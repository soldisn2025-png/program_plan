/**
 * VbmappImport.jsx — VB-MAPP Assessment Import Page
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  HIPAA COMPLIANCE                                                    ║
 * ║  • Files processed on our server only — never forwarded to any      ║
 * ║    third-party service or external API.                              ║
 * ║  • Files are parsed in memory and immediately discarded.            ║
 * ║  • Only the resulting goal records are saved to the database.        ║
 * ║  • Google Drive: files are fetched locally in the user's browser    ║
 * ║    and sent directly to this server over encrypted transport.        ║
 * ║    Personal Google accounts do NOT have a HIPAA Business Associate   ║
 * ║    Agreement (BAA). Use Google Workspace for Healthcare if required. ║
 * ║  • An audit log entry (no PHI) is written for every import action.  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

// VB-MAPP domain → goals table domain (same mapping as VbmappGoalSelector)
const DOMAIN_MAP = {
  'Mand':                 'verbal_behavior',
  'Tact':                 'verbal_behavior',
  'Echoic':               'verbal_behavior',
  'Intraverbal':          'verbal_behavior',
  'LRFFC':                'verbal_behavior',
  'Listener Responding':  'verbal_behavior',
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

const VBMAPP_ABBREVS = {
  'Mand': 'M', 'Tact': 'T', 'Listener Responding': 'LR',
  'VP/MTS': 'VP', 'Independent Play': 'IP', 'Social Behavior': 'Soc',
  'Motor Imitation': 'MI', 'Echoic': 'Ec', 'LRFFC': 'LRFFC',
  'Intraverbal': 'IV', 'Classroom Routines': 'Cls',
  'Linguistic Structure': 'Lin', 'Reading': 'Rdg',
  'Writing': 'Wri', 'Math': 'Ma', 'Spelling': 'Sp',
};

const vbLabel = (domain, num) => `${domain} ${num}-${VBMAPP_ABBREVS[domain] || domain}`;

// Google Drive: reads VITE_GOOGLE_CLIENT_ID from environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// ─────────────────────────────────────────────────────────────────────────────
// Google Drive Picker helper (client-side OAuth — no server credentials needed)
// ─────────────────────────────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

async function openGoogleDrivePicker(onFile) {
  if (!GOOGLE_CLIENT_ID) {
    toast.error('Google Drive not configured. Add VITE_GOOGLE_CLIENT_ID to client env.');
    return;
  }
  try {
    await Promise.all([
      loadScript('https://accounts.google.com/gsi/client'),
      loadScript('https://apis.google.com/js/api.js'),
    ]);

    // eslint-disable-next-line no-undef
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope:     'https://www.googleapis.com/auth/drive.readonly',
      callback:  async (tokenResp) => {
        if (tokenResp.error) { toast.error('Google auth failed: ' + tokenResp.error); return; }
        const token = tokenResp.access_token;

        await new Promise(res => gapi.load('picker', res)); // eslint-disable-line no-undef

        // eslint-disable-next-line no-undef
        const picker = new google.picker.PickerBuilder()
          // eslint-disable-next-line no-undef
          .addView(new google.picker.DocsView(google.picker.ViewId.DOCS)
            .setMimeTypes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
          .setOAuthToken(token)
          .setCallback(async (data) => {
            // eslint-disable-next-line no-undef
            if (data.action === google.picker.Action.PICKED) {
              const f = data.docs[0];
              try {
                const blob = await fetch(
                  `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`,
                  { headers: { Authorization: `Bearer ${token}` } }
                ).then(r => r.blob());
                onFile(new File([blob], f.name, {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }));
              } catch {
                toast.error('Failed to download file from Google Drive');
              }
            }
          })
          .build();
        picker.setVisible(true);
      },
    });
    tokenClient.requestAccessToken({ prompt: '' });
  } catch {
    toast.error('Failed to load Google Drive. Check your network connection.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function VbmappImport() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [step, setStep]           = useState('upload');   // 'upload' | 'review' | 'importing' | 'done'
  const [dragging, setDragging]   = useState(false);
  const [parsing, setParsing]     = useState(false);
  const [source, setSource]       = useState('excel');    // 'excel' | 'google_drive'

  // Parsed data from server
  const [parsed, setParsed]       = useState(null);        // { childName, dob, domains }

  // User selections
  const [children, setChildren]   = useState([]);
  const [plans, setPlans]         = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedPlan, setSelectedPlan]   = useState('');
  const [checked, setChecked]     = useState({});           // milestoneId → boolean
  const [hipaaAck, setHipaaAck]   = useState(false);

  // Done state
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef();

  // ── Load children + plans for dropdowns ──────────────────────────────────
  useEffect(() => {
    api.get('/children').then(r => setChildren(r.data)).catch(() => {});
    api.get('/plans').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  // ── Role guard ───────────────────────────────────────────────────────────
  if (!['rbt', 'bcba'].includes(user?.role)) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <p className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</p>
        <p className="text-gray-500">Only RBTs and BCBAs can import VB-MAPP assessments.</p>
      </div>
    );
  }

  // ── File upload handler ──────────────────────────────────────────────────
  const handleFile = useCallback(async (file, fileSrc = 'excel') => {
    if (!file) return;
    setSource(fileSrc);
    setParsing(true);

    // Log Google Drive selection for audit (no file content sent here)
    if (fileSrc === 'google_drive') {
      api.post('/import/log-gdrive', { fileName: file.name }).catch(() => {});
    }

    const form = new FormData();
    form.append('file', file);

    try {
      const { data } = await api.post('/import/vbmapp-parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setParsed(data);

      // Pre-check all suggested milestones
      const init = {};
      data.domains.forEach(d => d.suggested.forEach(m => { init[m.id] = true; }));
      setChecked(init);

      setStep('review');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to parse the file. Is it a VB-MAPP Excel file?');
    } finally {
      setParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, 'excel');
  }, [handleFile]);

  // ── Import goals handler ─────────────────────────────────────────────────
  const handleImport = async () => {
    if (!selectedPlan)  { toast.error('Please select a training plan'); return; }
    if (!hipaaAck)      { toast.error('Please acknowledge the HIPAA notice'); return; }

    const selectedMilestones = parsed.domains
      .flatMap(d => d.suggested.map(m => ({ ...m, vbmapp_domain: d.domain })))
      .filter(m => checked[m.id]);

    if (selectedMilestones.length === 0) {
      toast.error('No goals selected — check at least one milestone');
      return;
    }

    setStep('importing');

    try {
      let goalsApplied = 0;

      for (const m of selectedMilestones) {
        const goalName = `[${vbLabel(m.domain, m.milestone_number)}] ${m.milestone_name}`;
        const dbDomain = DOMAIN_MAP[m.vbmapp_domain] || 'verbal_behavior';

        // Create goal (auto-populates 12 template fields via vbmapp_domain)
        const goalRes = await api.post('/goals', {
          name: goalName,
          domain: dbDomain,
          vbmapp_domain: m.vbmapp_domain,
        });

        // Link to plan
        await api.post(`/plans/${selectedPlan}/goals`, { goal_id: goalRes.data.id });
        goalsApplied++;
      }

      // Audit log — NO PHI stored
      await api.post('/import/log-apply', {
        plan_id: selectedPlan,
        goals_applied: goalsApplied,
        source,
      });

      setImportResult({ goalsApplied, planId: selectedPlan });
      setStep('done');
      toast.success(`${goalsApplied} goals imported successfully!`);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Import failed — please try again');
      setStep('review');
    }
  };

  const totalSelected = Object.values(checked).filter(Boolean).length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📥 Import VB-MAPP Assessment</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload an Excel scoresheet to automatically generate goals from a child's assessment results.
        </p>
      </div>

      {/* ── HIPAA Notice ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
        <p className="font-semibold text-blue-800 text-sm flex items-center gap-2">
          🔒 HIPAA Privacy &amp; Security Notice
        </p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Uploaded files are <strong>processed in server memory only</strong> and are never written to disk or forwarded to any external service.</li>
          <li>Only the resulting <strong>clinical goal records</strong> are saved to the database — raw assessment data and child PII from the file are not stored.</li>
          <li>Every import action is recorded in a <strong>PHI-free audit log</strong> (user, timestamp, action type — no names or scores).</li>
          <li>Access is restricted to <strong>RBT and BCBA roles</strong> only.</li>
          <li>
            <strong>Google Drive users:</strong> Personal Google accounts do <em>not</em> have a HIPAA Business Associate Agreement (BAA).
            For full HIPAA compliance, use{' '}
            <a href="https://workspace.google.com/intl/en/solutions/healthcare/" target="_blank" rel="noopener noreferrer" className="underline font-medium">
              Google Workspace for Healthcare
            </a>
            {' '}which offers a BAA, or upload the file directly from your device.
          </li>
        </ul>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STEP 1 — Upload                                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {step === 'upload' && (
        <div className="space-y-4">

          {/* Drag-and-drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0], 'excel'); }}
            />
            {parsing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
                <p className="text-gray-600 font-medium">Parsing your VB-MAPP file…</p>
              </div>
            ) : (
              <>
                <div className="text-5xl mb-3">📊</div>
                <p className="text-lg font-semibold text-gray-700">
                  {dragging ? 'Drop your VB-MAPP Excel file here' : 'Click or drag & drop to upload'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Supports .xlsx files · Max 10 MB</p>
                <p className="text-xs text-gray-400 mt-3">
                  Compatible with the standard VB-MAPP Protocol scoresheet (Milestones sheet required)
                </p>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">or import from</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Drive button */}
          <div className="text-center">
            {GOOGLE_CLIENT_ID ? (
              <button
                onClick={() => openGoogleDrivePicker(file => handleFile(file, 'google_drive'))}
                disabled={parsing}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                </svg>
                Import from Google Drive
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-700">
                <span>⚙️</span>
                <span>Google Drive not configured — add <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">VITE_GOOGLE_CLIENT_ID</code> to your <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">.env</code> file to enable</span>
              </div>
            )}
          </div>

          {/* Expected format hint */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">📋 Expected file format</p>
            <p>The uploader reads the <strong>Milestones</strong> sheet of the standard VB-MAPP Protocol Excel scoresheet.</p>
            <p>Required: a row containing domain headers (<em>Mand, Tact, Listener, VP-MTS, Play, Social, Imitation, LRFFC, IV, Group, Ling., Math</em>) and milestone score rows below it.</p>
            <p>Compatible with: VB-MAPP Scoring Protocol (2nd edition) Excel format.</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STEP 2 — Review & Select                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {step === 'review' && parsed && (
        <div className="space-y-5">

          {/* Info from file */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <p className="font-semibold text-gray-800 text-sm">📄 Assessment File Info</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Child name in file</p>
                <p className="font-medium text-gray-800 mt-0.5">{parsed.childName || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Date of birth in file</p>
                <p className="font-medium text-gray-800 mt-0.5">{parsed.dob || '—'}</p>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
              ⚠️ The child name and DOB shown above are <strong>read from your file for reference only</strong> and will not be saved to the database. Link to a client below.
            </div>
          </div>

          {/* Client & Plan mapping */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <p className="font-semibold text-gray-800 text-sm">🔗 Link to Your System</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Client (optional — for reference)
                </label>
                <select
                  className="input w-full text-sm"
                  value={selectedChild}
                  onChange={e => setSelectedChild(e.target.value)}
                >
                  <option value="">— Select client —</option>
                  {children.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Training Plan <span className="text-red-500">*</span>
                </label>
                <select
                  className="input w-full text-sm"
                  value={selectedPlan}
                  onChange={e => setSelectedPlan(e.target.value)}
                >
                  <option value="">— Select a plan —</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.child_name ? `(${p.child_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Domain assessment summary + goal selection */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-semibold text-gray-800 text-sm">
                🎯 Suggested Goals from Assessment Results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const all = {};
                    parsed.domains.forEach(d => d.suggested.forEach(m => { all[m.id] = true; }));
                    setChecked(all);
                  }}
                  className="text-xs text-brand-600 hover:underline"
                >Select all</button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setChecked({})}
                  className="text-xs text-gray-400 hover:underline"
                >None</button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {parsed.domains.map(domainData => {
                const { domain, highestMastered, hasData, suggested } = domainData;
                const abbrev = VBMAPP_ABBREVS[domain] || domain;
                const domainSelected = suggested.filter(m => checked[m.id]).length;

                return (
                  <div key={domain} className="px-5 py-4 space-y-3">
                    {/* Domain header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700">
                          {abbrev}
                        </span>
                        <span className="font-medium text-gray-800 text-sm">{domain}</span>
                        {hasData && (
                          <span className="text-xs text-gray-400">
                            Highest mastered: <strong className="text-gray-600">
                              {highestMastered > 0 ? `Level ${highestMastered}` : 'None yet'}
                            </strong>
                          </span>
                        )}
                        {!hasData && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">No scores found</span>
                        )}
                      </div>
                      {suggested.length > 0 && (
                        <span className="text-xs text-gray-400">
                          {domainSelected}/{suggested.length} selected
                        </span>
                      )}
                    </div>

                    {/* Level progress dots */}
                    {hasData && (
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => (
                          <div
                            key={n}
                            title={`Level ${n}`}
                            className={`w-3 h-3 rounded-full ${
                              n <= highestMastered
                                ? 'bg-green-500'
                                : n === highestMastered + 1
                                ? 'bg-amber-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs text-gray-400">{highestMastered}/15</span>
                      </div>
                    )}

                    {/* Suggested milestones */}
                    {suggested.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-400 font-medium">
                          Next milestones to target (Level {highestMastered + 1}+):
                        </p>
                        {suggested.map(m => (
                          <label
                            key={m.id}
                            className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer border transition-colors ${
                              checked[m.id]
                                ? 'bg-indigo-50 border-indigo-200'
                                : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 accent-indigo-600 flex-shrink-0"
                              checked={!!checked[m.id]}
                              onChange={e => setChecked(prev => ({ ...prev, [m.id]: e.target.checked }))}
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-indigo-700 mr-1.5">
                                {vbLabel(m.domain, m.milestone_number)}
                              </span>
                              <span className="text-xs text-gray-700">{m.milestone_name}</span>
                              <span className="ml-2 text-xs text-gray-400">Level {m.level}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No milestones found for this domain in the database.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* HIPAA Acknowledgment */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              className="mt-0.5 accent-brand-600 flex-shrink-0"
              checked={hipaaAck}
              onChange={e => setHipaaAck(e.target.checked)}
            />
            <span className="text-sm text-gray-700">
              <strong>HIPAA Acknowledgment:</strong> I confirm that I am an authorized member of this child's care team,
              that I have the appropriate permissions to access and import this assessment data,
              and that my organization's policies regarding PHI handling have been followed.
            </span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => { setStep('upload'); setParsed(null); setChecked({}); setHipaaAck(false); }}
              className="btn-secondary text-sm"
            >
              ← Change File
            </button>
            <button
              onClick={handleImport}
              disabled={totalSelected === 0 || !selectedPlan || !hipaaAck}
              className="btn-primary text-sm disabled:opacity-50"
            >
              Import {totalSelected} Goal{totalSelected !== 1 ? 's' : ''} to Plan
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STEP — Importing (loading)                                         */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {step === 'importing' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
          <p className="text-gray-600 font-medium">Creating goals and adding to plan…</p>
          <p className="text-gray-400 text-sm">This may take a few seconds for large imports</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STEP — Done                                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {step === 'done' && importResult && (
        <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
          <div>
            <p className="text-xl font-bold text-gray-800">Import Complete!</p>
            <p className="text-gray-500 text-sm mt-1">
              <strong>{importResult.goalsApplied}</strong> goal{importResult.goalsApplied !== 1 ? 's were' : ' was'} added to the training plan with full clinical program plan details.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => navigate(`/plans/${importResult.planId}`)}
              className="btn-primary text-sm"
            >
              View Training Plan →
            </button>
            <button
              onClick={() => { setStep('upload'); setParsed(null); setChecked({}); setHipaaAck(false); setImportResult(null); }}
              className="btn-secondary text-sm"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
