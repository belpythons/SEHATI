import React, { useEffect, useState } from 'react'
import { FloatingNavbar } from '../components/layout/FloatingNavbar'
import { EditorialHero } from '../components/landing/EditorialHero'
import { TrustProofSection } from '../components/landing/TrustProofSection'
import { WhyEarlyScreening } from '../components/landing/WhyEarlyScreening'
import { ProductIntelligence } from '../components/landing/ProductIntelligence'
import { NutritionEducation } from '../components/landing/NutritionEducation'
import { FinalCTA } from '../components/landing/FinalCTA'
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
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Floating Header Navbar */}
      <FloatingNavbar
        canInstallPWA={canInstallPWA}
        onInstallPWA={handleInstallPWA}
      />

      {/* Main Content Sections (Narrative Workflow) */}
      <main className="flex-grow pt-8">
        
        {/* 1. Hero */}
        <EditorialHero />

        {/* 2. Trust / Product Proof */}
        <TrustProofSection />

        {/* 3. Why early screening matters */}
        <WhyEarlyScreening />

        {/* 4. Product intelligence / analysis (Horizontal storytelling) */}
        <ProductIntelligence />

        {/* 5. Nutrition / local food education */}
        <NutritionEducation />

        {/* 6. Final CTA */}
        <FinalCTA />
        
      </main>

      {/* Footer Section */}
      <FooterSection />
    </div>
  )
}