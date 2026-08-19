import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowUp,
  User,
  Sparkles,
  RefreshCw,
  Square,
  Lock,
  Fish,
  TrendingUp,
  Building2,
  HelpCircle,
  AlertTriangle,
  Ruler,
  FlaskConical,
} from 'lucide-react'
import { ScreeningRecord } from '../../types/screening'
import { chatService } from '../../services/chatService'
import { ChatMode } from './ChatDrawerContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  record: ScreeningRecord | null
  mode?: ChatMode
}

interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
  isStreaming?: boolean
}

const MAX_INPUT_LENGTH = 500

// ────────────── Quick Prompt Chips per Mode ──────────────

const PERSONAL_CHIPS = [
  {
    icon: Fish,
    label: 'Resep Ikan Bawis',
    query: 'Bagaimana takaran dan resep olahan ikan bawis & daun kelor untuk balita saya?',
  },
  {
    icon: TrendingUp,
    label: 'Tips Kejar Tumbuh',
    query: 'Bagaimana langkah praktis catch-up growth untuk memperbaiki Z-Score TB/U balita saya?',
  },
  {
    icon: Building2,
    label: 'Layanan Posyandu',
    query: 'Apa saja layanan dan pemantauan yang perlu saya ikuti di Posyandu kelurahan saya?',
  },
]

const UMUM_CHIPS = [
  {
    icon: HelpCircle,
    label: 'Apa itu stunting?',
    query: 'Apa itu stunting dan apa penyebab utamanya?',
  },
  {
    icon: AlertTriangle,
    label: 'Tanda-tanda awal',
    query: 'Apa saja tanda-tanda awal stunting yang perlu diwaspadai orang tua?',
  },
  {
    icon: Ruler,
    label: 'Cara cek status gizi',
    query: 'Bagaimana cara mengecek status gizi anak dan menginterpretasi Z-Score?',
  },
]

// ────────────── Greeting Generators ──────────────

function buildPersonalGreeting(record: ScreeningRecord): string {
  const zScore = record.zScore ?? -1.5
  const status = record.statusGiziTBU || (zScore < -2 ? 'Pendek' : 'Normal')
  return (
    `Halo! Saya **HATI** — Asisten Nutrisi Terpadu SEHATI (didukung Gemini 2.5 Flash).\n\n` +
    `Saya telah mempelajari data antropometri balita Anda:\n` +
    `• **Domisili:** Kelurahan ${record.kelurahan || 'Bontang'}\n` +
    `• **Usia & Gender:** ${record.ageMonths} Bulan (${record.gender === 'L' ? 'Laki-laki' : 'Perempuan'})\n` +
    `• **Status Antropometri:** ${record.heightCm} cm / ${record.weightKg} kg (Z-Score TB/U: ${zScore} SD — ${status})\n` +
    `• **Tingkat Risiko:** ${record.riskTier || 'MODERATE'}\n\n` +
    `Ada yang ingin Anda tanyakan seputar menu pangan lokal Bontang (Ikan Bawis/Bandeng), jadwal Posyandu, atau nutrisi harian?`
  )
}

function buildUmumGreeting(): string {
  return (
    `Halo! Saya **HATI** — Asisten Gizi AI dari SEHATI, platform deteksi dini & pencegahan stunting Kota Bontang.\n\n` +
    `Tanyakan apa saja seputar **gizi anak & pencegahan stunting** secara umum. Beberapa topik yang bisa saya bantu:\n` +
    `• Apa itu stunting & penyebabnya\n` +
    `• Tanda-tanda awal yang perlu diwaspadai\n` +
    `• Cara mengecek status gizi anak\n` +
    `• Panduan MPASI & nutrisi harian\n\n` +
    `💡 Untuk rekomendasi yang **dipersonalisasi** ke kondisi anak Anda, lakukan skrining antropometri terlebih dahulu melalui menu "Mulai Skrining".`
  )
}

// ════════════════════════════════════════════════════════════
//  Component
// ════════════════════════════════════════════════════════════

export const AIChatDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  record,
  mode = 'personal',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputQuery, setInputQuery] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isUmum = mode === 'umum'
  const sessionId = record?.sessionId
  const hasValidSession = Boolean(sessionId && sessionId.trim() !== '')
  const chips = isUmum ? UMUM_CHIPS : PERSONAL_CHIPS

  // ──────────────────────────────────────────────────────────
  // EFFECT 1: Reset messages when mode OR session context changes.
  //
  // ⚠️ ORDERING CRITICAL — this effect MUST be defined BEFORE
  //    the greeting injection effect (Effect 2) below, so that
  //    React executes reset first, then greeting injection sees
  //    messages.length === 0 and injects the new greeting.
  // ──────────────────────────────────────────────────────────
  const prevModeRef = useRef<ChatMode | undefined>(mode)
  const prevSessionIdRef = useRef<string | undefined>(record?.sessionId)

  useEffect(() => {
    const modeChanged = prevModeRef.current !== mode
    const sessionChanged = prevSessionIdRef.current !== record?.sessionId

    if (modeChanged || sessionChanged) {
      // Abort any active streaming
      abortControllerRef.current?.abort()
      setIsStreaming(false)
      // Clear messages — greeting effect (below) will re-inject fresh greeting
      setMessages([])
      setInputQuery('')

      // Update refs to current values
      prevModeRef.current = mode
      prevSessionIdRef.current = record?.sessionId
    }
  }, [mode, record?.sessionId])

  // ──────────────────────────────────────────────────────────
  // EFFECT 2: Inject initial greeting when drawer opens with
  //           empty messages (either first open, or after reset).
  //
  //           Runs AFTER Effect 1 due to definition order.
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || messages.length > 0) return

    let greetingText: string | null = null

    if (isUmum) {
      // Mode Umum — always has greeting, no session required
      greetingText = buildUmumGreeting()
    } else if (record && hasValidSession) {
      // Mode Personal — needs valid session + record
      greetingText = buildPersonalGreeting(record)
    }
    // If mode='personal' but no session → no greeting (locked state shows instead)

    if (greetingText) {
      setMessages([
        {
          id: 'msg-init',
          sender: 'bot',
          text: greetingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }, [isOpen, messages.length, isUmum, record, hasValidSession])

  // Auto-scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // Close drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // ──────────────────────────────────────────────────────────
  // Send Message Handler — routes to correct service per mode
  // ──────────────────────────────────────────────────────────
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim()
    if (!textToSend || isStreaming) return

    // Mode Personal requires sessionId
    if (!isUmum && !sessionId) return

    setInputQuery('')

    const userMessageId = `user-${Date.now()}`
    const botMessageId = `bot-${Date.now()}`

    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const botPlaceholderMsg: ChatMessage = {
      id: botMessageId,
      sender: 'bot',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMsg, botPlaceholderMsg])
    setIsStreaming(true)

    abortControllerRef.current = new AbortController()

    const streamCallbacks = {
      signal: abortControllerRef.current.signal,
      onChunk: (chunk: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: msg.text + chunk }
              : msg
          )
        )
      },
      onDone: () => {
        setIsStreaming(false)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        )
      },
      onError: (err: Error) => {
        console.error('Streaming error:', err)
        setIsStreaming(false)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                ...msg,
                text:
                  msg.text ||
                  'Maaf, terjadi kendala saat menyusun jawaban. Silakan ulangi pertanyaan Anda.',
                isStreaming: false,
              }
              : msg
          )
        )
      },
    }

    if (isUmum) {
      // Mode Umum — local mock, NEVER calls backend
      await chatService.streamChatUmum({
        query: textToSend,
        ...streamCallbacks,
      })
    } else {
      // Mode Personal — existing chatService (unchanged)
      await chatService.streamChat({
        sessionId: sessionId!,
        query: textToSend,
        record,
        ...streamCallbacks,
      })
    }
  }

  const handleStopStreaming = () => {
    abortControllerRef.current?.abort()
    setIsStreaming(false)
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    )
  }

  const handleResetChat = () => {
    handleStopStreaming()
    setMessages([])
  }

  // Determine if chat body should show (Mode Umum always shows; Personal needs session)
  const showChatBody = isUmum || hasValidSession

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
          />

          {/* Drawer Panel — Fullscreen on mobile (<640px), bottom-right card on tablet/desktop */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Asisten Konsultasi Gizi HATI"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-0 sm:top-auto sm:bottom-4 sm:right-4 sm:left-auto sm:w-[420px] h-full sm:h-auto sm:max-h-[88vh] bg-white shadow-2xl z-50 flex flex-col font-sans rounded-none sm:rounded-2xl border-0 sm:border sm:border-slate-200/80 overflow-hidden"
          >
            {/* ──────────────── Header — HILDA Style ──────────────── */}
            <div className="px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Avatar bulat */}
                <img
                  src="/icons/chat-avatar-64.png"
                  alt="HATI"
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full shadow-md ring-2 ring-teal-100 shrink-0"
                />
                {/* Name badge */}
                <div>
                  <h3
                    className="font-extrabold text-lg sm:text-[22px] tracking-tight leading-none"
                    style={{
                      background: 'linear-gradient(135deg, #1e40af, #0d9488)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    HATI
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>by</span>
                    <img
                      src="/icons/sehati-simbol-navbar.png"
                      alt=""
                      className="w-3.5 h-3.5 inline-block"
                    />
                    <span className="font-semibold text-slate-600">SEHATI</span>
                    <span className="text-slate-400">AI</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Gemini badge */}
                <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="hidden min-[380px]:inline">Gemini 2.5</span>
                </span>

                {/* Mode Simulasi badge — Mode Umum only */}
                {isUmum && (
                  <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shrink-0">
                    <FlaskConical className="w-3 h-3 text-amber-500" />
                    <span>Simulasi</span>
                  </span>
                )}

                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Mulai Ulang Percakapan"
                    aria-label="Mulai Ulang Percakapan"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup Konsultasi Chat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ──────────────── Main Chat Body ──────────────── */}
            {!showChatBody ? (
              // LOCKED STATE: Mode Personal without sessionId (edge case)
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-slate-50">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">
                  Konsultasi AI Belum Terbuka
                </h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
                  Asisten Gemini AI membutuhkan data hasil skrining antropometri balita (parameter <code>sessionId</code>) untuk memberikan rekomendasi nutrisi yang akurat.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-white font-semibold text-xs hover:shadow-lg transition-all cursor-pointer shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #0d9488)' }}
                >
                  Tutup & Lakukan Skrining
                </button>
              </div>
            ) : (
              // ACTIVE CHAT STATE
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/60">
                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* ── Session Notice Banner (static, HILDA-style) ── */}
                  {messages.length <= 1 && (
                    <div className="mx-0 mb-2 px-3.5 py-3 rounded-xl border border-teal-100/80 bg-gradient-to-r from-blue-50/80 to-teal-50/80">
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {isUmum
                          ? '🌍 Mode Edukasi Umum — Tanyakan apa saja seputar gizi & stunting. Untuk rekomendasi personal, lakukan skrining terlebih dahulu.'
                          : '💡 Konsultasi berdasarkan hasil skrining kamu, tanyakan apa saja seputar tumbuh kembang si kecil.'}
                      </p>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isBot = msg.sender === 'bot'
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
                      >
                        {/* Avatar */}
                        {isBot ? (
                          <img
                            src="/icons/chat-avatar-64.png"
                            alt="HATI"
                            className="w-7 h-7 rounded-full shadow-sm ring-1 ring-teal-100 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm bg-slate-700 text-white">
                            <User className="w-4 h-4" />
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm whitespace-pre-line ${isBot
                              ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                              : 'text-white rounded-tr-none'
                            }`}
                          style={
                            !isBot
                              ? { background: 'linear-gradient(135deg, #1e40af, #0d9488)' }
                              : undefined
                          }
                        >
                          {msg.text || (
                            <span className="inline-flex items-center gap-1.5 text-slate-400 italic">
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                              HATI sedang mengetik...
                            </span>
                          )}

                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3 ml-1 bg-teal-500 animate-pulse align-middle rounded-sm" />
                          )}

                          <span
                            className={`block text-[9px] mt-1.5 ${isBot ? 'text-slate-400' : 'text-blue-200 text-right'
                              }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── Quick Prompt Chips — Pill style (HILDA pattern) ── */}
                {messages.length <= 1 && !isStreaming && (
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-white/90 backdrop-blur-xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                      Saran Pertanyaan Cepat:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {chips.map((chip, idx) => {
                        const Icon = chip.icon
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(chip.query)}
                            className="px-3 py-1.5 rounded-full bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 border border-slate-200 hover:border-teal-200 text-[11px] font-medium text-slate-600 hover:text-teal-700 transition-all flex items-center gap-1.5 cursor-pointer text-left shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                          >
                            <Icon className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <span>{chip.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Input & Streaming Controls ── */}
                <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                  {isStreaming && (
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[11px] text-teal-600 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                        {isUmum
                          ? 'Menyusun jawaban edukasi...'
                          : 'Streaming respon Gemini AI aktif...'}
                      </span>
                      <button
                        type="button"
                        onClick={handleStopStreaming}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                      >
                        <Square className="w-3 h-3 fill-slate-700" />
                        <span>Hentikan</span>
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex items-end gap-2"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputQuery}
                        onChange={(e) => {
                          if (e.target.value.length <= MAX_INPUT_LENGTH) {
                            setInputQuery(e.target.value)
                          }
                        }}
                        disabled={isStreaming}
                        maxLength={MAX_INPUT_LENGTH}
                        placeholder={
                          isUmum
                            ? 'Tanyakan seputar gizi & pencegahan stunting...'
                            : 'Tanyakan seputar gizi & tumbuh kembang anak...'
                        }
                        className="w-full px-4 py-2.5 pr-14 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300 transition-all disabled:bg-slate-50 disabled:text-slate-400 bg-slate-50/50"
                      />
                      {/* Character counter */}
                      <span
                        className={`absolute right-3 bottom-2.5 text-[9px] font-medium transition-colors ${inputQuery.length > MAX_INPUT_LENGTH * 0.9
                            ? 'text-amber-500'
                            : 'text-slate-300'
                          }`}
                      >
                        {inputQuery.length}/{MAX_INPUT_LENGTH}
                      </span>
                    </div>

                    {/* Send button — gradient circle (HILDA pattern) */}
                    <button
                      type="submit"
                      aria-label="Kirim Pertanyaan"
                      disabled={!inputQuery.trim() || isStreaming}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1"
                      style={{
                        background:
                          !inputQuery.trim() || isStreaming
                            ? '#cbd5e1'
                            : 'linear-gradient(135deg, #1e40af, #0d9488)',
                      }}
                    >
                      <ArrowUp className="w-4.5 h-4.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
