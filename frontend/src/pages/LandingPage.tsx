import React, { useEffect, useState } from 'react'
import { FloatingNavbar } from '../components/layout/FloatingNavbar'
import { HeroSection } from '../components/landing/HeroSection'
import { BontangContextSection } from '../components/landing/BontangContextSection'
import { FeatureHighlightsGrid } from '../components/landing/FeatureHighlightsGrid'
import { PersonaPreviewSection } from '../components/landing/PersonaPreviewSection'
import { QuickStartCTA } from '../components/landing/QuickStartCTA'
import { FooterSection } from '../components/layout/FooterSection'

export const LandingPage: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstallPWA, setCanInstallPWA] = useState(false)

  useEffect(() => {
    // Listen for PWA installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstallPWA(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setCanInstallPWA(false)
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Floating Header Navbar */}
      <FloatingNavbar
        canInstallPWA={canInstallPWA}
        onInstallPWA={handleInstallPWA}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Bontang Health Context & Prevalence (27.4%) */}
        <BontangContextSection />

        {/* 3. Three Main Feature Pillars (WHO Z-Score, Naive Bayes, Gemini AI) */}
        <FeatureHighlightsGrid />

        {/* 4. Three Target Personas Selection Preview */}
        <PersonaPreviewSection />

        {/* 5. Quick Action Banner */}
        <QuickStartCTA />
      </main>

      {/* Footer Section */}
      <FooterSection />
    </div>
  )
}