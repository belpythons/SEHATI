import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, CheckCircle2, Shield } from 'lucide-react'
import mockData from '../../data/mockData'

export const QuickStartCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-14 text-white shadow-2xl shadow-blue-600/30 overflow-hidden text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Background Ambient Lights */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          {/* Content */}
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skrining Sekarang Cuma 2 Menit</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Lindungi Tumbuh Kembang Si Kecil Sejak Dini
            </h3>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Dapatkan analisis grafik WHO akurat, estimasi risiko determinan keluarga, dan panduan gizi ikan lokal Kota Bontang tanpa hambatan login.
            </p>
          </div>

          {/* Action Button */}
          <div className="relative z-10 flex-shrink-0">
            <Link
              to="/questionnaire"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white hover:bg-slate-50 text-blue-700 hover:text-blue-800 font-extrabold text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-200"
            >
              <span>Mulai Skrining Balita</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
