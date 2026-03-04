import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

export default function PlansList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/plans')
      .then(res => setPlans(res.data))
      .catch(() => toast.error('Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Training Plans</h2>
          <p className="text-sm text-gray-500 mt-0.5">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/plans/new" className="btn-primary">+ New Plan</Link>
      </div>

      {plans.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No training plans yet</h3>
          <p className="text-gray-500 mb-6">Create your first plan to start building ABA programs.</p>
          <Link to="/plans/new" className="btn-primary inline-block">Create First Plan</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => (
            <Link key={plan.id} to={`/plans/${plan.id}`}
              className="card hover:shadow-md hover:border-brand-200 transition-all block"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <span className={`badge ${plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    👶 {plan.child_name} · {plan.goal_count} goal{plan.goal_count !== 1 ? 's' : ''}
                  </p>
                  {plan.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">{plan.description}</p>
                  )}
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-xs text-gray-400">{new Date(plan.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">by {plan.created_by_name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
