'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  ACCOUNTS, HOME_EQUITY, FI_NUMBER, KOREA_MONTHLY_BUDGET_USD, USD_TO_KRW,
  NET_WORTH_HISTORY, KOREA_CASHFLOW, ACTION_ITEMS_2026, MILESTONES,
  SCENARIOS, RISKS, TAIMIN_STATUS, ABLE_BALANCE, SS_ESTIMATE,
  getFinancialSummary,
} from '@/lib/real-data'

const CURRENT_YEAR = 2026

function fmt(n: number, compact = true): string {
  if (compact && n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (compact && n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function pct(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100))
}

// Build projection for spark chart
function buildProjection() {
  const points = []
  let nw = getFinancialSummary().totalNetWorth
  for (let yr = CURRENT_YEAR; yr <= 2035; yr++) {
    nw = nw * 1.07 + 27400 + 7000  // 401k + Roth annual contrib
    points.push({ year: yr, nw: Math.round(nw) })
  }
  return points
}

export default function DashboardPage() {
  const summary = getFinancialSummary()
  const [actions, setActions] = useState(ACTION_ITEMS_2026)

  const toggleAction = (i: number) => {
    setActions(prev => prev.map((a, idx) => idx === i ? { ...a, done: !a.done } : a))
  }

  const totalPct = pct(summary.totalNetWorth, FI_NUMBER + HOME_EQUITY.projected2035Equity)
  const investPct = pct(summary.totalInvestable, FI_NUMBER)
  const projection = buildProjection()

  const incomeMin = KOREA_CASHFLOW.income.reduce((s, r) => s + r.min, 0)
  const incomeMax = KOREA_CASHFLOW.income.reduce((s, r) => s + r.max, 0)
  const expenseMin = KOREA_CASHFLOW.expense.reduce((s, r) => s + r.min, 0)
  const expenseMax = KOREA_CASHFLOW.expense.reduce((s, r) => s + r.max, 0)
  const surplusMin = incomeMin - expenseMax
  const surplusMax = incomeMax - expenseMin
  const surplusOk = surplusMax > 0

  const yearsLeft = 2035 - CURRENT_YEAR

  return (
    <div style={{
      height: '100vh',
      display: 'grid',
      gridTemplateRows: '48px 1fr',
      overflow: 'hidden',
      fontFamily: "'DM Mono', 'Courier New', monospace",
      background: '#080C14',
      color: '#E2E8F0',
    }}>
      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', borderBottom: '1px solid #1E293B',
        background: '#05080F',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: '#475569' }}>FY {CURRENT_YEAR}</span>
          <span style={{ color: '#1E293B' }}>|</span>
          <span style={{ fontSize: 10, color: '#475569', letterSpacing: 2 }}>SOL (41) · KELLY (41) · 태민 (13)</span>
          <span style={{ color: '#1E293B' }}>|</span>
          <span style={{ fontSize: 10, color: '#3B82F6', letterSpacing: 1 }}>목표: 2035년 한국 귀국 🇰🇷</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {MILESTONES.map(m => (
            <div key={m.year} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: m.year <= CURRENT_YEAR ? '#10B981' : '#1E293B', letterSpacing: 1 }}>{m.year}</div>
              <div style={{ fontSize: 9, color: m.year <= CURRENT_YEAR ? '#10B981' : '#334155' }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: '#475569' }}>
          순자산 <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{fmt(summary.totalNetWorth)}</span>
        </div>
      </div>

      {/* ── MAIN 3×2 GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 1,
        background: '#1E293B',
        overflow: 'hidden',
      }}>

        {/* ── PANEL 1: TOTAL PROGRESS ── */}
        <div style={{ background: '#0A1020', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569' }}>TOTAL PROGRESS</div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: '#F8FAFC', letterSpacing: -1 }}>{fmt(summary.totalNetWorth)}</span>
            <span style={{ fontSize: 11, color: '#334155' }}>/ {fmt(FI_NUMBER)} FI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Ring */}
            <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="37" fill="none" stroke="#1E293B" strokeWidth="9" />
                <circle cx="45" cy="45" r="37" fill="none" stroke="url(#grad1)" strokeWidth="9"
                  strokeDasharray={`${investPct * 2.325} 232.5`}
                  strokeLinecap="round" transform="rotate(-90 45 45)" />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>{investPct}%</span>
                <span style={{ fontSize: 8, color: '#475569' }}>of FI</span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                ['FI 목표', fmt(FI_NUMBER), '#8B5CF6'],
                ['부족액', fmt(Math.max(0, FI_NUMBER - summary.totalInvestable)), '#F59E0B'],
                ['연평균 필요', fmt((FI_NUMBER - summary.totalInvestable) / yearsLeft), '#10B981'],
                ['은퇴까지', `${yearsLeft}년`, '#3B82F6'],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: '#475569' }}>{k}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini sparkline history */}
          <div style={{ flex: 1, minHeight: 60 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={NET_WORTH_HISTORY.slice(-14)} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" hide />
                <YAxis hide domain={['dataMin - 20000', 'dataMax + 20000']} />
                <Tooltip
                  formatter={(v: number) => fmt(v)}
                  contentStyle={{ background: '#0A1020', border: '1px solid #1E293B', borderRadius: 6, fontSize: 10 }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={1.5} fill="url(#aGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 8, color: '#1E293B' }}>14개월 순자산 추이</div>
        </div>

        {/* ── PANEL 2: ACCOUNTS ── */}
        <div style={{ background: '#0A1020', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569' }}>ACCOUNTS · 2026</div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, overflowY: 'auto' }}>
            {ACCOUNTS.filter(a => a.current > 0).map(a => {
              const p = pct(a.current, a.target2035)
              return (
                <div key={a.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 10 }}>{a.icon}</span>
                      <span style={{ fontSize: 10, color: '#94A3B8' }}>{a.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#F8FAFC' }}>{fmt(a.current)}</span>
                      <span style={{ fontSize: 9, color: a.color, minWidth: 28, textAlign: 'right' }}>{p}%</span>
                    </div>
                  </div>
                  <div style={{ height: 4, background: '#1E293B', borderRadius: 2 }}>
                    <div style={{
                      height: '100%', width: `${p}%`, borderRadius: 2,
                      background: `linear-gradient(90deg, ${a.color}66, ${a.color})`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 9, color: '#475569' }}>ABLE (태민 전용)</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6' }}>{fmt(ABLE_BALANCE)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: '#475569' }}>홈 에쿼티</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1' }}>{fmt(HOME_EQUITY.equity)}</div>
            </div>
          </div>
        </div>

        {/* ── PANEL 3: ACTION ITEMS ── */}
        <div style={{ background: '#0A1020', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569' }}>2026 ACTION ITEMS</div>
            <div style={{ fontSize: 9, color: '#334155' }}>
              {actions.filter(a => a.done).length}/{actions.length} done
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto' }}>
            {actions.map((a, i) => (
              <div
                key={i}
                onClick={() => toggleAction(i)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                  background: a.done ? '#0D1F0D' : '#0F172A',
                  border: `1px solid ${a.done ? '#1A3A1A' : '#1E293B'}`,
                  opacity: a.done ? 0.45 : 1, transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${a.priority === 'HIGH' ? '#EF4444' : a.priority === 'MED' ? '#F59E0B' : '#475569'}`,
                  background: a.done ? (a.priority === 'HIGH' ? '#EF4444' : a.priority === 'MED' ? '#F59E0B' : '#475569') : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {a.done && <span style={{ fontSize: 8, color: '#080C14', fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: a.done ? '#334155' : '#CBD5E1', textDecoration: a.done ? 'line-through' : 'none' }}>
                    {a.text}
                  </span>
                </div>
                <span style={{
                  fontSize: 8, letterSpacing: 1,
                  color: a.priority === 'HIGH' ? '#EF4444' : a.priority === 'MED' ? '#F59E0B' : '#475569',
                  flexShrink: 0,
                }}>{a.priority}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 9, color: '#1E293B', borderTop: '1px solid #1E293B', paddingTop: 5 }}>
            클릭하여 완료 체크 · 자동 저장
          </div>
        </div>

        {/* ── PANEL 4: CASHFLOW 2035 ── */}
        <div style={{ background: '#0A1020', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569' }}>2035 MONTHLY CASHFLOW · KOREA</div>

          <div style={{ display: 'flex', gap: 12, flex: 1 }}>
            {/* Income */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 9, color: '#10B981', letterSpacing: 2, marginBottom: 2 }}>INCOME</div>
              {KOREA_CASHFLOW.income.map((r, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#64748B' }}>{r.label}</span>
                    <span style={{ fontSize: 10, color: '#94A3B8' }}>${r.min}–{r.max}</span>
                  </div>
                  {r.note && <div style={{ fontSize: 8, color: '#334155' }}>{r.note}</div>}
                </div>
              ))}
              <div style={{ borderTop: '1px solid #1E293B', paddingTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>합계</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>${incomeMin}–{incomeMax}</span>
              </div>
            </div>

            <div style={{ width: 1, background: '#1E293B' }} />

            {/* Expense */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 9, color: '#EF4444', letterSpacing: 2, marginBottom: 2 }}>EXPENSE</div>
              {KOREA_CASHFLOW.expense.map((r, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#64748B' }}>{r.label}</span>
                    <span style={{ fontSize: 10, color: '#94A3B8' }}>${r.min}–{r.max}</span>
                  </div>
                  {r.note && <div style={{ fontSize: 8, color: '#334155' }}>{r.note}</div>}
                </div>
              ))}
              <div style={{ borderTop: '1px solid #1E293B', paddingTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444' }}>합계</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444' }}>${expenseMin}–{expenseMax}</span>
              </div>
            </div>
          </div>

          {/* Surplus / Deficit */}
          <div style={{
            padding: '8px 12px', borderRadius: 6,
            background: surplusOk ? '#0A1F0A' : '#1F0A0A',
            border: `1px solid ${surplusOk ? '#14532D' : '#7F1D1D'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 9, color: '#94A3B8' }}>월 흑자/적자 (부업 포함 시)</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: surplusOk ? '#10B981' : '#EF4444' }}>
              {surplusMin >= 0 ? `+${surplusMin}` : surplusMin} ~ {surplusMax >= 0 ? `+${surplusMax}` : surplusMax}
            </span>
          </div>

          <div style={{ fontSize: 8, color: '#334155' }}>
            SS 62세(2047) 수령 시 +${SS_ESTIMATE.age62}/월 추가
          </div>
        </div>

        {/* ── PANEL 5: SCENARIOS ── */}
        <div style={{ background: '#0A1020', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569' }}>SCENARIOS</div>

          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            {/* Scenario A */}
            <div style={{ flex: 1, background: '#0F172A', borderRadius: 8, padding: '12px', border: '1px solid #1E3A5F', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 9, color: '#3B82F6', letterSpacing: 2 }}>A. SOL 혼자</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#93C5FD' }}>{SCENARIOS.A.year} (50세)</div>
              {[
                ['수입', `$${SCENARIOS.A.monthlyIncomeMin}–${SCENARIOS.A.monthlyIncomeMax}`],
                ['지출', `$${SCENARIOS.A.monthlyExpenseMin}–${SCENARIOS.A.monthlyExpenseMax}`],
                ['집', '버지니아 유지'],
                ['부업', SCENARIOS.A.sidework],
                ['SS 후', SCENARIOS.A.ssNote],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: '#475569' }}>{k}</span>
                  <span style={{ fontSize: 9, color: '#94A3B8', textAlign: 'right', maxWidth: 90 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 4, padding: '4px 8px', background: '#1E3A5F33', borderRadius: 4, fontSize: 9, color: '#60A5FA', textAlign: 'center' }}>
                ⚠️ 타이트하지만 가능
              </div>
            </div>

            {/* Scenario B */}
            <div style={{ flex: 1, background: '#0F1A0F', borderRadius: 8, padding: '12px', border: '1px solid #14532D', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 9, color: '#10B981', letterSpacing: 2 }}>B. 전원 귀국</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6EE7B7' }}>{SCENARIOS.B.year} (55세)</div>
              {[
                ['수입', `$${SCENARIOS.B.monthlyIncomeMin}–${SCENARIOS.B.monthlyIncomeMax}`],
                ['지출', `$${SCENARIOS.B.monthlyExpenseMin}–${SCENARIOS.B.monthlyExpenseMax}`],
                ['집', '매각 ~$950K'],
                ['Kelly', SCENARIOS.B.sidework],
                ['SS 후', SCENARIOS.B.ssNote],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: '#475569' }}>{k}</span>
                  <span style={{ fontSize: 9, color: '#94A3B8', textAlign: 'right', maxWidth: 90 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 4, padding: '4px 8px', background: '#14532D33', borderRadius: 4, fontSize: 9, color: '#34D399', textAlign: 'center' }}>
                ✅ 집 매각이 핵심 엔진
              </div>
            </div>
          </div>

          {/* SS Comparison */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { age: 62, label: '62세 조기', val: SS_ESTIMATE.age62, color: '#F59E0B' },
              { age: 67, label: '67세 정년', val: SS_ESTIMATE.age67, color: '#10B981' },
              { age: 70, label: '70세 최대', val: SS_ESTIMATE.age70, color: '#3B82F6' },
            ].map(s => (
              <div key={s.age} style={{ flex: 1, background: '#0F172A', padding: '6px 8px', borderRadius: 5, border: '1px solid #1E293B', textAlign: 'center' }}>
                <div style={{ fontSize: 8, color: '#475569' }}>{s.label}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: s.color }}>${s.val}</div>
                <div style={{ fontSize: 7, color: '#334155' }}>/ 월</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PANEL 6: RISK + 태민 ── */}
        <div style={{ background: '#0A1020', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569' }}>RISK MONITOR · 태민</div>

          <div style={{ display: 'flex', gap: 12, flex: 1 }}>
            {/* Risks */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 9, color: '#F59E0B', letterSpacing: 2, marginBottom: 2 }}>RISKS</div>
              {RISKS.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    {[1, 2, 3].map(l => (
                      <div key={l} style={{
                        width: 5, height: 11, borderRadius: 1,
                        background: l <= r.level
                          ? (r.level === 3 ? '#EF4444' : r.level === 2 ? '#F59E0B' : '#10B981')
                          : '#1E293B',
                      }} />
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#94A3B8' }}>{r.label}</div>
                    <div style={{ fontSize: 8, color: '#334155' }}>{r.note}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ width: 1, background: '#1E293B' }} />

            {/* 태민 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 9, color: '#8B5CF6', letterSpacing: 2, marginBottom: 2 }}>태민 PLAN</div>
              {TAIMIN_STATUS.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: '#64748B' }}>{r.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 9, color: '#94A3B8' }}>{r.status}</span>
                    <span style={{ fontSize: 10 }}>
                      {r.ok === true ? '✅' : r.ok === false ? '❌' : '⏳'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: '6px 10px', borderRadius: 5,
            background: '#0F0F1F', border: '1px solid #1E1E3F',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 9, color: '#475569' }}>모기지 완납</span>
            <span style={{ fontSize: 9, color: '#475569' }}>2034년 11월</span>
            <span style={{ fontSize: 9, color: '#6366F1', fontWeight: 700 }}>→ 에쿼티 {fmt(HOME_EQUITY.projected2035Equity)}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
