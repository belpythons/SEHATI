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
} from 'lucide-react'
import { ScreeningRecord } from '../../types/screening'
import { chatService } from '../../services/chatService'

interface Props {
  isOpen: boolean
  onClose: () => void
  record: ScreeningRecord | null
}

interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
  isStreaming?: boolean
}

const MAX_INPUT_LENGTH = 500

const QUICK_PROMPT_CHIPS = [
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

export const AIChatDrawer: React.FC<Props> = ({ isOpen, onClose, record }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputQuery, setInputQuery] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Verify that sessionId is present (strictly required by chat.controller.ts)
  const sessionId = record?.sessionId
  const hasValidSession = Boolean(sessionId && sessionId.trim() !== '')

  // Initialize initial contextual greeting when drawer opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && record && hasValidSession) {
      const zScore = record.zScore ?? -1.5
      const status = record.statusGiziTBU || (zScore < -2 ? 'Pendek' : 'Normal')
      const initialGreeting =
        `Halo! Saya **HATI** — Asisten Nutrisi Terpadu SEHATI (didukung Gemini 2.5 Flash).\n\n` +
        `Saya telah mempelajari data antropometri balita Anda:\n` +
        `• **Domisili:** Kelurahan ${record.kelurahan || 'Bontang'}\n` +
        `• **Usia & Gender:** ${record.ageMonths} Bulan (${record.gender === 'L' ? 'Laki-laki' : 'Perempuan'})\n` +
        `• **Status Antropometri:** ${record.heightCm} cm / ${record.weightKg} kg (Z-Score TB/U: ${zScore} SD — ${status})\n` +
        `• **Tingkat Risiko:** ${record.riskTier || 'MODERATE'}\n\n` +
        `Ada yang ingin Anda tanyakan seputar menu pangan lokal Bontang (Ikan Bawis/Bandeng), jadwal Posyandu, atau nutrisi harian?`

      setMessages([
        {
          id: 'msg-init',
          sender: 'bot',
          text: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }, [isOpen, record, hasValidSession, messages.length])

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

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim()
    if (!textToSend || isStreaming || !sessionId) return

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

    await chatService.streamChat({
      sessionId,
      query: textToSend,
      record,
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
    })
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

          {/* Drawer Panel — Bottom-right popup card (HILDA pattern) */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-4 right-4 w-[420px] max-h-[88vh] bg-white shadow-2xl z-50 flex flex-col font-sans rounded-2xl border border-slate-200/80 overflow-hidden max-[480px]:bottom-0 max-[480px]:right-0 max-[480px]:w-full max-[480px]:max-h-full max-[480px]:rounded-none"
          >
            {/* ──────────────── Header — HILDA Style ──────────────── */}
            <div className="px-4 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {/* Avatar bulat */}
                <img
                  src="/icons/chat-avatar-64.png"
                  alt="HATI"
                  className="w-11 h-11 rounded-full shadow-md ring-2 ring-teal-100"
                />
                {/* Name badge */}
                <div>
                  <h3
                    className="font-extrabold text-[22px] tracking-tight leading-none"
                    style={{
                      background: 'linear-gradient(135deg, #1e40af, #0d9488)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    HATI
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
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

              <div className="flex items-center gap-1.5">
                {/* Gemini badge */}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Gemini 2.5 Flash</span>
                </span>

                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Mulai Ulang Percakapan"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ──────────────── Main Chat Body ──────────────── */}
            {!hasValidSession ? (
              // LOCKED STATE: sessionId is missing
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
                        💡 Konsultasi berdasarkan hasil skrining kamu, tanyakan apa saja seputar tumbuh kembang si kecil.
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
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                            isBot
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
                            className={`block text-[9px] mt-1.5 ${
                              isBot ? 'text-slate-400' : 'text-blue-200 text-right'
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
                      {QUICK_PROMPT_CHIPS.map((chip, idx) => {
                        const Icon = chip.icon
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(chip.query)}
                            className="px-3 py-1.5 rounded-full bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 border border-slate-200 hover:border-teal-200 text-[11px] font-medium text-slate-600 hover:text-teal-700 transition-all flex items-center gap-1.5 cursor-pointer text-left shadow-sm hover:shadow"
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
                        Streaming respon Gemini AI aktif...
                      </span>
                      <button
                        type="button"
                        onClick={handleStopStreaming}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
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
                        placeholder="Tanyakan seputar gizi & tumbuh kembang anak..."
                        className="w-full px-4 py-2.5 pr-14 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300 transition-all disabled:bg-slate-50 disabled:text-slate-400 bg-slate-50/50"
                      />
                      {/* Character counter */}
                      <span
                        className={`absolute right-3 bottom-2.5 text-[9px] font-medium transition-colors ${
                          inputQuery.length > MAX_INPUT_LENGTH * 0.9
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
                      disabled={!inputQuery.trim() || isStreaming}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shrink-0"
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
