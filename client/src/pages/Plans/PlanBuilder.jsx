import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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

const STEPS = ['Plan Details', 'Select Goals', 'Review & Create'];

export default function PlanBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledChildId = searchParams.get('child_id') || '';
  const prefilledGoalId = searchParams.get('goal_id') || '';

  const [step, setStep] = useState(0);
  const [children, setChildren] = useState([]);
  const [goals, setGoals] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [goalSearch, setGoalSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    child_id: prefilledChildId,
    name: '',
    description: '',
    goal_ids: prefilledGoalId ? [prefilledGoalId] : [],
  });

  useEffect(() => {
    Promise.all([api.get('/children'), api.get('/goals'), api.get('/goals/domains')])
      .then(([cRes, gRes, dRes]) => {
        setChildren(cRes.data);
        setGoals(gRes.data);
        setDomains(dRes.data);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const toggleGoal = (id) => {
    setForm(f => ({
      ...f,
      goal_ids: f.goal_ids.includes(id)
        ? f.goal_ids.filter(g => g !== id)
        : [...f.goal_ids, id],
    }));
  };

  const filteredGoals = goals.filter(g => {
    const matchDomain = !selectedDomain || g.domain === selectedDomain;
    const matchSearch = !goalSearch || g.name.toLowerCase().includes(goalSearch.toLowerCase());
    return matchDomain && matchSearch;
  });

  const selectedGoals = goals.filter(g => form.goal_ids.includes(g.id));
  const selectedChild = children.find(c => c.id === form.child_id);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/plans', form);
      toast.success('Training plan created!');
      navigate(`/plans/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className={`flex items-center gap-2 text-sm ${i === step ? 'text-brand-700 font-semibold' : i < step ? 'text-gray-500' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i < step ? 'bg-brand-600 border-brand-600 text-white' :
                i === step ? 'border-brand-600 text-brand-600' :
                'border-gray-300 text-gray-300'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-brand-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="card">
        {/* Step 0: Plan Details */}
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

        {/* Step 1: Select Goals */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Select Goals</h3>
              <span className="badge bg-brand-100 text-brand-700">{form.goal_ids.length} selected</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input className="input flex-1" placeholder="Search goals…"
                value={goalSearch} onChange={e => setGoalSearch(e.target.value)} />
              <select className="input sm:w-48" value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}>
                <option value="">All Domains</option>
                {domains.map(d => (
                  <option key={d.domain} value={d.domain}>{domainLabels[d.domain] || d.domain}</option>
                ))}
              </select>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
              {filteredGoals.map(goal => (
                <label key={goal.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    form.goal_ids.includes(goal.id)
                      ? 'bg-brand-50 border border-brand-300'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <input type="checkbox" className="mt-0.5"
                    checked={form.goal_ids.includes(goal.id)}
                    onChange={() => toggleGoal(goal.id)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{goal.name}</p>
                    <p className="text-xs text-gray-500">{domainLabels[goal.domain]}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(0)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(2)}>
                Review ({form.goal_ids.length} goals) →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900">Review & Create</h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Child</span>
                <span className="font-medium">{selectedChild ? `${selectedChild.first_name} ${selectedChild.last_name}` : '—'}</span>
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
                Selected Goals ({form.goal_ids.length})
              </p>
              {form.goal_ids.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No goals selected — you can add them after creating the plan.</p>
              ) : (
                <div className="space-y-2">
                  {selectedGoals.map((g, i) => (
                    <div key={g.id} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-gray-800">{g.name}</span>
                      <span className="text-gray-400 text-xs ml-auto">{domainLabels[g.domain]}</span>
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
