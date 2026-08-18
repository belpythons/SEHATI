import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSessionToken } from './hooks/useSessionToken'
import { LandingPage } from './pages/LandingPage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { AnalyticsPage } from './pages/AnalyticsPage'

const AppContent: React.FC = () => {
  // Initialize anonymous session token on app load
  useSessionToken()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/questionnaire" element={<QuestionnairePage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/analytics/:shareHash" element={<AnalyticsPage />} />
    </Routes>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App