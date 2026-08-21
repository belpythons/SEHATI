import React from 'react'
import { ArrowRight01Icon } from 'hugeicons-react'
import { Button } from '../ui/button'

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/60 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
        <div>
          <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight text-slate-900 mb-6 leading-[1.05]">
            Siap memulai pemantauan presisi?
          </h2>
          <p className="text-lg md:text-xl text-slate-600 font-light max-w-md">
            Skrining cepat. Analisis data instan. Intervensi tepat sasaran untuk masa depan anak Indonesia.
          </p>
        </div>
        
        <div className="flex flex-col md:items-end justify-end">
          <Button size="lg" className="rounded-full bg-[#1e293b] hover:bg-[#0f172a] text-white px-10 h-14 text-base self-start md:self-end">
            Mulai Skrining <ArrowRight01Icon className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-xs font-mono text-slate-400 mt-4 uppercase tracking-widest text-left md:text-right">
            GRATIS UNTUK FASILITAS KESEHATAN
          </p>
        </div>
      </div>
    </section>
  )
}
