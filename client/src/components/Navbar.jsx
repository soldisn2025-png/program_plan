import React from 'react';
import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard':  'Dashboard',
  '/children':   'Children',
  '/plans':      'Training Plans',
  '/goals':      'Goal Library',
};

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = Object.entries(titles).find(([path]) => pathname.startsWith(path))?.[1] || 'ABA App';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
