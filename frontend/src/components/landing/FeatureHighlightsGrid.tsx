import React from 'react'
import { Activity, ShieldCheck, Bot, Sparkles, Check, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import mockData from '../../data/mockData'

export const FeatureHighlightsGrid: React.FC = () => {
  const features = mockData.landingPage.featureCards

  const iconMap: Record<string, React.ReactNode> = {
    'who-zscore': <Activity className="w-6 h-6 text-blue-600" />,
    'naive-bayes-risk': <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    'gemini-ai-consultant': <Bot className="w-6 h-6 text-teal-600" />,
  }

  const detailBullets: Record<string, string[]> = {
    'who-zscore': [
      'Indeks TB/U: Deteksi dini status Stunting / Severely Stunted',
      'Indeks BB/U: Deteksi status Underweight / Gizi Kurang',
      'Indeks BB/TB: Deteksi status Wasting & Gizi Buruk',
    ],
    'naive-bayes-risk': [
      'Analisis 8 variabel determinan non-klinis keluarga',
      'Klasifikasi 3 derajat kerentanan (LOW, MODERATE, HIGH)',
      'Ekstraksi otomatis 2 faktor pemicu risiko dominan',
    ],
    'gemini-ai-consultant': [
      'Rekomendasi menu berbasis pangan lokal Bontang (Ikan Bawis)',
      'Streaming jawaban interaktif real-time',
      'Dukungan panduan sanitasi dan jadwal posyandu balita',
    ],
  }

  const actionLabels: Record<string, string> = {
    'who-zscore': 'Pelajari Standar Antropometri WHO',
    'naive-bayes-risk': 'Pelajari Model Naïve Bayes',
    'gemini-ai-consultant': 'Eksplorasi Konsultasi Gizi AI',
  }

  return (
    <section className="py-16 sm:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Halodoc Style) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solusi Terintegrasi SEHATI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tiga Pilar Utama Deteksi & Edukasi Stunting
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Kombinasi standar medis internasional WHO, algoritma Naïve Bayes, dan asisten gizi pangan lokal Kota Bontang.
            </p>
          </div>

          <Link
            to="/questionnaire"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
          >
            <span>Coba Seluruh Fitur</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Grid Cards (Halodoc Card Layout Pattern) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    {iconMap[feature.id]}
                  </div>
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: feature.bgColor,
                      color: feature.accentColor,
                    }}
                  >
                    {feature.tag}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bullet Highlights */}
                <ul className="space-y-2 pt-3 border-t border-slate-100">
                  {detailBullets[feature.id]?.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Action Link */}
              <div className="pt-4 mt-5 border-t border-slate-100">
                <Link
                  to="/questionnaire"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors group-hover:translate-x-1 duration-200"
                >
                  <span>{actionLabels[feature.id] || 'Coba Fitur Ini'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
