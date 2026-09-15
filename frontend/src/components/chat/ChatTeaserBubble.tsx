import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useChatDrawer } from './ChatDrawerContext'
import {
  getActiveScreeningSession,
  isTeaserDismissedForMode,
  setTeaserDismissedForMode,
} from './chatSessionHelper'
import { ChatMode } from './ChatDrawerContext'
import { ScreeningRecord } from '../../types/screening'
import { Cancel01Icon, ArrowRight01Icon } from 'hugeicons-react'

export const ChatTeaserBubble: React.FC = () => {
  const location = useLocation()
  const { state, openChat } = useChatDrawer()

  const [isVisible, setIsVisible] = useState(false)
  const [currentMode, setCurrentMode] = useState<ChatMode>('umum')
  const [currentRecord, setCurrentRecord] = useState<ScreeningRecord | null>(null)

  useEffect(() => {
    if (state.isOpen) {
      setIsVisible(false)
      return
    }

    const { mode, record } = getActiveScreeningSession()
    setCurrentMode(mode)
    setCurrentRecord(record)

    if (isTeaserDismissedForMode(mode)) {
      setIsVisible(false)
      return
    }

    const timer = setTimeout(() => {
      if (!isTeaserDismissedForMode(mode) && !state.isOpen) {
        setIsVisible(true)
      }
    }, 2500)

    return () => {
      clearTimeout(timer)
    }
  }, [location.pathname, state.isOpen])

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    setTeaserDismissedForMode(currentMode)
  }

  const handleActionClick = (actionText: string) => {
    setIsVisible(false)
    setTeaserDismissedForMode(currentMode)
    // We open chat and normally we would pre-fill or send the query, 
    // but the drawer context openChat doesn't take an initial message.
    // The user can type it or we can just open it for now.
    openChat(currentMode, currentRecord)
  }

  const actions = currentMode === 'personal'
    ? [
        "Apa arti hasil skrining saya?",
        "Mengapa hasil saya seperti ini?",
        "Apa langkah selanjutnya?"
      ]
    : [
        "Apa itu stunting?",
        "Tanda-tanda awal yang diwaspadai?",
        "Cara cek status gizi?"
      ]

  return (
    <AnimatePresence>
      {isVisible && !state.isOpen && (
        <motion.div
          key={`teaser-${currentMode}`}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          role="dialog"
          aria-label="Saran interaktif Asisten Kesehatan HATI"
          className="fixed bottom-20 right-4 sm:right-6 left-4 sm:left-auto sm:max-w-[320px] bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-900/5 overflow-hidden z-39"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src="/icons/chat-avatar-64.png"
                alt="HATI"
                className="w-8 h-8 rounded-full border border-slate-200 shrink-0"
              />
              <div className="flex flex-col text-left">
                <span className="font-display text-sm font-medium leading-none mb-1 text-slate-900">
                  HATI
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 leading-none">
                  Asisten Kesehatan SEHATI
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Tutup saran"
              className="p-1 -mr-1 text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-md"
            >
              <Cancel01Icon className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 bg-slate-50/50">
            <p className="text-[13px] leading-relaxed font-medium text-slate-700 mb-4">
              Ada yang ingin kamu pahami dari hasil skrining?
            </p>

            {/* Contextual Actions as Text Rows */}
            <div className="flex flex-col border-t border-slate-100">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleActionClick(action)}
                  className="flex items-center justify-between py-3 border-b border-slate-100 text-left w-full group hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:bg-slate-50"
                >
                  <span className="text-[13px] text-slate-600 group-hover:text-slate-900 font-medium">
                    {action}
                  </span>
                  <ArrowRight01Icon className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
          
        </motion.div>
      )}
    </AnimatePresence>
  )
}
