import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',     icon: '🏠' },
  { to: '/children',   label: 'Children',       icon: '👶' },
  { to: '/plans',      label: 'Training Plans', icon: '📋' },
  { to: '/goals',      label: 'Goal Library',   icon: '🎯' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeColor = {
    parent: 'bg-green-100 text-green-700',
    rbt:    'bg-blue-100 text-blue-700',
    bcba:   'bg-purple-100 text-purple-700',
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            ABA
          </div>
          <span className="font-semibold text-gray-900 text-sm leading-tight">
            Training Plan<br />Generator
          </span>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-medium text-sm text-gray-900">{user?.first_name} {user?.last_name}</p>
          <span className={`badge mt-1 ${roleBadgeColor[user?.role] || 'bg-gray-100 text-gray-600'}`}>
            {user?.role?.toUpperCase()}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
