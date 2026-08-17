import React from 'react'
import { Activity, ShieldCheck, Bot, Sparkles, Check, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import mockData from '../../data/mockData'

export const FeatureHighlightsGrid: React.FC = () => {
  const features = mockData.landingPage.featureCards

  const iconMap: Record<string, React.ReactNode> = {
    'who-zscore': <Activity className="w-6 h-6 text-blue-600" />,
    'naive-bayes-risk': <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    'gemini-ai-consultant': <Bot className="w-6 h-6 text-purple-600" />
  }

  const detailBullets: Record<string, string[]> = {
    'who-zscore': [
      'Indeks TB/U: Deteksi dini status Stunting / Severely Stunted',
      'Indeks BB/U: Deteksi status Underweight / Gizi Kurang',
      'Indeks BB/TB: Deteksi status Wasting & Gizi Buruk'
    ],
    'naive-bayes-risk': [
      'Analisis 8 variabel determinan non-klinis keluarga',
      'Klasifikasi 3 derajat kerentanan (LOW, MODERATE, HIGH)',
      'Ekstraksi otomatis 2 faktor pemicu risiko dominan'
    ],
    'gemini-ai-consultant': [
      'Rekomendasi menu berbasis pangan lokal pesisir Bontang (Ikan Bawis)',
      'Protokol respon cepat Server-Sent Events (SSE) kata per kata',
      'Dukungan panduan sanitasi dan jadwal posyandu balita'
    ]
  }

  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitur Unggulan Sistem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tiga Pilar Utama Deteksi & Edukasi Stunting
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Menggabungkan standar medis internasional WHO, kecerdasan buatan, dan kearifan pangan lokal Kota Bontang.
          </p>
        </div>

        {/* 3 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="glass-card glass-card-hover rounded-3xl p-7 sm:p-8 flex flex-col justify-between border border-slate-200/80 group"
            >
              <div className="space-y-5">
                {/* Header Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    {iconMap[feature.id]}
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: feature.bgColor,
                      color: feature.accentColor
                    }}
                  >
                    {feature.tag}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bullet Highlights */}
                <ul className="space-y-2.5 pt-2 border-t border-slate-100">
                  {detailBullets[feature.id]?.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Action Link */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  to="/questionnaire"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group-hover:translate-x-1 duration-200"
                >
                  <span>Coba Fitur Ini Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
