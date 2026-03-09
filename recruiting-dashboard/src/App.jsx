import { useState } from 'react'
import { useDashboardStore } from './store/useDashboardStore.js'
import CSVUpload from './components/CSVUpload.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import PipelineView from './components/PipelineView.jsx'
import PositionBoard from './components/PositionBoard.jsx'

const TABS = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'positions', label: 'Position Board' },
]

export default function App() {
  const [tab, setTab] = useState('pipeline')
  const [showUpload, setShowUpload] = useState(false)
  const candidates = useDashboardStore(s => s.candidates)
  const lastLoadedAt = useDashboardStore(s => s.lastLoadedAt)
  const hasData = candidates.length > 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-base font-semibold text-gray-900">NIS Recruiting Dashboard</h1>
            <p className="text-xs text-gray-400">STAQSS II · SAF/AQ</p>
          </div>
          {hasData && (
            <nav className="flex gap-1 ml-4">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors
                    ${tab === t.id
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>↑</span>
          {hasData ? 'Refresh Data' : 'Load JazzHR Export'}
        </button>
      </header>

      {/* Empty state */}
      {!hasData && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No data loaded</h2>
          <p className="text-gray-400 max-w-sm mb-6 text-sm leading-relaxed">
            Export candidates from JazzHR (Reports → Candidate Export),
            then upload the CSV file to view your recruiting pipeline.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Load JazzHR Export
          </button>

          {/* Data flow diagram */}
          <div className="mt-10 flex items-center gap-3 text-sm text-gray-400">
            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg">JazzHR</span>
            <span>→ CSV Export →</span>
            <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">Dashboard</span>
            <span className="text-xs text-gray-300">· · ·</span>
            <span className="px-3 py-1.5 bg-white border border-dashed border-gray-200 rounded-lg text-gray-300">
              API (future)
            </span>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {hasData && (
        <div className="flex-1 flex flex-col">
          <SummaryBar />
          {tab === 'pipeline' && <PipelineView />}
          {tab === 'positions' && <PositionBoard />}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && <CSVUpload onClose={() => setShowUpload(false)} />}
    </div>
  )
}
