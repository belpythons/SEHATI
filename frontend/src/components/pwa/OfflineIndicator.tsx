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
} from 'lucide-react'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import {
  getQueueCount,
  flushQueue,
  FlushResult,
} from '../../services/offlineQueueService'
import { motion, AnimatePresence } from 'framer-motion'

export const OfflineIndicator: React.FC = () => {
  const navigate = useNavigate()
  const { isOnline, wasOffline } = useNetworkStatus()
  const [queueCount, setQueueCount] = useState<number>(0)
  const [isFlushing, setIsFlushing] = useState<boolean>(false)
  const [flushResult, setFlushResult] = useState<FlushResult | null>(null)

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

  // Nothing to show when online and no queue
  if (isOnline && queueCount === 0 && !flushResult) return null

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
          <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-xs font-semibold shadow-md">
            <CloudOff className="w-4 h-4 shrink-0" />
            <span>{queueCount} skrining offline menunggu sinkronisasi ke server pusat.</span>
            <button
              type="button"
              onClick={handleFlush}
              className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Sinkronkan Sekarang</span>
            </button>
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
