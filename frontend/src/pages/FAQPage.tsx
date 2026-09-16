import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown01Icon, ArrowUp01Icon } from 'hugeicons-react'
import { FloatingNavbar } from '../components/layout/FloatingNavbar'
import { FooterSection } from '../components/layout/FooterSection'

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded-2xl"
      >
        <span className="text-base md:text-lg font-medium text-slate-900 pr-4">{question}</span>
        {isOpen ? (
          <ArrowUp01Icon className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={1.5} />
        ) : (
          <ArrowDown01Icon className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={1.5} />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm md:text-base text-slate-600 font-light leading-relaxed">{answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const faqData = [
  {
    question: 'Apa itu SEHATI dan siapa yang dapat menggunakannya?',
    answer:
      'SEHATI (Sistem Edukasi & Deteksi Stunting Terintegrasi) adalah platform skrining stunting gratis yang dapat digunakan oleh orang tua, kader Posyandu, bidan, dan tenaga kesehatan. Sistem ini menggunakan standar pertumbuhan WHO 2006 untuk menganalisis status gizi anak usia 0–60 bulan secara objektif dan akurat.',
  },
  {
    question: 'Apakah data anak saya aman?',
    answer:
      'Ya. Data disimpan secara lokal di perangkat Anda dan diproses menggunakan sesi anonim. SEHATI tidak mengumpulkan informasi identitas pribadi dan tidak memerlukan pendaftaran akun. Data skrining hanya dapat diakses melalui perangkat yang digunakan atau melalui share link yang Anda buat secara manual.',
  },
  {
    question: 'Seberapa akurat hasil skrining SEHATI?',
    answer:
      'Algoritma deteksi SEHATI dikalibrasi ketat menggunakan standar pertumbuhan WHO 2006 untuk perhitungan Z-Score, dan model prediksi Naive Bayes yang dilatih pada dataset antropometri dengan akurasi 98.4%. Namun, hasil skrining bersifat indikasi awal dan tidak menggantikan diagnosis medis oleh tenaga kesehatan profesional.',
  },
  {
    question: 'Bisakah SEHATI digunakan tanpa koneksi internet?',
    answer:
      'Ya. SEHATI dirancang sebagai Progressive Web App (PWA) yang dapat berfungsi secara offline setelah kunjungan pertama. Anda dapat mengisi kuesioner, melihat hasil skrining sebelumnya, dan mengakses dashboard analitik tanpa koneksi internet. Data akan disinkronkan secara otomatis ketika koneksi kembali tersedia.',
  },
  {
    question: 'Apa itu Z-Score dan bagaimana cara membacanya?',
    answer:
      'Z-Score adalah ukuran statistik yang menunjukkan seberapa jauh pengukuran anak (berat/tinggi badan) menyimpang dari median populasi referensi WHO. Nilai Z-Score di bawah -2 SD mengindikasikan gizi kurang (stunted/underweight), sedangkan di bawah -3 SD menunjukkan kondisi gizi buruk (severely stunted). Dashboard SEHATI memvisualisasikan Z-Score pada kurva pertumbuhan WHO sehingga mudah dipahami.',
  },
  {
    question: 'Bagaimana cara membagikan hasil skrining kepada tenaga kesehatan?',
    answer:
      'Setelah mendapatkan hasil skrining di dashboard, Anda dapat membuat share link unik yang dapat dikirimkan ke bidan, dokter, atau kader Posyandu. Penerima link dapat melihat seluruh hasil analisis tanpa perlu akun atau instalasi aplikasi, cukup buka tautan di browser.',
  },
  {
    question: 'Apakah rekomendasi gizi SEHATI bersifat generik?',
    answer:
      'Tidak. Asisten AI HATI memberikan rekomendasi diet yang dipersonalisasi berdasarkan hasil skrining spesifik anak Anda, dengan fokus pada bahan pangan lokal yang tersedia di wilayah pesisir Bontang, seperti ikan laut, udang, kerang, serta hasil bumi lokal. Rekomendasi dirancang agar realistis, terjangkau, dan dapat langsung diterapkan.',
  },
  {
    question: 'Apakah SEHATI menggantikan pemeriksaan di Posyandu atau Puskesmas?',
    answer:
      'Tidak. SEHATI adalah alat bantu skrining awal yang melengkapi, bukan menggantikan pemeriksaan oleh tenaga kesehatan profesional. Jika hasil skrining menunjukkan indikasi risiko stunting atau masalah gizi, kami sangat menyarankan untuk segera melakukan konsultasi lanjutan di Posyandu atau Puskesmas terdekat.',
  },
]

export const FAQPage: React.FC = () => {
  const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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
              FAQ
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.06 }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-medium leading-[1.08] tracking-tight text-slate-900 mb-8 max-w-4xl"
          >
            Pertanyaan yang <br className="hidden md:block" />
            <span className="hl hl--teal">sering diajukan.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.12 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-light"
          >
            Temukan jawaban untuk pertanyaan umum seputar penggunaan SEHATI, privasi data, dan interpretasi hasil skrining.
          </motion.p>
        </section>

        {/* Accordion */}
        <section className="px-4 sm:px-6 md:px-12 max-w-4xl mx-auto pb-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ staggerChildren: 0.06 }}
            className="space-y-4"
          >
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition }
                }}
              >
                <AccordionItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      <FooterSection />
    </div>
  )
}
