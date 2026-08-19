import React from 'react'
import { MapPin, TrendingDown, AlertTriangle, Building2, ShieldAlert } from 'lucide-react'
import mockData from '../../data/mockData'

export const BontangContextSection: React.FC = () => {
  const contextData = mockData.landingPage.bontangHealthContext

  return (
    <section id="wilayah-bontang" className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Fokus Wilayah Intervensi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {contextData.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {contextData.subtitle}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Stat Card - 27.4% Prevalence */}
          <div className="lg:col-span-5 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-rose-600/15 flex flex-col justify-between relative overflow-hidden">
            {/* Background Ambient Pattern */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 bg-black/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-3.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Data Prevalensi Terkini</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight">
                  {contextData.metrics.stuntingPrevalence}
                </span>
                <span className="text-2xl font-extrabold text-rose-200">
                  {contextData.metrics.stuntingPrevalenceUnit}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
                {contextData.metrics.urgencyText}
              </p>
            </div>

            <div className="pt-5 mt-5 border-t border-rose-400/40 flex items-center justify-between relative z-10 text-xs sm:text-sm text-rose-100">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-300" />
                <span>Target Penurunan: <strong className="text-white">{contextData.metrics.targetPrevalence}%</strong></span>
              </div>
              <span className="bg-white/20 px-2.5 py-1 rounded-lg font-bold text-white text-xs">
                Tahun {contextData.metrics.targetYear}
              </span>
            </div>
          </div>

          {/* District Breakdown & Urgency Points */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            {/* 3 Kecamatan Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {contextData.districtOverview.map((district, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {district.subdistrictCount} Kelurahan
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-0.5">
                      {district.district}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Kerentanan: {district.prevalenceLevel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Crucial Action Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Pentingnya Deteksi Dini 1.000 Hari Pertama Kehidupan
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pertumbuhan otak dan tinggi badan tercepat terjadi pada usia 0 hingga 23 bulan. Deteksi dini sebelum usia 2 tahun memungkinkan pemulihan optimal secara permanen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
