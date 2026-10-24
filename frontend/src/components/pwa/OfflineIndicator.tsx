import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wifi,
  WifiOff,
  CloudOff,
  Upload,
  CheckCircle2,
  Loader2,
  ExternalLink,
  AlertTriangle,
  X,
  Trash2,
} from 'lucide-react'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import {
  getQueueCount,
  flushQueue,
  clearAllQueuedSubmissions,
  FlushResult,
} from '../../services/offlineQueueService'
import { motion, AnimatePresence } from 'framer-motion'

export const OfflineIndicator: React.FC = () => {
  const navigate = useNavigate()
  const { isOnline, wasOffline } = useNetworkStatus()
  const [queueCount, setQueueCount] = useState<number>(0)
  const [isFlushing, setIsFlushing] = useState<boolean>(false)
  const [flushResult, setFlushResult] = useState<FlushResult | null>(null)
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('sehati_offline_banner_dismissed') === 'true'
  })

  // Poll queue count periodically
  useEffect(() => {
    const checkQueue = async () => {
      const count = await getQueueCount()
      setQueueCount(count)
    }
    checkQueue()
    const interval = setInterval(checkQueue, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-flush when coming back online
  useEffect(() => {
    if (wasOffline && isOnline && queueCount > 0) {
      handleFlush()
    }
  }, [wasOffline, isOnline, queueCount])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('sehati_offline_banner_dismissed', 'true')
  }

  const handleClearQueue = async () => {
    await clearAllQueuedSubmissions()
    setQueueCount(0)
    setIsDismissed(true)
  }

  const handleFlush = async () => {
    setIsFlushing(true)
    setFlushResult(null)
    try {
      const result = await flushQueue()
      setFlushResult(result)
      const newCount = await getQueueCount()
      setQueueCount(newCount)

      // If last response was received, save to sessionStorage for seamless viewing
      if (result.lastResponse && result.lastShareHash) {
        sessionStorage.setItem('sehati_active_screening', JSON.stringify(result.lastResponse))
      }

      // Auto-clear result message after 6 seconds
      setTimeout(() => setFlushResult(null), 6000)
    } catch {
      setFlushResult({ succeededLive: 0, failed: queueCount })
    } finally {
      setIsFlushing(false)
    }
  }

  // Nothing to show when dismissed, or online and no queue
  if ((isOnline && queueCount === 0 && !flushResult) || (isDismissed && !flushResult && isOnline)) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="fixed top-0 left-0 right-0 z-50 font-sans"
      >
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold shadow-md">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Mode Offline — Skrining tersimpan di memori perangkat & akan disinkronkan saat online.</span>
          </div>
        )}

        {/* Queue Pending Banner */}
        {isOnline && queueCount > 0 && !isFlushing && !flushResult && (
          <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/60 text-white px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-3 text-xs font-medium shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <CloudOff className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">
                <strong className="font-semibold text-white">{queueCount} skrining offline</strong> siap disinkronkan ke server.
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleFlush}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[11px] sm:text-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Kirim ke server"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Sinkronkan</span>
              </button>
              <button
                type="button"
                onClick={handleClearQueue}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-red-500/80 text-slate-300 hover:text-white font-medium text-[11px] sm:text-xs transition-colors cursor-pointer"
                title="Hapus antrean offline yang tidak valid"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Flushing in progress */}
        {isFlushing && (
          <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold shadow-md">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Menghubungi server backend untuk sinkronisasi antrean...</span>
          </div>
        )}

        {/* Flush result with Action Button */}
        {flushResult && !isFlushing && (
          <div
            className={`${
              flushResult.succeededLive > 0
                ? 'bg-emerald-600'
                : 'bg-amber-600'
            } text-white px-4 py-2 flex items-center justify-center gap-3 text-xs font-semibold shadow-md`}
          >
            {flushResult.succeededLive > 0 ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}

            <span>
              {flushResult.succeededLive > 0
                ? `${flushResult.succeededLive} skrining berhasil tersinkronisasi ke server pusat (Live).`
                : 'Server backend belum dapat dijangkau. Data tetap aman di antrean offline.'}
              {flushResult.failed > 0 && flushResult.succeededLive > 0
                ? ` (${flushResult.failed} tertunda)`
                : ''}
            </span>

            {/* Direct navigation CTA to newly created report */}
            {flushResult.lastShareHash && (
              <button
                type="button"
                onClick={() => {
                  navigate(`/analytics/${flushResult.lastShareHash}`)
                  setFlushResult(null)
                }}
                className="px-2.5 py-0.5 rounded-md bg-white text-emerald-800 hover:bg-emerald-50 font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Hasil</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Online restored notification */}
        {isOnline && wasOffline && queueCount === 0 && !flushResult && (
          <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold shadow-md">
            <Wifi className="w-4 h-4 shrink-0" />
            <span>Koneksi internet telah pulih.</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
