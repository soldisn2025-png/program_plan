import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

export default function NewChild() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '',
    diagnosis_level: '', strengths: '', areas_of_concern: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/children', form);
      toast.success('Child profile created');
      navigate(`/children/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/children" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h2 className="text-xl font-bold text-gray-900">New Child Profile</h2>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className="input" placeholder="Alex" value={form.first_name}
                onChange={e => set('first_name', e.target.value)} required />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" placeholder="Smith" value={form.last_name}
                onChange={e => set('last_name', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input" value={form.date_of_birth}
                onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div>
              <label className="label">ASD Diagnosis Level</label>
              <select className="input" value={form.diagnosis_level}
                onChange={e => set('diagnosis_level', e.target.value)}>
                <option value="">Select level…</option>
                <option value="level_1">Level 1 — Requires Support</option>
                <option value="level_2">Level 2 — Requires Substantial Support</option>
                <option value="level_3">Level 3 — Requires Very Substantial Support</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Strengths</label>
            <textarea className="input" rows={3}
              placeholder="e.g., Strong visual learner, motivated by music, excellent memory for routines…"
              value={form.strengths}
              onChange={e => set('strengths', e.target.value)} />
          </div>

          <div>
            <label className="label">Areas of Concern</label>
            <textarea className="input" rows={3}
              placeholder="e.g., Limited verbal communication, difficulty with transitions, sensory sensitivities…"
              value={form.areas_of_concern}
              onChange={e => set('areas_of_concern', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Create Profile'}
            </button>
            <Link to="/children" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
