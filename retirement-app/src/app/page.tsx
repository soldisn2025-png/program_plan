'use client'

import { useState, useEffect } from 'react'
import {
  KOREA_CASHFLOW, ACTION_ITEMS_2026, RISKS, TAIMIN_STATUS, SS_ESTIMATE,
} from '@/lib/real-data'

// ─── TYPES ───────────────────────────────────────────────────────────
interface BucketItem {
  id: string
  name: string
  current: number
  target: number
  isBasis?: boolean
}
interface Bucket {
  id: string
  label: string
  sublabel: string
  color: string
  bg: string
  bd: string
  items: BucketItem[]
  note: string
}

// ─── STATIC DATA ─────────────────────────────────────────────────────
// Bucket targets are planning goals (not from Plaid). Amounts from real-data Feb 2026.
const BUCKETS_STATIC: Bucket[] = [
  {
    id: 'A', label: '버킷 A', sublabel: '50–55세 즉시 인출',
    color: '#0EA5E9', bg: '#F0F9FF', bd: '#BAE6FD',
    items: [
      { id: 'cash',   name: '현금 / 저축 (BofA·SoFi)', current: 213,   target: 60000 },
      { id: 'etrade', name: 'E*TRADE Taxable',          current: 24073, target: 50000 },
      { id: 'sofi',   name: 'SoFi Brokerage',           current: 4668,  target: 15000 },
    ],
    note: '생활비 2년치 이상 유지 필수. 시장 하락 시 여기서 먼저 씀.',
  },
  {
    id: 'B', label: '버킷 B', sublabel: '50–62세 브리지 (Roth Basis 중심)',
    color: '#8B5CF6', bg: '#F5F3FF', bd: '#DDD6FE',
    items: [
      { id: 'roth_balance', name: 'Roth IRA Sol (총 잔액)',      current: 34745, target: 249000 },
      { id: 'roth_basis',   name: '  └ Contribution Basis ★',   current: 0,     target: 120000, isBasis: true },
      { id: 'tira_sol',     name: 'TIRA Sol (Roth 전환 대상)',   current: 18976, target: 35000  },
    ],
    note: 'Roth는 잔액이 아닌 Basis만 패널티 없이 인출 가능! TIRA→Roth 전환 5년 카운트다운.',
  },
  {
    id: 'C', label: '버킷 C', sublabel: '62세+ — 정상 인출 시작',
    color: '#059669', bg: '#ECFDF5', bd: '#6EE7B7',
    items: [
      { id: 'k401',      name: 'Fidelity 401k (Sol)',          current: 22735, target: 370000 },
      { id: 'kelly_ira', name: 'Kelly IRAs (Robin·Vanguard)',  current: 14622, target: 27200  },
      { id: 'hsa',       name: 'HSA',                          current: 2133,  target: 7000   },
    ],
    note: '401k는 62세부터 인출 계획. 그 전까지 최대한 성장. 62세 이후 SS + 401k 함께 운용.',
  },
]

const RETURN_ASSUMPTIONS = [
  { label: '명목 수익률 (목표)',        value: '7%',   sub: '시장 평균 가정',             color: '#2563EB' },
  { label: '실질 수익률 (인플레 차감)', value: '4.5%', sub: '인플레 2.5% 가정 후',        color: '#7C3AED' },
  { label: '보수적 시나리오',           value: '5%',   sub: '한국 거주 + 환율 리스크 반영', color: '#D97706' },
  { label: '스트레스 테스트',           value: '3%',   sub: '시장 하락 + 인플레 동시',    color: '#DC2626' },
]

const WITHDRAWAL_PLAN = [
  {
    age: '50–54세',       spend: '$2,500', income: '$500–1,000', withdraw: '$1,500–2,000',
    source: '버킷A: Taxable → 현금',        note: '소득 유지가 핵심 — 일하거나 부업',
    color: '#0EA5E9', bg: '#F0F9FF',
  },
  {
    age: '55–61세',       spend: '$2,600', income: '$500–1,200', withdraw: '$1,400–2,100',
    source: '버킷B: Roth Basis 중심',       note: '401k는 건드리지 않음 — 계속 성장',
    color: '#8B5CF6', bg: '#F5F3FF',
  },
  {
    age: '62세 이후\n(SS 전)', spend: '$2,700', income: '$800–1,500', withdraw: '$1,200–1,900',
    source: '버킷C: 401k 정상 인출 시작',   note: '62세부터 페널티 없이 자유 인출',
    color: '#059669', bg: '#ECFDF5',
  },
  {
    age: '62세 이후\n(SS 수령)', spend: '$3,100+',
    income: `SS $${SS_ESTIMATE.age62}–$${SS_ESTIMATE.age67}`,
    withdraw: '$800–1,200',
    source: 'SS + 401k + Roth 조율',        note: '일하면 SS 지연 → FRA(67세) 고려',
    color: '#D97706', bg: '#FFFBEB',
  },
]

const INFLATION_DATA = [
  { year: '2035', nominal: '$2,300', real: '$2,300', expense: '$2,940', balance: '기준',   color: '#2563EB', bg: '#EFF6FF', bd: '#BFDBFE' },
  { year: '2040', nominal: '$3,100', real: '$2,720', expense: '$3,350', balance: '-$250',  color: '#8B5CF6', bg: '#F5F3FF', bd: '#DDD6FE' },
  { year: '2045', nominal: '$3,200', real: '$2,510', expense: '$3,755', balance: '-$555',  color: '#D97706', bg: '#FFFBEB', bd: '#FDE68A' },
  { year: '2047+',nominal: '$5,100', real: '$3,820', expense: '$3,900', balance: '+$1,200',color: '#059669', bg: '#ECFDF5', bd: '#6EE7B7' },
]

const TRAFFIC = {
  green: [
    '버킷A ≥ 2년치 생활비 ($55k+)',
    '한국 소득 월 $500 이상 확보',
    '미국팀 월 흑자 $2,000+',
    '부모 케어 버퍼 별도 존재',
  ],
  yellow: [
    '버킷A 1–2년치 ($30–55k)',
    '한국 소득 불안정 or 미달',
    '부모 의료비 증가 조짐',
    '시장 조정 10–20%',
  ],
  red: [
    '버킷A < 1년치 — 즉각 지출 축소',
    '자산 20%+ 하락 + 소득 $0',
    '부모 간병비 월 +200만 급증',
    '401k 조기 인출 필요 → 전문가 상담 먼저',
  ],
  auto: [
    '🔄 기본안 → 비관안: 조건 2개 이상 동시 충족 시',
    '🔄 비관안 → 충격안: 시장 -20% + 부모 의료비 급증 동시',
    '🔄 충격안 발동: 월 지출 $2,400 이하 강제 Lean 모드',
    '✅ 회복 조건: 버킷A 복원 + 소득 $500/월 이상 6개월 유지',
  ],
}

// ─── HELPERS ────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}
function pct(c: number, t: number): number {
  return t === 0 ? 0 : Math.min(100, Math.round((c / t) * 100))
}


// ─── STYLE CONSTANTS ────────────────────────────────────────────────
const PRICOLOR: Record<string, string> = { HIGH: '#DC2626', MED: '#D97706', LOW: '#6B7280' }
const PRIBG: Record<string, string>    = { HIGH: '#FEF2F2', MED: '#FFFBEB', LOW: '#F9FAFB' }
const PRIBD: Record<string, string>    = { HIGH: '#FECACA', MED: '#FDE68A', LOW: '#E5E7EB' }
const OKCOLOR: Record<string, string>  = { ok: '#059669', warn: '#D97706', pending: '#7C3AED' }
const OKBG: Record<string, string>     = { ok: '#ECFDF5', warn: '#FFFBEB', pending: '#F5F3FF' }
const OKICON: Record<string, string>   = { ok: '✅', warn: '⚠️', pending: '⏳' }

// ─── SHARED STYLES ──────────────────────────────────────────────────
const wrap: React.CSSProperties = {
  fontFamily: "'DM Sans','Apple SD Gothic Neo','Segoe UI',sans-serif",
  background: '#F0F4F8', color: '#1E293B',
  width: '100%', height: '100vh',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden', boxSizing: 'border-box',
}
const gridStyle: React.CSSProperties = {
  flex: 1, display: 'grid',
  gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
  gap: 12, padding: 12, overflow: 'hidden',
}
const card: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  padding: '20px 24px',
  display: 'flex', flexDirection: 'column', gap: 12,
  boxShadow: '0 1px 6px #00000010', overflow: 'hidden',
}
const tagStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: 3, color: '#94A3B8',
  fontWeight: 700, textTransform: 'uppercase',
}

// ─── COMPONENT ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const [page, setPage]       = useState(1)
  const [buckets, setBuckets] = useState<Bucket[]>(BUCKETS_STATIC)
  const [actions, setActions] = useState(ACTION_ITEMS_2026)
  const [editing, setEditing] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  useEffect(() => {
    // Restore Roth Basis from localStorage
    const savedBasis = localStorage.getItem('roth_basis')
    if (savedBasis) {
      const v = parseInt(savedBasis, 10)
      if (!isNaN(v)) {
        setBuckets(prev => prev.map(b => ({
          ...b,
          items: b.items.map(i => i.id === 'roth_basis' ? { ...i, current: v } : i),
        })))
      }
    }
  }, [])

  const commitEdit = (bIdx: number, iIdx: number) => {
    const v = parseInt(editVal.replace(/[^0-9]/g, ''), 10)
    if (!isNaN(v)) {
      setBuckets(prev => {
        const updated = prev.map((b, bi) => bi !== bIdx ? b : {
          ...b,
          items: b.items.map((item, ii) => ii !== iIdx ? item : { ...item, current: v }),
        })
        if (prev[bIdx]?.items[iIdx]?.id === 'roth_basis') {
          localStorage.setItem('roth_basis', String(v))
        }
        return updated
      })
    }
    setEditing(null)
  }

  // Computed totals (exclude isBasis items from totals)
  const allItems    = buckets.flatMap(b => b.items.filter(i => !i.isBasis))
  const total       = allItems.reduce((s, i) => s + i.current, 0)
  const totalTarget = allItems.reduce((s, i) => s + i.target,  0)

  const bucketTotal  = (b: Bucket) => b.items.filter(i => !i.isBasis).reduce((s, i) => s + i.current, 0)
  const bucketTarget = (b: Bucket) => b.items.filter(i => !i.isBasis).reduce((s, i) => s + i.target,  0)

  const incomeTotal  = KOREA_CASHFLOW.income .reduce((s, r) => ({ min: s.min + r.min, max: s.max + r.max }), { min: 0, max: 0 })
  const expenseTotal = KOREA_CASHFLOW.expense.reduce((s, r) => ({ min: s.min + r.min, max: s.max + r.max }), { min: 0, max: 0 })
  const surplusMax   = incomeTotal.max - expenseTotal.min

  // ── Shared sub-components ────────────────────────────────────────
  const PageNav = () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3].map(p => (
        <button key={p} onClick={() => setPage(p)} style={{
          padding: '7px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: page === p ? '#1E40AF' : '#EFF6FF',
          color: page === p ? '#fff' : '#3B82F6',
          fontSize: 15, fontFamily: 'inherit', fontWeight: 700,
          boxShadow: page === p ? '0 2px 8px #1E40AF44' : 'none',
        }}>P{p}</button>
      ))}
    </div>
  )

  const TopBar = ({ subtitle }: { subtitle: string }) => (
    <div style={{
      height: 68, minHeight: 68, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', background: '#fff',
      borderBottom: '2px solid #E2E8F0',
      boxShadow: '0 2px 8px #0000000A',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg,#1E40AF,#7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: '#fff', fontWeight: 900,
        }}>◈</div>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#1E293B' }}>Sol's Retirement Dashboard v5</div>
          <div style={{ fontSize: 13, color: '#94A3B8' }}>{subtitle}</div>
        </div>
      </div>

      {page === 1 && (
        <div style={{
          textAlign: 'center', padding: '10px 20px', borderRadius: 12,
          background: 'linear-gradient(135deg,#EFF6FF,#F5F3FF)',
          border: '1.5px solid #BFDBFE',
        }}>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 2 }}>Sol 금융자산 총계</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#1E40AF' }}>{fmt(total)}</div>
          <div style={{ fontSize: 12, color: '#94A3B8' }}>목표 {fmt(totalTarget)} · {pct(total, totalTarget)}%</div>
        </div>
      )}

      <PageNav />
    </div>
  )

  /* ══════════════════════════════════════════════════════════════════
     PAGE 1 — Buckets + Actions + Cashflow
  ══════════════════════════════════════════════════════════════════ */
  if (page === 1) return (
    <div style={wrap}>
      <TopBar subtitle="3-Bucket 구조 · Roth Basis 추적 · 401k 62세~ · 자동 전환 조건" />
      <div style={gridStyle}>

        {/* ── 3 Buckets (spans full left column) ── */}
        <div style={{ ...card, gridRow: '1/3' }}>
          <div style={tagStyle}>3-Bucket 자산 구조 · 숫자 클릭 → 수정</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
            {buckets.map((bkt, bi) => {
              const btotal  = bucketTotal(bkt)
              const btarget = bucketTarget(bkt)
              const bpct    = pct(btotal, btarget)
              return (
                <div key={bkt.id} style={{ borderRadius: 14, border: `2px solid ${bkt.bd}`, background: bkt.bg, overflow: 'hidden' }}>
                  {/* Bucket header */}
                  <div style={{ padding: '12px 18px', borderBottom: `1px solid ${bkt.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: bkt.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 }}>
                        {bkt.id}
                      </div>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#1E293B' }}>{bkt.label}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{bkt.sublabel}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: bkt.color }}>{fmt(btotal)}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>/ {fmt(btarget)} · {bpct}%</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, background: '#E2E8F0' }}>
                    <div style={{ height: '100%', width: `${bpct}%`, background: `linear-gradient(90deg,${bkt.color}66,${bkt.color})`, transition: 'width 0.5s' }} />
                  </div>
                  {/* Items */}
                  <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {bkt.items.map((item, ii) => {
                      const key    = `${bi}-${ii}`
                      const isEdit = editing === key
                      const isB    = !!item.isBasis
                      return (
                        <div key={ii} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: isB ? '7px 10px 7px 20px' : '7px 10px', borderRadius: 8,
                          background: isB ? '#FEF9FF' : 'rgba(255,255,255,0.7)',
                          border: isB ? `1px dashed ${bkt.bd}` : '1px solid transparent',
                        }}>
                          <div>
                            <div style={{ fontSize: isB ? 12 : 14, fontWeight: isB ? 600 : 500, color: isB ? '#7C3AED' : '#334155' }}>
                              {item.name}
                            </div>
                            {isB && (
                              <div style={{ fontSize: 11, color: '#A78BFA' }}>
                                Form 5498/8606으로 추적 — 패널티 없이 인출 가능한 금액
                              </div>
                            )}
                          </div>
                          {isEdit ? (
                            <input
                              autoFocus value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onBlur={() => commitEdit(bi, ii)}
                              onKeyDown={e => e.key === 'Enter' && commitEdit(bi, ii)}
                              style={{
                                background: '#fff', border: `2px solid ${bkt.color}`,
                                borderRadius: 7, color: '#1E293B', fontSize: 17,
                                padding: '3px 10px', width: 110, fontFamily: 'inherit', outline: 'none',
                              }}
                            />
                          ) : (
                            <span
                              onClick={() => { setEditing(key); setEditVal(String(item.current)) }}
                              style={{
                                fontSize: isB ? 15 : 17, fontWeight: 800,
                                color: isB ? '#7C3AED' : bkt.color,
                                cursor: 'text', borderBottom: `2px dashed ${bkt.color}55`,
                              }}
                            >
                              {fmt(item.current)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {/* Note */}
                  <div style={{ padding: '8px 18px 12px', fontSize: 12, color: '#64748B', borderTop: `1px solid ${bkt.bd}`, lineHeight: 1.5 }}>
                    💡 {bkt.note}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 2026 Action Items ── */}
        <div style={card}>
          <div style={tagStyle}>2026 Action Items</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, overflowY: 'auto' }}>
            {actions.map((a, i) => (
              <div
                key={i}
                onClick={() => setActions(prev => prev.map((x, j) => j === i ? { ...x, done: !x.done } : x))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px',
                  borderRadius: 10, cursor: 'pointer',
                  background: a.done ? '#F8FAFC' : PRIBG[a.priority],
                  border: `1.5px solid ${a.done ? '#E2E8F0' : PRIBD[a.priority]}`,
                  opacity: a.done ? 0.5 : 1, transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2.5px solid ${PRICOLOR[a.priority]}`,
                  background: a.done ? PRICOLOR[a.priority] : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {a.done && <span style={{ fontSize: 13, color: '#fff', fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: 14, color: a.done ? '#94A3B8' : '#1E293B', flex: 1,
                  fontWeight: 500, textDecoration: a.done ? 'line-through' : 'none',
                }}>{a.text}</span>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: PRICOLOR[a.priority],
                  background: '#fff', padding: '2px 9px', borderRadius: 20,
                  border: `1px solid ${PRIBD[a.priority]}`,
                }}>{a.priority}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#CBD5E1', paddingTop: 4, borderTop: '1px solid #F1F5F9' }}>
            클릭하여 완료 체크
          </div>
        </div>

        {/* ── Monthly Cashflow ── */}
        <div style={card}>
          <div style={tagStyle}>2035 월 현금흐름 — 인출 순서 포함</div>
          <div style={{ display: 'flex', gap: 14, flex: 1, overflow: 'hidden' }}>
            {/* Income */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 13, color: '#059669', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>↑ INCOME</div>
              {KOREA_CASHFLOW.income.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{r.note}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>${r.min}–{r.max}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', marginTop: 6, borderRadius: 10, background: '#ECFDF5' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>합계</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>${incomeTotal.min}–{incomeTotal.max}</span>
              </div>
            </div>
            <div style={{ width: 1, background: '#F1F5F9' }} />
            {/* Expense */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 13, color: '#DC2626', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>↓ EXPENSE</div>
              {KOREA_CASHFLOW.expense.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>${r.min}–{r.max}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', marginTop: 6, borderRadius: 10, background: '#FEF2F2' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>합계</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#DC2626' }}>${expenseTotal.min}–{expenseTotal.max}</span>
              </div>
            </div>
          </div>
          {/* Surplus/Deficit */}
          <div style={{
            padding: '12px 18px', borderRadius: 12,
            background: surplusMax > 0 ? '#ECFDF5' : '#FEF2F2',
            border: `2px solid ${surplusMax > 0 ? '#6EE7B7' : '#FECACA'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>월 흑자 (부업 최대 포함)</div>
              <div style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>⚠️ 부업 없으면 적자 — Plan A 필수</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: surplusMax > 0 ? '#059669' : '#DC2626' }}>
                {surplusMax > 0 ? '+' : ''}{surplusMax}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>최대 기준 / 월</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ══════════════════════════════════════════════════════════════════
     PAGE 2 — Risk Monitor + Taemin + Withdrawal Plan
  ══════════════════════════════════════════════════════════════════ */
  if (page === 2) return (
    <div style={wrap}>
      <TopBar subtitle="리스크 · 자동 전환 조건 · 태민 플랜 · 연령대별 인출" />
      <div style={gridStyle}>

        {/* ── Risk Monitor ── */}
        <div style={card}>
          <div style={tagStyle}>Risk Monitor</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
            {RISKS.map((r, i) => {
              const rc  = r.level === 3 ? '#DC2626' : r.level === 2 ? '#D97706' : '#059669'
              const rb  = r.level === 3 ? '#FEF2F2' : r.level === 2 ? '#FFFBEB' : '#ECFDF5'
              const rbd = r.level === 3 ? '#FECACA' : r.level === 2 ? '#FDE68A' : '#6EE7B7'
              return (
                <div key={i} style={{ borderRadius: 12, background: rb, border: `1.5px solid ${rbd}`, overflow: 'hidden' }}>
                  <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[1, 2, 3].map(l => (
                        <div key={l} style={{ width: 9, height: 22, borderRadius: 3, background: l <= r.level ? rc : '#E2E8F0' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', flex: 1 }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: rc, background: '#fff', padding: '3px 10px', borderRadius: 20, border: `1px solid ${rbd}` }}>
                      {r.level === 3 ? 'HIGH' : r.level === 2 ? 'MED' : 'LOW'}
                    </span>
                  </div>
                  <div style={{ padding: '0 16px 10px', fontSize: 14, color: '#475569' }}>→ {r.note}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 태민 Plan Status ── */}
        <div style={card}>
          <div style={tagStyle}>태민 Plan Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, overflowY: 'auto' }}>
            {TAIMIN_STATUS.map((t, i) => {
              const okKey = t.ok === true ? 'ok' : t.ok === false ? 'warn' : 'pending'
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '12px 16px', borderRadius: 12,
                  background: OKBG[okKey], border: `1.5px solid ${OKCOLOR[okKey]}33`,
                }}>
                  <span style={{ fontSize: 22, marginTop: 2 }}>{OKICON[okKey]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{t.label}</div>
                    <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{t.status}</div>
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: OKCOLOR[okKey], boxShadow: `0 0 0 3px ${OKCOLOR[okKey]}33`, marginTop: 6 }} />
                </div>
              )
            })}
          </div>
          <div style={{ padding: '12px 16px', borderRadius: 12, background: '#F5F3FF', border: '1.5px solid #DDD6FE', fontSize: 14, color: '#5B21B6', lineHeight: 1.6 }}>
            💡 3rd Party SNT → 한국 거주 중 자유 인출 가능<br />
            &nbsp;&nbsp;&nbsp;단, food/shelter 지출은 SSI ISM 규정 주의<br />
            &nbsp;&nbsp;&nbsp;모든 distribution 용도 기록 필수
          </div>
        </div>

        {/* ── Withdrawal Plan by Age (full width bottom) ── */}
        <div style={{ ...card, gridColumn: '1/3' }}>
          <div style={tagStyle}>연령대별 인출 플랜 — 인출 순서가 수익률보다 중요</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, flex: 1 }}>
            {WITHDRAWAL_PLAN.map((w, i) => (
              <div key={i} style={{
                borderRadius: 12, background: w.bg,
                border: `2px solid ${w.color}33`,
                padding: '16px', display: 'flex', flexDirection: 'column', gap: 9,
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: w.color, whiteSpace: 'pre-line' }}>{w.age}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {([
                    ['월 지출 목표', w.spend,    '#1E293B'],
                    ['한국 소득',    w.income,   '#059669'],
                    ['자산 인출액',  w.withdraw, '#DC2626'],
                  ] as [string, string, string][]).map(([k, v, c]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.8)' }}>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{k}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.9)', border: `1px solid ${w.color}33` }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3, fontWeight: 700 }}>인출원</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: w.color }}>{w.source}</div>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', padding: '6px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.03)' }}>
                  ⚡ {w.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  /* ══════════════════════════════════════════════════════════════════
     PAGE 3 — Return Assumptions + Inflation + Traffic Light
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div style={wrap}>
      <TopBar subtitle="수익률 가정 · 인플레이션 · 신호등 + 자동 전환" />
      <div style={gridStyle}>

        {/* ── Return Assumptions ── */}
        <div style={card}>
          <div style={tagStyle}>수익률 가정 — 명목 vs 실질 분리</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
            {RETURN_ASSUMPTIONS.map((r, i) => (
              <div key={i} style={{
                padding: '18px', borderRadius: 12,
                background: `${r.color}10`, border: `2px solid ${r.color}33`,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 38, fontWeight: 900, color: r.color, lineHeight: 1 }}>{r.value}</div>
                <div style={{ fontSize: 13, color: '#94A3B8' }}>{r.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', borderRadius: 12, background: '#FFFBEB', border: '1.5px solid #FDE68A', fontSize: 14, color: '#92400E', lineHeight: 1.6 }}>
            ⚠️ 명목/실질 구분 없이 7% 혼용하면 오판 가능<br />
            → 의사결정은 <strong>실질 구매력 기준 세후 현금흐름</strong>으로 할 것<br />
            → 한국 거주 + 환율 + 부모 리스크 = 보수적(5%) 기준 권장<br />
            → 401k는 62세까지 건드리지 않음 — 버킷A+B로 브리지
          </div>
        </div>

        {/* ── Inflation Impact ── */}
        <div style={card}>
          <div style={tagStyle}>Inflation Impact — 명목 vs 실질 수입 비교</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            {INFLATION_DATA.map(r => (
              <div key={r.year} style={{
                borderRadius: 12, background: r.bg, border: `2px solid ${r.bd}`,
                padding: '14px', display: 'flex', flexDirection: 'column', gap: 7,
              }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: r.color }}>{r.year}</div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>명목 수입</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>{r.nominal}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>실질 수입</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: r.color }}>{r.real}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>지출</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#DC2626' }}>{r.expense}</div>
                </div>
                <div style={{ borderTop: `1px solid ${r.bd}`, paddingTop: 6 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>월 흑/적자</div>
                  <div style={{
                    fontSize: 20, fontWeight: 900,
                    color: r.balance.includes('+') ? '#059669' : r.balance === '기준' ? '#2563EB' : '#DC2626',
                  }}>{r.balance}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
            {[
              { icon: '✅', text: 'SS COLA 자동 반영 — 유일한 인플레 자동 방어 수단' },
              { icon: '✅', text: 'Roth IRA 유연 인출 — 인플레 높은 해 증액 가능' },
              { icon: '⚠️', text: '401k는 62세까지 보호 — 버킷A/B로 12년 브리지 필요' },
              { icon: '💡', text: `SS 67세(FRA) 수령 시 월 $${SS_ESTIMATE.age67} — 62세 대비 +$${SS_ESTIMATE.age67 - SS_ESTIMATE.age62} 추가` },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: '#F8FAFC' }}>
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                <span style={{ fontSize: 14, color: '#475569' }}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Traffic Light + Auto-switch Rules (full width bottom) ── */}
        <div style={{ ...card, gridColumn: '1/3' }}>
          <div style={tagStyle}>신호등 기준 + 자동 전환 조건</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, flex: 1 }}>

            {/* GREEN */}
            <div style={{ borderRadius: 14, background: '#ECFDF5', border: '2px solid #6EE7B7', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#059669', boxShadow: '0 0 8px #059669' }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: '#065F46' }}>초록 — 기본안 실행</span>
              </div>
              {TRAFFIC.green.map((t, i) => (
                <div key={i} style={{ fontSize: 13, color: '#065F46', padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.7)', marginBottom: 7 }}>{t}</div>
              ))}
            </div>

            {/* YELLOW */}
            <div style={{ borderRadius: 14, background: '#FFFBEB', border: '2px solid #FDE68A', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#D97706', boxShadow: '0 0 8px #D97706' }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: '#92400E' }}>노랑 — 비관안 전환 검토</span>
              </div>
              {TRAFFIC.yellow.map((t, i) => (
                <div key={i} style={{ fontSize: 13, color: '#92400E', padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.7)', marginBottom: 7 }}>{t}</div>
              ))}
            </div>

            {/* RED */}
            <div style={{ borderRadius: 14, background: '#FEF2F2', border: '2px solid #FECACA', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#DC2626', boxShadow: '0 0 8px #DC2626' }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: '#991B1B' }}>빨강 — 충격안 즉시 발동</span>
              </div>
              {TRAFFIC.red.map((t, i) => (
                <div key={i} style={{ fontSize: 13, color: '#991B1B', padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.7)', marginBottom: 7 }}>{t}</div>
              ))}
            </div>

            {/* AUTO-SWITCH */}
            <div style={{ borderRadius: 14, background: '#F5F3FF', border: '2px solid #DDD6FE', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: '#7C3AED', boxShadow: '0 0 8px #7C3AED' }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: '#4C1D95' }}>자동 전환 룰</span>
              </div>
              {TRAFFIC.auto.map((t, i) => (
                <div key={i} style={{ fontSize: 13, color: '#4C1D95', padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.7)', marginBottom: 8, lineHeight: 1.5 }}>{t}</div>
              ))}
              <div style={{ marginTop: 10, padding: '10px', borderRadius: 10, background: '#EDE9FE', fontSize: 13, color: '#5B21B6', lineHeight: 1.6, fontWeight: 500 }}>
                💡 2034년 말 체크포인트에서<br />
                조건 충족 → 50세 기본안 실행<br />
                미달 → 52–55세로 자동 연기
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
