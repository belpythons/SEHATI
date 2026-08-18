import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to track online/offline network status and expose
 * connectivity state to UI components.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [wasOffline, setWasOffline] = useState<boolean>(false)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    // Mark that we just came back online (for triggering queue flush)
    if (!navigator.onLine) return
    setWasOffline(true)
    // Reset the wasOffline flag after a short delay
    setTimeout(() => setWasOffline(false), 5000)
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline, wasOffline }
}
