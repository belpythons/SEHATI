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

/**
 * ChatTeaserBubble — Proactive Speech Bubble Teaser (Halodoc Pattern).
 *
 * Appears floating near the GlobalChatLauncher with a ~2.5s delay.
 * - Reactive to SPA routing (via useLocation): updates mode & text when moving between pages.
 * - Per-mode dismissal: dismissing general teaser does not suppress the post-screening personal teaser.
 * - Safe defensive parsing: cannot crash on invalid/corrupted sessionStorage.
 * - Automatically hidden when the AIChatDrawer is open.
 */
export const ChatTeaserBubble: React.FC = () => {
  const location = useLocation()
  const { state, openChat } = useChatDrawer()

  const [isVisible, setIsVisible] = useState(false)
  const [currentMode, setCurrentMode] = useState<ChatMode>('umum')
  const [currentRecord, setCurrentRecord] = useState<ScreeningRecord | null>(null)

  // Re-evaluate session & schedule appearance on route change or drawer state change
  useEffect(() => {
    // If the chat drawer is currently open, immediately hide bubble and don't schedule
    if (state.isOpen) {
      setIsVisible(false)
      return
    }

    // Safely detect current active screening session
    const { mode, record } = getActiveScreeningSession()
    setCurrentMode(mode)
    setCurrentRecord(record)

    // If teaser for this mode was already dismissed in this session, do not show
    if (isTeaserDismissedForMode(mode)) {
      setIsVisible(false)
      return
    }

    // Schedule appearance with a polite ~2.5s delay after page load / route change
    const timer = setTimeout(() => {
      // Re-check dismiss status and drawer status before showing
      if (!isTeaserDismissedForMode(mode) && !state.isOpen) {
        setIsVisible(true)
      }
    }, 2500)

    return () => {
      clearTimeout(timer)
    }
  }, [location.pathname, state.isOpen])

  // Dismiss via close button (X)
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    setTeaserDismissedForMode(currentMode)
  }

  // Click on bubble body -> open drawer with appropriate context
  const handleBubbleClick = () => {
    setIsVisible(false)
    setTeaserDismissedForMode(currentMode)
    openChat(currentMode, currentRecord)
  }

  const teaserMessage =
    currentMode === 'personal'
      ? 'Mau tau lebih lanjut soal hasil skrining si kecil? Aku siap bantu!'
      : 'Ada pertanyaan seputar gizi & pencegahan stunting? Aku siap bantu!'

  return (
    <AnimatePresence>
      {isVisible && !state.isOpen && (
        <motion.div
          key={`teaser-${currentMode}`}
          initial={{ opacity: 0, scale: 0.82, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.82, y: 12 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          onClick={handleBubbleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleBubbleClick()
            }
          }}
          aria-label="Notifikasi interaktif Asisten Gizi HATI"
          className="sehati-chat-teaser-bubble"
          style={{
            position: 'fixed',
            bottom: '76px',
            right: '20px',
            zIndex: 39,
            maxWidth: '280px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid rgba(13, 148, 136, 0.25)',
            boxShadow:
              '0 12px 28px -4px rgba(30, 64, 175, 0.16), 0 6px 14px -2px rgba(13, 148, 136, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
            padding: '12px 14px 12px 14px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            userSelect: 'none',
          }}
        >
          {/* Header row: Badge + Close (X) button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            {/* Mini Brand Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.08), rgba(13, 148, 136, 0.12))',
                border: '1px solid rgba(13, 148, 136, 0.2)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#0d9488',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  background: 'linear-gradient(135deg, #1e40af, #0d9488)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                HATI • Asisten AI
              </span>
            </div>

            {/* Close button (X) */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Tutup notifikasi"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#334155'
                e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 0.9)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Contextual Teaser Message */}
          <p
            style={{
              margin: 0,
              fontSize: '12.5px',
              lineHeight: '1.45',
              fontWeight: 500,
              color: '#1e293b',
              letterSpacing: '-0.01em',
            }}
          >
            {teaserMessage}
          </p>

          {/* Speech Bubble Tail (Pointing toward avatar at bottom right) */}
          <div
            className="teaser-bubble-tail"
            style={{
              position: 'absolute',
              bottom: '-9px',
              right: '26px',
              width: '16px',
              height: '10px',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#ffffff',
                borderRight: '1.5px solid rgba(13, 148, 136, 0.25)',
                borderBottom: '1.5px solid rgba(13, 148, 136, 0.25)',
                transform: 'rotate(45deg)',
                transformOrigin: 'top left',
                margin: '-6px 0 0 2px',
              }}
            />
          </div>

          {/* Inline styles for responsive positioning & hover effect */}
          <style>{`
            .sehati-chat-teaser-bubble {
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .sehati-chat-teaser-bubble:hover {
              transform: translateY(-2px);
              box-shadow: 0 16px 36px -4px rgba(30, 64, 175, 0.22), 0 8px 18px -2px rgba(13, 148, 136, 0.16) !important;
            }
            @media (max-width: 420px) {
              .sehati-chat-teaser-bubble {
                right: 16px !important;
                bottom: 70px !important;
                max-width: calc(100vw - 32px) !important;
                width: 260px !important;
              }
              .teaser-bubble-tail {
                right: 20px !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
