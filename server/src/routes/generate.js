'use strict';

const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { generatePlan } = require('../lib/aiPlanGenerator');
const { verifyPlan } = require('../lib/aiPlanVerifier');
const { generateDocx } = require('../lib/docxGenerator');

const router = express.Router();

// POST /api/generate/plan/:planId — draft + verify a program plan
router.post('/plan/:planId', auth, async (req, res) => {
  const { planId } = req.params;

  try {
    // Fetch plan + child profile in one join
    const planResult = await db.query(
      `SELECT tp.id, tp.name, tp.child_id,
              c.first_name, c.last_name, c.diagnosis_level,
              c.strengths, c.areas_of_concern
       FROM training_plans tp
       JOIN children c ON c.id = tp.child_id
       WHERE tp.id = $1`,
      [planId]
    );
    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    const row = planResult.rows[0];
    const childProfile = {
      firstName: row.first_name,
      lastName: row.last_name,
      diagnosisLevel: row.diagnosis_level,
      strengths: row.strengths,
      areasOfConcern: row.areas_of_concern,
    };

    // Fetch selected milestones for this plan
    const milestonesResult = await db.query(
      `SELECT m.name, m.domain, m.level, m.description
       FROM plan_goals pg
       JOIN milestones m ON m.id = pg.goal_id
       WHERE pg.plan_id = $1`,
      [planId]
    );
    const selectedMilestones = milestonesResult.rows;

    // Fetch mastered milestones for this child (from plan_goals with status = mastered)
    const masteredResult = await db.query(
      `SELECT DISTINCT m.name
       FROM plan_goals pg
       JOIN training_plans tp ON tp.id = pg.plan_id
       JOIN milestones m ON m.id = pg.goal_id
       WHERE tp.child_id = $1 AND pg.status = 'mastered'`,
      [row.child_id]
    );
    const masteredMilestones = masteredResult.rows.map(r => r.name);

    // Generate with OpenAI, then verify with Claude
    const planContent = await generatePlan({ childProfile, selectedMilestones, masteredMilestones });
    const flags = await verifyPlan({ planContent, childProfile, masteredMilestones });

    // Upsert into generated_plans (replace existing draft for this plan)
    const saved = await db.query(
      `INSERT INTO generated_plans (plan_id, content, flags, status)
       VALUES ($1, $2, $3, 'draft')
       ON CONFLICT (plan_id) DO UPDATE
         SET content = EXCLUDED.content,
             flags = EXCLUDED.flags,
             status = 'draft',
             updated_at = NOW()
       RETURNING *`,
      [planId, planContent, JSON.stringify(flags)]
    );

    return res.json({ content: saved.rows[0].content, flags: saved.rows[0].flags });
  } catch (err) {
    console.error('generate error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/generate/plan/:planId — fetch existing draft
router.get('/plan/:planId', auth, async (req, res) => {
  const { planId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM generated_plans WHERE plan_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [planId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No generated plan found' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/generate/plan/:planId — save BCBA inline edits
router.patch('/plan/:planId', auth, async (req, res) => {
  const { planId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  try {
    const result = await db.query(
      `UPDATE generated_plans
       SET content = $1, updated_at = NOW()
       WHERE plan_id = $2
       RETURNING *`,
      [content, planId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No generated plan found' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/generate/plan/:planId/approve — BCBA approves the plan
router.post('/plan/:planId/approve', auth, async (req, res) => {
  const { planId } = req.params;
  try {
    const result = await db.query(
      `UPDATE generated_plans
       SET status = 'approved', updated_at = NOW()
       WHERE plan_id = $1
       RETURNING *`,
      [planId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No generated plan found' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/generate/plan/:planId/download — stream .docx file
router.get('/plan/:planId/download', auth, async (req, res) => {
  const { planId } = req.params;
  try {
    const [draftResult, planResult] = await Promise.all([
      db.query('SELECT content FROM generated_plans WHERE plan_id = $1', [planId]),
      db.query(
        `SELECT c.first_name || ' ' || c.last_name AS child_name
         FROM training_plans tp JOIN children c ON c.id = tp.child_id
         WHERE tp.id = $1`,
        [planId]
      ),
    ]);

    if (draftResult.rows.length === 0) {
      return res.status(404).json({ error: 'No generated plan found' });
    }

    const content = draftResult.rows[0].content;
    const childName = planResult.rows[0]?.child_name || 'Client';
    const buffer = await generateDocx(content, childName);

    const filename = `program-plan-${childName.replace(/\s+/g, '-')}.docx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (err) {
    console.error('download error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
