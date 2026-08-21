import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cancel01Icon,
  UserIcon,
  RefreshIcon,
  LockPasswordIcon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  SquareIcon
} from 'hugeicons-react'
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

const PERSONAL_CHIPS = [
  "Apa arti hasil skrining ini?",
  "Mengapa status gizi anak saya seperti ini?",
  "Apa yang harus saya siapkan untuk Posyandu?"
]

const UMUM_CHIPS = [
  "Apa arti Z-Score dalam pertumbuhan anak?",
  "Bagaimana mencegah stunting sejak dini?",
  "Kapan saya harus khawatir dengan BB anak?"
]

function buildPersonalGreeting(record: ScreeningRecord): string {
  const zScore = record.zScore ?? -1.5
  const status = record.statusGiziTBU || (zScore < -2 ? 'Pendek' : 'Normal')
  return (
    `Halo, saya HATI. Saya telah menganalisis hasil skrining antropometri anak Anda.\n\n` +
    `Saat ini, Z-Score TB/U berada di angka ${zScore} SD (${status}). Penilaian ini didasarkan pada kurva pertumbuhan standar WHO 2006 yang membandingkan parameter pengukuran dengan kurva sehat universal.\n\n` +
    `Ada yang ingin Anda pahami lebih lanjut mengenai arti dari hasil skrining ini?`
  )
}

function buildUmumGreeting(): string {
  return (
    `Halo, saya HATI, asisten edukasi kesehatan SEHATI.\n\n` +
    `Saya dapat membantu Anda memahami standar pertumbuhan WHO 2006, mengenali tanda-tanda stunting, atau merencanakan asupan gizi yang tepat.\n\n` +
    `Penting untuk diingat bahwa edukasi ini bersifat umum. Untuk analisis spesifik, silakan lakukan skrining terlebih dahulu.`
  )
}

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

  const prevModeRef = useRef<ChatMode | undefined>(mode)
  const prevSessionIdRef = useRef<string | undefined>(record?.sessionId)

  useEffect(() => {
    const modeChanged = prevModeRef.current !== mode
    const sessionChanged = prevSessionIdRef.current !== record?.sessionId

    if (modeChanged || sessionChanged) {
      abortControllerRef.current?.abort()
      setIsStreaming(false)
      setMessages([])
      setInputQuery('')

      prevModeRef.current = mode
      prevSessionIdRef.current = record?.sessionId
    }
  }, [mode, record?.sessionId])

  useEffect(() => {
    if (!isOpen || messages.length > 0) return

    let greetingText: string | null = null

    if (isUmum) {
      greetingText = buildUmumGreeting()
    } else if (record && hasValidSession) {
      greetingText = buildPersonalGreeting(record)
    }

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

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

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim()
    if (!textToSend || isStreaming) return

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
                  'Sistem saat ini sedang mengalami kendala jaringan. Mohon coba beberapa saat lagi.',
                isStreaming: false,
              }
              : msg
          )
        )
      },
    }

    if (isUmum) {
      await chatService.streamChatUmum({
        query: textToSend,
        ...streamCallbacks,
      })
    } else {
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

  const showChatBody = isUmum || hasValidSession

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="Asisten Konsultasi Kesehatan HATI"
            initial={{ opacity: 0, x: 20, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 w-full sm:w-[400px] bg-white border-l border-slate-200 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <img
                  src="/icons/chat-avatar-64.png"
                  alt="HATI"
                  className="w-9 h-9 rounded-full border border-slate-200 shrink-0"
                />
                <div className="flex flex-col text-left">
                  <span className="font-display text-base font-medium leading-none mb-1 text-slate-900">
                    HATI
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 leading-none">
                    Asisten Kesehatan SEHATI
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Mulai Ulang Percakapan"
                    className="p-2 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    <RefreshIcon className="w-4 h-4" strokeWidth={2} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup Panel"
                  className="p-2 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <Cancel01Icon className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Main Chat Body */}
            {!showChatBody ? (
              // LOCKED STATE
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <LockPasswordIcon className="w-5 h-5" />
                </div>
                <h4 className="font-display font-medium text-slate-800 text-lg mb-2">
                  Memerlukan Data Skrining
                </h4>
                <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">
                  HATI memerlukan data hasil skrining antropometri untuk memberikan analisis kesehatan yang akurat dan spesifik.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  Tutup Panel
                </button>
              </div>
            ) : (
              // ACTIVE CHAT STATE
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {messages.map((msg) => {
                    const isBot = msg.sender === 'bot'
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                      >
                        {/* Sender Label */}
                        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1.5 px-1">
                          {isBot ? 'HATI' : 'Anda'}
                        </span>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[90%] rounded-xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line ${isBot
                            ? 'bg-white border border-slate-200/60 text-slate-700'
                            : 'bg-[#0f172a] text-white'
                            }`}
                        >
                          {msg.text || (
                            <span className="inline-flex items-center gap-1.5 text-slate-400">
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse" />
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                            </span>
                          )}

                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3 ml-1 bg-teal-600 animate-pulse align-middle rounded-sm" />
                          )}

                          {/* Contextual Source (only for initial bot greeting in personal mode) */}
                          {isBot && msg.id === 'msg-init' && !isUmum && (
                            <div className="mt-4 pt-3 border-t border-slate-100 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                              Berdasarkan hasil skrining SEHATI
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Contextual Actions (Text Rows) */}
                {messages.length <= 1 && !isStreaming && (
                  <div className="px-5 py-4 border-t border-slate-200/60 bg-white">
                    <div className="flex flex-col">
                      {chips.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(action)}
                          className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 text-left w-full group hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:bg-slate-50"
                        >
                          <span className="text-[13px] text-slate-600 group-hover:text-slate-900 font-medium">
                            {action}
                          </span>
                          <ArrowRight01Icon className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200/60 bg-white shrink-0">
                  {isStreaming && (
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[11px] text-teal-600 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        Menyusun penjelasan klinis...
                      </span>
                      <button
                        type="button"
                        onClick={handleStopStreaming}
                        className="px-2.5 py-1 rounded-md text-slate-500 hover:bg-slate-100 text-[11px] font-medium flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                      >
                        <SquareIcon className="w-3 h-3" />
                        Hentikan
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex flex-col gap-2 relative"
                  >
                    <textarea
                      value={inputQuery}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_INPUT_LENGTH) {
                          setInputQuery(e.target.value)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isStreaming}
                      maxLength={MAX_INPUT_LENGTH}
                      placeholder="Tuliskan pertanyaan Anda di sini..."
                      rows={2}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all disabled:bg-slate-50 disabled:text-slate-400 bg-white resize-none"
                    />
                    
                    <button
                      type="submit"
                      aria-label="Kirim Pertanyaan"
                      disabled={!inputQuery.trim() || isStreaming}
                      className="absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center bg-[#0f172a] text-white transition-all disabled:opacity-30 disabled:bg-slate-200 disabled:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1"
                    >
                      <ArrowUp01Icon className="w-4 h-4" strokeWidth={2} />
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
