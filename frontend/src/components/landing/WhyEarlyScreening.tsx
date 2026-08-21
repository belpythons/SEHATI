import React from 'react'
import { Shield01Icon } from 'hugeicons-react'

export const WhyEarlyScreening: React.FC = () => {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/60 mt-12 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Left Heavy Content (8 cols) */}
        <div className="md:col-span-8 flex flex-col items-start pr-0 md:pr-12">
          <div className="bg-sage/10 p-3 rounded-full mb-8 inline-flex">
            <Shield01Icon className="w-8 h-8 text-sage" strokeWidth={1.5} />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Mengapa 1000 hari <br />
            pertama sangat krusial?
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed max-w-2xl">
            Stunting bukan sekadar tubuh pendek, melainkan terhambatnya perkembangan kognitif anak secara permanen. 
            Deteksi dini dalam periode emas (1000 HPK) adalah satu-satunya jendela kesempatan untuk intervensi yang efektif.
          </p>
          
          <div className="mt-12 flex items-center gap-6 border-l border-slate-300 pl-6">
            <div className="text-6xl font-display font-light text-slate-900 tracking-tighter">1000</div>
            <div className="text-sm font-mono text-slate-500 uppercase tracking-widest leading-snug">
              Hari<br />Pertama<br />Kehidupan
            </div>
          </div>
        </div>

        {/* Right Info (4 cols) */}
        <div className="md:col-span-4 flex flex-col justify-end">
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">Risiko Keterlambatan</h3>
            <ul className="space-y-4">
              <li className="text-slate-600 font-light text-sm flex gap-3"><span className="text-sage font-mono">01</span> Penurunan kapasitas intelektual dan kognitif jangka panjang.</li>
              <li className="text-slate-600 font-light text-sm flex gap-3"><span className="text-sage font-mono">02</span> Rentan terhadap penyakit metabolik di usia dewasa.</li>
              <li className="text-slate-600 font-light text-sm flex gap-3"><span className="text-sage font-mono">03</span> Kehilangan potensi produktivitas generasi penerus bangsa.</li>
            </ul>
          </div>
        </div>
        
      </div>
    </section>
  )
}
