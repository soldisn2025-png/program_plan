const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/children — list children accessible to logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.first_name, c.last_name, c.date_of_birth,
              c.diagnosis_level, c.strengths, c.areas_of_concern,
              c.created_at, ca.role AS user_role
       FROM children c
       JOIN child_assignments ca ON ca.child_id = c.id
       WHERE ca.user_id = $1
       ORDER BY c.first_name`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/children — create a new child profile
router.post(
  '/',
  auth,
  [
    body('first_name').trim().notEmpty(),
    body('last_name').trim().notEmpty(),
    body('diagnosis_level').optional().isIn(['level_1', 'level_2', 'level_3']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { first_name, last_name, date_of_birth, diagnosis_level, strengths, areas_of_concern } = req.body;
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const childResult = await client.query(
        `INSERT INTO children (first_name, last_name, date_of_birth, diagnosis_level, strengths, areas_of_concern, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [first_name, last_name, date_of_birth || null, diagnosis_level || null, strengths || null, areas_of_concern || null, req.user.id]
      );

      const child = childResult.rows[0];

      await client.query(
        `INSERT INTO child_assignments (child_id, user_id, role) VALUES ($1, $2, $3)`,
        [child.id, req.user.id, req.user.role]
      );

      await client.query('COMMIT');
      res.status(201).json(child);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }
);

// GET /api/children/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, ca.role AS user_role
       FROM children c
       JOIN child_assignments ca ON ca.child_id = c.id
       WHERE c.id = $1 AND ca.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Child not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/children/:id
router.put('/:id', auth, async (req, res) => {
  const { first_name, last_name, date_of_birth, diagnosis_level, strengths, areas_of_concern } = req.body;
  try {
    // Verify access
    const access = await db.query(
      'SELECT id FROM child_assignments WHERE child_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    const result = await db.query(
      `UPDATE children SET first_name = $1, last_name = $2, date_of_birth = $3,
       diagnosis_level = $4, strengths = $5, areas_of_concern = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [first_name, last_name, date_of_birth || null, diagnosis_level || null,
       strengths || null, areas_of_concern || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/children/:id/team — list users assigned to a child
router.get('/:id/team', auth, async (req, res) => {
  try {
    const access = await db.query(
      'SELECT id FROM child_assignments WHERE child_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    const result = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, ca.role
       FROM users u
       JOIN child_assignments ca ON ca.user_id = u.id
       WHERE ca.child_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
