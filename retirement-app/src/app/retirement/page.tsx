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
  ReferenceLine,
} from 'recharts'
import { calculateRetirementProjection, formatCurrency, USD_TO_KRW } from '@/lib/retirement'
import ProgressRing from '@/components/ProgressRing'

const CURRENT_YEAR = new Date().getFullYear()
const BIRTH_YEAR = 1985

// Build projection timeline
function buildTimeline(
  startNW: number,
  monthlyContrib: number,
  monthlyExpenses: number,
  retirementYear: number,
  usdToKrw: number
) {
  const timeline = []
  let nw = startNW
  const annualReturn = 0.07
  const fiNumber = monthlyExpenses * 12 * 25

  for (let year = CURRENT_YEAR; year <= retirementYear + 10; year++) {
    const isRetired = year >= retirementYear
    if (isRetired) {
      // 4% withdrawal
      nw = nw * (1 + annualReturn) - monthlyExpenses * 12
    } else {
      nw = nw * (1 + annualReturn) + monthlyContrib * 12
    }
    timeline.push({
      year,
      age: year - BIRTH_YEAR,
      netWorth: Math.round(nw),
      fiNumber: Math.round(fiNumber),
      isRetired,
    })
  }
  return timeline
}

// Korea cost of living data
const KOREA_EXPENSES = [
  { category: 'Housing (rent, Seoul suburban)', monthly: 900, notes: '원룸/apartment in Bundang, Ilsan area' },
  { category: 'Food & Dining', monthly: 500, notes: 'Mix of local restaurants & home cooking' },
  { category: 'National Health Insurance', monthly: 150, notes: 'NHI for US expat; actual rates vary' },
  { category: 'Transport', monthly: 100, notes: 'Seoul metro + occasional KTX' },
  { category: 'Entertainment & Travel', monthly: 300, notes: 'Local trips, flights back to US 1-2x/yr' },
  { category: 'Utilities & Phone', monthly: 120, notes: 'Electric, internet, mobile' },
  { category: 'Miscellaneous', monthly: 200, notes: 'Clothing, personal care, etc.' },
  { category: 'Emergency Buffer', monthly: 230, notes: '~8% buffer for unexpected costs' },
]

export default function RetirementPage() {
  const [view, setView] = useState<'family' | 'korea'>('korea')
  const [koreaMonthly, setKoreaMonthly] = useState(2500)
  const [familyMonthly, setFamilyMonthly] = useState(6000)
  const [currentNW] = useState(287_500)
  const [monthlyContrib] = useState(3_200)

  const targetYear = 2035
  const monthlyBudget = view === 'korea' ? koreaMonthly : familyMonthly
  const projection = calculateRetirementProjection({
    currentNetWorth: currentNW,
    monthlyContributions: monthlyContrib,
    monthlyExpenses: monthlyBudget,
    koreaMonthlyBudgetUSD: koreaMonthly,
    currentYear: CURRENT_YEAR,
    targetRetirementYear: targetYear,
    usdToKrw: USD_TO_KRW,
  })

  const timeline = buildTimeline(currentNW, monthlyContrib, monthlyBudget, targetYear, USD_TO_KRW)
  const totalKoreaExpenses = KOREA_EXPENSES.reduce((s, e) => s + e.monthly, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Retirement Dashboard</h1>
          <p className="text-slate-500 mt-1">Retire at 50 in 2035 · Moving to Korea 🇰🇷</p>
        </div>
        {/* View Toggle */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setView('korea')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === 'korea' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            🇰🇷 Korea View
          </button>
          <button
            onClick={() => setView('family')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === 'family' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            👨‍👩‍👧 Family View
          </button>
        </div>
      </div>

      {/* Budget Slider */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700">
            {view === 'korea' ? 'Korea Monthly Budget (USD)' : 'Family Monthly Budget (USD)'}
          </h2>
          <span className="text-xl font-bold text-blue-600">{formatCurrency(monthlyBudget)}</span>
        </div>
        <input
          type="range"
          min={1000}
          max={view === 'korea' ? 6000 : 12000}
          step={100}
          value={view === 'korea' ? koreaMonthly : familyMonthly}
          onChange={(e) =>
            view === 'korea'
              ? setKoreaMonthly(Number(e.target.value))
              : setFamilyMonthly(Number(e.target.value))
          }
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>$1,000</span>
          <span>{view === 'korea' ? '$6,000' : '$12,000'}</span>
        </div>
        {view === 'korea' && (
          <p className="text-sm text-slate-500 mt-2">
            ≈ ₩{(koreaMonthly * USD_TO_KRW).toLocaleString('ko-KR')} per month
          </p>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">FI Number</p>
          <p className="stat-value">{formatCurrency(projection.fiNumber)}</p>
          <p className="stat-delta text-slate-500">25× annual expenses</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Projected @ 2035</p>
          <p className="stat-value">{formatCurrency(projection.projectedNetWorthAtRetirement)}</p>
          <p className={`stat-delta ${projection.onTrack ? 'text-emerald-600' : 'text-red-500'}`}>
            {projection.onTrack ? '✓ On track' : '⚠ Behind'}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Years Remaining</p>
          <p className="stat-value">{projection.yearsToRetirement}</p>
          <p className="stat-delta text-slate-500">Until Jan 1, 2035</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Min Monthly Savings</p>
          <p className="stat-value">{formatCurrency(projection.monthlyContributionNeeded)}</p>
          <p className="stat-delta text-slate-500">to reach FI on time</p>
        </div>
      </div>

      {/* Progress + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Ring */}
        <div className="card flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900 self-start">FI Progress</h2>
          <ProgressRing
            percent={projection.progressPercent}
            size={160}
            color={projection.onTrack ? '#10b981' : '#f59e0b'}
            label={`${projection.progressPercent.toFixed(1)}%`}
            sublabel="of FI goal"
          />
          <div className="w-full space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Current NW</span>
              <span className="font-medium">{formatCurrency(currentNW)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">FI Target</span>
              <span className="font-medium">{formatCurrency(projection.fiNumber)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gap</span>
              <span className="font-medium text-orange-500">
                {formatCurrency(Math.max(0, projection.fiNumber - currentNW))}
              </span>
            </div>
          </div>
        </div>

        {/* Projection Chart */}
        <div className="card col-span-3">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Net Worth Projection</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v) => `${v} (${v - BIRTH_YEAR})`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(val: number, name: string) => [
                  formatCurrency(val),
                  name === 'netWorth' ? 'Net Worth' : 'FI Number',
                ]}
                labelFormatter={(label) => `${label} (Age ${Number(label) - BIRTH_YEAR})`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <ReferenceLine x={targetYear} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Retire', fill: '#ef4444', fontSize: 11 }} />
              <Line type="monotone" dataKey="netWorth" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="netWorth" />
              <Line type="monotone" dataKey="fiNumber" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="fiNumber" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Korea Cost of Living Breakdown */}
      {view === 'korea' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Korea Monthly Budget Breakdown</h2>
            <span className="text-sm text-slate-500">Estimated for Seoul Metro Area</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="text-left pb-3 font-medium">Category</th>
                  <th className="text-right pb-3 font-medium">Monthly (USD)</th>
                  <th className="text-right pb-3 font-medium">Monthly (KRW)</th>
                  <th className="text-left pb-3 font-medium pl-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {KOREA_EXPENSES.map((exp) => (
                  <tr key={exp.category} className="hover:bg-slate-50">
                    <td className="py-2.5 font-medium text-slate-800">{exp.category}</td>
                    <td className="py-2.5 text-right">{formatCurrency(exp.monthly)}</td>
                    <td className="py-2.5 text-right text-slate-600">
                      ₩{(exp.monthly * USD_TO_KRW).toLocaleString('ko-KR')}
                    </td>
                    <td className="py-2.5 text-slate-400 text-xs pl-4">{exp.notes}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td className="pt-3 font-bold text-slate-900">Total</td>
                  <td className="pt-3 text-right font-bold text-slate-900">{formatCurrency(totalKoreaExpenses)}</td>
                  <td className="pt-3 text-right font-bold text-slate-900">
                    ₩{(totalKoreaExpenses * USD_TO_KRW).toLocaleString('ko-KR')}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
            <p className="font-semibold mb-1">📋 Key Considerations for US → Korea Retirement</p>
            <ul className="space-y-1 text-blue-700 list-disc list-inside">
              <li>US-Korea tax treaty: US Social Security may be taxed in US only</li>
              <li>F-2 or F-5 visa required for long-term residence (marriage/ancestry options)</li>
              <li>Korean National Health Insurance (NHI) available for residents — lower cost than US</li>
              <li>Roth IRA withdrawals: tax-free in US; verify Korea treatment with a tax professional</li>
              <li>FBAR/FATCA reporting required for Korean bank accounts over $10,000</li>
            </ul>
          </div>
        </div>
      )}

      {/* Family View */}
      {view === 'family' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Family Retirement Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Income Sources</h3>
              {[
                { label: 'Roth IRA Withdrawals', value: '$400/mo (tax-free)', note: 'contributions basis first' },
                { label: '401k Distributions', value: '$1,200/mo', note: 'taxable, consider Roth ladder' },
                { label: 'Taxable Brokerage', value: '$600/mo', note: 'long-term cap gains rate' },
                { label: 'Cash Savings Draw', value: '$400/mo', note: 'bridge to SS at 62+' },
                { label: 'US Social Security', value: 'TBD', note: 'eligible at 62+ (reduced) or 67 (full)' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.note}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Risk Factors</h3>
              {[
                { label: 'Market Sequence Risk', level: 'High', color: 'text-red-500' },
                { label: 'Healthcare (pre-Medicare)', level: 'High', color: 'text-red-500' },
                { label: 'Currency (USD/KRW)', level: 'Medium', color: 'text-orange-500' },
                { label: 'Inflation in Korea', level: 'Medium', color: 'text-orange-500' },
                { label: 'Tax Law Changes', level: 'Low', color: 'text-yellow-500' },
                { label: 'Longevity Risk', level: 'Low', color: 'text-yellow-500' },
              ].map((risk) => (
                <div key={risk.label} className="flex justify-between">
                  <span className="text-sm text-slate-700">{risk.label}</span>
                  <span className={`text-sm font-semibold ${risk.color}`}>{risk.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
