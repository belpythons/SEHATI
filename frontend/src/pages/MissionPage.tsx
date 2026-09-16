import React from 'react'
import { motion } from 'framer-motion'
import { Target02Icon, BookOpen01Icon, Share05Icon } from 'hugeicons-react'
import { FloatingNavbar } from '../components/layout/FloatingNavbar'
import { FooterSection } from '../components/layout/FooterSection'

export const MissionPage: React.FC = () => {
  const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition }
  }

  const targets = [
    {
      icon: Target02Icon,
      number: '01',
      title: 'Deteksi Dini',
      description:
        'Menyediakan alat skrining berbasis standar WHO 2006 yang dapat diakses langsung oleh kader Posyandu dan orang tua, memungkinkan identifikasi risiko stunting sejak usia sedini mungkin sebelum jendela intervensi 1000 HPK tertutup.',
      color: 'teal',
    },
    {
      icon: BookOpen01Icon,
      number: '02',
      title: 'Edukasi Berbasis Data',
      description:
        'Mengintegrasikan rekomendasi gizi yang spesifik, terukur, dan berbasis pangan lokal ke dalam setiap hasil skrining. Bukan panduan generik, melainkan intervensi diet yang dapat langsung diterapkan di rumah dengan bahan baku yang terjangkau.',
      color: 'sage',
    },
    {
      icon: Share05Icon,
      number: '03',
      title: 'Pemerataan Akses',
      description:
        'Mendemokratisasi akses terhadap teknologi skrining berstandar medis melalui platform yang bersifat offline-ready, gratis, dan dirancang untuk wilayah dengan keterbatasan infrastruktur digital dimulai dari Kota Bontang, Kalimantan Timur.',
      color: 'navy',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      <FloatingNavbar />

      <main className="flex-grow pt-28">
        {/* Hero */}
        <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="mb-6"
          >
            <span className="eyebrow">
              <span className="eyebrow__dot eyebrow__dot--sage" />
              Visi & Misi
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.06 }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-medium leading-[1.08] tracking-tight text-slate-900 mb-8 max-w-4xl"
          >
            Setiap anak berhak <br className="hidden md:block" />
            tumbuh <span className="hl hl--sage">tanpa hambatan.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.12 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-light"
          >
            SEHATI dibangun dengan satu visi: memastikan tidak ada anak Indonesia yang kehilangan potensi optimalnya karena keterlambatan deteksi masalah gizi.
          </motion.p>
        </section>

        {/* Vision Statement */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-16 border-t border-slate-200/60 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={transition}
            className="grid grid-cols-1 md:grid-cols-12 gap-12"
          >
            <div className="md:col-span-4">
              <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">Visi</h2>
              <p className="text-2xl md:text-3xl font-display font-medium text-slate-900 leading-[1.2]">
                Indonesia bebas stunting melalui deteksi dini yang merata dan terstandarisasi.
              </p>
            </div>
            <div className="md:col-span-8">
              <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">Misi</h2>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-light leading-relaxed">
                <p className="mb-4">
                  Mengembangkan dan menyebarluaskan platform skrining stunting berbasis standar WHO 2006 yang dapat diakses secara gratis oleh seluruh lapisan masyarakat, dengan fokus pada:
                </p>
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex gap-3 text-base">
                    <span className="text-sage font-mono text-sm mt-0.5">→</span>
                    Akurasi klinis melalui algoritma yang tervalidasi secara ilmiah
                  </li>
                  <li className="flex gap-3 text-base">
                    <span className="text-sage font-mono text-sm mt-0.5">→</span>
                    Aksesibilitas universal, termasuk di wilayah dengan konektivitas terbatas
                  </li>
                  <li className="flex gap-3 text-base">
                    <span className="text-sage font-mono text-sm mt-0.5">→</span>
                    Relevansi lokal dalam rekomendasi gizi dan intervensi diet
                  </li>
                  <li className="flex gap-3 text-base">
                    <span className="text-sage font-mono text-sm mt-0.5">→</span>
                    Pemberdayaan kader kesehatan dan orang tua sebagai garda terdepan
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Target Impact Cards */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.h2
              variants={cardVariants}
              className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-10"
            >
              Target Dampak
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {targets.map((target) => (
                <motion.div
                  key={target.number}
                  variants={cardVariants}
                  className="bg-white rounded-2xl border border-slate-200/50 p-8 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className={`bg-${target.color}/10 p-3 rounded-full inline-flex`}>
                      <target.icon className={`w-6 h-6 text-${target.color}`} strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-sm text-slate-300">{target.number}</span>
                  </div>
                  <h3 className="text-lg font-display font-medium text-slate-900 mb-3">{target.title}</h3>
                  <p className="text-sm text-slate-600 font-light leading-relaxed">{target.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      <FooterSection />
    </div>
  )
}
