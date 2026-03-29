import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

const domainLabels = {
  verbal_behavior:    'Verbal Behavior',
  daily_living:       'Daily Living',
  social_skills:      'Social Skills',
  academic:           'Academic',
  behavior_reduction: 'Behavior Reduction',
  imitation:          'Imitation',
  motor_skills:       'Motor Skills',
};

const domainColors = {
  verbal_behavior:    'bg-blue-100 text-blue-700 border-blue-200',
  daily_living:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  social_skills:      'bg-purple-100 text-purple-700 border-purple-200',
  academic:           'bg-amber-100 text-amber-700 border-amber-200',
  behavior_reduction: 'bg-red-100 text-red-700 border-red-200',
  imitation:          'bg-cyan-100 text-cyan-700 border-cyan-200',
  motor_skills:       'bg-orange-100 text-orange-700 border-orange-200',
};

// Official VB-MAPP domain abbreviations (used on scoring sheets)
const vbmappAbbrevs = {
  'Mand':                 'M',
  'Tact':                 'T',
  'Listener Responding':  'LR',
  'VP/MTS':               'VP',
  'Independent Play':     'IP',
  'Social Behavior':      'Soc',
  'Motor Imitation':      'MI',
  'Echoic':               'Ec',
  'Spontaneous Vocal Behavior': 'SVB',
  'LRFFC':                'LRFFC',
  'Intraverbal':          'IV',
  'Classroom Routines':   'Cls',
  'Linguistic Structure': 'Lin',
  'Reading':              'Rdg',
  'Writing':              'Wri',
  'Math':                 'Ma',
  'Spelling':             'Sp',
};

// Returns the standard VB-MAPP label e.g. "Mand 1-M"
const vbmappLabel = (domain, milestoneNumber) => {
  const abbrev = vbmappAbbrevs[domain] || domain;
  return `${domain} ${milestoneNumber}-${abbrev}`;
};

export default function GoalLibrary() {
  const [goals, setGoals] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // VB-MAPP state
  const [vbmappDomains, setVbmappDomains] = useState([]);
  const [selectedVbmappDomain, setSelectedVbmappDomain] = useState('');
  const [vbmappMilestones, setVbmappMilestones] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [goalText, setGoalText] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/goals'),
      api.get('/goals/domains'),
    ])
      .then(([goalsRes, domainsRes]) => {
        setGoals(goalsRes.data);
        setDomains(domainsRes.data);
      })
      .catch(() => toast.error('Failed to load goals'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch VB-MAPP domains on mount
  useEffect(() => {
    api.get('/goals/vbmapp-domains')
      .then(res => setVbmappDomains(res.data))
      .catch(() => toast.error('Failed to load VB-MAPP domains'));
  }, []);

  // Fetch milestones when VB-MAPP domain selection changes
  useEffect(() => {
    if (!selectedVbmappDomain) {
      setVbmappMilestones([]);
      setSelectedMilestone(null);
      setGoalText('');
      return;
    }
    api.get(`/goals/vbmapp-milestones/${encodeURIComponent(selectedVbmappDomain)}`)
      .then(res => setVbmappMilestones(res.data))
      .catch(() => toast.error('Failed to load VB-MAPP milestones'));
  }, [selectedVbmappDomain]);

  // Pre-populate goal text when a milestone is selected (uses VB-MAPP label e.g. "Mand 1-M")
  useEffect(() => {
    if (selectedMilestone) {
      const label = vbmappLabel(selectedMilestone.domain, selectedMilestone.milestone_number);
      setGoalText(`[${label}] ${selectedMilestone.milestone_name}`);
    }
  }, [selectedMilestone]);

  const filtered = goals.filter(g => {
    const matchDomain = !selectedDomain || g.domain === selectedDomain;
    const matchSearch = !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchSearch;
  });

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Goal Library</h2>
        <p className="text-sm text-gray-500 mt-0.5">{goals.length} evidence-based ABA goals</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="input max-w-sm"
          placeholder="Search goals…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDomain('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !selectedDomain ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            All ({goals.length})
          </button>
          {domains.map(d => (
            <button
              key={d.domain}
              onClick={() => setSelectedDomain(d.domain === selectedDomain ? '' : d.domain)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedDomain === d.domain
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {domainLabels[d.domain] || d.domain} ({d.count})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goal list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">No goals match your search.</div>
          ) : filtered.map(goal => (
            <button
              key={goal.id}
              onClick={() => setSelected(selected?.id === goal.id ? null : goal)}
              className={`w-full text-left card p-4 transition-all ${
                selected?.id === goal.id
                  ? 'border-brand-400 bg-brand-50 shadow-md'
                  : 'hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{goal.name}</p>
                  {goal.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{goal.description}</p>
                  )}
                </div>
                <span className={`badge flex-shrink-0 border ${domainColors[goal.domain] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {domainLabels[goal.domain] || goal.domain}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Goal detail preview */}
        {selected ? (
          <div className="card sticky top-6 h-fit space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                <span className={`badge mt-1 border ${domainColors[selected.domain] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {domainLabels[selected.domain] || selected.domain}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {selected.description && (
              <p className="text-sm text-gray-600">{selected.description}</p>
            )}

            <div className="space-y-3 text-sm border-t pt-4">
              <TemplateField label="Data Collection" value={selected.data_collection} />
              <TemplateField label="Prerequisite Skills" value={selected.prerequisite_skills} />
              <TemplateField label="Materials / Set-up Required" value={selected.materials} />
              <TemplateField label="SD (Discriminative Stimulus)" value={selected.sd} />
              <TemplateField label="Correct Responses" value={selected.correct_responses} />
              <TemplateField label="Incorrect Responses" value={selected.incorrect_responses} />
              <TemplateField
                label={`Prompting Hierarchy: ${selected.prompting_hierarchy === 'most_to_least' ? 'Most to Least' : 'Least to Most'}`}
                value={selected.prompting_hierarchy_detail}
              />
              <TemplateField label="Error Correction" value={selected.error_correction} />
              <TemplateField label="Transfer Procedure" value={selected.transfer_procedure} />
              <TemplateField label="Reinforcement Schedule" value={selected.reinforcement_schedule} />
              <TemplateField label="Generalization Plan" value={selected.generalization_plan} />
              <TemplateField label="Maintenance Plan" value={selected.maintenance_plan} />
            </div>

            <button
              className="btn-primary w-full mt-4"
              onClick={() => navigate(`/plans/new?goal_id=${selected.id}`)}
            >
              Use in a Training Plan →
            </button>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">🎯</div>
            <p className="font-medium text-gray-600">Select a goal to preview</p>
            <p className="text-sm mt-1">Full program plan template will appear here</p>
          </div>
        )}
      </div>

      {/* ── VB-MAPP Milestone Browser ─────────────────────────────── */}
      <div className="border-t pt-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">VB-MAPP Milestones</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Browse 240 milestones across 16 skill domains — 3 levels, 5 milestones per level
          </p>
        </div>

        {/* Two-level dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-medium text-gray-700 mb-1">1. Select Domain</label>
            <select
              className="input w-full"
              value={selectedVbmappDomain}
              onChange={e => {
                setSelectedVbmappDomain(e.target.value);
                setSelectedMilestone(null);
                setGoalText('');
              }}
            >
              <option value="">Choose a domain…</option>
              {vbmappDomains.map(d => (
                <option key={d.domain} value={d.domain}>{d.domain}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-2xl">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              2. Select Milestone
              {selectedVbmappDomain && (
                <span className="ml-2 text-gray-400 font-normal">
                  — {vbmappMilestones.length} milestones
                </span>
              )}
            </label>
            <select
              className="input w-full"
              size={selectedVbmappDomain ? Math.min(vbmappMilestones.length + 1, 8) : 1}
              value={selectedMilestone?.id ?? ''}
              onChange={e => {
                const found = vbmappMilestones.find(m => String(m.id) === e.target.value);
                setSelectedMilestone(found || null);
              }}
              disabled={!selectedVbmappDomain || vbmappMilestones.length === 0}
            >
              <option value="">— choose a milestone —</option>
              {[1, 2, 3].map(lvl => {
                const group = vbmappMilestones.filter(m => m.level === lvl);
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

        {/* Preview card */}
        {selectedMilestone && (
          <div className="card max-w-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {/* VB-MAPP label as the primary identifier e.g. "Mand 1-M" */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-indigo-700">
                    {vbmappLabel(selectedMilestone.domain, selectedMilestone.milestone_number)}
                  </span>
                  <span className="badge border bg-indigo-100 text-indigo-700 border-indigo-200">
                    {selectedMilestone.domain}
                  </span>
                  <span className="badge border bg-gray-100 text-gray-600 border-gray-200">
                    Level {selectedMilestone.level}
                  </span>
                </div>
                <p className="font-medium text-gray-800 mt-2 text-sm leading-snug">
                  {selectedMilestone.milestone_name}
                </p>
              </div>
              <button
                onClick={() => { setSelectedMilestone(null); setGoalText(''); }}
                className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Goal Text <span className="text-gray-400 font-normal">(editable before adding)</span>
              </label>
              <textarea
                className="input w-full text-sm"
                rows={3}
                value={goalText}
                onChange={e => setGoalText(e.target.value)}
                placeholder="Customize the goal text before adding to a plan…"
              />
            </div>

            <button
              className="btn-primary w-full"
              disabled={!goalText.trim()}
              onClick={() =>
                navigate(
                  `/plans/new?vbmapp_id=${selectedMilestone.id}` +
                  `&vbmapp_code=${encodeURIComponent(selectedMilestone.milestone_code)}` +
                  `&vbmapp_goal=${encodeURIComponent(goalText)}`
                )
              }
            >
              Add to Client Goals →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-medium text-gray-700">{label}</dt>
      <dd className="text-gray-600 mt-0.5 leading-relaxed">{value}</dd>
    </div>
  );
}
