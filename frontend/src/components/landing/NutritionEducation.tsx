import React from 'react'
import { Apple01Icon } from 'hugeicons-react'
import { motion } from 'framer-motion'

export const NutritionEducation: React.FC = () => {
  const transition = { duration: 1.0, ease: [0.16, 1, 0.3, 1] as const }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition }
  }

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/60 mt-12 mb-12 overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ staggerChildren: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-12"
      >

        {/* Left column: Visual Anchor */}
        <div className="md:col-span-4 flex flex-col justify-between">
          <motion.div variants={itemVariants} className="bg-sage/10 p-4 inline-flex rounded-full self-start mb-12">
            <Apple01Icon className="w-8 h-8 text-sage" strokeWidth={1.5} />
          </motion.div>
          <motion.div variants={itemVariants} className="hidden md:block border-l-2 border-slate-200 pl-4 h-full">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest block mb-2">HATI Assistant</span>
            <p className="text-sm text-slate-500 font-light">Pendekatan gizi pangan lokal, dikurasi khusus untuk demografi dan geografi wilayah Bontang.</p>
          </motion.div>
        </div>

        {/* Right column: Editorial Block */}
        <div className="md:col-span-8 flex flex-col items-start">
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-display font-medium tracking-tight text-slate-900 mb-8 max-w-2xl leading-[1.1]">
            Asupan gizi bukan sekadar <br className="hidden md:block" /> kalkulasi kalori kasar.
          </motion.h2>

          <motion.div variants={itemVariants} className="prose prose-slate prose-lg max-w-none text-slate-600 font-light leading-relaxed">
            <p className="mb-6">
              Program pengentasan stunting seringkali gagal karena rekomendasi pangan yang tidak terjangkau atau asing bagi masyarakat lokal. SEHATI mengintegrasikan asisten cerdas yang memetakan kebutuhan gizi harian menggunakan bahan baku lokal ikan laut, sumber protein maritim, dan hasil bumi wilayah pesisir.
            </p>
            <p>
              Setiap hasil skrining yang menunjukkan deviasi pada <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Z-Score</span> akan secara otomatis memicu generasi rekomendasi diet spesifik. Bukan resep generik, melainkan intervensi terukur yang langsung dapat diterapkan oleh kader Posyandu dan orang tua di rumah.
            </p>
          </motion.div>
        </div>

      </motion.div>
    </section>
  )
}
