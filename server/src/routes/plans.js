const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/plans?child_id=xxx
router.get('/', auth, async (req, res) => {
  const { child_id } = req.query;
  try {
    let query = `
      SELECT tp.*, c.first_name || ' ' || c.last_name AS child_name,
             u.first_name || ' ' || u.last_name AS created_by_name,
             COUNT(pg.id) AS goal_count
      FROM training_plans tp
      JOIN children c ON c.id = tp.child_id
      JOIN users u ON u.id = tp.created_by
      JOIN child_assignments ca ON ca.child_id = tp.child_id AND ca.user_id = $1
      LEFT JOIN plan_goals pg ON pg.plan_id = tp.id
    `;
    const params = [req.user.id];

    if (child_id) {
      params.push(child_id);
      query += ` WHERE tp.child_id = $${params.length}`;
    }

    query += ` GROUP BY tp.id, c.first_name, c.last_name, u.first_name, u.last_name ORDER BY tp.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/plans
router.post('/', auth, async (req, res) => {
  const { child_id, name, description, goal_ids } = req.body;
  if (!child_id || !name) return res.status(400).json({ error: 'child_id and name are required' });

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Verify child access
    const access = await client.query(
      'SELECT id FROM child_assignments WHERE child_id = $1 AND user_id = $2',
      [child_id, req.user.id]
    );
    if (access.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied' });
    }

    const planResult = await client.query(
      `INSERT INTO training_plans (child_id, name, description, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [child_id, name, description || null, req.user.id]
    );
    const plan = planResult.rows[0];

    // Add goals if provided
    if (goal_ids && goal_ids.length > 0) {
      for (let i = 0; i < goal_ids.length; i++) {
        await client.query(
          `INSERT INTO plan_goals (plan_id, goal_id, sort_order) VALUES ($1, $2, $3)`,
          [plan.id, goal_ids[i], i]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(plan);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// GET /api/plans/:id — plan detail with goals
router.get('/:id', auth, async (req, res) => {
  try {
    const planResult = await db.query(
      `SELECT tp.*, c.first_name || ' ' || c.last_name AS child_name,
              c.date_of_birth, c.diagnosis_level,
              u.first_name || ' ' || u.last_name AS created_by_name
       FROM training_plans tp
       JOIN children c ON c.id = tp.child_id
       JOIN users u ON u.id = tp.created_by
       JOIN child_assignments ca ON ca.child_id = tp.child_id AND ca.user_id = $2
       WHERE tp.id = $1`,
      [req.params.id, req.user.id]
    );

    if (planResult.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });

    const goalsResult = await db.query(
      `SELECT pg.id AS plan_goal_id, pg.status, pg.mastery_criteria, pg.sort_order,
              pg.custom_materials, pg.custom_sd, pg.custom_reinforcement_schedule,
              g.*
       FROM plan_goals pg
       JOIN goals g ON g.id = pg.goal_id
       WHERE pg.plan_id = $1
       ORDER BY pg.sort_order`,
      [req.params.id]
    );

    res.json({
      ...planResult.rows[0],
      goals: goalsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/plans/:id/goals — add a goal to a plan
router.post('/:id/goals', auth, async (req, res) => {
  const { goal_id, mastery_criteria } = req.body;
  try {
    // Verify plan access
    const access = await db.query(
      `SELECT tp.id FROM training_plans tp
       JOIN child_assignments ca ON ca.child_id = tp.child_id
       WHERE tp.id = $1 AND ca.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    // Get next sort order
    const orderResult = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM plan_goals WHERE plan_id = $1',
      [req.params.id]
    );

    const result = await db.query(
      `INSERT INTO plan_goals (plan_id, goal_id, mastery_criteria, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, goal_id, mastery_criteria || '80% correct over 3 consecutive sessions', orderResult.rows[0].next]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/plans/:id/goals/:pgId — update plan goal status or overrides
router.patch('/:id/goals/:pgId', auth, async (req, res) => {
  const { status, mastery_criteria, custom_materials, custom_sd, custom_reinforcement_schedule } = req.body;
  try {
    const result = await db.query(
      `UPDATE plan_goals SET
        status = COALESCE($1, status),
        mastery_criteria = COALESCE($2, mastery_criteria),
        custom_materials = COALESCE($3, custom_materials),
        custom_sd = COALESCE($4, custom_sd),
        custom_reinforcement_schedule = COALESCE($5, custom_reinforcement_schedule)
       WHERE id = $6 RETURNING *`,
      [status, mastery_criteria, custom_materials, custom_sd, custom_reinforcement_schedule, req.params.pgId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plan goal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/plans/:id/goals/:pgId
router.delete('/:id/goals/:pgId', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM plan_goals WHERE id = $1', [req.params.pgId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
