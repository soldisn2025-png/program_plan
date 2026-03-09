'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/retirement'

const CONNECTED_ACCOUNTS = [
  {
    id: 1,
    institution: 'Fidelity',
    name: 'NetBenefits 401(k)',
    type: '401k',
    balance: 112_400,
    lastSync: '2 hours ago',
    status: 'active',
    icon: '🏦',
  },
  {
    id: 2,
    institution: 'Robinhood',
    name: 'Roth IRA',
    type: 'Roth IRA',
    balance: 48_200,
    lastSync: '2 hours ago',
    status: 'active',
    icon: '🐦',
  },
  {
    id: 3,
    institution: 'E*Trade',
    name: 'Individual Brokerage',
    type: 'Taxable Brokerage',
    balance: 63_900,
    lastSync: '2 hours ago',
    status: 'active',
    icon: '📈',
  },
  {
    id: 4,
    institution: 'SoFi',
    name: 'High-Yield Savings',
    type: 'HYSA (4.6% APY)',
    balance: 38_100,
    lastSync: '2 hours ago',
    status: 'active',
    icon: '💳',
  },
  {
    id: 5,
    institution: 'Bank of America',
    name: 'Advantage Checking',
    type: 'Checking',
    balance: 24_900,
    lastSync: '2 hours ago',
    status: 'active',
    icon: '🏛️',
  },
]

const PLAID_INSTITUTIONS = [
  'Fidelity', 'Robinhood', 'E*Trade', 'SoFi', 'Bank of America',
  'Charles Schwab', 'Vanguard', 'Chase', 'Wells Fargo', 'Ally Bank',
]

export default function AccountsPage() {
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime] = useState('2 hours ago')

  const totalBalance = CONNECTED_ACCOUNTS.reduce((s, a) => s + a.balance, 0)

  const handleSync = async () => {
    setSyncing(true)
    await new Promise((r) => setTimeout(r, 1500)) // Demo delay
    setSyncing(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Connected Accounts</h1>
          <p className="text-slate-500 mt-1">
            {CONNECTED_ACCOUNTS.length} accounts · Last synced {lastSyncTime}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-secondary flex items-center gap-2"
          >
            {syncing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing...
              </>
            ) : '↻ Sync All'}
          </button>
          <button className="btn-primary">+ Connect Account</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-label">Total Balance</p>
          <p className="stat-value">{formatCurrency(totalBalance)}</p>
          <p className="stat-delta text-slate-500">Across {CONNECTED_ACCOUNTS.length} accounts</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Retirement Accounts</p>
          <p className="stat-value">
            {formatCurrency(CONNECTED_ACCOUNTS.filter(a => ['401k', 'Roth IRA'].includes(a.type)).reduce((s, a) => s + a.balance, 0))}
          </p>
          <p className="stat-delta text-emerald-600">Tax-advantaged</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Liquid Cash</p>
          <p className="stat-value">
            {formatCurrency(CONNECTED_ACCOUNTS.filter(a => ['HYSA (4.6% APY)', 'Checking'].includes(a.type)).reduce((s, a) => s + a.balance, 0))}
          </p>
          <p className="stat-delta text-slate-500">~{Math.round(CONNECTED_ACCOUNTS.filter(a => ['HYSA (4.6% APY)', 'Checking'].includes(a.type)).reduce((s, a) => s + a.balance, 0) / 4800)} months expenses</p>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONNECTED_ACCOUNTS.map((acc) => (
          <div key={acc.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                {acc.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{acc.name}</p>
                <p className="text-sm text-slate-500">{acc.institution} · {acc.type}</p>
                <p className="text-xs text-slate-400 mt-0.5">Synced {acc.lastSync}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">{formatCurrency(acc.balance)}</p>
              <div className="flex items-center gap-1 justify-end mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400">Connected</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plaid Connect Info */}
      <div className="card bg-slate-50">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Connect More Accounts</h2>
        <p className="text-sm text-slate-600 mb-4">
          Connect additional accounts via Plaid — supports 12,000+ financial institutions.
          Your credentials are never stored; only read-only access is requested.
        </p>
        <div className="flex flex-wrap gap-2">
          {PLAID_INSTITUTIONS.map((inst) => (
            <span key={inst} className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
              {inst}
            </span>
          ))}
          <span className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-400">
            +12,000 more
          </span>
        </div>
      </div>
    </div>
  )
}
