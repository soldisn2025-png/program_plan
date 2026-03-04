import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const roleGreeting = {
  parent: 'Welcome back! Here\'s how your child is progressing.',
  rbt:    'Ready for today\'s sessions?',
  bcba:   'Here\'s your caseload overview.',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/children'), api.get('/plans')])
      .then(([cRes, pRes]) => {
        setChildren(cRes.data);
        setPlans(pRes.data);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const activePlans = plans.filter(p => p.status === 'active');

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Hello, {user?.first_name}! 👋
        </h2>
        <p className="text-gray-500 mt-1">{roleGreeting[user?.role]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon="👶" label="Children" value={children.length}
          to="/children" cta="Add child"
          empty={children.length === 0}
        />
        <StatCard
          icon="📋" label="Active Plans" value={activePlans.length}
          to="/plans" cta="Create plan"
          empty={activePlans.length === 0}
        />
        <StatCard
          icon="🎯" label="Total Goals" value={plans.reduce((s, p) => s + parseInt(p.goal_count || 0), 0)}
          to="/goals" cta="Browse library"
        />
        <StatCard
          icon="✅" label="Mastered Goals" value="—"
          to="/plans"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Children */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Children</h3>
            <Link to="/children/new" className="text-sm text-brand-600 hover:underline">+ Add</Link>
          </div>
          {children.length === 0 ? (
            <EmptyState
              icon="👶"
              message="No children yet"
              action={{ to: '/children/new', label: 'Add a child profile' }}
            />
          ) : (
            <div className="space-y-3">
              {children.slice(0, 4).map(child => (
                <Link key={child.id} to={`/children/${child.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                    {child.first_name[0]}{child.last_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{child.first_name} {child.last_name}</p>
                    {child.diagnosis_level && (
                      <p className="text-xs text-gray-400">ASD {child.diagnosis_level.replace('_', ' ')}</p>
                    )}
                  </div>
                  <span className="ml-auto text-gray-300 text-sm">›</span>
                </Link>
              ))}
              {children.length > 4 && (
                <Link to="/children" className="text-sm text-brand-600 hover:underline block text-center pt-1">
                  View all {children.length} children →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Recent Plans */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Active Plans</h3>
            <Link to="/plans/new" className="text-sm text-brand-600 hover:underline">+ New</Link>
          </div>
          {activePlans.length === 0 ? (
            <EmptyState
              icon="📋"
              message="No active plans"
              action={{ to: '/plans/new', label: 'Create a training plan' }}
            />
          ) : (
            <div className="space-y-3">
              {activePlans.slice(0, 4).map(plan => (
                <div key={plan.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link to={`/plans/${plan.id}`} className="font-medium text-gray-900 text-sm hover:text-brand-600">
                      {plan.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      👶 {plan.child_name} · {plan.goal_count} goals
                    </p>
                  </div>
                  <Link to={`/data-collection/${plan.id}`}
                    className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium hover:bg-brand-100 transition-colors flex-shrink-0"
                  >
                    Log Data
                  </Link>
                </div>
              ))}
              {activePlans.length > 4 && (
                <Link to="/plans" className="text-sm text-brand-600 hover:underline block text-center pt-1">
                  View all {activePlans.length} plans →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction to="/children/new"   icon="👶" label="Add Child" />
          <QuickAction to="/plans/new"       icon="📋" label="New Plan" />
          <QuickAction to="/goals"           icon="🎯" label="Goal Library" />
          {activePlans[0] && (
            <QuickAction to={`/data-collection/${activePlans[0].id}`} icon="📊" label="Log Session" />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, to, cta, empty }) {
  return (
    <Link to={to} className="card hover:shadow-md transition-all text-center py-5 block">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {empty && cta && (
        <div className="text-xs text-brand-600 mt-2 font-medium">{cta} →</div>
      )}
    </Link>
  );
}

function EmptyState({ icon, message, action }) {
  return (
    <div className="text-center py-8">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-gray-500 mb-3">{message}</p>
      {action && (
        <Link to={action.to} className="text-sm text-brand-600 font-medium hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

function QuickAction({ to, icon, label }) {
  return (
    <Link to={to}
      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-brand-50 hover:text-brand-700 transition-colors text-center"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </Link>
  );
}
