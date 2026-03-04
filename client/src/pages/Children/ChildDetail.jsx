import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

const levelLabels = { level_1: 'Level 1', level_2: 'Level 2', level_3: 'Level 3' };

export default function ChildDetail() {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/children/${id}`),
      api.get(`/plans?child_id=${id}`),
    ])
      .then(([childRes, plansRes]) => {
        setChild(childRes.data);
        setForm(childRes.data);
        setPlans(plansRes.data);
      })
      .catch(() => toast.error('Failed to load child'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/children/${id}`, form);
      setChild(res.data);
      setEditing(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  );

  if (!child) return <div className="text-center py-20 text-gray-500">Child not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/children" className="text-gray-400 hover:text-gray-600 text-sm">← Children</Link>
        <h2 className="text-xl font-bold text-gray-900">{child.first_name} {child.last_name}</h2>
        {child.diagnosis_level && (
          <span className="badge bg-blue-100 text-blue-700">{levelLabels[child.diagnosis_level]}</span>
        )}
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Profile Information</h3>
          {!editing
            ? <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-1.5">Edit</button>
            : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary text-sm py-1.5" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setForm(child); }} className="btn-secondary text-sm py-1.5">
                  Cancel
                </button>
              </div>
            )
          }
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input className="input" value={form.first_name || ''}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" value={form.last_name || ''}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" className="input"
                  value={form.date_of_birth ? form.date_of_birth.split('T')[0] : ''}
                  onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
              </div>
              <div>
                <label className="label">Diagnosis Level</label>
                <select className="input" value={form.diagnosis_level || ''}
                  onChange={e => setForm(f => ({ ...f, diagnosis_level: e.target.value }))}>
                  <option value="">Not specified</option>
                  <option value="level_1">Level 1</option>
                  <option value="level_2">Level 2</option>
                  <option value="level_3">Level 3</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Strengths</label>
              <textarea className="input" rows={2} value={form.strengths || ''}
                onChange={e => setForm(f => ({ ...f, strengths: e.target.value }))} />
            </div>
            <div>
              <label className="label">Areas of Concern</label>
              <textarea className="input" rows={2} value={form.areas_of_concern || ''}
                onChange={e => setForm(f => ({ ...f, areas_of_concern: e.target.value }))} />
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-gray-500">Date of Birth</dt>
              <dd className="font-medium mt-0.5">
                {child.date_of_birth ? new Date(child.date_of_birth).toLocaleDateString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Diagnosis Level</dt>
              <dd className="font-medium mt-0.5">{levelLabels[child.diagnosis_level] || '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-500">Strengths</dt>
              <dd className="font-medium mt-0.5">{child.strengths || '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-500">Areas of Concern</dt>
              <dd className="font-medium mt-0.5">{child.areas_of_concern || '—'}</dd>
            </div>
          </dl>
        )}
      </div>

      {/* Training Plans */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Training Plans ({plans.length})</h3>
          <Link to={`/plans/new?child_id=${id}`} className="btn-primary text-sm py-1.5">+ New Plan</Link>
        </div>

        {plans.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No plans yet. Create the first one.</p>
        ) : (
          <div className="space-y-3">
            {plans.map(plan => (
              <Link key={plan.id} to={`/plans/${plan.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{plan.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {plan.goal_count} goal{plan.goal_count !== 1 ? 's' : ''} ·{' '}
                    Created {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {plan.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
