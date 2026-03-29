/**
 * /api/import — VB-MAPP Excel Import & Google Drive Integration
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  HIPAA COMPLIANCE NOTES                                                  ║
 * ║  ─────────────────────────────────────────────────────────────────────  ║
 * ║  1. FILES NEVER WRITTEN TO DISK — multer uses memoryStorage() only.     ║
 * ║  2. PARSED DATA IS TRANSIENT — only goal records are persisted, not     ║
 * ║     raw assessment data or child PII from the file.                     ║
 * ║  3. AUDIT LOG IS PHI-FREE — logs record who/what/when with no names,   ║
 * ║     DOBs, or clinical scores.                                           ║
 * ║  4. ROLE RESTRICTION — only bcba and rbt roles may call these routes.  ║
 * ║  5. CHILD MAPPING REQUIRED — imported data must be linked to an         ║
 * ║     existing client record; no auto-creation from PHI.                 ║
 * ║  6. GOOGLE DRIVE — only drive.readonly scope requested; no data         ║
 * ║     written back to Drive. Files are fetched client-side and sent      ║
 * ║     to this server over encrypted transport.                            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

const express  = require('express');
const multer   = require('multer');
const XLSX     = require('xlsx');
const { auth } = require('../middleware/auth');
const db       = require('../db');

const router = express.Router();

// ── HIPAA: in-memory only — files never touch disk ───────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },   // 10 MB hard cap
  fileFilter: (_req, file, cb) => {
    const ok = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ].includes(file.mimetype)
      || file.originalname.match(/\.(xlsx|xls)$/i);
    ok ? cb(null, true) : cb(new Error('Only .xlsx / .xls files are accepted'));
  },
});

// ── Column header → canonical VB-MAPP domain name ────────────────────────────
const EXCEL_TO_DOMAIN = {
  'Mand':                 'Mand',
  'Tact':                 'Tact',
  'Listener':             'Listener Responding',
  'Listener Responding':  'Listener Responding',
  'VP-MTS':               'VP/MTS',
  'VP/MTS':               'VP/MTS',
  'Play':                 'Independent Play',
  'Independent Play':     'Independent Play',
  'Social':               'Social Behavior',
  'Social Behavior':      'Social Behavior',
  'Imitation':            'Motor Imitation',
  'Motor Imitation':      'Motor Imitation',
  'LRFFC':                'LRFFC',
  'IV':                   'Intraverbal',
  'Intraverbal':          'Intraverbal',
  'Group':                'Classroom Routines',
  'Classroom Routines':   'Classroom Routines',
  'Ling.':                'Linguistic Structure',
  'Ling':                 'Linguistic Structure',
  'Linguistics':          'Linguistic Structure',
  'Linguistic Structure': 'Linguistic Structure',
  'Math':                 'Math',
  'Reading':              'Reading',
  'Writing':              'Writing',
  'Spelling':             'Spelling',
  'Echoic':               'Echoic',
  'Vocal':                'Spontaneous Vocal Behavior',
  'Spontaneous Vocal Behavior': 'Spontaneous Vocal Behavior',
};

// ── Canonical VB-MAPP domain → goals table domain column ─────────────────────
const DOMAIN_TO_GOALS_DOMAIN = {
  'Mand':                 'verbal_behavior',
  'Tact':                 'verbal_behavior',
  'Echoic':               'verbal_behavior',
  'Intraverbal':          'verbal_behavior',
  'LRFFC':                'verbal_behavior',
  'Listener Responding':  'verbal_behavior',
  'Spontaneous Vocal Behavior': 'verbal_behavior',
  'VP/MTS':               'verbal_behavior',
  'Linguistic Structure': 'verbal_behavior',
  'Independent Play':     'daily_living',
  'Classroom Routines':   'daily_living',
  'Social Behavior':      'social_skills',
  'Reading':              'academic',
  'Writing':              'academic',
  'Math':                 'academic',
  'Spelling':             'academic',
  'Motor Imitation':      'imitation',
};

// ─────────────────────────────────────────────────────────────────────────────
// Core Excel parser
// Returns { childName, dob, domainLevels }
// domainLevels: { [dbDomain]: { highestMastered: number, hasData: boolean } }
// ─────────────────────────────────────────────────────────────────────────────
function parseVbmappExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true, raw: false });

  const sheet = wb.Sheets['Milestones'];
  if (!sheet) throw new Error('No "Milestones" sheet found. Please upload a standard VB-MAPP assessment Excel file.');

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  // ── Extract child name & DOB from header rows ─────────────────────────────
  let childName = null;
  let dob       = null;

  for (let i = 0; i < Math.min(8, rows.length); i++) {
    const row = rows[i];
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      const c = row[j];
      if (!c) continue;
      const lower = String(c).toLowerCase().trim();
      if (lower.includes('child') && lower.includes('name') && row[j + 1]) {
        childName = String(row[j + 1]).trim();
      }
      if ((lower.includes('birth') || lower === 'dob') && row[j + 1]) {
        dob = String(row[j + 1]).trim();
      }
    }
  }

  // ── Locate domain header row (must contain literal "Mand") ────────────────
  let headerRowIdx = -1;
  const domainCols = {}; // excelLabel → column index

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    if (row.some(c => c && String(c).trim() === 'Mand')) {
      headerRowIdx = i;
      row.forEach((cell, ci) => {
        if (cell && typeof cell === 'string' && cell.trim()) {
          domainCols[cell.trim()] = ci;
        }
      });
      break;
    }
  }

  if (headerRowIdx === -1) {
    throw new Error('Could not find domain headers in the Milestones sheet. Expected a row containing "Mand".');
  }

  // ── Collect milestone scores per domain ───────────────────────────────────
  // milestoneScores[excelDomain][milestoneNumber] = highest score seen
  const milestoneScores = {};
  Object.keys(domainCols).forEach(d => { milestoneScores[d] = {}; });

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row[0] === null || row[0] === undefined) continue;

    // First column is the milestone label (integer 1-15, or "5-M" etc.)
    const num = parseInt(String(row[0]).trim());
    if (isNaN(num) || num < 1 || num > 15) continue;

    Object.entries(domainCols).forEach(([excelDomain, ci]) => {
      const val = row[ci];
      if (val === null || val === undefined || val === '') return;
      const score = parseFloat(val);
      if (!isNaN(score) && score > 0) {
        const prev = milestoneScores[excelDomain][num] ?? 0;
        milestoneScores[excelDomain][num] = Math.max(prev, score);
      }
    });
  }

  // ── Compute highest mastered milestone per domain ─────────────────────────
  const domainLevels = {};

  Object.entries(milestoneScores).forEach(([excelLabel, scores]) => {
    const dbDomain = EXCEL_TO_DOMAIN[excelLabel];
    if (!dbDomain) return; // skip unknown columns (e.g., blank header fragments)

    const allNums = Object.keys(scores).map(Number).filter(n => !isNaN(n));
    if (allNums.length === 0) {
      domainLevels[dbDomain] = { highestMastered: 0, hasData: false };
      return;
    }

    const mastered = Object.entries(scores)
      .filter(([, s]) => parseFloat(s) >= 1)
      .map(([n]) => Number(n));

    domainLevels[dbDomain] = {
      highestMastered: mastered.length > 0 ? Math.max(...mastered) : 0,
      hasData: true,
    };
  });

  return { childName, dob, domainLevels };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/import/vbmapp-parse
// Accepts: multipart/form-data with field "file" (xlsx)
// Returns: { childName, dob, domains: [{ domain, highestMastered, suggested: [milestone rows] }] }
// HIPAA: child name / DOB are returned to the caller for display only — never persisted here
// ─────────────────────────────────────────────────────────────────────────────
router.post('/vbmapp-parse', auth, upload.single('file'), async (req, res) => {
  if (!['rbt', 'bcba'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only RBTs and BCBAs can import assessments' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const { childName, dob, domainLevels } = parseVbmappExcel(req.file.buffer);

    // Build suggestions: for each domain, fetch the 3 milestones just above current level
    const domainResults = [];

    for (const [domain, info] of Object.entries(domainLevels)) {
      const { highestMastered, hasData } = info;

      // Query DB for suggested milestones (next 3 above child's level)
      const suggestResult = await db.query(
        `SELECT * FROM vbmapp_milestones
         WHERE domain = $1
           AND milestone_number > $2
         ORDER BY level, milestone_number
         LIMIT 3`,
        [domain, highestMastered]
      );

      // If domain is at max level or no higher milestones exist, grab first 3
      let suggested = suggestResult.rows;
      if (suggested.length === 0 && highestMastered > 0) {
        const fallback = await db.query(
          `SELECT * FROM vbmapp_milestones WHERE domain = $1 ORDER BY level, milestone_number LIMIT 3`,
          [domain]
        );
        suggested = fallback.rows;
      }

      if (suggested.length > 0 || hasData) {
        domainResults.push({ domain, highestMastered, hasData, suggested });
      }
    }

    // ── HIPAA Audit log (NO PHI — only metadata) ──────────────────────────
    await db.query(
      `INSERT INTO import_audit_log (user_id, action, source, meta)
       VALUES ($1, 'vbmapp_excel_parse', 'excel_upload', $2)`,
      [req.user.id, JSON.stringify({
        domains_found:   domainResults.length,
        has_child_name:  !!childName,
        has_dob:         !!dob,
        file_size_bytes: req.file.size,
      })]
    );

    res.json({ childName, dob, domains: domainResults });

  } catch (err) {
    console.error('[import/vbmapp-parse]', err.message);
    res.status(422).json({ error: err.message || 'Failed to parse Excel file' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/import/log-gdrive
// Called client-side after the user selects a file from Google Drive Picker
// Logs the event for audit purposes (no file content sent here)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/log-gdrive', auth, async (req, res) => {
  if (!['rbt', 'bcba'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    await db.query(
      `INSERT INTO import_audit_log (user_id, action, source, meta)
       VALUES ($1, 'gdrive_file_selected', 'google_drive', $2)`,
      [req.user.id, JSON.stringify({ file_name_length: (req.body.fileName || '').length })]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[import/log-gdrive]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/import/log-apply
// Called after goals are created from an import (audit trail for goal creation batch)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/log-apply', auth, async (req, res) => {
  if (!['rbt', 'bcba'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { plan_id, goals_applied, source } = req.body;
  try {
    await db.query(
      `INSERT INTO import_audit_log (user_id, action, source, meta)
       VALUES ($1, 'vbmapp_goals_applied', $2, $3)`,
      [req.user.id, source || 'excel_upload', JSON.stringify({ plan_id, goals_applied })]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[import/log-apply]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
