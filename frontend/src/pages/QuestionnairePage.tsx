import React, { useState } from 'react'

export const QuestionnairePage: React.FC = () => {
  const [step, setStep] = useState(1)
  const [persona, setPersona] = useState<'ORANG_TUA' | 'KADER_POSYANDU' | 'SURVEYOR'>('')
  const [kelurahan, setKelurahan] = useState('')
  const [gender, setGender] = useState<'L' | 'P'>('')
  const [ageMonths, setAgeMonths] = useState(0)
  const [measurementPosition, setMeasurementPosition] = useState<'Terlentang' | 'Berdi'>('Terlentang')
  const [weight, setWeight] = useState(0)
  const [height, setHeight] = useState(0)

  const steps = [
    'persona',
    'antro',
    'determinan'
  ]

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-600">SEHATI</span>
            <span className="text-sm text-gray-500">Perawatan Anak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Langkah {step} dari 3</span>
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-sm text-gray-400">Langkah 3</span>
          </div>
        </div>
      </nav>

      <main className="p-4 sm:p-6">
        {steps[step - 1] === 'persona' && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Seleksi Persona & Domisili</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  value="ORANG_TUA"
                  checked={persona === 'ORANG_TUA'}
                  onChange={(e) => setPersona(e.target.value as any)}
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">Orang Tua</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  value="KADER_POSYANDU"
                  checked={persona === 'KADER_POSYANDU'}
                  onChange={(e) => setPersona(e.target.value as any)}
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">Kader Posyandu</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  value="SURVEYOR"
                  checked={persona === 'SURVEYOR'}
                  onChange={(e) => setPersona(e.target.value as any)}
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">Surveyor</span>
              </label>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kelurahan
              </label>
              <select
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Pilih kelurahan domisili</option>
                <option value="Bentang">Bentang</option>
                <option value="Denta">Denta</option>
                <option value="Karya">Karya</option>
                <option value="Kawali">Kawali</option>
                <option value="Majatani">Majatani</option>
                <option value="Negara">Negara</option>
                <option value="Paser">Paser</option>
                <option value="Penajam">Penajam</option>
                <option value="Sesayap">Sesayap</option>
                <option value="Tanjungpura">Tanjungpura</option>
                <option value="Tidore">Tidore</option>
                <option value="Ulin">Ulin</option>
                <option value="Wajo">Wajo</option>
                <option value="Samarinda">Samarinda</option>
                <option value="Melak">Melak</option>
              </select>
            </div>
          </div>
        )}

        {steps[step - 1] === 'antro' && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Fisik & Antropometri Balita</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      value="L"
                      checked={gender === 'L'}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-4 h-4 rounded border-blue-600"
                    />
                    <span className="text-gray-700">Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      value="P"
                      checked={gender === 'P'}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-4 h-4 rounded border-blue-600"
                    />
                    <span className="text-gray-700">Perempuan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usia Balita (0-59 Bulan)
                </label>
                <input
                  type="number"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(Number(e.target.value))}
                  min="0"
                  max="59"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Usia harus antara 0 hingga 59 bulan</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posisi Pengukuran
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      value="Terlentang"
                      checked={measurementPosition === 'Terlentang'}
                      onChange={(e) => setMeasurementPosition(e.target.value as any)}
                      className="w-4 h-4 rounded border-blue-600"
                    />
                    <span className="text-gray-700">Terlentang</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      value="Berdi"
                      checked={measurementPosition === 'Berdi'}
                      onChange={(e) => setMeasurementPosition(e.target.value as any)}
                      className="w-4 h-4 rounded border-blue-600"
                    />
                    <span className="text-gray-700">Berdi</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat Badan (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min="1"
                  max="30"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">1.0 - 30.0 kg</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tinggi Badan (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min="30"
                  max="130"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">30.0 - 130.0 cm</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={prevStep}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={nextStep}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}

        {steps[step - 1] === 'determinan' && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Determinan Lingkungan & Pola Asuh</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  value="BBLR"
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">BBLR (Bubur Bayi)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  value="ASI_Eksklusif"
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">ASI Eksklusif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  value="MPASI"
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">MPASI</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  value="Air_Bersih"
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">Air Bersih</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  value="Jamban_Sehat"
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">Jamban Sehat</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  value="Paparan_Asap_Rokok"
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">Paparan Asap Rokok</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  value="Kuintil_Ekonomi"
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">Kuintil Ekonomi</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  value="Pendidikan_Ibu"
                  className="w-4 h-4 rounded border-blue-600"
                />
                <span className="text-gray-700">Pendidikan Ibu</span>
              </label>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={prevStep}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => alert('Menyimpan draft kuesioner...')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Simpan Draft (Offline)
              </button>
              <button
                onClick={() => alert('Lihat hasil analisis')}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Lihat Hasil Analisis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}