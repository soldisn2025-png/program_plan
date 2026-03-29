import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import VbmappGoalSelector from '../../components/VbmappGoalSelector';

const domainLabels = {
  verbal_behavior:    'Verbal Behavior',
  daily_living:       'Daily Living',
  social_skills:      'Social Skills',
  academic:           'Academic',
  behavior_reduction: 'Behavior Reduction',
  imitation:          'Imitation',
  motor_skills:       'Motor Skills',
};

const STEPS = ['Plan Details', 'Select Goals', 'Review & Create'];

export default function PlanBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledChildId = searchParams.get('child_id') || '';

  const [step, setStep]           = useState(0);
  const [children, setChildren]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Goals staged for this plan: [{ name, domain }]
  const [stagedGoals, setStagedGoals] = useState([]);

  const [form, setForm] = useState({
    child_id:    prefilledChildId,
    name:        '',
    description: '',
  });

  useEffect(() => {
    api.get('/children')
      .then(r => setChildren(r.data))
      .catch(() => toast.error('Failed to load children'))
      .finally(() => setLoading(false));
  }, []);

  // Called by VbmappGoalSelector when user adds a goal
  const handleStageGoal = (goalName, domain, vbmappDomain, vbmappMilestoneCode) => {
    setStagedGoals(prev => [...prev, {
      name: goalName,
      domain,
      vbmappDomain,
      vbmappMilestoneCode,
    }]);
    toast.success('Goal added to plan');
  };

  const handleRemoveStaged = (index) => {
    setStagedGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      // 1. Create each staged goal as a plan-specific (non-library) goal
      // VB-MAPP metadata triggers milestone-first template resolution.
      const createdIds = await Promise.all(
        stagedGoals.map(g =>
          api.post('/goals', {
            name: g.name,
            domain: g.domain,
            vbmapp_domain: g.vbmappDomain,
            vbmapp_milestone_code: g.vbmappMilestoneCode,
          })
             .then(r => r.data.id)
        )
      );

      // 2. Create the training plan with those goal IDs
      const res = await api.post('/plans', { ...form, goal_ids: createdIds });
      toast.success('Training plan created!');
      navigate(`/plans/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChild = children.find(c => c.id === form.child_id);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/plans" className="text-gray-400 hover:text-gray-600 text-sm">← Plans</Link>
        <h2 className="text-xl font-bold text-gray-900">New Training Plan</h2>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 text-sm ${
              i === step ? 'text-brand-700 font-semibold' :
              i < step   ? 'text-gray-500' : 'text-gray-300'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i < step  ? 'bg-brand-600 border-brand-600 text-white' :
                i === step ? 'border-brand-600 text-brand-600' :
                             'border-gray-300 text-gray-300'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? 'bg-brand-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="card">

        {/* ── Step 0: Plan Details ─────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900">Plan Details</h3>
            <div>
              <label className="label">Child *</label>
              <select className="input" value={form.child_id}
                onChange={e => setForm(f => ({ ...f, child_id: e.target.value }))} required>
                <option value="">Select a child…</option>
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
              {children.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No children yet. <Link to="/children/new" className="underline">Add one first</Link>.
                </p>
              )}
            </div>
            <div>
              <label className="label">Plan Name *</label>
              <input className="input" placeholder="e.g., Fall 2025 Home Program" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea className="input" rows={3}
                placeholder="Describe the focus and goals of this training plan…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex justify-end">
              <button
                className="btn-primary"
                disabled={!form.child_id || !form.name}
                onClick={() => setStep(1)}
              >
                Next: Select Goals →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Select Goals ─────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Select Goals</h3>
              <span className="badge bg-brand-100 text-brand-700">
                {stagedGoals.length} added
              </span>
            </div>

            {/* VB-MAPP selector — suggestions + two-level dropdown */}
            <VbmappGoalSelector onAdd={handleStageGoal} />

            {/* Goals staged so far */}
            {stagedGoals.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Goals Added to This Plan ({stagedGoals.length})
                </p>
                <div className="space-y-2">
                  {stagedGoals.map((g, i) => (
                    <div key={i}
                      className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg"
                    >
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-snug">{g.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{domainLabels[g.domain] || g.domain}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStaged(i)}
                        className="text-red-400 hover:text-red-600 text-lg flex-shrink-0 leading-none"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button className="btn-secondary" onClick={() => setStep(0)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(2)}>
                Review ({stagedGoals.length} goals) →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review & Create ──────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900">Review & Create</h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Child</span>
                <span className="font-medium">
                  {selectedChild ? `${selectedChild.first_name} ${selectedChild.last_name}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plan Name</span>
                <span className="font-medium">{form.name}</span>
              </div>
              {form.description && (
                <div>
                  <span className="text-gray-500">Description</span>
                  <p className="text-gray-700 mt-1">{form.description}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Goals ({stagedGoals.length})
              </p>
              {stagedGoals.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No goals selected — you can add them after creating the plan.
                </p>
              ) : (
                <div className="space-y-2">
                  {stagedGoals.map((g, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-gray-800 flex-1">{g.name}</span>
                      <span className="text-gray-400 text-xs">{domainLabels[g.domain] || g.domain}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating…' : '✓ Create Training Plan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
