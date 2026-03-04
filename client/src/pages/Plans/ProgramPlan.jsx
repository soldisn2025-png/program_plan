import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const statusColors = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  mastered:    'bg-green-100 text-green-700',
  on_hold:     'bg-amber-100 text-amber-700',
};

export default function ProgramPlan() {
  const { planId, planGoalId } = useParams();
  const [plan, setPlan] = useState(null);
  const [goal, setGoal] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState({});
  const [saving, setSaving] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/plans/${planId}`),
      api.get(`/sessions/progress/${planGoalId}`),
    ])
      .then(([planRes, progressRes]) => {
        const planData = planRes.data;
        setPlan(planData);
        setProgressData(progressRes.data);

        const goalData = planData.goals?.find(g => g.plan_goal_id === planGoalId);
        setGoal(goalData);
        setOverrides({
          custom_materials: goalData?.custom_materials || '',
          custom_sd: goalData?.custom_sd || '',
          custom_reinforcement_schedule: goalData?.custom_reinforcement_schedule || '',
        });
      })
      .catch(() => toast.error('Failed to load program plan'))
      .finally(() => setLoading(false));
  }, [planId, planGoalId]);

  const handleSaveOverrides = async () => {
    setSaving(true);
    try {
      await api.patch(`/plans/${planId}/goals/${planGoalId}`, overrides);
      setGoal(g => ({ ...g, ...overrides }));
      setEditing(false);
      toast.success('Overrides saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  // Resolve displayed value: custom override takes priority, falls back to library default
  const val = (customKey, defaultKey) => {
    const custom = goal?.[customKey];
    return custom || goal?.[defaultKey] || null;
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  );
  if (!goal || !plan) return <div className="text-center py-20 text-gray-500">Program plan not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Nav & actions — hidden on print */}
      <div className="no-print flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/plans" className="hover:text-gray-700">Plans</Link>
          <span>›</span>
          <Link to={`/plans/${planId}`} className="hover:text-gray-700">{plan.name}</Link>
          <span>›</span>
          <span className="text-gray-900">Program Plan</span>
        </div>
        <div className="flex gap-2">
          {!editing
            ? <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-1.5">✏️ Customize</button>
            : (
              <>
                <button onClick={handleSaveOverrides} className="btn-primary text-sm py-1.5" disabled={saving}>
                  {saving ? 'Saving…' : '✓ Save Overrides'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-1.5">Cancel</button>
              </>
            )
          }
          <button onClick={handlePrint} className="btn-secondary text-sm py-1.5">🖨 Print / PDF</button>
        </div>
      </div>

      {/* ─────────────────────────────────────────── */}
      {/* PROGRAM PLAN DOCUMENT                       */}
      {/* ─────────────────────────────────────────── */}
      <div ref={printRef} className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden">

        {/* Document Header */}
        <div className="bg-brand-700 text-white px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">Program Plan</p>
              <h1 className="text-2xl font-bold leading-tight">{goal.name}</h1>
              <p className="text-brand-100 mt-1">{domainLabels[goal.domain] || goal.domain}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-brand-200 text-xs">Client</p>
              <p className="font-semibold">{plan.child_name}</p>
              <p className="text-brand-200 text-xs mt-2">Plan</p>
              <p className="text-sm">{plan.name}</p>
            </div>
          </div>
        </div>

        {/* Status & Meta Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-3 flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Status:</span>
            <span className={`badge ${statusColors[goal.status]}`}>
              {goal.status?.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Mastery Criteria:</span>
            <span className="font-medium text-gray-800">{goal.mastery_criteria}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <div className="px-8 py-4 border-b border-gray-100 bg-blue-50">
            <p className="text-sm text-blue-800 font-medium">Goal Description</p>
            <p className="text-sm text-blue-700 mt-1">{goal.description}</p>
          </div>
        )}

        {/* Template Fields */}
        <div className="divide-y divide-gray-100">

          <TemplateRow
            label="Data Collection"
            value={goal.data_collection}
            editing={editing}
            onEdit={null}
          />

          <TemplateRow
            label="Prerequisite Skills"
            value={goal.prerequisite_skills}
          />

          <TemplateRow
            label="Material / Set-up Required"
            value={val('custom_materials', 'materials')}
            customized={!!goal.custom_materials}
            editing={editing}
            editValue={overrides.custom_materials}
            onEdit={v => setOverrides(o => ({ ...o, custom_materials: v }))}
            placeholder="Override materials for this child (e.g., child-specific preferred items)…"
            fallback={goal.materials}
          />

          <TemplateRow
            label="SD (Discriminative Stimulus)"
            value={val('custom_sd', 'sd')}
            customized={!!goal.custom_sd}
            editing={editing}
            editValue={overrides.custom_sd}
            onEdit={v => setOverrides(o => ({ ...o, custom_sd: v }))}
            placeholder="Override the SD for this child if needed…"
            fallback={goal.sd}
          />

          <TemplateRow
            label="Correct Responses"
            value={goal.correct_responses}
          />

          <TemplateRow
            label="Incorrect Responses"
            value={goal.incorrect_responses}
          />

          <TemplateRow
            label={`Prompting Hierarchy: ${goal.prompting_hierarchy === 'most_to_least' ? 'Most to Least' : 'Least to Most'}`}
            value={goal.prompting_hierarchy_detail}
            highlight
          />

          <TemplateRow
            label="Error Correction"
            value={goal.error_correction}
          />

          <TemplateRow
            label="Transfer Procedure"
            value={goal.transfer_procedure}
          />

          <TemplateRow
            label="Reinforcement Schedule"
            value={val('custom_reinforcement_schedule', 'reinforcement_schedule')}
            customized={!!goal.custom_reinforcement_schedule}
            editing={editing}
            editValue={overrides.custom_reinforcement_schedule}
            onEdit={v => setOverrides(o => ({ ...o, custom_reinforcement_schedule: v }))}
            placeholder="Override reinforcement schedule for this child (e.g., specific preferred reinforcers)…"
            fallback={goal.reinforcement_schedule}
            highlight
          />

          <TemplateRow
            label="Generalization Plan"
            value={goal.generalization_plan}
          />

          <TemplateRow
            label="Maintenance Plan"
            value={goal.maintenance_plan}
          />
        </div>

        {/* Progress Summary */}
        {progressData.length > 0 && (
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Progress</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Trials</th>
                    <th className="pb-2 font-medium">Correct</th>
                    <th className="pb-2 font-medium">% Correct</th>
                    <th className="pb-2 font-medium">Prompt Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {progressData.slice(-10).map((dp, i) => (
                    <tr key={i} className="text-gray-700">
                      <td className="py-2">{new Date(dp.session_date).toLocaleDateString()}</td>
                      <td className="py-2">{dp.total_trials}</td>
                      <td className="py-2">{dp.correct_trials}</td>
                      <td className="py-2">
                        <span className={`font-semibold ${
                          parseFloat(dp.percentage_correct) >= 80 ? 'text-green-600' :
                          parseFloat(dp.percentage_correct) >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {dp.percentage_correct}%
                        </span>
                      </td>
                      <td className="py-2 text-gray-500 capitalize">
                        {dp.prompt_level_used?.replace('_', ' ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs text-gray-400">
          <span>ABA Training Plan Generator · {plan.child_name}</span>
          <span>Generated {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// TemplateRow component — renders one template field
// ─────────────────────────────────────────────────
function TemplateRow({ label, value, highlight, customized, editing, editValue, onEdit, placeholder, fallback }) {
  const displayValue = value || fallback;

  return (
    <div className={`px-8 py-5 ${highlight ? 'bg-amber-50/60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <dt className="text-sm font-semibold text-gray-800 flex-shrink-0">{label}</dt>
          {customized && (
            <span className="badge bg-indigo-100 text-indigo-700 text-xs flex-shrink-0">Customized</span>
          )}
        </div>
      </div>

      {editing && onEdit ? (
        <div className="mt-2">
          {fallback && (
            <p className="text-xs text-gray-400 mb-2 italic">Default: {fallback}</p>
          )}
          <textarea
            className="input text-sm"
            rows={3}
            placeholder={placeholder}
            value={editValue}
            onChange={e => onEdit(e.target.value)}
          />
        </div>
      ) : (
        <dd className="mt-1.5 text-sm text-gray-700 leading-relaxed">
          {displayValue || <span className="text-gray-300 italic">Not specified</span>}
        </dd>
      )}
    </div>
  );
}
