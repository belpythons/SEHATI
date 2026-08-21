import React from 'react'
import { DatabaseIcon, RulerIcon, Analytics01Icon, ClipboardIcon } from 'hugeicons-react'

export const ProductIntelligence: React.FC = () => {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/60 mt-12 mb-12">
      <div className="max-w-3xl mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
          Dari penimbangan fisik <br className="hidden md:block" /> hingga analitik presisi.
        </h2>
        <p className="text-lg text-slate-600 font-light max-w-xl leading-relaxed">
          Alur inteligensi SEHATI meminimalkan kesalahan manusia dan mempercepat pengambilan keputusan di tingkat Posyandu.
        </p>
      </div>
      
      <div className="space-y-16 max-w-4xl">
        
        {/* Step 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          <div className="flex flex-col items-start">
            <DatabaseIcon className="w-12 h-12 text-slate-900 mb-6" strokeWidth={1} />
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-sm font-mono text-sage uppercase tracking-widest">Tahap 01</span>
              <h3 className="text-xl font-display font-medium text-slate-900">Data Balita</h3>
            </div>
            <p className="text-slate-600 font-light leading-relaxed">
              Pengumpulan data antropometri secara terpusat dan terstruktur. Basis profil historis untuk pelacakan jangka panjang tanpa dokumen fisik yang mudah hilang.
            </p>
          </div>

          <div className="flex flex-col items-start md:pt-24">
            <RulerIcon className="w-12 h-12 text-slate-900 mb-6" strokeWidth={1} />
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-sm font-mono text-sage uppercase tracking-widest">Tahap 02</span>
              <h3 className="text-xl font-display font-medium text-slate-900">Pengukuran</h3>
            </div>
            <p className="text-slate-600 font-light leading-relaxed">
              Pencatatan berat dan tinggi badan secara langsung, divalidasi oleh sistem untuk meminimalisir *human error* sebelum masuk ke tahap komputasi medis.
            </p>
          </div>
        </div>

        {/* Step 3 & 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          <div className="flex flex-col items-start">
            <Analytics01Icon className="w-12 h-12 text-slate-900 mb-6" strokeWidth={1} />
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-sm font-mono text-sage uppercase tracking-widest">Tahap 03</span>
              <h3 className="text-xl font-display font-medium text-slate-900">Analisis WHO</h3>
            </div>
            <p className="text-slate-600 font-light leading-relaxed">
              Kalkulasi Z-Score otomatis (BB/U, TB/U, BB/TB) dikombinasikan dengan probabilitas algoritma Naïve Bayes untuk menghasilkan klasifikasi risiko yang objektif.
            </p>
          </div>

          <div className="flex flex-col items-start md:pt-24">
            <ClipboardIcon className="w-12 h-12 text-slate-900 mb-6" strokeWidth={1} />
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-sm font-mono text-sage uppercase tracking-widest">Tahap 04</span>
              <h3 className="text-xl font-display font-medium text-slate-900">Rekomendasi</h3>
            </div>
            <p className="text-slate-600 font-light leading-relaxed">
              Tindakan kuratif dan edukatif yang di-generate spesifik berdasarkan klasifikasi tiap individu. Dari observasi lanjutan hingga rujukan Puskesmas.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
