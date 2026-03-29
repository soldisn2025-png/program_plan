const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
const TEMPLATE_FIELDS = [
  'data_collection',
  'prerequisite_skills',
  'materials',
  'sd',
  'correct_responses',
  'incorrect_responses',
  'prompting_hierarchy',
  'prompting_hierarchy_detail',
  'error_correction',
  'transfer_procedure',
  'reinforcement_schedule',
  'generalization_plan',
  'maintenance_plan',
];

function pickTemplateFields(row = {}) {
  return TEMPLATE_FIELDS.reduce((fields, key) => {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      fields[key] = row[key];
    }
    return fields;
  }, {});
}

function mergeTemplateFields(...layers) {
  const merged = {};

  layers.forEach(layer => {
    if (!layer) return;
    TEMPLATE_FIELDS.forEach(key => {
      if (layer[key] !== undefined && layer[key] !== null && layer[key] !== '') {
        merged[key] = layer[key];
      }
    });
  });

  if (!merged.prompting_hierarchy) {
    merged.prompting_hierarchy = 'most_to_least';
  }

  return merged;
}

// GET /api/goals — list all library goals, optionally filter by domain
router.get('/', auth, async (req, res) => {
  const { domain } = req.query;
  try {
    let query = `SELECT * FROM goals WHERE is_library_goal = TRUE`;
    const params = [];

    if (domain) {
      params.push(domain);
      query += ` AND domain = $${params.length}`;
    }

    query += ` ORDER BY domain, name`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/goals/domains — return distinct domain counts
router.get('/domains', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT domain, COUNT(*) as count FROM goals
       WHERE is_library_goal = TRUE
       GROUP BY domain ORDER BY domain`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/goals/vbmapp-domains — return all distinct VB-MAPP domains
router.get('/vbmapp-domains', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT domain FROM vbmapp_milestones ORDER BY domain`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/goals/vbmapp-suggestions — 5 foundational Level-1 starter milestones
router.get('/vbmapp-suggestions', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM vbmapp_milestones
       WHERE milestone_number = 1
         AND domain IN ('Mand','Tact','Listener Responding','Motor Imitation','Independent Play')
       ORDER BY domain`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/goals/vbmapp-milestones/:domain — return milestones for a VB-MAPP domain
router.get('/vbmapp-milestones/:domain', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM vbmapp_milestones WHERE domain = $1 ORDER BY level, milestone_number`,
      [req.params.domain]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/goals/:id — single goal with full template data
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM goals WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Goal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/goals — create custom goal (rbt/bcba only)
router.post('/', auth, async (req, res) => {
  if (!['rbt', 'bcba'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only therapists and BCBAs can create goals' });
  }

  const {
    name, domain, description, vbmapp_domain,
    vbmapp_milestone_code,
    data_collection, prerequisite_skills, materials,
    sd, correct_responses, incorrect_responses,
    prompting_hierarchy, prompting_hierarchy_detail,
    error_correction, transfer_procedure,
    reinforcement_schedule, generalization_plan, maintenance_plan,
  } = req.body;

  try {
    const manualTemplateFields = {
      data_collection, prerequisite_skills, materials,
      sd, correct_responses, incorrect_responses,
      prompting_hierarchy: prompting_hierarchy || 'most_to_least',
      prompting_hierarchy_detail, error_correction, transfer_procedure,
      reinforcement_schedule, generalization_plan, maintenance_plan,
    };

    let templateFields = manualTemplateFields;

    if (vbmapp_domain || vbmapp_milestone_code) {
      const [domainTemplateResult, milestoneTemplateResult] = await Promise.all([
        vbmapp_domain
          ? db.query(
              'SELECT * FROM vbmapp_program_templates WHERE vbmapp_domain = $1',
              [vbmapp_domain]
            )
          : Promise.resolve({ rows: [] }),
        vbmapp_milestone_code
          ? db.query(
              'SELECT * FROM vbmapp_milestone_templates WHERE milestone_code = $1',
              [vbmapp_milestone_code]
            )
          : Promise.resolve({ rows: [] }),
      ]);

      templateFields = mergeTemplateFields(
        manualTemplateFields,
        pickTemplateFields(domainTemplateResult.rows[0]),
        pickTemplateFields(milestoneTemplateResult.rows[0]),
      );
    }

    const result = await db.query(
      `INSERT INTO goals (
        name, domain, description,
        data_collection, prerequisite_skills, materials,
        sd, correct_responses, incorrect_responses,
        prompting_hierarchy, prompting_hierarchy_detail,
        error_correction, transfer_procedure,
        reinforcement_schedule, generalization_plan, maintenance_plan,
        is_library_goal, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, FALSE, $17)
      RETURNING *`,
      [name, domain, description,
       templateFields.data_collection, templateFields.prerequisite_skills, templateFields.materials,
       templateFields.sd, templateFields.correct_responses, templateFields.incorrect_responses,
       templateFields.prompting_hierarchy, templateFields.prompting_hierarchy_detail,
       templateFields.error_correction, templateFields.transfer_procedure,
       templateFields.reinforcement_schedule, templateFields.generalization_plan,
       templateFields.maintenance_plan, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
