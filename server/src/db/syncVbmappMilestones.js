const db = require('./index');
const level1Seed = require('./vbmapp_level1_milestones.json');
const level2Seed = require('./vbmapp_level2_milestones.json');
const level3Seed = require('./vbmapp_level3_milestones.json');

const PROVIDED_GUIDE_SOURCE = 'User-provided VB-MAPP Guide OCR excerpt';
const CANONICAL_STATUS = 'canonicalized_from_provided_text';
const LEGACY_STATUS = 'legacy_seed';
const MISSING_GUIDE_STATUS = 'missing_from_provided_text';
const LEGACY_SOURCE_NAME = 'Legacy VB-MAPP seed';
const EXPECTED_LEVEL_COUNTS = {
  1: 45,
  2: 60,
  3: 65,
};

function validateLevelSeed(seed) {
  const expectedCount = EXPECTED_LEVEL_COUNTS[seed.level];

  if (!expectedCount) {
    throw new Error(`Unexpected VB-MAPP level in seed: ${seed.level}`);
  }

  if (!Array.isArray(seed.milestones)) {
    throw new Error(`VB-MAPP Level ${seed.level} seed is missing milestones array.`);
  }

  if (seed.milestones.length !== expectedCount) {
    throw new Error(
      `VB-MAPP Level ${seed.level} seed has ${seed.milestones.length} milestones; expected ${expectedCount}.`
    );
  }

  const duplicateCodes = seed.milestones.reduce((dupes, milestone) => {
    if (dupes.seen.has(milestone.milestone_code)) {
      dupes.duplicates.add(milestone.milestone_code);
    }
    dupes.seen.add(milestone.milestone_code);
    return dupes;
  }, { seen: new Set(), duplicates: new Set() });

  if (duplicateCodes.duplicates.size > 0) {
    throw new Error(
      `VB-MAPP Level ${seed.level} seed has duplicate milestone codes: ${[...duplicateCodes.duplicates].join(', ')}`
    );
  }
}

function buildCanonicalSeed() {
  const seeds = [level1Seed, level2Seed, level3Seed];
  seeds.forEach(validateLevelSeed);

  const milestones = seeds.flatMap(seed => seed.milestones);
  const codes = milestones.map(milestone => milestone.milestone_code);
  const uniqueCodes = new Set(codes);

  if (uniqueCodes.size !== milestones.length) {
    throw new Error('VB-MAPP milestone seeds contain duplicate milestone codes across levels.');
  }

  return {
    source_title: level1Seed.source_title,
    source_edition: level1Seed.source_edition,
    milestones,
  };
}

async function syncVbmappMilestones() {
  const client = await db.getClient();
  const canonicalSeed = buildCanonicalSeed();
  const officialCodes = canonicalSeed.milestones.map(milestone => milestone.milestone_code);
  const seedPayload = JSON.stringify(canonicalSeed);

  try {
    const tableCheck = await client.query(
      `SELECT to_regclass('public.vbmapp_milestones') AS table_name`
    );

    if (!tableCheck.rows[0]?.table_name) {
      console.warn('Skipping VB-MAPP milestone sync: vbmapp_milestones table does not exist yet.');
      return { skipped: true, reason: 'missing_vbmapp_milestones_table' };
    }

    await client.query('BEGIN');

    const schemaStatements = [
      `ALTER TABLE vbmapp_milestones ADD COLUMN IF NOT EXISTS official_domain VARCHAR(150)`,
      `ALTER TABLE vbmapp_milestones ADD COLUMN IF NOT EXISTS milestone_label VARCHAR(10)`,
      `ALTER TABLE vbmapp_milestones ADD COLUMN IF NOT EXISTS example TEXT`,
      `ALTER TABLE vbmapp_milestones ADD COLUMN IF NOT EXISTS measurement VARCHAR(10)`,
      `ALTER TABLE vbmapp_milestones ADD COLUMN IF NOT EXISTS measurement_detail VARCHAR(50)`,
      `ALTER TABLE vbmapp_milestones ADD COLUMN IF NOT EXISTS note TEXT`,
      `ALTER TABLE vbmapp_milestones ADD COLUMN IF NOT EXISTS source_kind VARCHAR(30)`,
      `ALTER TABLE vbmapp_milestones ADD COLUMN IF NOT EXISTS source_name VARCHAR(255)`,
      `ALTER TABLE vbmapp_milestones ADD COLUMN IF NOT EXISTS source_status VARCHAR(50)`,
      `CREATE TABLE IF NOT EXISTS vbmapp_milestone_source_texts (
        id             SERIAL PRIMARY KEY,
        milestone_code VARCHAR(20) NOT NULL REFERENCES vbmapp_milestones(milestone_code) ON DELETE CASCADE,
        source_kind    VARCHAR(30) NOT NULL,
        source_name    VARCHAR(255) NOT NULL,
        source_edition VARCHAR(50),
        level          INTEGER,
        source_status  VARCHAR(50) NOT NULL,
        source_text_raw TEXT NOT NULL,
        created_at     TIMESTAMP DEFAULT NOW(),
        UNIQUE (milestone_code, source_kind)
      )`,
      `CREATE TABLE IF NOT EXISTS vbmapp_milestone_guide_fields (
        milestone_code VARCHAR(20) PRIMARY KEY REFERENCES vbmapp_milestones(milestone_code) ON DELETE CASCADE,
        source_name    VARCHAR(255) NOT NULL,
        source_status  VARCHAR(50) NOT NULL,
        objective      TEXT,
        materials      TEXT,
        scoring_half   TEXT,
        scoring_full   TEXT,
        notes          TEXT,
        updated_at     TIMESTAMP DEFAULT NOW()
      )`,
    ];

    for (const statement of schemaStatements) {
      await client.query(statement);
    }

    await client.query(
      `UPDATE vbmapp_milestones
       SET official_domain = COALESCE(official_domain, domain),
           milestone_label = COALESCE(milestone_label, milestone_number::text || '-M'),
           source_kind = COALESCE(source_kind, 'legacy_seed'),
           source_name = COALESCE(source_name, $1),
           source_status = COALESCE(source_status, $2)`,
      [LEGACY_SOURCE_NAME, LEGACY_STATUS]
    );

    await client.query(
      `WITH seed AS (
         SELECT $1::jsonb AS data
       ),
       rows AS (
         SELECT
           jsonb_array_elements(data->'milestones') AS item,
           data->>'source_title' AS source_title,
           data->>'source_edition' AS source_edition
         FROM seed
       )
       INSERT INTO vbmapp_milestones (
         domain,
         official_domain,
         level,
         milestone_number,
         milestone_code,
         milestone_name,
         milestone_label,
         example,
         measurement,
         measurement_detail,
         note,
         source_kind,
         source_name,
         source_status
       )
       SELECT
         item->>'db_domain' AS domain,
         item->>'official_domain' AS official_domain,
         (item->>'level')::INTEGER AS level,
         (item->>'milestone_number')::INTEGER AS milestone_number,
         item->>'milestone_code' AS milestone_code,
         item->>'milestone_name' AS milestone_name,
         item->>'milestone_label' AS milestone_label,
         NULLIF(item->>'example', '') AS example,
         item->>'measurement' AS measurement,
         NULLIF(item->>'measurement_detail', '') AS measurement_detail,
         NULLIF(item->>'note', '') AS note,
         'protocol' AS source_kind,
         CASE
           WHEN source_edition IS NULL OR source_edition = '' THEN source_title
           ELSE source_title || ' - ' || source_edition
         END AS source_name,
         $2 AS source_status
       FROM rows
       ON CONFLICT (milestone_code) DO UPDATE
       SET domain = EXCLUDED.domain,
           official_domain = EXCLUDED.official_domain,
           level = EXCLUDED.level,
           milestone_number = EXCLUDED.milestone_number,
           milestone_name = EXCLUDED.milestone_name,
           milestone_label = EXCLUDED.milestone_label,
           example = EXCLUDED.example,
           measurement = EXCLUDED.measurement,
           measurement_detail = EXCLUDED.measurement_detail,
           note = EXCLUDED.note,
           source_kind = EXCLUDED.source_kind,
           source_name = EXCLUDED.source_name,
           source_status = EXCLUDED.source_status`,
      [seedPayload, CANONICAL_STATUS]
    );

    const pruneResult = await client.query(
      `DELETE FROM vbmapp_milestones
       WHERE source_name = $1
         AND NOT (milestone_code = ANY($2::text[]))`,
      [LEGACY_SOURCE_NAME, officialCodes]
    );

    await client.query(
      `WITH seed AS (
         SELECT $1::jsonb AS data
       ),
       rows AS (
         SELECT
           jsonb_array_elements(data->'milestones') AS item,
           data->>'source_title' AS source_title,
           data->>'source_edition' AS source_edition
         FROM seed
       )
       INSERT INTO vbmapp_milestone_source_texts (
         milestone_code,
         source_kind,
         source_name,
         source_edition,
         level,
         source_status,
         source_text_raw
       )
       SELECT
         item->>'milestone_code' AS milestone_code,
         'protocol' AS source_kind,
         source_title AS source_name,
         NULLIF(source_edition, '') AS source_edition,
         (item->>'level')::INTEGER AS level,
         $2 AS source_status,
         TRIM(
           BOTH ' ' FROM CONCAT(
             item->>'milestone_number', '. ',
             item->>'milestone_name',
             CASE
               WHEN NULLIF(item->>'example', '') IS NOT NULL
                 THEN ' (e.g., ' || item->>'example' || ')'
               ELSE ''
             END,
             CASE
               WHEN NULLIF(item->>'note', '') IS NOT NULL
                 THEN ' (' || item->>'note' || ')'
               ELSE ''
             END,
             ' (', item->>'measurement',
             CASE
               WHEN NULLIF(item->>'measurement_detail', '') IS NOT NULL
                 THEN ': ' || item->>'measurement_detail'
               ELSE ''
             END,
             ')'
           )
         ) AS source_text_raw
       FROM rows
       ON CONFLICT (milestone_code, source_kind) DO UPDATE
       SET source_name = EXCLUDED.source_name,
           source_edition = EXCLUDED.source_edition,
           level = EXCLUDED.level,
           source_status = EXCLUDED.source_status,
           source_text_raw = EXCLUDED.source_text_raw`,
      [seedPayload, CANONICAL_STATUS]
    );

    await client.query(
      `WITH seed AS (
         SELECT $1::jsonb AS data
       ),
       rows AS (
         SELECT jsonb_array_elements(data->'milestones') AS item
         FROM seed
       )
       INSERT INTO vbmapp_milestone_guide_fields (
         milestone_code,
         source_name,
         source_status,
         objective,
         materials,
         scoring_half,
         scoring_full,
         notes
       )
       SELECT
         item->>'milestone_code' AS milestone_code,
         $2 AS source_name,
         $3 AS source_status,
         NULL::TEXT AS objective,
         NULL::TEXT AS materials,
         NULL::TEXT AS scoring_half,
         NULL::TEXT AS scoring_full,
         NULL::TEXT AS notes
       FROM rows
       ON CONFLICT (milestone_code) DO UPDATE
       SET source_name = EXCLUDED.source_name,
           source_status = EXCLUDED.source_status,
           updated_at = NOW()`,
      [seedPayload, PROVIDED_GUIDE_SOURCE, MISSING_GUIDE_STATUS]
    );

    await client.query('COMMIT');

    const levelCounts = canonicalSeed.milestones.reduce((counts, milestone) => {
      counts[milestone.level] = (counts[milestone.level] || 0) + 1;
      return counts;
    }, {});

    console.log(
      `Synced ${canonicalSeed.milestones.length} official VB-MAPP milestones (L1=${levelCounts[1]}, L2=${levelCounts[2]}, L3=${levelCounts[3]}).`
    );

    if (pruneResult.rowCount > 0) {
      console.log(`Pruned ${pruneResult.rowCount} legacy non-official VB-MAPP milestone rows.`);
    }

    return {
      synced: canonicalSeed.milestones.length,
      byLevel: levelCounts,
      prunedLegacy: pruneResult.rowCount,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  syncVbmappMilestones()
    .then(result => {
      console.log(result);
      process.exit(0);
    })
    .catch(err => {
      console.error('VB-MAPP milestone sync failed:', err.message);
      process.exit(1);
    });
}

module.exports = syncVbmappMilestones;
