import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

export const QuickStartCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-3xl p-8 sm:p-12 text-white shadow-2xl overflow-hidden text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8 border border-blue-800/40"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #0d9488 100%)' }}
        >
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/15 rounded-full blur-2xl pointer-events-none" />

          {/* Content */}
          <div className="space-y-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Skrining Cepat & Tanpa Registrasi</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Lindungi Tumbuh Kembang Si Kecil Sejak Dini
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Dapatkan analisis grafik WHO 2006, kalkulasi determinan Naïve Bayes, serta konsultasi gizi pangan lokal Kota Bontang dalam satu alur terpadu.
            </p>
          </div>

          {/* Action Button */}
          <div className="relative z-10 shrink-0">
            <Link
              to="/questionnaire"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-slate-50 text-blue-700 hover:text-blue-800 font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-200 cursor-pointer"
            >
              <span>Mulai Skrining Balita</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
