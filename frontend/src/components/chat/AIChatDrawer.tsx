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
  Loader2,
} from 'lucide-react'
import { ScreeningRecord } from '../../types/screening'

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
}

export const AIChatDrawer: React.FC<Props> = ({ isOpen, onClose, record }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputQuery, setInputQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize initial greeting when drawer opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && record) {
      const initialGreeting =
        `Halo! Saya Asisten Nutrisi SEHATI (didukung Gemini AI).\n\n` +
        `Saya telah mempelajari data balita Anda:\n` +
        `• Usia: ${record.ageMonths} Bulan (${record.kelurahan})\n` +
        `• Status TB/U: ${record.statusGiziTBU || 'Normal'} (Z-Score: ${record.zScore} SD)\n` +
        `• Derajat Risiko: ${record.riskTier}\n\n` +
        `Ada yang ingin Anda tanyakan seputar variasi menu MPASI lokal Bontang, jadwal imunisasi posyandu, atau tips kejar tumbuh balita?`

      setMessages([
        {
          id: 'msg-init',
          sender: 'bot',
          text: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }, [isOpen, record, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputQuery.trim() || isGenerating) return

    const userText = inputQuery.trim()
    setInputQuery('')

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsGenerating(true)

    // Simulate streaming mock response for Fase 4 (real SSE stream fully hooked in Fase 6)
    setTimeout(() => {
      const botResponse = generateMockAnswer(userText, record)
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
      setIsGenerating(false)
    }, 900)
  }

  const generateMockAnswer = (query: string, rec: ScreeningRecord | null): string => {
    const q = query.toLowerCase()
    const age = rec?.ageMonths ?? 18

    if (q.includes('bawis') || q.includes('ikan') || q.includes('resep') || q.includes('makan')) {
      return (
        `Untuk balita usia ${age} bulan, Ikan Bawis sangat ideal diolah menjadi **Sup Bening Ikan Bawis Daun Kelor** atau **Pepes Kukus Gurih Tanpa Cabai**.\n\n` +
        `• Porsi: 1-2 potong kecil tanpa duri halus.\n` +
        `• Kalsium & Seng pada ikan bawis membantu penyerapan nutrisi tulang untuk perbaikan Z-Score TB/U.\n` +
        `• Tambahkan 1 sendok teh minyak kelapa/lemak sehat pada kuah untuk menambah kalori.`
      )
    }

    if (q.includes('stunting') || q.includes('risiko') || q.includes('tinggi')) {
      return (
        `Berdasarkan data skrining, balita Anda berada pada kategori Z-Score **${rec?.zScore ?? -2.0} SD** (${rec?.statusGiziTBU ?? 'Stunted'}).\n\n` +
        `Langkah utama kejar tumbuh (Catch-up Growth):\n` +
        `1. Berikan minimal 1 butir telur dan 1 porsi ikan laut segar setiap hari.\n` +
        `2. Pastikan sanitasi air dan lingkungan rumah bebas dari paparan asap rokok.\n` +
        `3. Konsultasikan jadwal penimbangan rutin di Posyandu Kelurahan ${rec?.kelurahan ?? 'setempat'}.`
      )
    }

    return (
      `Terima kasih atas pertanyaannya. Menjaga asupan gizi hewani kaya zat besi dan menjaga lingkungan bersih adalah kunci utama pencegahan stunting pada balita usia ${age} bulan di Kota Bontang. Apakah ada hal spesifik lain yang ingin Anda konsultasikan?`
    )
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/40 text-blue-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Asisten AI Gemini</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-normal">
                      SSE Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Konteks: Sesi #{record?.sessionId ? record.sessionId.slice(-6) : 'Anonim'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context Badge */}
            <div className="px-4 py-2 bg-blue-50/80 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">
                Balita: {record?.ageMonths ?? '-'} Bulan • Kelurahan {record?.kelurahan ?? 'Bontang'} • Risiko: {record?.riskTier ?? 'LOW'}
              </span>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot'
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                        isBot
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                        isBot
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                          : 'bg-blue-600 text-white rounded-tr-none'
                      }`}
                    >
                      {msg.text}
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

              {isGenerating && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl p-3 max-w-[70%]">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Gemini AI sedang menyusun jawaban...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Tanyakan rekomendasi gizi atau jadwal posyandu..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isGenerating}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
