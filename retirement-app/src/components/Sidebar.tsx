'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/', label: '대시보드', sub: 'Dashboard', icon: '◈' },
  { href: '/net-worth', label: '순자산', sub: 'Net Worth', icon: '◉' },
  { href: '/spending', label: '지출 분석', sub: 'Spending', icon: '◌' },
  { href: '/retirement', label: '은퇴 플랜', sub: 'Retirement', icon: '◍' },
  { href: '/ai-advice', label: 'AI 어드바이저', sub: 'AI Advisor', icon: '◎' },
  { href: '/accounts', label: '계좌 관리', sub: 'Accounts', icon: '○' },
]

const yearsLeft = Math.ceil(
  (new Date('2035-01-01').getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365.25 * 10)
) / 10

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 200,
      background: '#05080F',
      borderRight: '1px solid #1E293B',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      fontFamily: "'DM Mono', 'Courier New', monospace",
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: 'white', fontWeight: 900,
          }}>◈</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F1F5F9', letterSpacing: 1 }}>RETIRE 2035</div>
            <div style={{ fontSize: 9, color: '#475569', letterSpacing: 2, marginTop: 2 }}>SOL · KOREA</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(({ href, label, sub, icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 6,
              background: active ? '#1E3A5F' : 'transparent',
              border: `1px solid ${active ? '#2563EB40' : 'transparent'}`,
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 12, color: active ? '#60A5FA' : '#475569' }}>{icon}</span>
              <div>
                <div style={{ fontSize: 11, color: active ? '#93C5FD' : '#94A3B8', fontWeight: active ? 700 : 400 }}>{label}</div>
                <div style={{ fontSize: 9, color: '#334155', letterSpacing: 1 }}>{sub}</div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #1E293B' }}>
        <div style={{ fontSize: 9, color: '#334155', letterSpacing: 1, marginBottom: 4 }}>COUNTDOWN</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#3B82F6', letterSpacing: -1 }}>{yearsLeft}Y</div>
        <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>until 2035.01.01</div>
        <div style={{ marginTop: 8, height: 3, background: '#1E293B', borderRadius: 2 }}>
          <div style={{
            height: '100%',
            width: `${((2026 - 2010) / (2035 - 2010)) * 100}%`,
            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
            borderRadius: 2,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#1E293B', marginTop: 2 }}>
          <span>2010</span><span>2035</span>
        </div>
      </div>
    </aside>
  )
}
