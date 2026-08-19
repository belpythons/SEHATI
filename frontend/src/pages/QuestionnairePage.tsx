import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import {
  PersonaType,
  GenderType,
  MeasurementPositionType,
  ScreeningFormData,
  ScreeningSubmitPayload,
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

const INITIAL_FORM_DATA: ScreeningFormData = {
  persona: 'ORANG_TUA',
  kelurahan: '',
  gender: 'L',
  ageMonths: '',
  measurementPosition: 'Terlentang',
  weightKg: '',
  heightCm: '',
  bblrHistory: null,
  exclusiveAsi: null,
  mpasiHistory: null,
  cleanWaterAccess: null,
  sanitationAccess: null,
  smokeExposure: null,
  economicQuintile: 3,
  motherEducation: null,
  diarrheaHistory: null,
}

export const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState<number>(1)
  const [formData, setFormData] = useState<ScreeningFormData>(INITIAL_FORM_DATA)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [hasDraftAvailable, setHasDraftAvailable] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Check for persona passed from Landing Page & saved offline draft on mount
  useEffect(() => {
    const incomingPersona = location.state?.selectedPersona as PersonaType | undefined
    if (incomingPersona && ['ORANG_TUA', 'KADER_POSYANDU', 'SURVEYOR'].includes(incomingPersona)) {
      setFormData((prev) => ({ ...prev, persona: incomingPersona }))
    }

    const draft = screeningService.loadDraft()
    if (draft && (draft.kelurahan || draft.ageMonths !== '' || draft.weightKg !== '')) {
      setHasDraftAvailable(true)
    }
  }, [location.state])

  const updateField = <K extends keyof ScreeningFormData>(key: K, value: ScreeningFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrorMessage(null)
  }

  const handleRestoreDraft = () => {
    const draft = screeningService.loadDraft()
    if (draft) {
      setFormData(draft)
      setHasDraftAvailable(false)
      setToastMessage('Draft berhasil dipulihkan!')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleDismissDraft = () => {
    setHasDraftAvailable(false)
  }

  // Step 1 Validation (Persona & Kelurahan)
  const validateStep1 = (): boolean => {
    if (!formData.persona) {
      setErrorMessage('Pilih peran Anda terlebih dahulu.')
      return false
    }
    if (!formData.kelurahan) {
      setErrorMessage('Pilih kelurahan domisili di Kota Bontang.')
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

  // Step 3 Validation (Determinan Lingkungan & Pola Asuh)
  const validateStep3 = (): boolean => {
    const requiredBooleans = [
      formData.bblrHistory,
      formData.exclusiveAsi,
      formData.mpasiHistory,
      formData.cleanWaterAccess,
      formData.sanitationAccess,
      formData.smokeExposure,
      formData.motherEducation,
      formData.diarrheaHistory,
    ]
    if (requiredBooleans.some((val) => val === null)) {
      setErrorMessage('Mohon pilih salah satu opsi yang tersedia.')
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
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    setErrorMessage(null)
    if (step > 1) setStep(step - 1)
  }

  const handleSaveDraft = () => {
    const success = screeningService.saveDraft(formData)
    if (success) {
      setToastMessage('Draft kuesioner berhasil disimpan ke penyimpanan lokal!')
      setTimeout(() => setToastMessage(null), 3000)
    } else {
      setErrorMessage('Gagal menyimpan draft kuesioner.')
    }
  }

  const handleSubmit = async () => {
    setErrorMessage(null)
    if (!validateStep3()) return

    // Ensure client session token via canonical helper
    const clientToken = getClientToken()

    const payload: ScreeningSubmitPayload = {
      clientToken,
      persona: formData.persona as PersonaType,
      kelurahan: formData.kelurahan,
      gender: formData.gender as GenderType,
      ageMonths: Number(formData.ageMonths),
      weightKg: Number(formData.weightKg),
      heightCm: Number(formData.heightCm),
      exclusiveAsi: Boolean(formData.exclusiveAsi),
      sanitationAccess: Boolean(formData.sanitationAccess),
      cleanWaterAccess: Boolean(formData.cleanWaterAccess),
      smokeExposure: Boolean(formData.smokeExposure),
      economicQuintile: Number(formData.economicQuintile),
      diarrheaHistory: Boolean(formData.diarrheaHistory),
      bblrHistory: Boolean(formData.bblrHistory),
      motherEducation: Boolean(formData.motherEducation),
      // NOTE/TODO: Payload sends rawMetadata containing mpasiHistory and measurementPosition.
      // Backend screening.controller.ts currently writes rawMetadata from mlResult instead of screeningData.
      // Once backend merges screeningData.rawMetadata, this payload will automatically persist properly.
      rawMetadata: {
        mpasiHistory: Boolean(formData.mpasiHistory),
        measurementPosition: formData.measurementPosition,
      },
      sourceType: 'PWA_DIRECT_USER',
    }

    setIsSubmitting(true)
    try {
      if (!navigator.onLine) {
        // SCENARIO 1: Device is genuinely offline
        // 1. Generate immediate client-side approximation so user can still see interim growth analysis
        const mockRes = await mockScreeningApi.submit(payload)
        
        // 2. Enqueue payload into IndexedDB with mockShareHash mapping for auto-sync upgrade
        await enqueueSubmission(payload, mockRes.shareHash)

        const enrichedOfflineResponse = {
          ...mockRes,
          isMockData: true,
          dataSource: 'mock' as const,
          data: {
            ...mockRes.data,
            bblrHistory: Boolean(formData.bblrHistory),
            motherEducation: Boolean(formData.motherEducation),
          },
        }

        // 3. Store in sessionStorage for local offline viewing
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
          data: {
            ...liveRes.data,
            bblrHistory: Boolean(formData.bblrHistory),
            motherEducation: Boolean(formData.motherEducation),
          },
        }

        sessionStorage.setItem('sehati_active_screening', JSON.stringify(enrichedLiveResponse))
        screeningService.clearDraft()
        navigate(`/analytics/${liveRes.shareHash}`)
      } catch (backendError) {
        console.warn('[SEHATI] Live backend unreachable, buffering to offline queue and activating simulation:', backendError)
        
        // 1. Fallback to mock simulation for uninterrupted demo UX
        const mockRes = await mockScreeningApi.submit(payload)

        // 2. Buffer to IndexedDB for retry with mockShareHash mapping
        await enqueueSubmission(payload, mockRes.shareHash)
        
        const enrichedMockResponse = {
          ...mockRes,
          isMockData: true,
          dataSource: 'mock' as const,
          data: {
            ...mockRes.data,
            bblrHistory: Boolean(formData.bblrHistory),
            motherEducation: Boolean(formData.motherEducation),
          },
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="glass-nav sticky top-0 z-30 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              Langkah {step} dari 3
            </span>
            <div className="flex gap-1.5 ml-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-blue-600'
                      : s < step
                      ? 'w-2 bg-blue-300'
                      : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        {/* Draft Recovery Prompt */}
        {hasDraftAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-blue-900"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
              <span>Ditemukan draf kuesioner yang tersimpan di perangkat ini.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pulihkan</span>
              </button>
              <button
                type="button"
                onClick={handleDismissDraft}
                className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-100/50 font-medium text-xs transition-all"
              >
                Abaikan
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* STEP 1: Seleksi Persona & Domisili */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Langkah 1: Seleksi Persona & Domisili
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Tentukan peran Anda dan wilayah kelurahan domisili di Kota Bontang.
                  </p>
                </div>

                {/* Persona Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Pilih Peran / Persona Anda <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        value: 'ORANG_TUA',
                        label: 'Orang Tua',
                        desc: 'Pemeriksaan mandiri untuk anak tercinta',
                      },
                      {
                        value: 'KADER_POSYANDU',
                        label: 'Kader Posyandu',
                        desc: 'Pencatatan skrining posyandu balita',
                      },
                      {
                        value: 'SURVEYOR',
                        label: 'Surveyor / Nakes',
                        desc: 'Pengumpulan data stunting terintegrasi',
                      },
                    ].map((p) => {
                      const isSelected = formData.persona === p.value
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => updateField('persona', p.value as PersonaType)}
                          aria-pressed={isSelected}
                          className={`text-left cursor-pointer rounded-xl p-4 border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 text-sm">
                              {p.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Kelurahan Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pilih Kelurahan di Kota Bontang <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kelurahan}
                    onChange={(e) => updateField('kelurahan', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                </div>
              </motion.div>
            )}

            {/* STEP 2: Data Fisik & Antropometri Balita */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Langkah 2: Data Fisik & Antropometri Balita
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Masukkan data pengukuran fisik sesuai standar WHO.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                            className={`cursor-pointer rounded-xl p-3 text-center border-2 transition-all font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                                : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <span className="text-xs text-slate-400 mt-1 block">Rentang: 0 hingga 59 bulan</span>
                  </div>
                </div>

                {/* Measurement Position */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Posisi Pengukuran Tinggi/Panjang Badan <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: 'Terlentang',
                        label: 'Terlentang (Panjang Badan)',
                        desc: 'Rekomendasi untuk usia < 24 bulan',
                      },
                      {
                        value: 'Berdiri',
                        label: 'Berdiri (Tinggi Badan)',
                        desc: 'Rekomendasi untuk usia ≥ 24 bulan',
                      },
                    ].map((pos) => {
                      const isSelected = formData.measurementPosition === pos.value
                      return (
                        <button
                          key={pos.value}
                          type="button"
                          onClick={() =>
                            updateField('measurementPosition', pos.value as MeasurementPositionType)
                          }
                          aria-pressed={isSelected}
                          className={`text-left cursor-pointer rounded-xl p-3 border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="font-semibold text-sm">{pos.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{pos.desc}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Weight & Height */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <span className="text-xs text-slate-400 mt-1 block">Rentang valid: 1.0 - 30.0 kg</span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <span className="text-xs text-slate-400 mt-1 block">Rentang valid: 30.0 - 130.0 cm</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Determinan Lingkungan & Pola Asuh */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Langkah 3: Determinan Lingkungan & Pola Asuh
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Informasi determinan pemicu stunting untuk model Naïve Bayes & Gemini AI.
                  </p>
                </div>

                {/* Boolean Questions Grid */}
                <div className="space-y-4">
                  {[
                    {
                      key: 'bblrHistory' as const,
                      label: 'Riwayat BBLR (Berat Badan Lahir Rendah < 2.5 kg)',
                      desc: 'Apakah balita lahir dengan berat badan di bawah 2.500 gram?',
                    },
                    {
                      key: 'exclusiveAsi' as const,
                      label: 'Pemberian ASI Eksklusif (0–6 Bulan)',
                      desc: 'Apakah balita hanya diberikan ASI saja selama 6 bulan pertama?',
                    },
                    {
                      key: 'mpasiHistory' as const,
                      label: 'Pemberian MPASI Tepat Waktu & Bergizi',
                      desc: 'Apakah balita mendapatkan Makanan Pendamping ASI adekuat mulai usia 6 bulan?',
                    },
                    {
                      key: 'cleanWaterAccess' as const,
                      label: 'Akses Air Minum Bersih & Layak',
                      desc: 'Apakah rumah tangga menggunakan sumber air bersih/perpipaan yang terlindungi?',
                    },
                    {
                      key: 'sanitationAccess' as const,
                      label: 'Akses Sanitasi / Jamban Sehat',
                      desc: 'Apakah rumah tangga memiliki fasilitas jamban dengan septic tank tertutup?',
                    },
                    {
                      key: 'smokeExposure' as const,
                      label: 'Paparan Asap Rokok di Dalam Rumah',
                      desc: 'Apakah ada anggota keluarga yang merokok di dalam lingkungan rumah?',
                    },
                    {
                      key: 'diarrheaHistory' as const,
                      label: 'Riwayat Diare Berulang (1–3 Bulan Terakhir)',
                      desc: 'Apakah balita mengalami episode diare dalam beberapa bulan terakhir?',
                    },
                    {
                      key: 'motherEducation' as const,
                      label: 'Pendidikan Ibu (Tamat SMA / Sederajat ke Atas)',
                      desc: 'Apakah ibu balita menamatkan jenjang pendidikan menengah atas atau perguruan tinggi?',
                    },
                  ].map((q) => {
                    const value = formData[q.key]
                    return (
                      <div
                        key={q.key}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="max-w-md">
                          <p className="font-semibold text-slate-800 text-sm">{q.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{q.desc}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateField(q.key, true)}
                            aria-pressed={value === true}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
                              value === true
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            Ya
                          </button>
                          <button
                            type="button"
                            onClick={() => updateField(q.key, false)}
                            aria-pressed={value === false}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
                              value === false
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            Tidak
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Economic Quintile */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-slate-800">
                      Kuintil Status Ekonomi Rumah Tangga (1–5) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500">
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
                          className={`py-2 px-1 rounded-xl text-center border-2 transition-all text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-100">
            {step > 1 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={prevStep}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span>Simpan Draft</span>
            </button>

            <div className="flex-1" />

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-75 cursor-pointer"
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
