import React, { createContext, useContext, useState, useCallback } from 'react'
import { ScreeningRecord } from '../../types/screening'

export type ChatMode = 'personal' | 'umum'

interface ChatDrawerState {
  isOpen: boolean
  mode: ChatMode
  record: ScreeningRecord | null
}

interface ChatDrawerContextValue {
  state: ChatDrawerState
  openChat: (mode: ChatMode, record?: ScreeningRecord | null) => void
  closeChat: () => void
}

const ChatDrawerContext = createContext<ChatDrawerContextValue | null>(null)

/**
 * Hook to access the shared chat drawer state.
 * Must be used within a <ChatDrawerProvider>.
 */
export const useChatDrawer = (): ChatDrawerContextValue => {
  const ctx = useContext(ChatDrawerContext)
  if (!ctx) {
    throw new Error('useChatDrawer must be used within a <ChatDrawerProvider>')
  }
  return ctx
}

/**
 * ChatDrawerProvider — Single source of truth for chat drawer state.
 *
 * Mounted once at App level. Both GlobalChatLauncher and AIChatWidget
 * call openChat() from this context, guaranteeing only ONE drawer
 * instance can be open at any time.
 */
export const ChatDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ChatDrawerState>({
    isOpen: false,
    mode: 'umum',
    record: null,
  })

  const openChat = useCallback((mode: ChatMode, record?: ScreeningRecord | null) => {
    setState({ isOpen: true, mode, record: record ?? null })
  }, [])

  const closeChat = useCallback(() => {
    // Preserve mode & record on close so re-open returns to last state.
    // Full reset happens only when openChat() is called with new params.
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return (
    <ChatDrawerContext.Provider value={{ state, openChat, closeChat }}>
      {children}
    </ChatDrawerContext.Provider>
  )
}
