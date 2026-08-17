import React, { useState } from 'react'
import { ScreeningRecord } from '../../types/screening'
import { Share2, Copy, Check, ExternalLink, MessageCircle } from 'lucide-react'

interface Props {
  record: ScreeningRecord
}

export const ShareableLinkWidget: React.FC<Props> = ({ record }) => {
  const [copied, setCopied] = useState<boolean>(false)

  const shareUrl = `${window.location.origin}/analytics/${record.shareHash}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const waText = encodeURIComponent(
    `Halo, berikut adalah hasil ringkasan skrining stunting balita di SEHATI Kota Bontang:\n` +
    `• Usia: ${record.ageMonths} Bulan (${record.kelurahan})\n` +
    `• Z-Score TB/U: ${record.zScore} SD (${record.statusGiziTBU || 'Normal'})\n` +
    `• Tingkat Risiko: ${record.riskTier}\n` +
    `Buka detail analisis & rekomendasi gizi lengkap di tautan ini: ${shareUrl}`
  )

  const waShareUrl = `https://api.whatsapp.com/send?text=${waText}`

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
            <Share2 className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Shareable Link Box
            </h3>
            <p className="text-xs text-slate-500">
              Bagikan Hasil Skrining ke Kader / Dokter Posyandu
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        Tautan ini dapat diakses secara publik oleh keluarga, kader posyandu, atau tenaga kesehatan tanpa perlu login.
      </p>

      {/* Link Copy Box */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pl-3 mb-3">
        <span className="font-mono text-xs text-slate-700 truncate flex-1 select-all">
          {shareUrl}
        </span>
        <button
          type="button"
          onClick={handleCopyLink}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <a
          href={waShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/70 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 text-center"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Kirim via WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Hasil Skrining Stunting SEHATI',
                text: `Hasil skrining balita: Z-Score TB/U ${record.zScore} SD (${record.statusGiziTBU})`,
                url: shareUrl,
              }).catch(() => {})
            } else {
              handleCopyLink()
            }
          }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Bagikan</span>
        </button>
      </div>
    </div>
  )
}
