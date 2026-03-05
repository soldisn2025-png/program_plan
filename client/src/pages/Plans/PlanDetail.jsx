import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import VbmappGoalSelector from '../../components/VbmappGoalSelector';

const statusColors = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  mastered:    'bg-green-100 text-green-700',
  on_hold:     'bg-amber-100 text-amber-700',
};

const domainLabels = {
  verbal_behavior:    'Verbal Behavior',
  daily_living:       'Daily Living',
  social_skills:      'Social Skills',
  academic:           'Academic',
  behavior_reduction: 'Behavior Reduction',
  imitation:          'Imitation',
  motor_skills:       'Motor Skills',
};

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [addingGoal, setAddingGoal] = useState(false);
  const [saving, setSaving]     = useState(false);

  const fetchPlan = () =>
    api.get(`/plans/${id}`)
      .then(res => setPlan(res.data))
      .catch(() => toast.error('Failed to load plan'));

  useEffect(() => {
    fetchPlan().finally(() => setLoading(false));
  }, [id]);

  // Called by VbmappGoalSelector — creates the goal then adds it to the plan
  const handleAddVbmappGoal = async (goalName, domain, vbmappDomain) => {
    setSaving(true);
    try {
      // 1. Create as plan-specific goal (is_library_goal = FALSE via API default)
      // vbmapp_domain triggers automatic population of all 12 template fields
      const goalRes = await api.post('/goals', { name: goalName, domain, vbmapp_domain: vbmappDomain });
      // 2. Attach to this plan
      await api.post(`/plans/${id}/goals`, { goal_id: goalRes.data.id });
      await fetchPlan();
      toast.success('Goal added to plan');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add goal');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (pgId, status) => {
    try {
      await api.patch(`/plans/${id}/goals/${pgId}`, { status });
      setPlan(p => ({
        ...p,
        goals: p.goals.map(g => g.plan_goal_id === pgId ? { ...g, status } : g),
      }));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleRemoveGoal = async (pgId) => {
    try {
      await api.delete(`/plans/${id}/goals/${pgId}`);
      setPlan(p => ({ ...p, goals: p.goals.filter(g => g.plan_goal_id !== pgId) }));
      toast.success('Goal removed');
    } catch {
      toast.error('Failed to remove goal');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  );
  if (!plan) return <div className="text-center py-20 text-gray-500">Plan not found</div>;

  const masteredCount = plan.goals?.filter(g => g.status === 'mastered').length || 0;
  const totalCount    = plan.goals?.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/plans" className="hover:text-gray-700">Plans</Link>
            <span>›</span>
            <Link to={`/children/${plan.child_id}`} className="hover:text-gray-700">{plan.child_name}</Link>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
          {plan.description && <p className="text-gray-500 text-sm mt-1">{plan.description}</p>}
        </div>
        <Link to={`/data-collection/${id}`} className="btn-primary flex-shrink-0">
          📊 Log Session Data
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-brand-600">{totalCount}</div>
          <div className="text-xs text-gray-500 mt-1">Total Goals</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-blue-600">
            {plan.goals?.filter(g => g.status === 'in_progress').length || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">In Progress</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-green-600">{masteredCount}</div>
          <div className="text-xs text-gray-500 mt-1">Mastered</div>
        </div>
      </div>

      {/* Goals section */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Goals</h3>
          {!addingGoal && (
            <button
              onClick={() => setAddingGoal(true)}
              className="btn-secondary text-sm py-1.5"
            >
              + Add Goal
            </button>
          )}
        </div>

        {/* ── Add Goal Panel (VB-MAPP selector) ─────────────── */}
        {addingGoal && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Add a VB-MAPP Goal</h4>
              <button
                onClick={() => setAddingGoal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {saving ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-4 justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600" />
                Saving goal…
              </div>
            ) : (
              <VbmappGoalSelector onAdd={handleAddVbmappGoal} />
            )}
          </div>
        )}

        {/* ── Goals list ──────────────────────────────────────── */}
        {plan.goals?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No goals yet. Click <strong>+ Add Goal</strong> to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {plan.goals.map((goal, i) => (
              <div
                key={goal.plan_goal_id}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{goal.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {domainLabels[goal.domain] || goal.domain}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={goal.status}
                        onChange={e => handleStatusChange(goal.plan_goal_id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer focus:ring-1 focus:ring-brand-400 ${statusColors[goal.status]}`}
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="mastered">Mastered</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                      <Link
                        to={`/plans/${id}/goals/${goal.plan_goal_id}/program`}
                        className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium hover:bg-brand-100 transition-colors"
                      >
                        View Program Plan
                      </Link>
                      <button
                        onClick={() => handleRemoveGoal(goal.plan_goal_id)}
                        className="text-xs text-red-400 hover:text-red-600 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {goal.mastery_criteria && (
                    <p className="text-xs text-gray-400 mt-1">Mastery: {goal.mastery_criteria}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
