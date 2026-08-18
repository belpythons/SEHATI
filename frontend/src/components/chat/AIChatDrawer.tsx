import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Info,
  Square,
  Lock,
  MessageSquare,
  ChevronRight,
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
        `Halo! Saya Asisten Nutrisi Terpadu SEHATI (didukung Gemini 2.5 Flash).\n\n` +
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl z-50 flex flex-col font-sans border-l border-slate-200"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/40 text-blue-300 backdrop-blur-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">
                      Asisten Nutrisi SEHATI
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Gemini 2.5 Flash</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {hasValidSession
                      ? `Konteks Sesi: #${sessionId?.slice(0, 8)}... (Grounded Antropometri)`
                      : 'Konteks Belum Tersedia'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Mulai Ulang Percakapan"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Header Ribbon */}
            {hasValidSession && record && (
              <div className="px-4 py-2 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2 truncate">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate font-medium">
                    Balita: {record.ageMonths} Bln • Kel. {record.kelurahan} • Z-Score {record.zScore} SD ({record.riskTier})
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 uppercase shrink-0">
                  SSE ACTIVE
                </span>
              </div>
            )}

            {/* Main Chat Body */}
            {!hasValidSession ? (
              // LOCKED STATE: sessionId is missing
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-slate-50">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
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
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                >
                  Tutup & Lakukan Skrining
                </button>
              </div>
            ) : (
              // ACTIVE CHAT STATE
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/60">
                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isBot = msg.sender === 'bot'
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs ${
                            isBot
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                            isBot
                              ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                              : 'bg-blue-600 text-white rounded-tr-none'
                          }`}
                        >
                          {msg.text || (
                            <span className="inline-flex items-center gap-1.5 text-slate-400 italic">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                              Gemini AI sedang mengetik...
                            </span>
                          )}

                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3 ml-1 bg-blue-600 animate-pulse align-middle" />
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

                {/* Quick Prompt Chips */}
                {messages.length <= 1 && !isStreaming && (
                  <div className="px-4 py-2 border-t border-slate-200/70 bg-white/80 backdrop-blur-xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
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
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-[11px] font-medium text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                          >
                            <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{chip.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Input & Streaming Controls */}
                <div className="p-3 border-t border-slate-200 bg-white">
                  {isStreaming && (
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
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
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      disabled={isStreaming}
                      placeholder="Tanyakan variasi menu ikan laut, porsi makan, atau Posyandu..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={!inputQuery.trim() || isStreaming}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <Send className="w-4 h-4" />
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
