import React from 'react'
import { ScreeningRecord } from '../../types/screening'
import { Sparkles, MessageSquare, ChevronRight, Lock } from 'lucide-react'

interface Props {
  record?: ScreeningRecord | null
  onOpenChat: () => void
}

export const AIChatWidget: React.FC<Props> = ({ record, onOpenChat }) => {
  const hasSession = Boolean(record?.sessionId)

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-blue-950 to-teal-950 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header — HILDA-style: Avatar + Name + Badge */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Avatar bulat */}
          <img
            src="/icons/chat-avatar-64.png"
            alt="HATI"
            className="w-11 h-11 rounded-full shadow-lg ring-2 ring-teal-400/30"
          />
          <div>
            <h3
              className="font-extrabold text-xl tracking-tight leading-none"
              style={{
                background: 'linear-gradient(135deg, #93c5fd, #5eead4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HATI
            </h3>
            <p className="text-[11px] text-slate-300/80 flex items-center gap-1 mt-0.5">
              <span>by</span>
              <img src="/icons/sehati-simbol-navbar.png" alt="" className="w-3.5 h-3.5" />
              <span className="font-semibold text-slate-200">SEHATI</span>
              <span className="text-slate-400">AI</span>
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
            <span className="text-teal-300 font-semibold">Topik Rekomendasi: </span>
            &quot;Bagaimana takaran porsi ikan bawis &amp; daun kelor untuk balita {record?.ageMonths ?? 18} bulan?&quot;
          </div>

          <button
            type="button"
            disabled={!hasSession}
            onClick={onOpenChat}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              hasSession
                ? 'text-white shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30'
                : 'bg-white/20 text-slate-400 cursor-not-allowed'
            }`}
            style={
              hasSession
                ? { background: 'linear-gradient(135deg, #1e40af, #0d9488)' }
                : undefined
            }
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
