import React from 'react'
import { motion } from 'framer-motion'

export const TrustProofSection: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
  }

  return (
    <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/60 mt-12">
      <motion.div 
        variants={container} 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start"
      >
        
        <motion.div variants={item} className="md:col-span-1">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-2">Standard</span>
          <h2 className="text-xl font-display font-medium text-slate-900">WHO 2006</h2>
        </motion.div>
        
        <motion.div variants={item} className="md:col-span-2">
          <p className="text-base text-slate-600 leading-relaxed font-light">
            Algoritma deteksi SEHATI dikalibrasi ketat menggunakan standar pertumbuhan anak <span className="font-medium text-slate-900">World Health Organization (WHO) 2006</span>. 
            Hasil analisis Z-Score memberikan presisi medis untuk menentukan status gizi secara objektif, bukan perkiraan.
          </p>
        </motion.div>

        <motion.div variants={item} className="md:col-span-1 md:text-right">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-2">Akurasi</span>
          <div className="text-3xl font-display text-slate-900 tracking-tight tabular-nums">98.4%</div>
          <span className="text-xs text-slate-500 mt-1 block">Naïve Bayes Prediction</span>
        </motion.div>
        
      </motion.div>
    </section>
  )
}
