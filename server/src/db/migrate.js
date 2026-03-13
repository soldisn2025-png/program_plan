// Runs on server startup in production to ensure schema exists.
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function migrate() {
  if (process.env.NODE_ENV !== 'production') return;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const files = ['schema.sql', 'seeds.sql', 'vbmapp_seeds.sql', 'vbmapp_program_templates.sql', 'import_audit_log.sql'];
    for (const file of files) {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      await pool.query(sql);
      console.log(`Migrated: ${file}`);
    }
  } catch (err) {
    console.error('Migration error (may be safe to ignore if tables already exist):', err.message);
  } finally {
    await pool.end();
  }
}

module.exports = migrate;
