import React from 'react'
import { motion } from 'framer-motion'
import { Mail01Icon, Location04Icon, CallIcon } from 'hugeicons-react'
import { FloatingNavbar } from '../components/layout/FloatingNavbar'
import { FooterSection } from '../components/layout/FooterSection'

const contactChannels = [
  {
    icon: Mail01Icon,
    label: 'Email',
    value: 'sehati.bontang@gmail.com',
    href: 'mailto:sehati.bontang@gmail.com',
    description: 'Kirimkan pertanyaan atau masukan Anda. Kami akan merespons dalam 1–2 hari kerja.',
    color: 'teal',
  },
  {
    icon: CallIcon,
    label: 'Hotline',
    value: '(0548) 21-XXX',
    href: null,
    description: 'Hubungi hotline Dinas Kesehatan Kota Bontang untuk konsultasi lebih lanjut mengenai program gizi anak.',
    color: 'sage',
  },
  {
    icon: Location04Icon,
    label: 'Alamat',
    value: 'Dinas Kesehatan Kota Bontang',
    href: null,
    description: 'Jl. Bessai Berinta, Bontang Baru, Kecamatan Bontang Utara, Kota Bontang, Kalimantan Timur 75331.',
    color: 'navy',
  },
]

export const ContactPage: React.FC = () => {
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
              Kontak
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.06 }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-medium leading-[1.08] tracking-tight text-slate-900 mb-8 max-w-4xl"
          >
            Kami di sini untuk <br className="hidden md:block" />
            <span className="hl hl--sage">membantu Anda.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.12 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-light"
          >
            Memiliki pertanyaan tentang SEHATI, hasil skrining, atau ingin berkolaborasi? Jangan ragu untuk menghubungi kami melalui kanal berikut.
          </motion.p>
        </section>

        {/* Contact Cards */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.12 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {contactChannels.map((channel) => (
              <motion.div
                key={channel.label}
                variants={cardVariants}
                className="bg-white rounded-2xl border border-slate-200/50 p-8 flex flex-col"
              >
                <div className={`bg-${channel.color}/10 p-3 rounded-full mb-6 inline-flex self-start`}>
                  <channel.icon className={`w-6 h-6 text-${channel.color}`} strokeWidth={1.5} />
                </div>

                <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-2">{channel.label}</h3>

                {channel.href ? (
                  <a
                    href={channel.href}
                    className="text-lg font-medium text-slate-900 hover:text-teal transition-colors mb-4 break-all"
                  >
                    {channel.value}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-slate-900 mb-4">{channel.value}</p>
                )}

                <p className="text-sm text-slate-600 font-light leading-relaxed mt-auto">{channel.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Additional Note */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-24 border-t border-slate-200/60 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={transition}
            className="grid grid-cols-1 md:grid-cols-12 gap-12"
          >
            <div className="md:col-span-5">
              <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-slate-900 leading-[1.1]">
                Catatan penting
              </h2>
            </div>
            <div className="md:col-span-7">
              <div className="prose prose-slate max-w-none text-slate-600 font-light leading-relaxed">
                <p className="mb-4">
                  SEHATI adalah alat bantu skrining awal yang bersifat edukatif. Hasil analisis tidak menggantikan diagnosis medis oleh tenaga kesehatan profesional.
                </p>
                <p>
                  Jika hasil skrining menunjukkan indikasi risiko stunting atau masalah gizi pada anak Anda, segera konsultasikan dengan bidan, dokter, atau kader kesehatan di Posyandu/Puskesmas terdekat untuk evaluasi dan intervensi lebih lanjut.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <FooterSection />
    </div>
  )
}
