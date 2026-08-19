import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSessionToken } from './hooks/useSessionToken'
import { LandingPage } from './pages/LandingPage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { OfflineIndicator } from './components/pwa/OfflineIndicator'
import { ChatDrawerProvider, useChatDrawer } from './components/chat/ChatDrawerContext'
import { AIChatDrawer } from './components/chat/AIChatDrawer'
import { GlobalChatLauncher } from './components/chat/GlobalChatLauncher'

const AppContent: React.FC = () => {
  // Initialize anonymous session token on app load
  useSessionToken()

  const { state, closeChat } = useChatDrawer()

  return (
    <>
      {/* PWA Offline Status Banner (Fase 5) */}
      <OfflineIndicator />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/analytics/:shareHash" element={<AnalyticsPage />} />
      </Routes>

      {/* Floating HATI launcher — visible on ALL pages */}
      <GlobalChatLauncher />

      {/* SINGLE AIChatDrawer instance — controlled via ChatDrawerContext */}
      <AIChatDrawer
        isOpen={state.isOpen}
        onClose={closeChat}
        record={state.record}
        mode={state.mode}
      />
    </>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <ChatDrawerProvider>
        <AppContent />
      </ChatDrawerProvider>
    </Router>
  )
}

export default App