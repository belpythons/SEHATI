import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User, HeartHandshake, ClipboardList, ChevronRight, Sparkles } from 'lucide-react'
import mockData from '../../data/mockData'

export const PersonaPreviewSection: React.FC = () => {
  const navigate = useNavigate()
  const personaOptions = mockData.questionnaire.step1PersonaAndLocation.personaOptions

  const iconMap: Record<string, React.ReactNode> = {
    ORANG_TUA: <User className="w-6 h-6 text-blue-600" />,
    KADER_POSYANDU: <HeartHandshake className="w-6 h-6 text-teal-600" />,
    SURVEYOR: <ClipboardList className="w-6 h-6 text-indigo-600" />,
  }

  const handleSelectPersona = (personaId: string) => {
    // Navigate to questionnaire with pre-selected persona state
    navigate('/questionnaire', { state: { selectedPersona: personaId } })
  }

  return (
    <section className="py-16 sm:py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilih Sesuai Peran Anda</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pengalaman Skrining Fleksibel untuk 3 Pengguna
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pilih peran Anda untuk langsung memulai kuesioner dengan pengaturan profil yang sesuai.
          </p>
        </div>

        {/* 3 Persona Cards (Halodoc Selection Card Pattern) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {personaOptions.map((persona) => (
            <div
              key={persona.id}
              onClick={() => handleSelectPersona(persona.id)}
              className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {iconMap[persona.id]}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                    {persona.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {persona.label}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>Pilih Peran Ini</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
