import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

const levelLabels = { level_1: 'Level 1', level_2: 'Level 2', level_3: 'Level 3' };
const levelColors = {
  level_1: 'bg-green-100 text-green-700',
  level_2: 'bg-yellow-100 text-yellow-700',
  level_3: 'bg-red-100 text-red-700',
};

function calcAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return `${years} yr`;
}

export default function ChildrenList() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/children')
      .then(res => setChildren(res.data))
      .catch(() => toast.error('Failed to load children'))
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
          <h2 className="text-xl font-bold text-gray-900">Child Profiles</h2>
          <p className="text-sm text-gray-500 mt-0.5">{children.length} profile{children.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/children/new" className="btn-primary">+ Add Child</Link>
      </div>

      {children.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">👶</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No children yet</h3>
          <p className="text-gray-500 mb-6">Add a child profile to start building training plans.</p>
          <Link to="/children/new" className="btn-primary inline-block">Add Your First Child</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map(child => (
            <Link key={child.id} to={`/children/${child.id}`}
              className="card hover:shadow-md hover:border-brand-200 transition-all cursor-pointer block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">
                  {child.first_name[0]}{child.last_name[0]}
                </div>
                {child.diagnosis_level && (
                  <span className={`badge ${levelColors[child.diagnosis_level]}`}>
                    {levelLabels[child.diagnosis_level]}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{child.first_name} {child.last_name}</h3>
              {child.date_of_birth && (
                <p className="text-sm text-gray-500">{calcAge(child.date_of_birth)} old</p>
              )}
              {child.areas_of_concern && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{child.areas_of_concern}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
