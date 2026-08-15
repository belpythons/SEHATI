import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useSessionToken } from './hooks/useSessionToken'
import { LandingPage } from './pages/LandingPage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { AnalyticsPage } from './pages/AnalyticsPage'

const App: React.FC = () => {
  const navigate = useNavigate()
  const clientToken = useSessionToken()

  React.useEffect(() => {
    if (!clientToken) {
      navigate('/')
    }
  }, [clientToken, navigate])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b border-gray-200 background-white px-4 py-3 fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-blue-600">SEHATI</span>
              <span className="text-sm text-gray-500">Sistem Stunting</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Beranda
              </Link>
              <Link to="/questionnaire" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Kuesioner
              </Link>
              <Link to="/analytics" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Analitik
              </Link>
            </div>
          </div>
        </nav>

        <div className="p-4 sm:p-6 pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/questionnaire" element={<QuestionnairePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App