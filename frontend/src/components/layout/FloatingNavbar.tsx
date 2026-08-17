import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wifi, WifiOff, Download, ArrowRight, Activity, Menu, X } from 'lucide-react'
import mockData from '../../data/mockData'

interface FloatingNavbarProps {
  onInstallPWA?: () => void
  canInstallPWA?: boolean
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
  onInstallPWA,
  canInstallPWA = false,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

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

  const navItems = mockData.appNavigation.navItems

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
      <div className="max-w-7xl mx-auto">
        <nav className="glass-nav rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shadow-blue-900/5 transition-all duration-300">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  {mockData.meta.systemName}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-full">
                  Bontang
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden md:block">
                {mockData.appNavigation.brand.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online/Offline Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-amber-50 text-amber-700 border-amber-200/80'
              }`}
              title={
                isOnline
                  ? mockData.appNavigation.pwaInstall.onlineStatusLabel
                  : mockData.appNavigation.pwaInstall.offlineStatusLabel
              }
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden lg:inline">Online</span>
                  <Wifi className="w-3.5 h-3.5 sm:hidden" />
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="hidden lg:inline">Offline</span>
                  <WifiOff className="w-3.5 h-3.5" />
                </>
              )}
            </div>

            {/* PWA Install Button */}
            {canInstallPWA && (
              <button
                onClick={onInstallPWA}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>{mockData.appNavigation.pwaInstall.buttonLabel}</span>
              </button>
            )}

            {/* Quick CTA Button */}
            <Link
              to="/questionnaire"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95"
            >
              <span>Mulai Skrining</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 bg-white rounded-2xl shadow-xl border border-slate-200/80 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {canInstallPWA && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  onInstallPWA?.()
                }}
                className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 bg-slate-100 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>{mockData.appNavigation.pwaInstall.buttonLabel}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
