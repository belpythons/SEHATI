import React from 'react'
import { motion } from 'framer-motion'
import { Location04Icon } from 'hugeicons-react'
import { FloatingNavbar } from '../components/layout/FloatingNavbar'
import { FooterSection } from '../components/layout/FooterSection'

const kecamatanData = [
  {
    name: 'Kecamatan Bontang Barat',
    kelurahan: ['Belimbing', 'Kanaan', 'Gunung Telihan (Telihan)'],
  },
  {
    name: 'Kecamatan Bontang Utara',
    kelurahan: ['Api-Api', 'Bontang Baru', 'Gunung Elai', 'Bontang Kuala', 'Guntung', 'Loktuan'],
  },
  {
    name: 'Kecamatan Bontang Selatan',
    kelurahan: [
      'Tanjung Laut',
      'Tanjung Laut Indah',
      'Satimpo',
      'Berbas Pantai',
      'Berbas Tengah',
      'Bontang Lestari',
    ],
  },
]

export const BontangContextPage: React.FC = () => {
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
              <span className="eyebrow__dot eyebrow__dot--navy" />
              Konteks Wilayah
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.06 }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-medium leading-[1.08] tracking-tight text-slate-900 mb-8 max-w-4xl"
          >
            Kota Bontang, <br className="hidden md:block" />
            <span className="hl hl--teal">Kalimantan Timur.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.12 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-light"
          >
            SEHATI dikembangkan secara khusus untuk konteks demografis dan geografis Kota Bontang, kota pesisir di pantai timur Kalimantan yang menghadapi tantangan stunting di atas rata-rata nasional.
          </motion.p>
        </section>

        {/* Prevalence Stat */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-20 border-t border-slate-200/60 pt-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-12"
          >
            <div className="md:col-span-5">
              <motion.div variants={cardVariants} className="flex items-center gap-6 border-l-2 border-teal pl-6">
                <div className="text-6xl md:text-7xl font-display font-light text-slate-900 tracking-tighter">
                  27.4<span className="text-3xl">%</span>
                </div>
                <div className="text-sm font-mono text-slate-500 uppercase tracking-widest leading-snug">
                  Prevalensi<br />Stunting<br />Bontang
                </div>
              </motion.div>
              <motion.p variants={cardVariants} className="text-sm text-slate-500 font-light mt-6">
                Angka ini melampaui target nasional 14% pada tahun 2024 dan menunjukkan urgensi intervensi berbasis data di tingkat kelurahan.
              </motion.p>
            </div>

            <div className="md:col-span-7">
              <motion.div variants={cardVariants} className="prose prose-slate prose-lg max-w-none text-slate-600 font-light leading-relaxed">
                <p className="mb-6">
                  Kota Bontang, dengan populasi sekitar 180.000 jiwa, adalah kota industri pesisir yang bergantung pada sektor migas dan petrokimia. Meskipun memiliki Produk Domestik Regional Bruto (PDRB) per kapita yang relatif tinggi, angka prevalensi stunting masih mengkhawatirkan mengindikasikan bahwa masalah stunting tidak semata-mata soal kemampuan ekonomi, melainkan juga akses terhadap informasi gizi yang tepat dan terukur.
                </p>
                <p>
                  Karakteristik wilayah pesisir membentuk pola konsumsi pangan yang unik. Potensi sumber protein maritim yang melimpah, ikan laut, udang, kerang justru kerap kurang optimal dalam pemanfaatannya untuk memenuhi kebutuhan gizi balita. SEHATI memahami konteks ini dan mengintegrasikan rekomendasi diet berbasis pangan lokal yang realistis dan terjangkau.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Kelurahan Grid */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={cardVariants} className="mb-10">
              <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-2">Cakupan Wilayah</h2>
              <p className="text-2xl md:text-3xl font-display font-medium text-slate-900">
                3 Kecamatan, 15 Kelurahan
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kecamatanData.map((kecamatan) => (
                <motion.div
                  key={kecamatan.name}
                  variants={cardVariants}
                  className="bg-white rounded-2xl border border-slate-200/50 p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-navy/10 p-2 rounded-full inline-flex">
                      <Location04Icon className="w-5 h-5 text-navy" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-mono uppercase tracking-widest text-slate-500">{kecamatan.name}</h3>
                  </div>
                  <ul className="space-y-3">
                    {kecamatan.kelurahan.map((kel, idx) => (
                      <li key={kel} className="text-slate-600 font-light text-sm flex gap-3 items-start">
                        <span className="text-sage font-mono text-xs mt-0.5">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {kel}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Why Bontang */}
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
                Mengapa fokus <br className="hidden md:block" />
                di Bontang?
              </motion.h2>
            </div>

            <div className="md:col-span-7">
              <motion.div variants={cardVariants}>
                <ul className="space-y-6">
                  <li className="flex gap-4 items-start">
                    <span className="text-teal font-mono text-sm mt-1 shrink-0">01</span>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Prevalensi di atas rata-rata nasional</h4>
                      <p className="text-sm text-slate-600 font-light leading-relaxed">
                        Dengan 27.4% prevalensi stunting, Bontang memerlukan alat deteksi dini yang spesifik dan mudah diakses oleh petugas kesehatan lokal.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="text-teal font-mono text-sm mt-1 shrink-0">02</span>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Potensi pangan lokal belum optimal</h4>
                      <p className="text-sm text-slate-600 font-light leading-relaxed">
                        Wilayah pesisir kaya akan sumber protein maritim yang dapat dioptimalkan untuk intervensi gizi balita jika didukung oleh rekomendasi yang terukur dan berbasis data.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="text-teal font-mono text-sm mt-1 shrink-0">03</span>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Skala yang terkelola</h4>
                      <p className="text-sm text-slate-600 font-light leading-relaxed">
                        Dengan 3 kecamatan dan 15 kelurahan, Bontang menjadi pilot project ideal untuk memvalidasi efektivitas SEHATI sebelum diskalakan ke wilayah yang lebih luas.
                      </p>
                    </div>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <FooterSection />
    </div>
  )
}
