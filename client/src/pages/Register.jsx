import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const roles = [
  { value: 'parent', label: 'Parent / Caregiver', desc: 'I manage my child\'s home therapy' },
  { value: 'rbt',    label: 'Therapist (RBT)',    desc: 'I deliver ABA therapy sessions' },
  { value: 'bcba',   label: 'BCBA Supervisor',    desc: 'I supervise therapy programs' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) { toast.error('Please select your role'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl text-white font-bold text-xl mb-4">
            ABA
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Get started with ABA Training Plans</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input className="input" placeholder="Jane" value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" placeholder="Smith" value={form.last_name}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="At least 8 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
            </div>

            <div>
              <label className="label">I am a…</label>
              <div className="space-y-2">
                {roles.map(r => (
                  <label key={r.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.role === r.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" name="role" value={r.value} className="mt-0.5"
                      checked={form.role === r.value}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{r.label}</div>
                      <div className="text-xs text-gray-500">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
