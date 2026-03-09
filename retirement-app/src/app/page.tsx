import { formatCurrency, calculateRetirementProjection } from '@/lib/retirement'
import ProgressRing from '@/components/ProgressRing'

// Demo data — will be replaced with Supabase fetches once auth is wired up
const DEMO_DATA = {
  netWorth: 287_500,
  accounts: [
    { name: 'Fidelity 401(k)', balance: 112_400, type: '401k', color: '#10b981' },
    { name: 'Robinhood Roth IRA', balance: 48_200, type: 'roth', color: '#6366f1' },
    { name: 'E*Trade Brokerage', balance: 63_900, type: 'brokerage', color: '#f59e0b' },
    { name: 'SoFi Savings', balance: 38_100, type: 'savings', color: '#3b82f6' },
    { name: 'BofA Checking', balance: 24_900, type: 'checking', color: '#ec4899' },
  ],
  monthlyContributions: 3_200,
  monthlyExpenses: 4_800,
  profile: {
    birth_year: 1985,
    target_retirement_year: 2035,
    target_retirement_age: 50,
    monthly_korea_budget_usd: 3_000,
  },
}

export default function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const projection = calculateRetirementProjection({
    currentNetWorth: DEMO_DATA.netWorth,
    monthlyContributions: DEMO_DATA.monthlyContributions,
    monthlyExpenses: DEMO_DATA.monthlyExpenses,
    koreaMonthlyBudgetUSD: DEMO_DATA.profile.monthly_korea_budget_usd,
    currentYear,
    targetRetirementYear: DEMO_DATA.profile.target_retirement_year,
  })

  const yearsRemaining = DEMO_DATA.profile.target_retirement_year - currentYear
  const age = currentYear - DEMO_DATA.profile.birth_year

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Age {age} · {yearsRemaining} years to retire at 50 · Korea-bound
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">Net Worth</p>
          <p className="stat-value">{formatCurrency(DEMO_DATA.netWorth)}</p>
          <p className="stat-delta text-emerald-600">↑ +$4,200 this month</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">FI Number (25× expenses)</p>
          <p className="stat-value">{formatCurrency(projection.fiNumber)}</p>
          <p className="stat-delta text-slate-500">${formatCurrency(projection.koreaMonthlyBudgetUSD)}/mo Korea budget</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Monthly Savings</p>
          <p className="stat-value">{formatCurrency(DEMO_DATA.monthlyContributions)}</p>
          <p className="stat-delta text-slate-500">Across all accounts</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Projected @ 2035</p>
          <p className="stat-value">{formatCurrency(projection.projectedNetWorthAtRetirement)}</p>
          <p className={`stat-delta ${projection.onTrack ? 'text-emerald-600' : 'text-red-500'}`}>
            {projection.onTrack ? '✓ On track' : '⚠ Need to increase savings'}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FI Progress Ring */}
        <div className="card flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900 self-start">FI Progress</h2>
          <ProgressRing
            percent={projection.progressPercent}
            size={180}
            color={projection.onTrack ? '#10b981' : '#f59e0b'}
            label={`${projection.progressPercent.toFixed(1)}%`}
            sublabel="of FI Number"
          />
          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Current</span>
              <span className="font-medium">{formatCurrency(DEMO_DATA.netWorth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target (FI)</span>
              <span className="font-medium">{formatCurrency(projection.fiNumber)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gap</span>
              <span className="font-medium text-orange-600">
                {formatCurrency(projection.fiNumber - DEMO_DATA.netWorth)}
              </span>
            </div>
          </div>
        </div>

        {/* Account Breakdown */}
        <div className="card col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Breakdown</h2>
          <div className="space-y-3">
            {DEMO_DATA.accounts.map((acc) => {
              const pct = (acc.balance / DEMO_DATA.netWorth) * 100
              return (
                <div key={acc.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{acc.name}</span>
                    <span className="text-slate-900 font-semibold">{formatCurrency(acc.balance)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: acc.color }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{pct.toFixed(1)}% of net worth</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/net-worth" className="btn-primary">View Net Worth History</a>
          <a href="/spending" className="btn-secondary">Analyze 6-Month Spending</a>
          <a href="/retirement" className="btn-secondary">Korea Retirement Dashboard</a>
          <a href="/ai-advice" className="btn-secondary">Get AI Advice</a>
        </div>
      </div>

      {/* Retirement Countdown */}
      <div className="card bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Retirement Countdown</p>
            <p className="text-4xl font-bold mt-1">{yearsRemaining} years</p>
            <p className="text-slate-400 text-sm mt-1">January 1, 2035 · Seoul, Korea 🇰🇷</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Monthly Korea Budget</p>
            <p className="text-2xl font-bold">
              {formatCurrency(DEMO_DATA.profile.monthly_korea_budget_usd)}
            </p>
            <p className="text-slate-400 text-sm">
              ≈ ₩{(DEMO_DATA.profile.monthly_korea_budget_usd * 1320).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
