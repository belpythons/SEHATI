import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatDrawer } from './ChatDrawerContext'
import { ChatTeaserBubble } from './ChatTeaserBubble'
import { getActiveScreeningSession } from './chatSessionHelper'
import { Message01Icon } from 'hugeicons-react'

export const GlobalChatLauncher: React.FC = () => {
  const { state, openChat, closeChat } = useChatDrawer()

  const handleClick = () => {
    if (state.isOpen) {
      closeChat()
      return
    }

    const { mode, record } = getActiveScreeningSession()
    openChat(mode, record)
  }

  return (
    <>
      <ChatTeaserBubble />

      <AnimatePresence>
      {!state.isOpen && (
        <motion.button
          type="button"
          onClick={handleClick}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Buka HATI — Asisten kesehatan SEHATI"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 sm:gap-3 bg-[#0f172a] hover:bg-[#1e293b] text-white py-2 px-3 pr-4 sm:py-2.5 sm:px-3.5 sm:pr-5 rounded-full border border-slate-700/50 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <img
            src="/icons/chat-avatar-64.png"
            alt="HATI"
            className="w-8 h-8 rounded-full border border-slate-700 shrink-0"
          />

          <div className="flex flex-col text-left">
            <span className="font-display text-sm font-medium leading-none mb-1">
              HATI
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 leading-none">
              Asisten Kesehatan
            </span>
          </div>
        </motion.button>
      )}
      </AnimatePresence>
    </>
  )
}
