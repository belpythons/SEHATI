import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface FloatingNavbarProps {
  onInstallPWA?: () => void
  canInstallPWA?: boolean
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
  onInstallPWA,
  canInstallPWA = false,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-6 pointer-events-none">
      <div className="max-w-4xl mx-auto flex justify-center">
        <nav className="bg-white/95 backdrop-blur-md rounded-full px-2 py-2 flex items-center justify-between border border-slate-200/80 shadow-sm pointer-events-auto w-full max-w-2xl">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 shrink-0 px-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <img
              src="/icons/sehati-simbol-navbar.png"
              alt="SEHATI Logo"
              className="w-8 h-8 rounded-full shadow-sm border border-slate-200/60"
            />
            <span className="text-sm font-semibold tracking-wide text-slate-900 font-sans uppercase">
              SEHATI
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase ${
                isOnline
                  ? 'bg-sage/10 text-sage'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* CTA */}
            <Link
              to="/questionnaire"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#1e293b] hover:bg-[#0f172a] text-white px-5 h-9 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Mulai Skrining
            </Link>
          </div>
          
        </nav>
      </div>
    </header>
  )
}
