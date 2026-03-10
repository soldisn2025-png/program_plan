'use client'

import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { ACCOUNTS, HOME_EQUITY, NET_WORTH_HISTORY, getFinancialSummary } from '@/lib/real-data'

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Math.round(n).toLocaleString()}`
}

const latest = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 1]
const prev = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 2]
const monthChange = latest.total - prev.total
const ytdChange = latest.total - (NET_WORTH_HISTORY.find(d => d.month === 'Jan 26')?.total ?? prev.total)
const allTimeStart = NET_WORTH_HISTORY[0].total
const allTimeChange = latest.total - allTimeStart

// Group accounts for display
const ACCOUNT_GROUPS = [
  {
    label: '은퇴 계좌 (Tax-Advantaged)',
    color: '#10B981',
    accounts: ACCOUNTS.filter(a => a.isTaxAdvantaged),
  },
  {
    label: '투자/과세 계좌 (Taxable)',
    color: '#F59E0B',
    accounts: ACCOUNTS.filter(a => !a.isTaxAdvantaged && !['crypto'].includes(a.id) && a.current > 0),
  },
]

const totalRetirement = ACCOUNT_GROUPS[0].accounts.reduce((s, a) => s + a.current, 0)
const totalTaxable = ACCOUNT_GROUPS[1].accounts.reduce((s, a) => s + a.current, 0)

export default function NetWorthPage() {
  const summary = getFinancialSummary()

  return (
    <div style={{
      minHeight: '100vh', background: '#F0F4F8', color: '#1E293B',
      fontFamily: "'DM Mono', 'Courier New', monospace",
      padding: '24px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569', marginBottom: 4 }}>NET WORTH TRACKER</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', letterSpacing: -2 }}>{fmt(summary.totalNetWorth)}</span>
          <span style={{ fontSize: 12, color: monthChange >= 0 ? '#10B981' : '#EF4444' }}>
            {monthChange >= 0 ? '↑' : '↓'} {fmt(Math.abs(monthChange))} (지난달)
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { label: '순 금융자산', value: fmt(summary.totalInvestable), sub: 'ABLE 제외', color: '#3B82F6' },
          { label: '은퇴 계좌', value: fmt(totalRetirement), sub: '세제 혜택', color: '#10B981' },
          { label: '과세 투자', value: fmt(totalTaxable), sub: '브리지 자산', color: '#F59E0B' },
          { label: '홈 에쿼티', value: fmt(HOME_EQUITY.equity), sub: '2034년 완납', color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 9, color: '#475569', letterSpacing: 2, marginBottom: 6 }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: -1 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#334155', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569' }}>HISTORY · Jan 2023 – Feb 2026</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, color: '#475569' }}>YTD 2026</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: ytdChange >= 0 ? '#10B981' : '#EF4444' }}>
                {ytdChange >= 0 ? '+' : ''}{fmt(ytdChange)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, color: '#475569' }}>전체 기간</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6' }}>+{fmt(allTimeChange)}</div>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={NET_WORTH_HISTORY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#334155' }} interval={2} />
            <YAxis
              tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
              tick={{ fontSize: 9, fill: '#334155' }}
              width={52}
            />
            <Tooltip
              formatter={(v: number) => [fmt(v), '순자산']}
              contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 10 }}
              labelStyle={{ color: '#94A3B8' }}
            />
            <ReferenceLine y={900000} stroke="#8B5CF6" strokeDasharray="4 2"
              label={{ value: 'FI $900K', fill: '#8B5CF6', fontSize: 9, position: 'right' }} />
            <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2}
              fill="url(#nwGrad)" dot={{ r: 2, fill: '#3B82F6', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Account breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {ACCOUNT_GROUPS.map(g => (
          <div key={g.label} style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#475569', marginBottom: 12 }}>{g.label.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {g.accounts.map(a => {
                const p = Math.min(100, (a.current / a.target2035) * 100)
                return (
                  <div key={a.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div>
                        <span style={{ fontSize: 10, color: '#334155' }}>{a.icon} {a.label}</span>
                        <div style={{ fontSize: 8, color: '#334155', marginTop: 1 }}>{a.note}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{fmt(a.current)}</div>
                        <div style={{ fontSize: 8, color: '#475569' }}>→ {fmt(a.target2035)} by 2035</div>
                      </div>
                    </div>
                    <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2 }}>
                      <div style={{
                        height: '100%',
                        width: `${p}%`,
                        background: `linear-gradient(90deg, ${a.color}55, ${a.color})`,
                        borderRadius: 2,
                      }} />
                    </div>
                    <div style={{ fontSize: 8, color: '#334155', marginTop: 2 }}>{p.toFixed(0)}% of 2035 target</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Home equity card */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px' }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#475569', marginBottom: 10 }}>🏠 부동산 현황 (버지니아)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: '시세', value: fmt(HOME_EQUITY.value), color: '#94A3B8' },
            { label: '모기지 잔액', value: fmt(HOME_EQUITY.mortgage), color: '#EF4444' },
            { label: '현재 에쿼티', value: fmt(HOME_EQUITY.equity), color: '#10B981' },
            { label: '2035년 예상 에쿼티', value: fmt(HOME_EQUITY.projected2035Equity), color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '10px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 8, color: '#475569', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 9, color: '#334155' }}>
          모기지 완납: 2034년 11월 · Kelly + 태민 거주 유지 예정 · 매각 시 양도세 $500K 부부 면세 적용
        </div>
      </div>
    </div>
  )
}
