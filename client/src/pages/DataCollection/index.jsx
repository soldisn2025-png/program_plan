import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import ProgressChart from '../../components/ProgressChart';

const RESPONSES = [
  { key: 'correct',    label: '+',   color: 'bg-green-500 hover:bg-green-600 text-white' },
  { key: 'incorrect',  label: '−',   color: 'bg-red-500 hover:bg-red-600 text-white' },
  { key: 'no_response',label: 'NR',  color: 'bg-gray-400 hover:bg-gray-500 text-white' },
];

const PROMPT_LEVELS = [
  { key: 'independent',       label: 'Independent (I)' },
  { key: 'gestural',          label: 'Gestural (G)' },
  { key: 'verbal',            label: 'Verbal (V)' },
  { key: 'partial_physical',  label: 'Partial Physical (PP)' },
  { key: 'full_physical',     label: 'Full Physical (FP)' },
];

export default function DataCollection() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [progressCache, setProgressCache] = useState({});
  // trials[planGoalId] = [{ trial_number, response, prompt_level }]
  const [trials, setTrials] = useState({});
  const [promptLevels, setPromptLevels] = useState({});
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/plans/${planId}`)
      .then(res => {
        setPlan(res.data);
        const activeGoals = res.data.goals?.filter(g => g.status !== 'mastered');
        if (activeGoals?.length > 0) setActiveGoalId(activeGoals[0].plan_goal_id);
      })
      .catch(() => toast.error('Failed to load plan'))
      .finally(() => setLoading(false));
  }, [planId]);

  const loadProgress = async (pgId) => {
    if (progressCache[pgId]) return;
    const res = await api.get(`/sessions/progress/${pgId}`);
    setProgressCache(c => ({ ...c, [pgId]: res.data }));
  };

  const handleSelectGoal = (pgId) => {
    setActiveGoalId(pgId);
    loadProgress(pgId);
  };

  const logTrial = (pgId, response) => {
    const current = trials[pgId] || [];
    const trial_number = current.length + 1;
    setTrials(t => ({
      ...t,
      [pgId]: [...current, { trial_number, response, prompt_level: promptLevels[pgId] || 'independent' }],
    }));
  };

  const removeLast = (pgId) => {
    setTrials(t => {
      const current = t[pgId] || [];
      return { ...t, [pgId]: current.slice(0, -1) };
    });
  };

  const getStats = (pgId) => {
    const t = trials[pgId] || [];
    const total = t.length;
    const correct = t.filter(x => x.response === 'correct').length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : null;
    return { total, correct, pct };
  };

  const handleSubmit = async () => {
    const allTrials = Object.entries(trials).flatMap(([pgId, ts]) => ts);
    if (allTrials.length === 0) { toast.error('Log at least one trial first'); return; }

    setSubmitting(true);
    try {
      await api.post('/sessions', {
        child_id: plan.child_id,
        plan_id: planId,
        session_date: sessionDate,
        notes: sessionNotes,
        trials: allTrials,
      });
      toast.success('Session saved! Progress updated.');
      setTrials({});
      setProgressCache({});
      // Reload plan to get updated statuses
      const planRes = await api.get(`/plans/${planId}`);
      setPlan(planRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  );
  if (!plan) return <div className="text-center py-20 text-gray-500">Plan not found</div>;

  const activeGoals = plan.goals?.filter(g => g.status !== 'mastered') || [];
  const activeGoal = activeGoals.find(g => g.plan_goal_id === activeGoalId);
  const activeTrials = trials[activeGoalId] || [];
  const activeStats = getStats(activeGoalId);
  const totalTrialsLogged = Object.values(trials).flat().length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to={`/plans/${planId}`} className="hover:text-gray-700">← {plan.name}</Link>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" className="input w-auto text-sm py-1.5" value={sessionDate}
            onChange={e => setSessionDate(e.target.value)} />
          <button
            onClick={handleSubmit}
            disabled={submitting || totalTrialsLogged === 0}
            className="btn-primary"
          >
            {submitting ? 'Saving…' : `Save Session (${totalTrialsLogged} trials)`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal selector */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Goals</h3>
          {activeGoals.length === 0 && (
            <div className="card text-center py-6 text-gray-400 text-sm">
              All goals mastered! 🎉
            </div>
          )}
          {activeGoals.map(g => {
            const stats = getStats(g.plan_goal_id);
            return (
              <button
                key={g.plan_goal_id}
                onClick={() => handleSelectGoal(g.plan_goal_id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  activeGoalId === g.plan_goal_id
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-medium text-gray-900 leading-tight">{g.name}</p>
                {stats.total > 0 && (
                  <p className="text-xs mt-1">
                    <span className={`font-bold ${
                      stats.pct >= 80 ? 'text-green-600' : stats.pct >= 60 ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      {stats.pct}%
                    </span>
                    <span className="text-gray-400"> ({stats.correct}/{stats.total})</span>
                  </p>
                )}
              </button>
            );
          })}

          {/* Session notes */}
          <div className="pt-2">
            <label className="label text-xs">Session Notes</label>
            <textarea className="input text-sm" rows={3}
              placeholder="General session observations…"
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)} />
          </div>
        </div>

        {/* Trial logging */}
        <div className="lg:col-span-2 space-y-4">
          {!activeGoal ? (
            <div className="card text-center py-12 text-gray-400">Select a goal to log trials</div>
          ) : (
            <>
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{activeGoal.name}</h3>
                    {activeGoal.sd && (
                      <div className="mt-2 text-xs bg-blue-50 text-blue-800 rounded-lg p-2.5">
                        <span className="font-semibold">SD: </span>{activeGoal.custom_sd || activeGoal.sd}
                      </div>
                    )}
                  </div>
                  <span className="badge bg-blue-100 text-blue-700 text-xs flex-shrink-0 ml-3">
                    Trial {activeTrials.length + 1}
                  </span>
                </div>

                {/* Prompt level selector */}
                <div className="mb-4">
                  <label className="label text-xs">Prompt Level for Next Trial</label>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_LEVELS.map(pl => (
                      <button
                        key={pl.key}
                        onClick={() => setPromptLevels(p => ({ ...p, [activeGoalId]: pl.key }))}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          (promptLevels[activeGoalId] || 'independent') === pl.key
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {pl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big trial buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {RESPONSES.map(r => (
                    <button
                      key={r.key}
                      onClick={() => logTrial(activeGoalId, r.key)}
                      className={`${r.color} rounded-xl py-6 text-2xl font-black transition-transform active:scale-95 shadow-sm`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Trial tape */}
                <div className="min-h-[40px] flex flex-wrap gap-1.5 items-center">
                  {activeTrials.map((t, i) => (
                    <span key={i} className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                      t.response === 'correct' ? 'bg-green-100 text-green-700 border border-green-300' :
                      t.response === 'incorrect' ? 'bg-red-100 text-red-700 border border-red-300' :
                      'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}>
                      {t.response === 'correct' ? '+' : t.response === 'incorrect' ? '−' : 'NR'}
                    </span>
                  ))}
                  {activeTrials.length > 0 && (
                    <button onClick={() => removeLast(activeGoalId)}
                      className="text-xs text-gray-400 hover:text-red-500 ml-1">
                      ↩ Undo
                    </button>
                  )}
                </div>

                {/* Live accuracy */}
                {activeStats.total > 0 && (
                  <div className={`mt-3 text-center py-2 rounded-lg text-sm font-semibold ${
                    activeStats.pct >= 80 ? 'bg-green-50 text-green-700' :
                    activeStats.pct >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {activeStats.correct}/{activeStats.total} correct — {activeStats.pct}%
                    {activeStats.pct >= 80 && ' 🎉'}
                  </div>
                )}
              </div>

              {/* Progress Chart */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 text-sm">Progress Over Time</h4>
                  <Link
                    to={`/plans/${planId}/goals/${activeGoalId}/program`}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    View Program Plan →
                  </Link>
                </div>
                <ProgressChart data={progressCache[activeGoalId] || []} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
