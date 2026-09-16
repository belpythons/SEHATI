import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StethoscopeIcon, AiBeautifyIcon, ChartLineData03Icon } from 'hugeicons-react'
import { FloatingNavbar } from '../components/layout/FloatingNavbar'
import { FooterSection } from '../components/layout/FooterSection'

export const AboutPage: React.FC = () => {
  const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition }
  }

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
              <span className="eyebrow__dot eyebrow__dot--teal" />
              Tentang Kami
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.06 }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-medium leading-[1.08] tracking-tight text-slate-900 mb-8 max-w-4xl"
          >
            Menjembatani <br className="hidden md:block" />
            kesenjangan <span className="hl hl--teal">deteksi stunting.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.12 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-light mb-16"
          >
            SEHATI (Sistem Edukasi & Deteksi Stunting Terintegrasi) lahir dari kebutuhan mendesak akan alat skrining yang akurat, mudah diakses, dan relevan secara lokal bagi masyarakat Indonesia.
          </motion.p>
        </section>

        {/* Stunting as National Issue */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-24 border-t border-slate-200/60 pt-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-12"
          >
            <div className="md:col-span-5">
              <motion.h2
                variants={cardVariants}
                className="text-3xl md:text-4xl font-display font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]"
              >
                Stunting bukan sekadar <br className="hidden md:block" />
                masalah tinggi badan.
              </motion.h2>
              <motion.div variants={cardVariants} className="flex items-center gap-6 border-l border-slate-300 pl-6 mt-8">
                <div className="text-5xl font-display font-light text-slate-900 tracking-tighter">21.6<span className="text-2xl">%</span></div>
                <div className="text-sm font-mono text-slate-500 uppercase tracking-widest leading-snug">
                  Prevalensi<br />Stunting<br />Nasional
                </div>
              </motion.div>
            </div>

            <div className="md:col-span-7">
              <motion.div variants={cardVariants} className="prose prose-slate prose-lg max-w-none text-slate-600 font-light leading-relaxed">
                <p className="mb-6">
                  Indonesia masih menghadapi tantangan serius dalam penanganan stunting. Data Survei Status Gizi Indonesia (SSGI) menunjukkan prevalensi yang masih tinggi di berbagai wilayah, dengan dampak jangka panjang pada perkembangan kognitif, produktivitas, dan kualitas hidup generasi mendatang.
                </p>
                <p>
                  Keterlambatan deteksi menjadi akar masalah utama. Tanpa alat skrining yang terstandarisasi dan mudah digunakan oleh kader Posyandu maupun orang tua, banyak kasus stunting baru teridentifikasi ketika jendela intervensi emas, 1000 Hari Pertama Kehidupan sudah terlewat. SEHATI hadir untuk mengisi kekosongan ini.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Approach Cards */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.12 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Card 1 */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-2xl border border-slate-200/50 p-8 flex flex-col"
            >
              <div className="bg-sage/10 p-3 rounded-full mb-6 inline-flex self-start">
                <StethoscopeIcon className="w-6 h-6 text-sage" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-display font-medium text-slate-900 mb-3">Standar WHO 2006</h3>
              <p className="text-sm text-slate-600 font-light leading-relaxed">
                Algoritma deteksi dikalibrasi menggunakan data referensi pertumbuhan WHO 2006 standar emas global untuk menilai status gizi anak berusia 0–60 bulan melalui perhitungan Z-Score.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-2xl border border-slate-200/50 p-8 flex flex-col"
            >
              <div className="bg-teal/10 p-3 rounded-full mb-6 inline-flex self-start">
                <AiBeautifyIcon className="w-6 h-6 text-teal" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-display font-medium text-slate-900 mb-3">Naive Bayes Classifier</h3>
              <p className="text-sm text-slate-600 font-light leading-relaxed">
                Model klasifikasi Naive Bayes dilatih dengan dataset antropometri untuk memprediksi risiko stunting dengan akurasi 98.4%. Pendekatan probabilistik ini memberikan hasil yang cepat dan dapat diandalkan.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-2xl border border-slate-200/50 p-8 flex flex-col"
            >
              <div className="bg-navy/10 p-3 rounded-full mb-6 inline-flex self-start">
                <ChartLineData03Icon className="w-6 h-6 text-navy" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-display font-medium text-slate-900 mb-3">Dashboard Analitik</h3>
              <p className="text-sm text-slate-600 font-light leading-relaxed">
                Hasil skrining divisualisasikan dalam dashboard interaktif yang menampilkan Z-Score, kurva pertumbuhan WHO, dan rekomendasi gizi berbasis pangan lokal, semuanya dapat diakses secara offline.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transition}
            className="text-center"
          >
            <Link
              to="/questionnaire"
              className="inline-flex items-center justify-center rounded-full bg-[#1e293b] hover:bg-[#0f172a] text-white px-8 h-12 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 shadow-xs"
            >
              Mulai Skrining Sekarang
            </Link>
          </motion.div>
        </section>
      </main>

      <FooterSection />
    </div>
  )
}
