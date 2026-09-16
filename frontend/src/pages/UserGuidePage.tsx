import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NoteIcon, ChartLineData03Icon, MessageMultiple01Icon } from 'hugeicons-react'
import { FloatingNavbar } from '../components/layout/FloatingNavbar'
import { FooterSection } from '../components/layout/FooterSection'

const steps = [
  {
    number: '01',
    icon: NoteIcon,
    title: 'Isi Kuesioner Skrining',
    description:
      'Masukkan data antropometri anak melalui kuesioner 3 langkah yang intuitif: data dasar anak (nama, tanggal lahir, jenis kelamin), pengukuran fisik (berat badan, tinggi/panjang badan), dan lingkar kepala.',
    details: [
      'Kuesioner dirancang untuk dapat diisi dalam waktu kurang dari 3 menit',
      'Data tersimpan secara lokal — dapat diakses tanpa koneksi internet',
      'Input divalidasi secara real-time untuk meminimalkan kesalahan pengukuran',
    ],
    color: 'teal',
    cta: { label: 'Mulai Skrining', to: '/questionnaire' },
  },
  {
    number: '02',
    icon: ChartLineData03Icon,
    title: 'Lihat Hasil di Dashboard',
    description:
      'Setelah mengirim kuesioner, hasil analisis akan ditampilkan dalam dashboard interaktif yang mencakup Z-Score, kurva pertumbuhan WHO, prediksi Naive Bayes, dan status gizi menyeluruh.',
    details: [
      'Visualisasi Z-Score pada kurva pertumbuhan WHO 2006',
      'Gauge prediksi risiko stunting berbasis Naive Bayes (akurasi 98.4%)',
      'Hasil dapat dibagikan melalui tautan unik (share link)',
    ],
    color: 'sage',
    cta: { label: 'Contoh Dashboard', to: '/analytics' },
  },
  {
    number: '03',
    icon: MessageMultiple01Icon,
    title: 'Konsultasi HATI Assistant',
    description:
      'Gunakan asisten AI HATI untuk mendapatkan rekomendasi gizi yang dipersonalisasi berdasarkan hasil skrining. HATI memahami konteks pangan lokal Bontang dan memberikan saran diet yang realistis serta terjangkau.',
    details: [
      'Rekomendasi diet berbasis bahan pangan lokal pesisir Bontang',
      'Penjelasan hasil skrining dalam bahasa yang mudah dipahami',
      'Tersedia langsung di samping dashboard hasil analisis',
    ],
    color: 'navy',
    cta: null,
  },
]

export const UserGuidePage: React.FC = () => {
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
              <span className="eyebrow__dot eyebrow__dot--sage" />
              Panduan Pengguna
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.06 }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-medium leading-[1.08] tracking-tight text-slate-900 mb-8 max-w-4xl"
          >
            Tiga langkah menuju <br className="hidden md:block" />
            <span className="hl hl--sage">kejelasan gizi anak.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.12 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-light"
          >
            Proses skrining SEHATI dirancang sederhana namun komprehensif. Ikuti alur berikut untuk mendapatkan analisis status gizi anak berdasarkan standar WHO 2006.
          </motion.p>
        </section>

        {/* Steps */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.15 }}
            className="space-y-8"
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={cardVariants}
                className="bg-white rounded-2xl border border-slate-200/50 p-8 md:p-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left: number + icon */}
                  <div className="md:col-span-3 flex flex-row md:flex-col items-start gap-4">
                    <div className={`bg-${step.color}/10 p-3 rounded-full inline-flex`}>
                      <step.icon className={`w-6 h-6 text-${step.color}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl md:text-5xl font-display font-light text-slate-200 tracking-tighter">
                        {step.number}
                      </span>
                      <div className="hidden md:block w-12 h-px bg-slate-200" />
                    </div>
                  </div>

                  {/* Right: content */}
                  <div className="md:col-span-9">
                    <h3 className="text-xl md:text-2xl font-display font-medium text-slate-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-base text-slate-600 font-light leading-relaxed mb-6">
                      {step.description}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {step.details.map((detail, i) => (
                        <li key={i} className="text-sm text-slate-600 font-light flex gap-3 items-start">
                          <span className={`text-${step.color} font-mono text-xs mt-0.5`}>✓</span>
                          {detail}
                        </li>
                      ))}
                    </ul>

                    {step.cta && (
                      <Link
                        to={step.cta.to}
                        className="inline-flex items-center text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
                      >
                        {step.cta.label}
                        <span className="ml-2">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
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
            <p className="text-slate-500 font-light mb-6">Siap memulai?</p>
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
