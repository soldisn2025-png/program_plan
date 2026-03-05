import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const vbmappAbbrevs = {
  'Mand':                 'M',
  'Tact':                 'T',
  'Listener Responding':  'LR',
  'VP/MTS':               'VP',
  'Independent Play':     'IP',
  'Social Behavior':      'Soc',
  'Motor Imitation':      'MI',
  'Echoic':               'Ec',
  'LRFFC':                'LRFFC',
  'Intraverbal':          'IV',
  'Classroom Routines':   'Cls',
  'Linguistic Structure': 'Lin',
  'Reading':              'Rdg',
  'Writing':              'Wri',
  'Math':                 'Ma',
  'Spelling':             'Sp',
};

// Maps VB-MAPP clinical domain → goals table domain column
const vbmappDomainMap = {
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

const vbmappLabel = (domain, num) =>
  `${domain} ${num}-${vbmappAbbrevs[domain] || domain}`;

/**
 * VbmappGoalSelector
 * Props:
 *   onAdd(goalName: string, domain: string) — called when user adds a goal
 */
export default function VbmappGoalSelector({ onAdd }) {
  const [suggestions, setSuggestions]           = useState([]);
  const [domains, setDomains]                   = useState([]);
  const [selectedDomain, setSelectedDomain]     = useState('');
  const [milestones, setMilestones]             = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [goalText, setGoalText]                 = useState('');

  // Load suggestions + domain list once on mount
  useEffect(() => {
    api.get('/goals/vbmapp-suggestions').then(r => setSuggestions(r.data)).catch(() => {});
    api.get('/goals/vbmapp-domains').then(r => setDomains(r.data)).catch(() => {});
  }, []);

  // Load milestones whenever the domain selection changes
  useEffect(() => {
    if (!selectedDomain) {
      setMilestones([]);
      setSelectedMilestone(null);
      setGoalText('');
      return;
    }
    api.get(`/goals/vbmapp-milestones/${encodeURIComponent(selectedDomain)}`)
      .then(r => setMilestones(r.data))
      .catch(() => toast.error('Failed to load milestones'));
  }, [selectedDomain]);

  // Pre-fill editable text when a milestone is selected
  useEffect(() => {
    if (selectedMilestone) {
      setGoalText(
        `[${vbmappLabel(selectedMilestone.domain, selectedMilestone.milestone_number)}] ${selectedMilestone.milestone_name}`
      );
    }
  }, [selectedMilestone]);

  const commitAdd = (text, vbmappDomain) => {
    if (!text.trim()) return;
    const domain = vbmappDomainMap[vbmappDomain] || 'verbal_behavior';
    // Pass vbmappDomain as 3rd arg so parents can send it to the API for template lookup
    onAdd(text.trim(), domain, vbmappDomain);
  };

  const handleBrowseAdd = () => {
    commitAdd(goalText, selectedMilestone?.domain);
    // Reset browser state
    setSelectedDomain('');
    setSelectedMilestone(null);
    setGoalText('');
  };

  const handleSuggestionAdd = (m) => {
    const text = `[${vbmappLabel(m.domain, m.milestone_number)}] ${m.milestone_name}`;
    commitAdd(text, m.domain);
  };

  return (
    <div className="space-y-5">

      {/* ── Suggested Starting Goals ─────────────────────────── */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            ⚡ Suggested Starting Goals
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {suggestions.map(m => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-700">
                    {vbmappLabel(m.domain, m.milestone_number)}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                    {m.milestone_name}
                  </p>
                </div>
                <button
                  onClick={() => handleSuggestionAdd(m)}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center hover:bg-indigo-700 transition-colors"
                  title={`Add ${vbmappLabel(m.domain, m.milestone_number)}`}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Browse All VB-MAPP Milestones ────────────────────── */}
      <div className="border-t pt-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Browse VB-MAPP Milestones
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Dropdown 1 — Domain */}
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">1. Domain</label>
            <select
              className="input w-full text-sm"
              value={selectedDomain}
              onChange={e => {
                setSelectedDomain(e.target.value);
                setSelectedMilestone(null);
                setGoalText('');
              }}
            >
              <option value="">Choose a domain…</option>
              {domains.map(d => (
                <option key={d.domain} value={d.domain}>{d.domain}</option>
              ))}
            </select>
          </div>

          {/* Dropdown 2 — Milestone (grouped by level) */}
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">
              2. Milestone
              {selectedDomain && milestones.length > 0 && (
                <span className="ml-1 text-gray-400 font-normal">— {milestones.length} available</span>
              )}
            </label>
            <select
              className="input w-full text-sm"
              value={selectedMilestone?.id ?? ''}
              onChange={e => {
                const found = milestones.find(m => String(m.id) === e.target.value);
                setSelectedMilestone(found || null);
              }}
              disabled={!selectedDomain || milestones.length === 0}
            >
              <option value="">Choose a milestone…</option>
              {[1, 2, 3].map(lvl => {
                const group = milestones.filter(m => m.level === lvl);
                return group.length > 0 ? (
                  <optgroup key={lvl} label={`── Level ${lvl} ──`}>
                    {group.map(m => (
                      <option key={m.id} value={m.id}>
                        {vbmappLabel(m.domain, m.milestone_number)}
                        {'  —  '}
                        {m.milestone_name}
                      </option>
                    ))}
                  </optgroup>
                ) : null;
              })}
            </select>
          </div>
        </div>

        {/* Editable goal text + Add button */}
        {(selectedMilestone || goalText) && (
          <div className="space-y-2">
            <label className="block text-xs text-gray-600">
              Goal Text{' '}
              <span className="text-gray-400 font-normal">(editable before adding)</span>
            </label>
            <textarea
              className="input w-full text-sm"
              rows={2}
              value={goalText}
              onChange={e => setGoalText(e.target.value)}
              placeholder="Customize the goal text…"
            />
            <button
              className="btn-primary text-sm py-1.5 w-full"
              disabled={!goalText.trim()}
              onClick={handleBrowseAdd}
            >
              + Add to Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
