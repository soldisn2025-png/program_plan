const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/sessions — create a new session and log trial data
router.post('/', auth, async (req, res) => {
  const { child_id, plan_id, session_date, duration_minutes, notes, trials } = req.body;
  if (!child_id || !plan_id) return res.status(400).json({ error: 'child_id and plan_id required' });

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const sessionResult = await client.query(
      `INSERT INTO sessions (child_id, plan_id, therapist_id, session_date, duration_minutes, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [child_id, plan_id, req.user.id, session_date || new Date(), duration_minutes || null, notes || null]
    );
    const session = sessionResult.rows[0];

    // Insert individual trials and aggregate per plan_goal
    const aggregates = {};

    if (trials && trials.length > 0) {
      for (const trial of trials) {
        await client.query(
          `INSERT INTO session_trials (session_id, plan_goal_id, trial_number, response, prompt_level, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [session.id, trial.plan_goal_id, trial.trial_number, trial.response, trial.prompt_level || null, trial.notes || null]
        );

        if (!aggregates[trial.plan_goal_id]) {
          aggregates[trial.plan_goal_id] = { total: 0, correct: 0, prompt_level: trial.prompt_level };
        }
        aggregates[trial.plan_goal_id].total++;
        if (trial.response === 'correct') aggregates[trial.plan_goal_id].correct++;
      }

      // Insert aggregated data points
      for (const [plan_goal_id, agg] of Object.entries(aggregates)) {
        await client.query(
          `INSERT INTO data_points (plan_goal_id, session_id, session_date, total_trials, correct_trials, prompt_level_used, recorded_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [plan_goal_id, session.id, session.session_date, agg.total, agg.correct, agg.prompt_level || null, req.user.id]
        );

        // Auto-check mastery (80% over sessions — simplified check)
        const recentResult = await client.query(
          `SELECT percentage_correct FROM data_points
           WHERE plan_goal_id = $1 ORDER BY session_date DESC LIMIT 3`,
          [plan_goal_id]
        );
        const recent = recentResult.rows;
        if (recent.length >= 3 && recent.every(r => parseFloat(r.percentage_correct) >= 80)) {
          await client.query(
            `UPDATE plan_goals SET status = 'mastered' WHERE id = $1 AND status = 'in_progress'`,
            [plan_goal_id]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ session, aggregates });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// GET /api/sessions/progress/:planGoalId — progress data for a goal (for charts)
router.get('/progress/:planGoalId', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT session_date, total_trials, correct_trials, percentage_correct, prompt_level_used
       FROM data_points
       WHERE plan_goal_id = $1
       ORDER BY session_date ASC`,
      [req.params.planGoalId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sessions?plan_id=xxx — list sessions for a plan
router.get('/', auth, async (req, res) => {
  const { plan_id, child_id } = req.query;
  try {
    let query = `
      SELECT s.*, u.first_name || ' ' || u.last_name AS therapist_name
      FROM sessions s
      JOIN users u ON u.id = s.therapist_id
    `;
    const params = [];
    const conditions = [];

    if (plan_id) { params.push(plan_id); conditions.push(`s.plan_id = $${params.length}`); }
    if (child_id) { params.push(child_id); conditions.push(`s.child_id = $${params.length}`); }

    if (conditions.length > 0) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY s.session_date DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
