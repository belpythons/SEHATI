import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  PersonaType,
  GenderType,
  MeasurementPositionType,
  ScreeningFormData,
  ScreeningSubmitPayload,
  PERSONA_SUBMIT_MAP,
  GENDER_SUBMIT_MAP,
} from '../types/screening'
import { getClientToken } from '../hooks/useSessionToken'
import { screeningService } from '../services/screeningService'
import { screeningApi } from '../lib/api'
import { mockScreeningApi } from '../lib/mockApi'
import { enqueueSubmission } from '../services/offlineQueueService'

const BONTANG_KELURAHAN = [
  'Api-Api',
  'Belimbing',
  'Berbas Pantai',
  'Berbas Tengah',
  'Bontang Baru',
  'Bontang Kuala',
  'Bontang Lestari',
  'Guntung',
  'Gunung Elai',
  'Gunung Telihan',
  'Kanaan',
  'Loktuan',
  'Satimpo',
  'Tanjung Laut',
  'Tanjung Laut Indah',
]

const TOTAL_STEPS = 4

const INITIAL_FORM_DATA: ScreeningFormData = {
  persona: 'ORANG_TUA',
  isOutsideBontang: false,
  kelurahan: '',
  gender: 'L',
  ageMonths: '',
  measurementPosition: 'Terlentang',
  weightKg: '',
  heightCm: '',
  // Step 3
  bblrOption: null,
  exclusiveAsi: null,
  mpasiAge: null,
  animalProtein: [],
  // Step 4
  cleanWaterAccess: null,
  sanitationAccess: null,
  smokeExposure: null,
  motherEducation: null,
  economicQuintile: 3,
  diarrheaHistory: null,
  posyanduKia: null,
}

/* ── Radio/Checkbox option types ── */
interface RadioOption { value: number; label: string; desc?: string }

const BBLR_OPTIONS: RadioOption[] = [
  { value: 1, label: 'Normal (≥ 2.500 gram)', desc: 'Berat lahir cukup sesuai standar klinis' },
  { value: 2, label: 'BBLR (< 2.500 gram)', desc: 'Berat Badan Lahir Rendah' },
  { value: 3, label: 'Tidak Tahu / Tidak Tercatat', desc: 'Informasi berat lahir tidak tersedia' },
]

const EXCLUSIVE_ASI_OPTIONS: RadioOption[] = [
  { value: 1, label: 'ASI Eksklusif 6 Bulan', desc: 'Hanya ASI saja selama 6 bulan pertama' },
  { value: 2, label: 'Tidak Eksklusif / Formula', desc: 'Diselingi susu formula atau makanan lain sebelum 6 bulan' },
  { value: 3, label: 'Belum 6 Bulan', desc: 'Bayi masih berusia di bawah 6 bulan' },
]

const MPASI_AGE_OPTIONS: RadioOption[] = [
  { value: 1, label: '< 6 Bulan (Dini)', desc: 'MPASI diberikan sebelum usia 6 bulan' },
  { value: 2, label: 'Tepat 6 Bulan (Ideal)', desc: 'Sesuai rekomendasi WHO' },
  { value: 3, label: '> 6 Bulan (Terlambat)', desc: 'MPASI baru diberikan setelah lewat 6 bulan' },
  { value: 4, label: 'Belum MPASI', desc: 'Bayi masih dalam fase ASI eksklusif' },
]

const ANIMAL_PROTEIN_OPTIONS: RadioOption[] = [
  { value: 1, label: 'Ikan' },
  { value: 2, label: 'Telur' },
  { value: 3, label: 'Daging (Ayam/Sapi)' },
  { value: 4, label: 'Susu / Produk Olahan' },
  { value: 5, label: 'Sangat Jarang / Hampir Tidak Ada' },
]

const CLEAN_WATER_OPTIONS: RadioOption[] = [
  { value: 1, label: 'Air Kemasan / Isi Ulang', desc: 'Sumber air terlindungi dan terjamin kualitasnya' },
  { value: 2, label: 'PDAM', desc: 'Air perpipaan dari perusahaan daerah' },
  { value: 3, label: 'Sumur Bor (Terlindungi)', desc: 'Air tanah dalam dengan pompa' },
  { value: 4, label: 'Sumur Gali / Mata Air / Hujan', desc: 'Sumber air tidak terlindungi, risiko kontaminasi tinggi' },
]

const SANITATION_OPTIONS: RadioOption[] = [
  { value: 1, label: 'Milik Sendiri (Leher Angsa + Septic Tank)', desc: 'Jamban sehat sesuai standar kesehatan' },
  { value: 2, label: 'Cemplung (Tanpa Septic Tank)', desc: 'Jamban tanpa pengolahan limbah tertutup' },
  { value: 3, label: 'MCK Umum / Bersama', desc: 'Fasilitas sanitasi bersama di lingkungan' },
  { value: 4, label: 'Tidak Memiliki Jamban', desc: 'Tidak ada akses fasilitas sanitasi' },
]

const SMOKE_OPTIONS: RadioOption[] = [
  { value: 1, label: 'Bebas Asap Rokok', desc: 'Tidak ada anggota keluarga yang merokok di dalam rumah' },
  { value: 2, label: 'Terpapar Asap Rokok', desc: 'Ada anggota keluarga yang merokok di lingkungan rumah' },
]

const MOTHER_EDUCATION_OPTIONS: RadioOption[] = [
  { value: 1, label: 'Tidak Tamat / Tamat SD', desc: 'Pendidikan dasar' },
  { value: 2, label: 'SMP / Sederajat', desc: 'Pendidikan menengah pertama' },
  { value: 3, label: 'SMA / SMK / Sederajat', desc: 'Pendidikan menengah atas' },
  { value: 4, label: 'Diploma / Sarjana / Lebih Tinggi', desc: 'Pendidikan tinggi' },
]

const DIARRHEA_OPTIONS: RadioOption[] = [
  { value: 1, label: 'Tidak Pernah / 1x Ringan', desc: 'Riwayat diare minimal dalam 3 bulan terakhir' },
  { value: 2, label: 'Sering / Berulang (≥ 2 kali)', desc: 'Episode diare berulang yang menghambat penyerapan gizi' },
]

const POSYANDU_KIA_OPTIONS: RadioOption[] = [
  { value: 1, label: 'Rutin Posyandu + Punya Buku KIA', desc: 'Pemantauan tumbuh kembang konsisten' },
  { value: 2, label: 'Kadang-kadang ke Posyandu', desc: 'Kunjungan tidak rutin' },
  { value: 3, label: 'Tidak Pernah / Jarang', desc: 'Tidak ada pemantauan posyandu' },
]

const PERSONA_CARDS = [
  { value: 'ORANG_TUA' as PersonaType, label: 'Orang Tua', desc: 'Pemeriksaan mandiri untuk anak tercinta' },
  { value: 'KADER_POSYANDU' as PersonaType, label: 'Kader Posyandu', desc: 'Pencatatan skrining posyandu balita' },
  { value: 'TENAGA_KESEHATAN' as PersonaType, label: 'Nakes / Bidan', desc: 'Penilaian klinis tenaga kesehatan' },
  { value: 'SURVEYOR' as PersonaType, label: 'Surveyor', desc: 'Pengumpulan data stunting terintegrasi' },
]

/* ── Reusable Radio Group ── */
const IntegerRadioGroup: React.FC<{
  label: string
  desc: string
  options: RadioOption[]
  value: number | null
  onChange: (val: number) => void
}> = ({ label, desc, options, value, onChange }) => (
  <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] space-y-3">
    <div>
      <p className="font-semibold text-[var(--color-ink)] text-sm">{label} <span className="text-red-500">*</span></p>
      <p className="text-xs text-[var(--color-ink-2)] mt-0.5">{desc}</p>
    </div>
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={isSelected}
            className={`w-full text-left cursor-pointer rounded-lg p-3 border-2 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-1 ${isSelected
              ? 'border-[var(--color-navy)] bg-[var(--color-paper-3)] text-[var(--color-ink)] font-semibold'
              : 'border-[var(--color-rule)] text-[var(--color-ink-2)] hover:border-[var(--color-ink-2)]/40 bg-[var(--color-paper)]'
              }`}
          >
            <span className="font-medium">{opt.label}</span>
            {opt.desc && <span className="block text-xs text-[var(--color-ink-2)] mt-0.5 font-normal">{opt.desc}</span>}
          </button>
        )
      })}
    </div>
  </div>
)

export const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState<number>(1)
  const [formData, setFormData] = useState<ScreeningFormData>(INITIAL_FORM_DATA)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Check for persona passed from Landing Page & saved offline draft on mount
  useEffect(() => {
    const draft = screeningService.loadDraft()
    const incomingPersona = location.state?.selectedPersona as PersonaType | undefined

    setFormData((prev) => {
      let newData = { ...prev }
      let hasChanges = false

      if (draft && (draft.kelurahan || draft.ageMonths !== '' || draft.weightKg !== '')) {
        newData = draft
        hasChanges = true
      }

      if (incomingPersona && ['ORANG_TUA', 'KADER_POSYANDU', 'TENAGA_KESEHATAN', 'SURVEYOR'].includes(incomingPersona)) {
        newData.persona = incomingPersona
        hasChanges = true
      }

      return hasChanges ? newData : prev
    })

    if (draft && (draft.kelurahan || draft.ageMonths !== '' || draft.weightKg !== '')) {
      setToastMessage('Melanjutkan draft kuesioner sebelumnya...')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }, [location.state])

  const updateField = <K extends keyof ScreeningFormData>(key: K, value: ScreeningFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrorMessage(null)
  }

  /** Toggle animalProtein with mutual exclusivity for option 5 */
  const toggleProtein = (val: number) => {
    setFormData((prev) => {
      let next: number[]
      if (val === 5) {
        // Option 5 selected → clear 1-4
        next = prev.animalProtein.includes(5) ? [] : [5]
      } else {
        // Option 1-4 selected → remove 5 if present, toggle this option
        const without5 = prev.animalProtein.filter((v) => v !== 5)
        next = without5.includes(val) ? without5.filter((v) => v !== val) : [...without5, val]
      }
      return { ...prev, animalProtein: next }
    })
    setErrorMessage(null)
  }

  // Step 1 Validation (Persona & Kelurahan)
  const validateStep1 = (): boolean => {
    if (!formData.persona) {
      setErrorMessage('Pilih peran Anda terlebih dahulu.')
      return false
    }
    if (!formData.kelurahan) {
      setErrorMessage(formData.isOutsideBontang ? 'Masukkan nama kelurahan domisili.' : 'Pilih kelurahan domisili di Kota Bontang.')
      return false
    }
    if (formData.isOutsideBontang && formData.kelurahan.length < 2) {
      setErrorMessage('Nama kelurahan minimal 2 karakter.')
      return false
    }
    return true
  }

  // Step 2 Validation (Antropometri Balita)
  const validateStep2 = (): boolean => {
    if (!formData.gender) {
      setErrorMessage('Pilih jenis kelamin balita.')
      return false
    }
    const age = Number(formData.ageMonths)
    if (formData.ageMonths === '' || isNaN(age) || age < 0 || age > 59) {
      setErrorMessage('Usia balita harus antara 0 hingga 59 bulan.')
      return false
    }
    const weight = Number(formData.weightKg)
    if (formData.weightKg === '' || isNaN(weight) || weight < 1.0 || weight > 30.0) {
      setErrorMessage('Berat badan tidak valid (1.0 - 30.0 kg).')
      return false
    }
    const height = Number(formData.heightCm)
    if (formData.heightCm === '' || isNaN(height) || height < 30.0 || height > 130.0) {
      setErrorMessage('Tinggi badan tidak valid (30.0 - 130.0 cm).')
      return false
    }
    return true
  }

  // Step 3 Validation (Riwayat Kelahiran & Pola Makan)
  const validateStep3 = (): boolean => {
    if (formData.bblrOption === null) {
      setErrorMessage('Pilih riwayat berat badan lahir balita.')
      return false
    }
    if (formData.exclusiveAsi === null) {
      setErrorMessage('Pilih status pemberian ASI eksklusif.')
      return false
    }
    if (formData.mpasiAge === null) {
      setErrorMessage('Pilih usia pemberian MPASI.')
      return false
    }
    if (formData.animalProtein.length === 0) {
      setErrorMessage('Pilih minimal satu sumber protein hewani atau opsi "Sangat Jarang".')
      return false
    }
    return true
  }

  // Step 4 Validation (Lingkungan & Sosial-Ekonomi)
  const validateStep4 = (): boolean => {
    const required: (number | null)[] = [
      formData.cleanWaterAccess,
      formData.sanitationAccess,
      formData.smokeExposure,
      formData.motherEducation,
      formData.diarrheaHistory,
      formData.posyanduKia,
    ]
    if (required.some((val) => val === null)) {
      setErrorMessage('Mohon lengkapi semua pertanyaan pada halaman ini.')
      return false
    }
    if (!formData.economicQuintile || formData.economicQuintile < 1 || formData.economicQuintile > 5) {
      setErrorMessage('Mohon tentukan kuintil status ekonomi (1-5).')
      return false
    }
    return true
  }

  const nextStep = () => {
    setErrorMessage(null)
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  const prevStep = () => {
    setErrorMessage(null)
    if (step > 1) setStep(step - 1)
  }

  // Auto-save draft automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      screeningService.saveDraft(formData)
    }, 500)

    return () => clearTimeout(timer)
  }, [formData])

  const handleSubmit = async () => {
    setErrorMessage(null)
    if (!validateStep4()) return

    // Ensure client session token via canonical helper
    const clientToken = getClientToken()

    const payload: ScreeningSubmitPayload = {
      clientToken,
      persona: PERSONA_SUBMIT_MAP[formData.persona as PersonaType],
      isOutsideBontang: formData.isOutsideBontang,
      kelurahan: formData.kelurahan,
      gender: GENDER_SUBMIT_MAP[formData.gender as GenderType],
      ageMonths: Number(formData.ageMonths),
      weightKg: Number(formData.weightKg),
      heightCm: Number(formData.heightCm),
      bblrOption: formData.bblrOption!,
      exclusiveAsi: formData.exclusiveAsi!,
      mpasiAge: formData.mpasiAge!,
      animalProtein: formData.animalProtein,
      cleanWaterAccess: formData.cleanWaterAccess!,
      sanitationAccess: formData.sanitationAccess!,
      smokeExposure: formData.smokeExposure!,
      motherEducation: formData.motherEducation!,
      economicQuintile: Number(formData.economicQuintile),
      diarrheaHistory: formData.diarrheaHistory!,
      posyanduKia: formData.posyanduKia!,
      rawMetadata: {
        measurementPosition: formData.measurementPosition,
      },
      sourceType: 'PWA_DIRECT_USER',
    }

    setIsSubmitting(true)
    try {
      if (!navigator.onLine) {
        // SCENARIO 1: Device is genuinely offline
        const mockRes = await mockScreeningApi.submit(payload)
        await enqueueSubmission(payload, mockRes.shareHash)

        const enrichedOfflineResponse = {
          ...mockRes,
          isMockData: true,
          dataSource: 'mock' as const,
        }

        sessionStorage.setItem('sehati_active_screening', JSON.stringify(enrichedOfflineResponse))
        screeningService.clearDraft()

        setToastMessage('Mode Offline: Data skrining telah disimpan di memori perangkat & akan disinkronkan otomatis saat online.')
        setTimeout(() => {
          navigate(`/analytics/${mockRes.shareHash}`)
        }, 1200)
        return
      }

      // SCENARIO 2: Device is online — Attempt real backend API
      try {
        const liveRes = await screeningApi.submit(payload)
        const enrichedLiveResponse = {
          ...liveRes,
          isMockData: false,
          dataSource: 'live' as const,
        }

        sessionStorage.setItem('sehati_active_screening', JSON.stringify(enrichedLiveResponse))
        screeningService.clearDraft()
        navigate(`/analytics/${liveRes.shareHash}`)
      } catch (backendError) {
        console.warn('[SEHATI] Live backend unreachable, buffering to offline queue and activating simulation:', backendError)

        const mockRes = await mockScreeningApi.submit(payload)
        await enqueueSubmission(payload, mockRes.shareHash)

        const enrichedMockResponse = {
          ...mockRes,
          isMockData: true,
          dataSource: 'mock' as const,
        }

        sessionStorage.setItem('sehati_active_screening', JSON.stringify(enrichedMockResponse))
        screeningService.clearDraft()
        navigate(`/analytics/${mockRes.shareHash}`)
      }
    } catch (err: any) {
      console.error('Fatal submit error:', err)
      setErrorMessage(
        'Terjadi kendala saat memproses kuesioner. Silakan coba lagi.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Navbar — Hallmark pill */}
      <nav className="sticky top-0 z-30 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2 pointer-events-none">
        <div className="max-w-3xl mx-auto flex justify-center pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-full px-2.5 sm:px-3 py-2 flex items-center justify-between border border-[var(--color-rule)] shadow-sm w-full">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 sm:gap-2 text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors font-medium text-sm rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Kembali ke Beranda</span>
              <span className="sm:hidden">Beranda</span>
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="hidden sm:inline text-xs sm:text-sm font-medium text-[var(--color-ink-2)]">
                Langkah {step} dari {TOTAL_STEPS}
              </span>
              <span className="sm:hidden text-xs font-medium text-[var(--color-ink-2)]">
                {step}/{TOTAL_STEPS}
              </span>
              <div className="flex gap-1.5 ml-1">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all duration-300 ${s === step
                      ? 'w-6 bg-[var(--color-navy)]'
                      : s < step
                        ? 'w-2 bg-[var(--color-teal)]'
                        : 'w-2 bg-[var(--color-rule)]'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-full shadow-sm flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        {/* Error Alert Box */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <div className="bg-[var(--color-paper)] rounded-2xl border border-[var(--color-rule)] p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* ════════ STEP 1: Persona & Domisili ════════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-display font-medium text-[var(--color-ink)] tracking-tight">
                    Langkah 1: Seleksi Persona & Domisili
                  </h2>
                  <p className="text-sm text-[var(--color-ink-2)] mt-1">
                    Tentukan peran Anda dan wilayah kelurahan domisili.
                  </p>
                </div>

                {/* Persona Selection — 4 cards */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">
                    Pilih Peran / Persona Anda <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PERSONA_CARDS.map((p) => {
                      const isSelected = formData.persona === p.value
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => updateField('persona', p.value)}
                          aria-pressed={isSelected}
                          className={`text-left cursor-pointer rounded-xl p-4 border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-1 ${isSelected
                            ? 'border-[var(--color-navy)] bg-[var(--color-paper-3)]'
                            : 'border-[var(--color-rule)] hover:border-[var(--color-ink-2)]/40 bg-[var(--color-paper)]'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[var(--color-ink)] text-sm">
                              {p.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[var(--color-navy)]" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-ink-2)] mt-1">{p.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* isOutsideBontang Toggle */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={formData.isOutsideBontang}
                      onChange={(e) => {
                        updateField('isOutsideBontang', e.target.checked)
                        updateField('kelurahan', '') // reset kelurahan on toggle
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)] cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-[var(--color-ink)]">Domisili di luar Kota Bontang</span>
                      <span className="block text-xs text-[var(--color-ink-2)]">Centang jika balita berdomisili di luar wilayah Kota Bontang</span>
                    </div>
                  </label>
                </div>

                {/* Kelurahan Selection — conditional */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
                    {formData.isOutsideBontang ? 'Nama Kelurahan / Desa Domisili' : 'Pilih Kelurahan di Kota Bontang'} <span className="text-red-500">*</span>
                  </label>
                  {formData.isOutsideBontang ? (
                    <input
                      type="text"
                      value={formData.kelurahan}
                      onChange={(e) => updateField('kelurahan', e.target.value)}
                      placeholder="Ketik nama kelurahan / desa (min. 2 karakter)"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] transition-all"
                    />
                  ) : (
                    <select
                      value={formData.kelurahan}
                      onChange={(e) => updateField('kelurahan', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] transition-all"
                    >
                      <option value="" disabled>
                        -- Pilih Kelurahan Domisili --
                      </option>
                      {BONTANG_KELURAHAN.map((kel) => (
                        <option key={kel} value={kel}>
                          Kelurahan {kel}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </motion.div>
            )}

            {/* ════════ STEP 2: Data Fisik & Antropometri Balita ════════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-display font-medium text-[var(--color-ink)] tracking-tight">
                    Langkah 2: Data Fisik & Antropometri Balita
                  </h2>
                  <p className="text-sm text-[var(--color-ink-2)] mt-1">
                    Masukkan data pengukuran fisik sesuai standar WHO.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'L', label: 'Laki-laki (L)' },
                        { value: 'P', label: 'Perempuan (P)' },
                      ].map((g) => {
                        const isSelected = formData.gender === g.value
                        return (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => updateField('gender', g.value as GenderType)}
                            aria-pressed={isSelected}
                            className={`cursor-pointer rounded-xl p-3 text-center border-2 transition-all font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-1 ${isSelected
                              ? 'border-[var(--color-navy)] bg-[var(--color-paper-3)] text-[var(--color-ink)] font-semibold'
                              : 'border-[var(--color-rule)] text-[var(--color-ink-2)] hover:border-[var(--color-ink-2)]/40 bg-[var(--color-paper)]'
                              }`}
                          >
                            {g.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Age Months */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
                      Usia Balita (Bulan) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.ageMonths}
                      onChange={(e) =>
                        updateField(
                          'ageMonths',
                          e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10))
                        )
                      }
                      min="0"
                      max="59"
                      placeholder="0 - 59 bulan"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-rule)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] transition-all"
                    />
                    <span className="text-xs text-[var(--color-ink-2)] mt-1 block">Rentang: 0 hingga 59 bulan</span>
                  </div>
                </div>

                {/* Measurement Position */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
                    Posisi Pengukuran Tinggi/Panjang Badan <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'Terlentang', label: 'Terlentang (Panjang Badan)', desc: 'Rekomendasi untuk usia < 24 bulan' },
                      { value: 'Berdiri', label: 'Berdiri (Tinggi Badan)', desc: 'Rekomendasi untuk usia ≥ 24 bulan' },
                    ].map((pos) => {
                      const isSelected = formData.measurementPosition === pos.value
                      return (
                        <button
                          key={pos.value}
                          type="button"
                          onClick={() => updateField('measurementPosition', pos.value as MeasurementPositionType)}
                          aria-pressed={isSelected}
                          className={`text-left cursor-pointer rounded-xl p-3 border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-1 ${isSelected
                            ? 'border-[var(--color-navy)] bg-[var(--color-paper-3)] text-[var(--color-ink)] font-semibold'
                            : 'border-[var(--color-rule)] text-[var(--color-ink-2)] hover:border-[var(--color-ink-2)]/40 bg-[var(--color-paper)]'
                            }`}
                        >
                          <div className="font-semibold text-sm">{pos.label}</div>
                          <div className="text-xs text-[var(--color-ink-2)] mt-0.5">{pos.desc}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Weight & Height */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
                      Berat Badan (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="30.0"
                      value={formData.weightKg}
                      onChange={(e) =>
                        updateField('weightKg', e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      placeholder="Contoh: 9.5"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-rule)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] transition-all"
                    />
                    <span className="text-xs text-[var(--color-ink-2)] mt-1 block">Rentang valid: 1.0 - 30.0 kg</span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
                      Tinggi / Panjang Badan (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="30.0"
                      max="130.0"
                      value={formData.heightCm}
                      onChange={(e) =>
                        updateField('heightCm', e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      placeholder="Contoh: 78.2"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-rule)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] transition-all"
                    />
                    <span className="text-xs text-[var(--color-ink-2)] mt-1 block">Rentang valid: 30.0 - 130.0 cm</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════ STEP 3: Riwayat Kelahiran & Pola Makan ════════ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-display font-medium text-[var(--color-ink)] tracking-tight">
                    Langkah 3: Riwayat Kelahiran & Pola Makan
                  </h2>
                  <p className="text-sm text-[var(--color-ink-2)] mt-1">
                    Informasi riwayat kelahiran dan pola pemberian makan balita.
                  </p>
                </div>

                <IntegerRadioGroup
                  label="Riwayat Berat Badan Lahir"
                  desc="Apakah balita pernah didiagnosis lahir dengan BBLR?"
                  options={BBLR_OPTIONS}
                  value={formData.bblrOption}
                  onChange={(v) => updateField('bblrOption', v)}
                />

                <IntegerRadioGroup
                  label="Pemberian ASI Eksklusif (0–6 Bulan)"
                  desc="Apakah balita hanya diberikan ASI saja selama 6 bulan pertama?"
                  options={EXCLUSIVE_ASI_OPTIONS}
                  value={formData.exclusiveAsi}
                  onChange={(v) => updateField('exclusiveAsi', v)}
                />

                <IntegerRadioGroup
                  label="Usia Pemberian MPASI Pertama Kali"
                  desc="Kapan Makanan Pendamping ASI pertama kali diberikan?"
                  options={MPASI_AGE_OPTIONS}
                  value={formData.mpasiAge}
                  onChange={(v) => updateField('mpasiAge', v)}
                />

                {/* Animal Protein — Multi-Select with Mutual Exclusivity */}
                <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] space-y-3">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)] text-sm">Keragaman Protein Hewani Harian <span className="text-red-500">*</span></p>
                    <p className="text-xs text-[var(--color-ink-2)] mt-0.5">Pilih sumber protein hewani yang rutin dikonsumsi balita (bisa lebih dari satu).</p>
                  </div>
                  <div className="space-y-2">
                    {ANIMAL_PROTEIN_OPTIONS.map((opt) => {
                      const isChecked = formData.animalProtein.includes(opt.value)
                      const isDisabled = opt.value !== 5 && formData.animalProtein.includes(5)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleProtein(opt.value)}
                          disabled={isDisabled}
                          className={`w-full text-left cursor-pointer rounded-lg p-3 border-2 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-1 flex items-center gap-3 ${isChecked
                            ? 'border-[var(--color-navy)] bg-[var(--color-paper-3)] text-[var(--color-ink)] font-semibold'
                            : isDisabled
                              ? 'border-[var(--color-rule)] bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'border-[var(--color-rule)] text-[var(--color-ink-2)] hover:border-[var(--color-ink-2)]/40 bg-[var(--color-paper)]'
                            }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center shrink-0 ${isChecked ? 'bg-[var(--color-navy)] border-[var(--color-navy)]' : 'border-[var(--color-rule)] bg-[var(--color-paper)]'
                            }`}>
                            {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-medium">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════ STEP 4: Lingkungan & Sosial-Ekonomi ════════ */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-display font-medium text-[var(--color-ink)] tracking-tight">
                    Langkah 4: Lingkungan & Sosial-Ekonomi
                  </h2>
                  <p className="text-sm text-[var(--color-ink-2)] mt-1">
                    Determinan lingkungan, sanitasi, dan sosial-ekonomi untuk model Naïve Bayes & Gemini AI.
                  </p>
                </div>

                <IntegerRadioGroup
                  label="Sumber Air Minum Utama Rumah Tangga"
                  desc="Pilih sumber air minum yang paling sering digunakan sehari-hari."
                  options={CLEAN_WATER_OPTIONS}
                  value={formData.cleanWaterAccess}
                  onChange={(v) => updateField('cleanWaterAccess', v)}
                />

                <IntegerRadioGroup
                  label="Akses Sanitasi / Jamban"
                  desc="Pilih jenis fasilitas sanitasi yang digunakan rumah tangga."
                  options={SANITATION_OPTIONS}
                  value={formData.sanitationAccess}
                  onChange={(v) => updateField('sanitationAccess', v)}
                />

                <IntegerRadioGroup
                  label="Paparan Asap Rokok di Dalam Rumah"
                  desc="Apakah ada anggota keluarga yang merokok di lingkungan rumah?"
                  options={SMOKE_OPTIONS}
                  value={formData.smokeExposure}
                  onChange={(v) => updateField('smokeExposure', v)}
                />

                <IntegerRadioGroup
                  label="Pendidikan Terakhir Ibu"
                  desc="Jenjang pendidikan terakhir yang ditamatkan oleh ibu balita."
                  options={MOTHER_EDUCATION_OPTIONS}
                  value={formData.motherEducation}
                  onChange={(v) => updateField('motherEducation', v)}
                />

                {/* Economic Quintile */}
                <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-[var(--color-ink)]">
                      Kuintil Status Ekonomi Rumah Tangga (1–5) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-[var(--color-ink-2)]">
                      Klasifikasi tingkat pengeluaran/kesejahteraan keluarga (1: Termiskin s/d 5: Terkaya).
                    </p>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {[
                      { q: 1, label: 'K1 (Termiskin)' },
                      { q: 2, label: 'K2 (Menengah Bawah)' },
                      { q: 3, label: 'K3 (Menengah)' },
                      { q: 4, label: 'K4 (Menengah Atas)' },
                      { q: 5, label: 'K5 (Terkaya)' },
                    ].map((item) => {
                      const isSelected = formData.economicQuintile === item.q
                      return (
                        <button
                          key={item.q}
                          type="button"
                          onClick={() => updateField('economicQuintile', item.q)}
                          aria-pressed={isSelected}
                          className={`py-2 px-1 rounded-xl text-center border-2 transition-all text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-1 ${isSelected
                            ? 'border-[var(--color-navy)] bg-[var(--color-navy)] text-white'
                            : 'border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:border-[var(--color-ink-2)]/40'
                            }`}
                        >
                          <div>Q{item.q}</div>
                          <div className="text-[10px] font-normal truncate mt-0.5 hidden sm:block">
                            {item.label}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <IntegerRadioGroup
                  label="Riwayat Diare Berulang (1–3 Bulan Terakhir)"
                  desc="Apakah balita mengalami episode diare dalam beberapa bulan terakhir?"
                  options={DIARRHEA_OPTIONS}
                  value={formData.diarrheaHistory}
                  onChange={(v) => updateField('diarrheaHistory', v)}
                />

                <IntegerRadioGroup
                  label="Keaktifan Posyandu & Kepemilikan Buku KIA"
                  desc="Seberapa rutin balita dibawa ke Posyandu dan apakah memiliki Buku KIA?"
                  options={POSYANDU_KIA_OPTIONS}
                  value={formData.posyanduKia}
                  onChange={(v) => updateField('posyanduKia', v)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-[var(--color-rule)]">
            {step > 1 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={prevStep}
                className="px-5 py-2.5 rounded-full border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)] font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            )}

            <div className="flex-1" />

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 rounded-full bg-[#1e293b] text-white hover:bg-[#0f172a] font-medium text-sm transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-75 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Analisis...</span>
                  </>
                ) : (
                  <>
                    <span>Lihat Hasil Analisis</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}