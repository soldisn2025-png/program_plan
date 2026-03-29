const db = require('./index');
const level1Seed = require('./vbmapp_level1_milestones.json');
const level2Seed = require('./vbmapp_level2_milestones.json');
const level3Seed = require('./vbmapp_level3_milestones.json');
const { buildGeneratedMilestoneTemplate } = require('../lib/vbmappMilestoneTemplateFactory');

function getCanonicalMilestones() {
  return [level1Seed, level2Seed, level3Seed].flatMap(seed => seed.milestones);
}

async function syncVbmappMilestoneTemplates() {
  const client = await db.getClient();
  const milestones = getCanonicalMilestones();
  const officialCodes = milestones.map(milestone => milestone.milestone_code);
  let generatedCount = 0;

  try {
    const tableCheck = await client.query(
      `SELECT to_regclass('public.vbmapp_milestone_templates') AS table_name`
    );

    if (!tableCheck.rows[0]?.table_name) {
      console.warn('Skipping VB-MAPP milestone template sync: vbmapp_milestone_templates table does not exist yet.');
      return { skipped: true, reason: 'missing_vbmapp_milestone_templates_table' };
    }

    await client.query('BEGIN');

    await client.query(
      `ALTER TABLE vbmapp_milestone_templates
       ADD COLUMN IF NOT EXISTS template_origin VARCHAR(40)`
    );
    await client.query(
      `ALTER TABLE vbmapp_milestone_templates
       ALTER COLUMN template_origin SET DEFAULT 'manual_override'`
    );
    await client.query(
      `UPDATE vbmapp_milestone_templates
       SET template_origin = 'manual_override'
       WHERE template_origin IS NULL OR template_origin = ''`
    );

    for (const milestone of milestones) {
      const generated = buildGeneratedMilestoneTemplate(milestone);
      if (!generated.milestone_code) continue;

      const result = await client.query(
        `INSERT INTO vbmapp_milestone_templates (
           milestone_code,
           vbmapp_domain,
           data_collection,
           prerequisite_skills,
           materials,
           sd,
           correct_responses,
           incorrect_responses,
           prompting_hierarchy,
           prompting_hierarchy_detail,
           error_correction,
           transfer_procedure,
           reinforcement_schedule,
           generalization_plan,
           maintenance_plan,
           template_origin
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'generated_from_milestone'
         )
         ON CONFLICT (milestone_code) DO UPDATE
         SET vbmapp_domain = EXCLUDED.vbmapp_domain,
             data_collection = EXCLUDED.data_collection,
             prerequisite_skills = EXCLUDED.prerequisite_skills,
             materials = EXCLUDED.materials,
             sd = EXCLUDED.sd,
             correct_responses = EXCLUDED.correct_responses,
             incorrect_responses = EXCLUDED.incorrect_responses,
             prompting_hierarchy = EXCLUDED.prompting_hierarchy,
             prompting_hierarchy_detail = EXCLUDED.prompting_hierarchy_detail,
             error_correction = EXCLUDED.error_correction,
             transfer_procedure = EXCLUDED.transfer_procedure,
             reinforcement_schedule = EXCLUDED.reinforcement_schedule,
             generalization_plan = EXCLUDED.generalization_plan,
             maintenance_plan = EXCLUDED.maintenance_plan,
             template_origin = 'generated_from_milestone'
         WHERE vbmapp_milestone_templates.template_origin = 'generated_from_milestone'
            OR vbmapp_milestone_templates.template_origin IS NULL`,
        [
          generated.milestone_code,
          generated.vbmapp_domain,
          generated.data_collection,
          generated.prerequisite_skills,
          generated.materials,
          generated.sd,
          generated.correct_responses,
          generated.incorrect_responses,
          generated.prompting_hierarchy,
          generated.prompting_hierarchy_detail,
          generated.error_correction,
          generated.transfer_procedure,
          generated.reinforcement_schedule,
          generated.generalization_plan,
          generated.maintenance_plan,
        ]
      );

      if (result.rowCount > 0) {
        generatedCount += 1;
      }
    }

    const pruneResult = await client.query(
      `DELETE FROM vbmapp_milestone_templates
       WHERE template_origin = 'generated_from_milestone'
         AND NOT (milestone_code = ANY($1::text[]))`,
      [officialCodes]
    );

    await client.query('COMMIT');

    console.log(
      `Synced VB-MAPP milestone templates for ${officialCodes.length} official milestones.`
    );

    if (pruneResult.rowCount > 0) {
      console.log(`Pruned ${pruneResult.rowCount} generated milestone templates no longer in the canonical seed.`);
    }

    return {
      synced: officialCodes.length,
      generatedTouched: generatedCount,
      prunedGenerated: pruneResult.rowCount,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  syncVbmappMilestoneTemplates()
    .then(result => {
      console.log(result);
      process.exit(0);
    })
    .catch(err => {
      console.error('VB-MAPP milestone template sync failed:', err.message);
      process.exit(1);
    });
}

module.exports = syncVbmappMilestoneTemplates;
