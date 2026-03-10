'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import {
  FI_NUMBER, KOREA_MONTHLY_BUDGET_USD, USD_TO_KRW, SS_ESTIMATE,
  KOREA_EXPENSE_DETAIL, SCENARIOS, getFinancialSummary,
} from '@/lib/real-data'

const BIRTH_YEAR = 1985
const CURRENT_YEAR = 2026
const RETIREMENT_YEAR = 2035
const ANNUAL_RETURN = 0.07

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function buildTimeline(startNW: number, monthlyContrib: number, monthlyBudget: number, retireYear: number) {
  const points = []
  let nw = startNW
  const fiNum = monthlyBudget * 12 * 25

  for (let yr = CURRENT_YEAR; yr <= retireYear + 15; yr++) {
    const age = yr - BIRTH_YEAR
    const isRetired = yr >= retireYear
    if (isRetired) {
      nw = nw * (1 + ANNUAL_RETURN) - monthlyBudget * 12
    } else {
      nw = nw * (1 + ANNUAL_RETURN) + monthlyContrib * 12
    }
    points.push({ year: yr, age, netWorth: Math.round(Math.max(0, nw)), fiNumber: Math.round(fiNum) })
  }
  return points
}

export default function RetirementPage() {
  const [view, setView] = useState<'korea' | 'family'>('korea')
  const [koreaMonthly, setKoreaMonthly] = useState(KOREA_MONTHLY_BUDGET_USD)
  const [familyMonthly, setFamilyMonthly] = useState(5000)

  const summary = getFinancialSummary()
  const budget = view === 'korea' ? koreaMonthly : familyMonthly
  const fiNum = budget * 12 * 25
  const investPct = (summary.totalInvestable / fiNum) * 100
  const timeline = buildTimeline(summary.totalInvestable, 27400 / 12 + 7000 / 12, budget, RETIREMENT_YEAR)
  const projected2035 = timeline.find(p => p.year === RETIREMENT_YEAR)?.netWorth ?? 0

  const koreaTotal = KOREA_EXPENSE_DETAIL.reduce((s, e) => s + e.monthly, 0)

  return (
    <div style={{
      minHeight: '100vh', background: '#F0F4F8', color: '#1E293B',
      fontFamily: "'DM Mono', 'Courier New', monospace",
      padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Header + toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569', marginBottom: 4 }}>RETIREMENT PLAN · 은퇴 플랜</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: -1 }}>
            50세 은퇴 · 2035년 귀국 🇰🇷
          </div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>
            Sol (50세) · 수지구 외곽 전원주택 · 태민 자연환경 접근성 우선
          </div>
        </div>
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          {(['korea', 'family'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '8px 16px', fontSize: 11, fontWeight: 700,
                background: view === v ? '#2563EB' : '#F1F5F9',
                color: view === v ? '#fff' : '#64748B',
                border: 'none', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {v === 'korea' ? '🇰🇷 한국 뷰' : '👨‍👩‍👧 가족 뷰'}
            </button>
          ))}
        </div>
      </div>

      {/* Budget slider */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: '#475569', letterSpacing: 2 }}>
            {view === 'korea' ? '한국 월 생활비 (USD)' : '가족 전체 월 생활비 (USD)'}
          </span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#3B82F6' }}>${budget.toLocaleString()}</span>
            {view === 'korea' && (
              <span style={{ fontSize: 10, color: '#475569', marginLeft: 8 }}>
                ≈ ₩{(budget * USD_TO_KRW).toLocaleString('ko-KR')}
              </span>
            )}
          </div>
        </div>
        <input
          type="range"
          min={1000}
          max={view === 'korea' ? 6000 : 12000}
          step={100}
          value={budget}
          onChange={e => view === 'korea' ? setKoreaMonthly(+e.target.value) : setFamilyMonthly(+e.target.value)}
          style={{ width: '100%', accentColor: '#3B82F6' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#334155', marginTop: 2 }}>
          <span>$1,000</span>
          <span>{view === 'korea' ? '$6,000' : '$12,000'}</span>
        </div>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { label: 'FI 목표액 (25×)', value: fmt(fiNum), color: '#8B5CF6', sub: `${budget.toLocaleString()} × 12 × 25` },
          { label: '2035 예상 금융자산', value: fmt(projected2035), color: projected2035 >= fiNum ? '#10B981' : '#F59E0B', sub: projected2035 >= fiNum ? '✓ 목표 달성' : '⚠ 부족' },
          { label: '현재 진행률', value: `${Math.min(100, investPct).toFixed(1)}%`, color: '#3B82F6', sub: `${fmt(summary.totalInvestable)} / ${fmt(fiNum)}` },
          { label: '남은 기간', value: `${RETIREMENT_YEAR - CURRENT_YEAR}년`, color: '#F59E0B', sub: '2035년 1월 1일' },
        ].map(s => (
          <div key={s.label} style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 9, color: '#475569', letterSpacing: 2, marginBottom: 6 }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#334155', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Projection chart */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px' }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: '#475569', marginBottom: 12 }}>순자산 프로젝션 · {CURRENT_YEAR}–{RETIREMENT_YEAR + 15}</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeline} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#E2E8F0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 9, fill: '#334155' }}
              tickFormatter={v => `${v}(${v - BIRTH_YEAR}세)`}
              interval={2}
            />
            <YAxis
              tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
              tick={{ fontSize: 9, fill: '#334155' }}
              width={52}
            />
            <Tooltip
              formatter={(v: number, name: string) => [fmt(v), name === 'netWorth' ? '순자산' : 'FI 목표']}
              labelFormatter={l => `${l}년 (${Number(l) - BIRTH_YEAR}세)`}
              contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 10 }}
              labelStyle={{ color: '#94A3B8' }}
            />
            <ReferenceLine x={RETIREMENT_YEAR} stroke="#EF4444" strokeDasharray="4 2"
              label={{ value: '은퇴', fill: '#EF4444', fontSize: 9 }} />
            <ReferenceLine x={2047} stroke="#F59E0B" strokeDasharray="4 2"
              label={{ value: 'SS(62세)', fill: '#F59E0B', fontSize: 8 }} />
            <Legend wrapperStyle={{ fontSize: 9, color: '#475569' }} />
            <Line type="monotone" dataKey="netWorth" stroke="#3B82F6" strokeWidth={2.5} dot={false} name="순자산" />
            <Line type="monotone" dataKey="fiNumber" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="FI 목표" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Korea expense breakdown / Family view */}
      {view === 'korea' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Expense table */}
          <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#475569', marginBottom: 12 }}>한국 월 지출 항목 (수지구 외곽)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {KOREA_EXPENSE_DETAIL.map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#334155' }}>{e.category}</div>
                    <div style={{ fontSize: 8, color: '#334155', marginTop: 2 }}>{e.notes}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>${e.monthly}</div>
                    <div style={{ fontSize: 8, color: '#475569' }}>₩{(e.monthly * USD_TO_KRW).toLocaleString('ko-KR')}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#3B82F6' }}>합계</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#3B82F6' }}>${koreaTotal}/월</div>
                  <div style={{ fontSize: 9, color: '#475569' }}>₩{(koreaTotal * USD_TO_KRW).toLocaleString('ko-KR')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Korea notes */}
          <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#475569' }}>한국 귀국 핵심 사항</div>

            {[
              {
                title: '비자 / 체류',
                color: '#3B82F6',
                items: ['F-4 (재외동포) → F-5 (영주권) 전환', '미국 시민권 취득 후 F-4 즉시 신청 가능', 'F-5 취득 후 NHI, 활동지원서비스 접근'],
              },
              {
                title: '세금 (한미 조세협약)',
                color: '#10B981',
                items: ['Roth IRA 인출: 미국·한국 모두 비과세 ✅', '401k 인출: 미국에서 과세, 한국 이중과세 없음', 'FBAR: 한국 계좌 $10K 초과 시 신고 필수'],
              },
              {
                title: '72(t) SEPP 중요',
                color: '#F59E0B',
                items: ['50세 시작 시 59.5세까지 9.5년 고정', '3가지 계산법 중 유리한 방법 선택', '중도 변경 시 소급 패널티 주의'],
              },
              {
                title: '국민건강보험',
                color: '#8B5CF6',
                items: ['F-5 영주권자 기준 가입 가능', '미국 ACA보다 훨씬 저렴 ($80-300/월)', 'ACA: 50-65세 브리지 필요 ($400-800/월)'],
              },
            ].map(s => (
              <div key={s.title} style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', border: `1px solid ${s.color}44` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: s.color, letterSpacing: 1, marginBottom: 6 }}>{s.title.toUpperCase()}</div>
                {s.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 9, color: '#64748B', marginBottom: 3, display: 'flex', gap: 5 }}>
                    <span style={{ color: s.color, flexShrink: 0 }}>›</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Family View */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#475569', marginBottom: 12 }}>55세 전원 귀국 (2040) · 수입 구조</div>
            {[
              { label: '401k 72(t) SEPP', value: '~$1,200', note: '계속 수령 중', color: '#3B82F6' },
              { label: 'Roth IRA 인출', value: '~$600', note: '잔여 원금', color: '#10B981' },
              { label: '집 매각 자금 운용', value: '~$2,500-3,000', note: '$900K × 3.5% ÷ 12', color: '#8B5CF6' },
              { label: 'Kelly ABA 한국 창업', value: '$500-2,000', note: '한국 ABA 시장 개척', color: '#F59E0B' },
              { label: 'Social Security (62세~)', value: `$${SS_ESTIMATE.age62}+`, note: '2047년부터 COLA 반영', color: '#6366F1' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: 10, color: '#334155' }}>{r.label}</div>
                  <div style={{ fontSize: 8, color: '#334155' }}>{r.note}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: r.color }}>{r.value}/월</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#475569', marginBottom: 12 }}>리스크 요소 (전원 귀국 시)</div>
            {[
              { label: '시장 시퀀스 리스크', level: 'HIGH', note: '은퇴 초기 하락장 → 안전망 필요' },
              { label: '태민 한국 복지 전환', level: 'HIGH', note: 'SSI 중단 → SNT + Sol 보조로 대체' },
              { label: '환율 (원/달러)', level: 'MED', note: '달러 자산 일부 유지 권장' },
              { label: 'Kelly ABA 사업 리스크', level: 'MED', note: '한국 ABA 시장 초기 진입' },
              { label: '부모님 장기 케어 비용', level: 'MED', note: '본인 자산 우선, Sol 보조분 예비' },
              { label: '인플레이션 (미/한국)', level: 'LOW', note: 'SS COLA + 주식 포트폴리오로 방어' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: 10, color: '#334155' }}>{r.label}</div>
                  <div style={{ fontSize: 8, color: '#334155' }}>{r.note}</div>
                </div>
                <span style={{
                  fontSize: 8, fontWeight: 700,
                  color: r.level === 'HIGH' ? '#EF4444' : r.level === 'MED' ? '#F59E0B' : '#10B981',
                  flexShrink: 0, marginLeft: 8,
                }}>{r.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
