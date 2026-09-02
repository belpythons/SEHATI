import React, { useState } from 'react'
import { ScreeningRecord } from '../../types/screening'
import { Share2, Copy, Check, ExternalLink, MessageCircle, AlertTriangle, Lock } from 'lucide-react'

interface Props {
  record: ScreeningRecord
  dataSource?: 'live' | 'mock'
}

export const ShareableLinkWidget: React.FC<Props> = ({ record, dataSource = 'mock' }) => {
  const [copied, setCopied] = useState<boolean>(false)
  const isMock = dataSource === 'mock' || record.shareHash?.startsWith('mock-') || record.shareHash?.startsWith('bntg-')

  const shareUrl = `${window.location.origin}/analytics/${record.shareHash}`

  const handleCopyLink = async () => {
    if (isMock) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
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
    <div className="flex flex-col h-full bg-[var(--color-paper)] rounded-2xl border border-[var(--color-rule)] p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[var(--color-paper-2)] text-[var(--color-navy)] border border-[var(--color-rule)]">
            <Share2 className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-medium text-[var(--color-ink)] text-base sm:text-lg">
              Shareable Link Box
            </h3>
            <p className="text-xs text-[var(--color-ink-2)]">
              Bagikan Hasil Skrining ke Kader / Dokter Posyandu
            </p>
          </div>
        </div>

        {isMock && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 shrink-0">
            <Lock className="w-3 h-3 text-amber-700" />
            <span>Mode Simulasi</span>
          </span>
        )}
      </div>

      {/* Offline/Mock Warning Banner */}
      {isMock ? (
        <div className="p-2.5 sm:p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 mb-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Perhatian: </span>
            Data ini masih berstatus <strong>Mode Simulasi (Offline)</strong> dan belum tersimpan di server pusat. Tautan publik permanen akan aktif setelah perangkat online & tersinkronisasi.
          </div>
        </div>
      ) : (
        <p className="text-xs text-[var(--color-ink-2)] mb-3 leading-relaxed">
          Tautan ini terdaftar resmi di server pusat dan dapat diakses secara publik oleh keluarga, kader posyandu, atau tenaga kesehatan.
        </p>
      )}

      {/* Link Copy Box */}
      <div className={`flex items-center gap-2 rounded-xl p-1.5 pl-3 mb-3 border ${
        isMock ? 'bg-[var(--color-paper-2)] border-[var(--color-rule)] opacity-80' : 'bg-[var(--color-paper-2)] border-[var(--color-rule)]'
      }`}>
        <span className="font-mono text-[11px] sm:text-xs text-[var(--color-ink)] truncate flex-1 select-all">
          {shareUrl}
        </span>
        <button
          type="button"
          disabled={isMock}
          onClick={handleCopyLink}
          title={isMock ? 'Fitur salin dinonaktifkan saat mode simulasi offline' : 'Salin tautan'}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] ${
            isMock
              ? 'bg-[var(--color-paper-3)] text-[var(--color-ink-2)] cursor-not-allowed'
              : copied
              ? 'bg-emerald-600 text-white cursor-pointer'
              : 'bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-xs cursor-pointer'
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
      <div className="mt-auto flex flex-col sm:flex-row gap-2 pt-2">
        {isMock ? (
          <div className="w-full text-center py-2 px-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-xl text-[11px] text-[var(--color-ink-2)] font-medium">
            Tunggu status berubah menjadi <strong>&quot;Live Backend&quot;</strong> sebelum membagikan link ke orang lain.
          </div>
        ) : (
          <>
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/70 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Kirim via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => {
                if (
                  typeof navigator !== 'undefined' &&
                  'share' in navigator &&
                  typeof navigator.share === 'function'
                ) {
                  navigator.share({
                    title: 'Hasil Skrining Stunting SEHATI',
                    text: `Hasil skrining balita: Z-Score TB/U ${record.zScore} SD (${record.statusGiziTBU || 'Normal'})`,
                    url: shareUrl,
                  }).catch(() => {})
                } else {
                  handleCopyLink()
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--color-rule)] text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tautan Disalin!</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
