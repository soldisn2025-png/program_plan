'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { formatCurrency } from '@/lib/retirement'

// Demo historical data
const NET_WORTH_HISTORY = [
  { month: 'Sep 24', netWorth: 241_200, retirement: 138_500, taxable: 72_100, cash: 30_600 },
  { month: 'Oct 24', netWorth: 248_900, retirement: 143_200, taxable: 73_800, cash: 31_900 },
  { month: 'Nov 24', netWorth: 256_300, retirement: 148_400, taxable: 75_900, cash: 32_000 },
  { month: 'Dec 24', netWorth: 262_100, retirement: 151_900, taxable: 77_200, cash: 33_000 },
  { month: 'Jan 25', netWorth: 271_800, retirement: 155_200, taxable: 82_100, cash: 34_500 },
  { month: 'Feb 25', netWorth: 279_400, retirement: 157_800, taxable: 85_300, cash: 36_300 },
  { month: 'Mar 25', netWorth: 287_500, retirement: 160_600, taxable: 88_800, cash: 38_100 },
]

const ACCOUNTS = [
  { id: 1, name: 'Fidelity 401(k)', balance: 112_400, type: 'Pretax 401k', institution: 'Fidelity', change: +2_100, changePct: 1.9 },
  { id: 2, name: 'Robinhood Roth IRA', balance: 48_200, type: 'Roth IRA', institution: 'Robinhood', change: +840, changePct: 1.8 },
  { id: 3, name: 'E*Trade Brokerage', balance: 63_900, type: 'Taxable Brokerage', institution: 'E*Trade', change: +1_260, changePct: 2.0 },
  { id: 4, name: 'SoFi Savings', balance: 38_100, type: 'HYSA', institution: 'SoFi', change: +140, changePct: 0.4 },
  { id: 5, name: 'BofA Checking', balance: 24_900, type: 'Checking', institution: 'Bank of America', change: -200, changePct: -0.8 },
]

const formatTick = (value: number) => `$${(value / 1000).toFixed(0)}k`

export default function NetWorthPage() {
  const [view, setView] = useState<'area' | 'line'>('area')
  const latest = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 1]
  const prev = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 2]
  const monthChange = latest.netWorth - prev.netWorth

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Net Worth</h1>
        <p className="text-slate-500 mt-1">Track your total wealth across all accounts</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">Total Net Worth</p>
          <p className="stat-value">{formatCurrency(latest.netWorth)}</p>
          <p className="stat-delta text-emerald-600">↑ {formatCurrency(monthChange)} this month</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Retirement Accounts</p>
          <p className="stat-value">{formatCurrency(latest.retirement)}</p>
          <p className="stat-delta text-slate-500">{((latest.retirement / latest.netWorth) * 100).toFixed(0)}% of NW</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Taxable Investments</p>
          <p className="stat-value">{formatCurrency(latest.taxable)}</p>
          <p className="stat-delta text-slate-500">{((latest.taxable / latest.netWorth) * 100).toFixed(0)}% of NW</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Cash & Savings</p>
          <p className="stat-value">{formatCurrency(latest.cash)}</p>
          <p className="stat-delta text-slate-500">{((latest.cash / latest.netWorth) * 100).toFixed(0)}% of NW</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">7-Month History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setView('area')}
              className={view === 'area' ? 'btn-primary text-sm py-1.5' : 'btn-secondary text-sm py-1.5'}
            >
              Area
            </button>
            <button
              onClick={() => setView('line')}
              className={view === 'line' ? 'btn-primary text-sm py-1.5' : 'btn-secondary text-sm py-1.5'}
            >
              Lines
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          {view === 'area' ? (
            <AreaChart data={NET_WORTH_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tickFormatter={formatTick} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(val: number) => formatCurrency(val)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Area type="monotone" dataKey="retirement" stackId="1" stroke="#10b981" fill="#d1fae5" name="Retirement" />
              <Area type="monotone" dataKey="taxable" stackId="1" stroke="#6366f1" fill="#e0e7ff" name="Taxable" />
              <Area type="monotone" dataKey="cash" stackId="1" stroke="#3b82f6" fill="#dbeafe" name="Cash" />
            </AreaChart>
          ) : (
            <LineChart data={NET_WORTH_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tickFormatter={formatTick} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(val: number) => formatCurrency(val)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="netWorth" stroke="#1e3a8a" strokeWidth={2} name="Net Worth" dot={false} />
              <Line type="monotone" dataKey="retirement" stroke="#10b981" strokeWidth={1.5} name="Retirement" dot={false} />
              <Line type="monotone" dataKey="taxable" stroke="#6366f1" strokeWidth={1.5} name="Taxable" dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Account List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">All Accounts</h2>
          <button className="btn-primary text-sm py-1.5">+ Connect Account</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="text-left pb-3 font-medium">Account</th>
                <th className="text-left pb-3 font-medium">Type</th>
                <th className="text-right pb-3 font-medium">Balance</th>
                <th className="text-right pb-3 font-medium">1-Month Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ACCOUNTS.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <p className="font-medium text-slate-900">{acc.name}</p>
                    <p className="text-slate-400 text-xs">{acc.institution}</p>
                  </td>
                  <td className="py-3 text-slate-600">{acc.type}</td>
                  <td className="py-3 text-right font-semibold text-slate-900">
                    {formatCurrency(acc.balance)}
                  </td>
                  <td className="py-3 text-right">
                    <span className={acc.change >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                      {acc.change >= 0 ? '+' : ''}{formatCurrency(acc.change)}
                    </span>
                    <span className={`block text-xs ${acc.change >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      {acc.changePct >= 0 ? '+' : ''}{acc.changePct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td className="pt-3 font-bold text-slate-900" colSpan={2}>Total Net Worth</td>
                <td className="pt-3 text-right font-bold text-slate-900">{formatCurrency(latest.netWorth)}</td>
                <td className="pt-3 text-right font-bold text-emerald-600">+{formatCurrency(monthChange)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
