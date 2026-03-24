import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initDB } from './lib/db.js'
import Layout from './components/Layout.jsx'
import ImportCenter from './components/ImportCenter.jsx'
import SummaryDashboard from './components/SummaryDashboard.jsx'
import DetailBoard from './components/DetailBoard.jsx'
import AdminMapping from './components/AdminMapping.jsx'

export default function App() {
  const [dbReady, setDbReady] = useState(false)
  const [dbError, setDbError] = useState(null)

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('Failed to initialize database:', err)
        setDbError(err.message || 'Failed to initialize database')
      })
  }, [])

  if (dbError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Database Error</h2>
          </div>
          <p className="text-gray-600 text-sm">{dbError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm font-medium">Initializing database...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/import" replace />} />
          <Route path="import" element={<ImportCenter />} />
          <Route path="summary" element={<SummaryDashboard />} />
          <Route path="detail" element={<DetailBoard />} />
          <Route path="admin" element={<AdminMapping />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
