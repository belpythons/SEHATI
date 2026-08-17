import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Shield, Cpu, Activity, Wifi, CheckCircle2, PlayCircle } from 'lucide-react'
import mockData from '../../data/mockData'

export const HeroSection: React.FC = () => {
  const heroData = mockData.landingPage.heroSection

  const statIcons = [
    <Activity key="activity" className="w-5 h-5 text-blue-600" />,
    <Cpu key="cpu" className="w-5 h-5 text-emerald-600" />,
    <Sparkles key="sparkles" className="w-5 h-5 text-purple-600" />,
    <Wifi key="wifi" className="w-5 h-5 text-amber-600" />
  ]

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/40 via-sky-100/30 to-purple-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Official Location Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full gradient-badge border border-blue-200/80 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-blue-800 tracking-wide">
              {heroData.badge}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] sm:leading-[1.12]">
            Deteksi Dini & Pencegahan{' '}
            <span className="gradient-text">Stunting Balita</span> Secara Terintegrasi
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {heroData.subtitle}
          </p>

          {/* CTA Buttons Group */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={heroData.ctaPrimary.path}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all group"
            >
              <span>{heroData.ctaPrimary.label}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-white/20 rounded-full text-white/95">
                {heroData.ctaPrimary.badge}
              </span>
            </Link>

            <Link
              to={heroData.ctaSecondary.path}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-base rounded-2xl border border-slate-200 shadow-sm hover:shadow transition-all"
            >
              <PlayCircle className="w-5 h-5 text-slate-500" />
              <span>{heroData.ctaSecondary.label}</span>
            </Link>
          </div>

          {/* Quick Trust Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Bebas Registrasi / Tanpa Password
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Kalkulasi Standar Deviasi WHO 2006
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Data Tersimpan Aman di Perangkat
            </span>
          </div>
        </div>

        {/* 4 Feature Highlights Grid Cards */}
        <div className="mt-14 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {heroData.statsHighlights.map((stat, index) => (
            <div
              key={index}
              className="glass-card glass-card-hover rounded-2xl p-5 sm:p-6 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </span>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                  {statIcons[index % statIcons.length]}
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                  {stat.value}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {stat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
