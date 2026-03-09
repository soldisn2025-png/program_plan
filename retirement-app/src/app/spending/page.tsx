'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/retirement'

const MONTHS = ['Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25']

const SPENDING_BY_MONTH = [
  { month: 'Oct 24', Housing: 2100, Food: 680, Transport: 340, Entertainment: 210, Shopping: 380, Other: 290 },
  { month: 'Nov 24', Housing: 2100, Food: 720, Transport: 310, Entertainment: 340, Shopping: 510, Other: 320 },
  { month: 'Dec 24', Housing: 2100, Food: 810, Transport: 290, Entertainment: 580, Shopping: 890, Other: 430 },
  { month: 'Jan 25', Housing: 2100, Food: 650, Transport: 320, Entertainment: 180, Shopping: 290, Other: 260 },
  { month: 'Feb 25', Housing: 2100, Food: 690, Transport: 305, Entertainment: 220, Shopping: 310, Other: 275 },
  { month: 'Mar 25', Housing: 2100, Food: 710, Transport: 330, Entertainment: 240, Shopping: 350, Other: 270 },
]

const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#6366f1',
  Food: '#f59e0b',
  Transport: '#10b981',
  Entertainment: '#ec4899',
  Shopping: '#3b82f6',
  Other: '#94a3b8',
}

const BUDGETS: Record<string, number> = {
  Housing: 2100,
  Food: 750,
  Transport: 350,
  Entertainment: 250,
  Shopping: 400,
  Other: 300,
}

const RECENT_TRANSACTIONS = [
  { date: 'Mar 9', name: 'Whole Foods', category: 'Food', amount: 87.43 },
  { date: 'Mar 8', name: 'Netflix', category: 'Entertainment', amount: 15.49 },
  { date: 'Mar 7', name: 'Shell Gas', category: 'Transport', amount: 52.10 },
  { date: 'Mar 7', name: 'Amazon', category: 'Shopping', amount: 129.99 },
  { date: 'Mar 6', name: 'Rent', category: 'Housing', amount: 2100.00 },
  { date: 'Mar 5', name: 'Trader Joe\'s', category: 'Food', amount: 64.22 },
  { date: 'Mar 4', name: 'BART', category: 'Transport', amount: 6.90 },
  { date: 'Mar 3', name: 'Spotify', category: 'Entertainment', amount: 9.99 },
]

function avg6Month(category: string) {
  return SPENDING_BY_MONTH.reduce((s, m) => s + (m[category as keyof typeof m] as number || 0), 0) / 6
}

export default function SpendingPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const latestMonth = SPENDING_BY_MONTH[SPENDING_BY_MONTH.length - 1]
  const totalLatest = Object.entries(latestMonth)
    .filter(([k]) => k !== 'month')
    .reduce((s, [, v]) => s + (v as number), 0)

  const totalBudget = Object.values(BUDGETS).reduce((s, v) => s + v, 0)

  const pieData = Object.entries(latestMonth)
    .filter(([k]) => k !== 'month')
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Spending Analysis</h1>
        <p className="text-slate-500 mt-1">6-month breakdown — identify what to cut before 2035</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">This Month</p>
          <p className="stat-value">{formatCurrency(totalLatest)}</p>
          <p className={`stat-delta ${totalLatest <= totalBudget ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalLatest <= totalBudget
              ? `↓ ${formatCurrency(totalBudget - totalLatest)} under budget`
              : `↑ ${formatCurrency(totalLatest - totalBudget)} over budget`}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Monthly Budget</p>
          <p className="stat-value">{formatCurrency(totalBudget)}</p>
          <p className="stat-delta text-slate-500">6 categories</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">6-Mo Average</p>
          <p className="stat-value">
            {formatCurrency(
              SPENDING_BY_MONTH.reduce((s, m) => {
                return s + Object.entries(m).filter(([k]) => k !== 'month').reduce((cs, [, v]) => cs + (v as number), 0)
              }, 0) / 6
            )}
          </p>
          <p className="stat-delta text-slate-500">per month</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Korea Target</p>
          <p className="stat-value">$3,000</p>
          <p className="stat-delta text-orange-500">
            Need to cut {formatCurrency(totalLatest - 3000)}/mo
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked Bar Chart */}
        <div className="card col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Spending by Category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={SPENDING_BY_MONTH} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip
                formatter={(val: number, name: string) => [formatCurrency(val), name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">This Month</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-auto space-y-1.5 text-sm">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[d.name] }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-medium text-slate-900">{formatCurrency(d.value as number)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget vs Actual */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Budget vs Actual (6-Month Avg)</h2>
        <div className="space-y-4">
          {Object.entries(BUDGETS).map(([cat, budget]) => {
            const avg = avg6Month(cat)
            const pct = (avg / budget) * 100
            const over = avg > budget
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ background: CATEGORY_COLORS[cat] }}
                    />
                    {cat}
                  </span>
                  <div className="text-right">
                    <span className={`font-semibold ${over ? 'text-red-500' : 'text-slate-900'}`}>
                      {formatCurrency(avg)}
                    </span>
                    <span className="text-slate-400 ml-1">/ {formatCurrency(budget)}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: over ? '#ef4444' : CATEGORY_COLORS[cat],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="text-left pb-3 font-medium">Date</th>
                <th className="text-left pb-3 font-medium">Merchant</th>
                <th className="text-left pb-3 font-medium">Category</th>
                <th className="text-right pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {RECENT_TRANSACTIONS.map((tx, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2.5 text-slate-500">{tx.date}</td>
                  <td className="py-2.5 font-medium text-slate-800">{tx.name}</td>
                  <td className="py-2.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: `${CATEGORY_COLORS[tx.category]}20`,
                        color: CATEGORY_COLORS[tx.category],
                      }}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-medium text-slate-900">
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
