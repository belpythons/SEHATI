import React from 'react'
import { DatabaseIcon, RulerIcon, Analytics01Icon, ClipboardIcon } from 'hugeicons-react'
import { motion } from 'framer-motion'

export const ProductIntelligence: React.FC = () => {
  const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition }
  }

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/60 mt-12 mb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={transition}
        className="max-w-3xl mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
          Dari penimbangan fisik <br className="hidden md:block" /> hingga analitik presisi.
        </h2>
        <p className="text-lg text-slate-600 font-light max-w-xl leading-relaxed">
          Alur inteligensi SEHATI meminimalkan kesalahan manusia dan mempercepat pengambilan keputusan di tingkat Posyandu.
        </p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="space-y-16 max-w-4xl"
      >
        
        {/* Step 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          <motion.div variants={stepVariants} className="flex flex-col items-start">
            <motion.div variants={stepVariants}><DatabaseIcon className="w-12 h-12 text-slate-900 mb-6" strokeWidth={1} /></motion.div>
            <motion.div variants={stepVariants} className="flex items-baseline gap-4 mb-3">
              <span className="text-sm font-mono text-sage uppercase tracking-widest">Tahap 01</span>
              <h3 className="text-xl font-display font-medium text-slate-900">Data Balita</h3>
            </motion.div>
            <motion.p variants={stepVariants} className="text-slate-600 font-light leading-relaxed">
              Pengumpulan data antropometri secara terpusat dan terstruktur. Basis profil historis untuk pelacakan jangka panjang tanpa dokumen fisik yang mudah hilang.
            </motion.p>
          </motion.div>

          <motion.div variants={stepVariants} className="flex flex-col items-start md:pt-24">
            <motion.div variants={stepVariants}><RulerIcon className="w-12 h-12 text-slate-900 mb-6" strokeWidth={1} /></motion.div>
            <motion.div variants={stepVariants} className="flex items-baseline gap-4 mb-3">
              <span className="text-sm font-mono text-sage uppercase tracking-widest">Tahap 02</span>
              <h3 className="text-xl font-display font-medium text-slate-900">Pengukuran</h3>
            </motion.div>
            <motion.p variants={stepVariants} className="text-slate-600 font-light leading-relaxed">
              Pencatatan berat dan tinggi badan secara langsung, divalidasi oleh sistem untuk meminimalisir *human error* sebelum masuk ke tahap komputasi medis.
            </motion.p>
          </motion.div>
        </div>

        {/* Step 3 & 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          <motion.div variants={stepVariants} className="flex flex-col items-start">
            <motion.div variants={stepVariants}><Analytics01Icon className="w-12 h-12 text-slate-900 mb-6" strokeWidth={1} /></motion.div>
            <motion.div variants={stepVariants} className="flex items-baseline gap-4 mb-3">
              <span className="text-sm font-mono text-sage uppercase tracking-widest">Tahap 03</span>
              <h3 className="text-xl font-display font-medium text-slate-900">Analisis WHO</h3>
            </motion.div>
            <motion.p variants={stepVariants} className="text-slate-600 font-light leading-relaxed">
              Kalkulasi Z-Score otomatis (BB/U, TB/U, BB/TB) dikombinasikan dengan probabilitas algoritma Naïve Bayes untuk menghasilkan klasifikasi risiko yang objektif.
            </motion.p>
          </motion.div>

          <motion.div variants={stepVariants} className="flex flex-col items-start md:pt-24">
            <motion.div variants={stepVariants}><ClipboardIcon className="w-12 h-12 text-slate-900 mb-6" strokeWidth={1} /></motion.div>
            <motion.div variants={stepVariants} className="flex items-baseline gap-4 mb-3">
              <span className="text-sm font-mono text-sage uppercase tracking-widest">Tahap 04</span>
              <h3 className="text-xl font-display font-medium text-slate-900">Rekomendasi</h3>
            </motion.div>
            <motion.p variants={stepVariants} className="text-slate-600 font-light leading-relaxed">
              Tindakan kuratif dan edukatif yang di-generate spesifik berdasarkan klasifikasi tiap individu. Dari observasi lanjutan hingga rujukan Puskesmas.
            </motion.p>
          </motion.div>
        </div>

      </motion.div>
    </section>
  )
}
