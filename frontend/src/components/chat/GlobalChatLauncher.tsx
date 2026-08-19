import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatDrawer } from './ChatDrawerContext'
import { ScreeningSubmitResponse } from '../../types/screening'

/**
 * GlobalChatLauncher — Floating "HATI" chat button (HILDA Halodoc pattern).
 *
 * Rendered once at App level, visible on ALL pages (Landing, Questionnaire,
 * Analytics). Detects mode from sessionStorage:
 * - sehati_active_screening exists → Mode Personal (with record)
 * - otherwise → Mode Umum (mock, no sessionId)
 *
 * Does NOT render its own AIChatDrawer — calls openChat() from
 * ChatDrawerContext to open the single shared drawer instance.
 */
export const GlobalChatLauncher: React.FC = () => {
  const { state, openChat, closeChat } = useChatDrawer()

  const handleClick = () => {
    // Toggle: if drawer is already open, close it
    if (state.isOpen) {
      closeChat()
      return
    }

    // Detect mode based on sessionStorage
    const cached = sessionStorage.getItem('sehati_active_screening')
    if (cached) {
      try {
        const parsed: ScreeningSubmitResponse = JSON.parse(cached)
        if (parsed.data?.sessionId) {
          openChat('personal', parsed.data)
          return
        }
      } catch {
        // Parse failed — fallback to Mode Umum
      }
    }

    // No active screening session → Mode Umum
    openChat('umum')
  }

  return (
    <AnimatePresence>
      {/* Hide launcher button when drawer is open — the drawer itself
          has its own close button, and showing both would be redundant */}
      {!state.isOpen && (
        <motion.button
          type="button"
          onClick={handleClick}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Buka HATI — Asisten Gizi AI SEHATI"
          className="global-chat-launcher"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px 8px 8px',
            borderRadius: '9999px',
            border: '2px solid rgba(13, 148, 136, 0.25)',
            background: 'linear-gradient(135deg, #1e3a5f, #0d4f4a)',
            color: 'white',
            cursor: 'pointer',
            boxShadow:
              '0 8px 32px rgba(30, 64, 175, 0.3), 0 0 0 0 rgba(13, 148, 136, 0.4)',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        >
          {/* Pulse ring effect */}
          <span
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '9999px',
              border: '2px solid rgba(13, 148, 136, 0.35)',
              animation: 'launcherPulse 2.5s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          {/* Avatar */}
          <img
            src="/icons/chat-avatar-64.png"
            alt=""
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              flexShrink: 0,
              border: '2px solid rgba(94, 234, 212, 0.3)',
            }}
          />

          {/* Label badge */}
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: '16px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #93c5fd, #5eead4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HATI
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 600,
                color: 'rgba(148, 163, 184, 0.9)',
                letterSpacing: '0.02em',
              }}
            >
              Asisten Gizi AI
            </span>
          </div>

          {/* Keyframe for pulse animation — injected inline */}
          <style>{`
            @keyframes launcherPulse {
              0%, 100% { opacity: 0; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.08); }
            }
            .global-chat-launcher:hover {
              box-shadow: 0 12px 40px rgba(30, 64, 175, 0.4), 0 0 20px rgba(13, 148, 136, 0.2) !important;
            }
            /* Hide label text on very small screens, keep avatar only */
            @media (max-width: 380px) {
              .global-chat-launcher > div:last-of-type {
                display: none !important;
              }
              .global-chat-launcher {
                padding: 8px !important;
              }
            }
          `}</style>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
