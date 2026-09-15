import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight01Icon } from 'hugeicons-react'
import { motion } from 'framer-motion'
import { HeroCarousel } from './HeroCarousel'

export const EditorialHero: React.FC = () => {
  const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

        {/* Left: Typography & CTA (7 cols) — UNCHANGED */}
        <div className="lg:col-span-7 flex flex-col items-start z-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-medium leading-[1.08] tracking-tight text-slate-900 mb-6 sm:mb-8 mt-4"
          >
            Deteksi dini, <br className="hidden md:block" />
            tumbuh <span className="hl hl--teal">lebih pasti.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.08 }}
            className="text-lg md:text-xl text-slate-600 max-w-lg mb-10 leading-relaxed font-light"
          >
            Sistem edukasi holistik dan deteksi stunting terintegrasi. Pendekatan klinis berbasis standar WHO 2006 untuk masa depan anak Indonesia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.12 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/questionnaire"
              className="inline-flex items-center justify-center rounded-full bg-[#1e293b] hover:bg-[#0f172a] text-white px-8 h-12 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 shadow-xs cursor-pointer active:scale-98"
            >
              Mulai Skrining <ArrowRight01Icon className="ml-2 w-4 h-4" />
            </Link>
            <a
              href="#cara-kerja"
              className="inline-flex items-center justify-center rounded-full px-8 h-12 text-sm font-medium transition-colors hover:bg-slate-100 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 cursor-pointer"
            >
              Lihat Cara Kerja
            </a>
          </motion.div>
        </div>

        {/* Right: Hero Carousel (5 cols) — REPLACED (was static WHO Growth Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.2 }}
          className="lg:col-span-5 relative mt-12 lg:mt-0"
        >
          <HeroCarousel />
        </motion.div>
      </div>
    </section>
  )
}