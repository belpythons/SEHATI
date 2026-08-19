import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Activity,
  MapPin,
  Bot,
  CheckCircle2,
  PlayCircle,
  ShieldCheck,
  TrendingDown,
  Fish,
} from 'lucide-react'
import mockData from '../../data/mockData'

interface SlideItem {
  id: string
  badgeText: string
  badgeIcon: React.ReactNode
  title: string
  highlight: string
  description: string
  ctaText: string
  ctaPath: string
  secondaryCtaText?: string
  secondaryCtaPath?: string
  bgGradient: string
  decorIcon: React.ReactNode
  metricBox?: {
    value: string
    label: string
  }
}

const CAROUSEL_SLIDES: SlideItem[] = [
  {
    id: 'slide-who',
    badgeText: 'Inisiatif Kesehatan Balita Kota Bontang',
    badgeIcon: <Activity className="w-3.5 h-3.5 text-blue-600" />,
    title: 'Deteksi Dini & Pencegahan',
    highlight: 'Stunting Balita Terintegrasi',
    description:
      'Platform cerdas ramah keluarga untuk skrining antropometri standar WHO 2006, kalkulasi Z-Score akurat, serta inferensi risiko determinan Naïve Bayes tanpa hambatan login.',
    ctaText: 'Mulai Skrining Sekarang',
    ctaPath: '/questionnaire',
    secondaryCtaText: 'Lihat Contoh Analisis',
    secondaryCtaPath: '/analytics',
    bgGradient: 'from-slate-900 via-blue-950 to-slate-900',
    decorIcon: <Activity className="w-48 h-48 text-blue-500/10" />,
    metricBox: {
      value: 'WHO 2006',
      label: 'Standar Antropometri Baku',
    },
  },
  {
    id: 'slide-bontang',
    badgeText: 'Fokus Wilayah & Target Intervensi',
    badgeIcon: <MapPin className="w-3.5 h-3.5 text-rose-500" />,
    title: 'Target Penurunan Prevalensi',
    highlight: 'Menuju Generasi Emas Bontang',
    description:
      'Memantau kerentanan stunting di 3 kecamatan (Bontang Utara, Selatan, Barat) dan 15 kelurahan dengan pendekatan intervensi gizi tepat sasaran pada 1.000 HPK.',
    ctaText: 'Cek Status Balita Anda',
    ctaPath: '/questionnaire',
    secondaryCtaText: 'Pelajari Data Wilayah',
    secondaryCtaPath: '#wilayah-bontang',
    bgGradient: 'from-slate-900 via-teal-950 to-slate-900',
    decorIcon: <TrendingDown className="w-48 h-48 text-teal-500/10" />,
    metricBox: {
      value: '27.4% → 14%',
      label: 'Target Penurunan Stunting',
    },
  },
  {
    id: 'slide-ai',
    badgeText: 'Konsultasi Interaktif Cerdas',
    badgeIcon: <Bot className="w-3.5 h-3.5 text-emerald-500" />,
    title: 'Tanya HATI Asisten Gizi AI &',
    highlight: 'Menu Pangan Lokal Bontang',
    description:
      'Dapatkan panduan variasi menu kaya protein hewani lokal (Ikan Bawis, Bandeng) dan jadwal pemantauan Posyandu secara interaktif bersama asisten virtual kami.',
    ctaText: 'Konsultasi Sekarang',
    ctaPath: '/questionnaire',
    bgGradient: 'from-blue-950 via-slate-900 to-teal-950',
    decorIcon: <Fish className="w-48 h-48 text-emerald-500/10" />,
    metricBox: {
      value: 'Ikan Bawis & Kelor',
      label: 'Kaya Zinc & Kalsium',
    },
  },
]

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const autoSlideTimerRef = useRef<number | null>(null)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)
  }

  // Auto-slide effect (5 seconds)
  useEffect(() => {
    if (!isPaused) {
      autoSlideTimerRef.current = window.setInterval(() => {
        nextSlide()
      }, 5500)
    }
    return () => {
      if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current)
    }
  }, [isPaused, currentSlide])

  const slide = CAROUSEL_SLIDES[currentSlide]

  return (
    <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-200/30 via-teal-100/25 to-indigo-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: 70% Carousel + 30% Side Promo Card (Halodoc Layout Pattern) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ──────────────── 1. Main Hero Carousel (8 Cols on LG) ──────────────── */}
          <div
            className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Slide Animation via Framer Motion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`w-full h-full p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-br ${slide.bgGradient} relative text-white`}
              >
                {/* Decorative Background Icon */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none select-none">
                  {slide.decorIcon}
                </div>

                {/* Top Content */}
                <div className="relative z-10 space-y-4 max-w-2xl">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-teal-200 shadow-sm">
                    {slide.badgeIcon}
                    <span>{slide.badgeText}</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight leading-[1.2]">
                    {slide.title}{' '}
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #93c5fd, #5eead4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {slide.highlight}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    {slide.description}
                  </p>
                </div>

                {/* Bottom CTA & Metric Footer */}
                <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={slide.ctaPath}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #1e40af, #0d9488)' }}
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {slide.secondaryCtaText && (
                      <Link
                        to={slide.secondaryCtaPath || '#'}
                        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-semibold transition-colors border border-white/15"
                      >
                        <PlayCircle className="w-4 h-4 text-teal-300" />
                        <span>{slide.secondaryCtaText}</span>
                      </Link>
                    )}
                  </div>

                  {slide.metricBox && (
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-bold text-white tracking-tight">
                        {slide.metricBox.value}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {slide.metricBox.label}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls (Dots & Arrows) */}
            <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 z-20 flex items-center gap-2">
              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5 mr-2">
                {CAROUSEL_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Pindah ke slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide
                        ? 'w-6 bg-teal-400'
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Slide Sebelumnya"
                className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Slide Selanjutnya"
                className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ──────────────── 2. Side Promo Card (4 Cols on LG - Halodoc Pattern) ──────────────── */}
          <div className="lg:col-span-4 rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-blue-900 via-blue-950 to-teal-950 text-white border border-blue-800/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Side Content */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
                  Skrining Mandiri
                </span>
                <span className="text-[11px] text-slate-400">⏱️ Cuma 2 Menit</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Cek Status Gizi & Risiko Stunting Balita
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Kalkulasi otomatis indeks antropometri WHO, inferensi Naïve Bayes, serta rekomendasi pangan lokal Bontang seketika.
              </p>

              {/* Verified Trust Points */}
              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Gratis & Tanpa Perlu Login / Akun</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Kalkulasi Z-Score TB/U, BB/U, BB/TB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Penyimpanan Aman & Dukungan Offline</span>
                </div>
              </div>
            </div>

            {/* Side Card Action Button */}
            <div className="relative z-10 pt-5 mt-4 border-t border-white/10">
              <Link
                to="/questionnaire"
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-center text-slate-900 bg-gradient-to-r from-teal-300 to-emerald-300 hover:from-teal-200 hover:to-emerald-200 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer active:scale-95"
              >
                <span>Mulai Skrining Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ──────────────── 3. Quick Stats Ribbon (Halodoc Summary Bar) ──────────────── */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {mockData.landingPage.heroSection.statsHighlights.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {stat.label}
              </span>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {stat.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
