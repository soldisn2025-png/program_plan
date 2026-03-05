-- HIPAA-Compliant Import Audit Log
-- Tracks WHAT was imported, WHO imported it, and WHEN.
-- IMPORTANT: This table must NEVER store PHI (Protected Health Information).
-- Child names, dates of birth, and raw assessment scores are NOT stored here.
-- Only non-PHI metadata is logged (domain counts, goal counts, plan IDs, source).

CREATE TABLE IF NOT EXISTS import_audit_log (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  action     VARCHAR(50)  NOT NULL,  -- 'vbmapp_excel_parse' | 'vbmapp_goals_applied' | 'gdrive_file_selected'
  source     VARCHAR(50)  NOT NULL DEFAULT 'excel_upload',  -- 'excel_upload' | 'google_drive'
  meta       JSONB        NOT NULL DEFAULT '{}',  -- non-PHI: domain_count, goals_applied, plan_id, etc.
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_audit_user   ON import_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_import_audit_action ON import_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_import_audit_time   ON import_audit_log(created_at DESC);
