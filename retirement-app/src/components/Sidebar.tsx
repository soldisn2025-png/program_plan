'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const nav = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/net-worth', label: 'Net Worth', icon: '💰' },
  { href: '/spending', label: 'Spending', icon: '💳' },
  { href: '/retirement', label: 'Retirement', icon: '🏖️' },
  { href: '/ai-advice', label: 'AI Advisor', icon: '🤖' },
  { href: '/accounts', label: 'Accounts', icon: '🏦' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-lg">
            🎯
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Retire 2035</p>
            <p className="text-slate-400 text-xs mt-0.5">Korea-bound @ 50</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          <p>Target: Jan 1, 2035</p>
          <p className="mt-0.5 font-medium text-slate-400">
            {Math.ceil((new Date('2035-01-01').getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10} years away
          </p>
        </div>
      </div>
    </aside>
  )
}
