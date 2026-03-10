import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Retire 2035 | Sol 은퇴 대시보드',
  description: '50세 은퇴 · 한국 귀국 · 재무 트래킹',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080C14' }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', background: '#F0F4F8' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
