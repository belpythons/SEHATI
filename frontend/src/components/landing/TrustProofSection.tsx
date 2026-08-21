import React from 'react'

export const TrustProofSection: React.FC = () => {
  return (
    <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/60 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        <div className="md:col-span-1">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-2">Standard</span>
          <h2 className="text-xl font-display font-medium text-slate-900">WHO 2006</h2>
        </div>
        
        <div className="md:col-span-2">
          <p className="text-base text-slate-600 leading-relaxed font-light">
            Algoritma deteksi SEHATI dikalibrasi ketat menggunakan standar pertumbuhan anak <span className="font-medium text-slate-900">World Health Organization (WHO) 2006</span>. 
            Hasil analisis Z-Score memberikan presisi medis untuk menentukan status gizi secara objektif, bukan perkiraan.
          </p>
        </div>

        <div className="md:col-span-1 md:text-right">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-2">Akurasi</span>
          <div className="text-3xl font-display text-slate-900 tracking-tight tabular-nums">98.4%</div>
          <span className="text-xs text-slate-500 mt-1 block">Naïve Bayes Prediction</span>
        </div>
        
      </div>
    </section>
  )
}
