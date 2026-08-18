import React from 'react'
import { ScreeningRecord } from '../../types/screening'
import { Bot, Sparkles, MessageSquare, ChevronRight, Lock } from 'lucide-react'

interface Props {
  record?: ScreeningRecord | null
  onOpenChat: () => void
}

export const AIChatWidget: React.FC<Props> = ({ record, onOpenChat }) => {
  const hasSession = Boolean(record?.sessionId)

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-white/10 text-blue-300 backdrop-blur-xs">
            <Bot className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-white text-base">
              Asisten AI Gemini
            </h3>
            <p className="text-xs text-blue-200/80">
              Konsultasi Gizi & Panduan Tumbuh Kembang
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Gemini 2.5 Flash</span>
        </span>
      </div>

      {/* Body Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <p className="text-xs text-slate-200 leading-relaxed my-2">
          Diskusikan hasil antropometri balita ({record?.heightCm ?? '-'} cm / {record?.weightKg ?? '-'} kg) dan tanyakan resep MPASI pangan lokal Bontang secara interaktif.
        </p>

        <div className="space-y-2 mt-2">
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-2.5 text-xs text-slate-200">
            <span className="text-blue-300 font-semibold">Topik Rekomendasi: </span>
            &quot;Bagaimana takaran porsi ikan bawis & daun kelor untuk balita {record?.ageMonths ?? 18} bulan?&quot;
          </div>

          <button
            type="button"
            disabled={!hasSession}
            onClick={onOpenChat}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              hasSession
                ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/25'
                : 'bg-white/20 text-slate-400 cursor-not-allowed'
            }`}
          >
            {hasSession ? (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Buka Konsultasi Chat AI</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Selesaikan skrining untuk membuka chat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
