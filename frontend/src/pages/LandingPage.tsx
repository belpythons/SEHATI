import React from 'react'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-600">SEHATI</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span className="text-sm text-gray-500">Selamat datang</span>
            <span className="text-sm font-medium text-gray-900">Orang Tua</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Deteksi Stunting dini untuk kesehatan anak
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Platform integrasi edukasi holistik dan deteksi risiko stunting berdasarkan
            parameter antropometri dan lingkungan balita.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow p-6 hover:transition-transform hover:transition-hover p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Deteksi Z-Score WHO</h3>
            <p className="text-sm text-gray-500">Mengukur pertumbuhan balita berdasarkan standar dunia</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:transition-transform hover:transition-hover p-8">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0-2C7 2 2 7 2 12s5 10 10 10 10-5 10-10S17 2 12 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Prediksi Risiko Naïve Bayes</h3>
            <p className="text-sm text-gray-500">Analisis faktor risiko berdasarkan algoritma machine learning</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:transition-transform hover:transition-hover p-8">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C3 2 2 3 2 12s1 10 8 10 8-2 8-10S13 2 12 2zm0-2C7 2 2 7 2 12s5 10 10 10 10-5 10-10S17 2 12 2zm-4 7.5c0-.66-.55-1.2-1.2-1.2S5.5 6.34 5.5 7s.55.54 1.2.54t1.2-.54c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2.54t-1.2-.54S10.5 9.06 10.5 8.4zM9 8c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H9zm3 3c0 .66-.55 1.2-1.2 1.2s-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2t1.2.54zM4 13c0 .66-.55 1.1-1.1 1.1S2 13.66 2 13s.55-1.1 1.1-1.1h4c.55 0 1-.45 1-1s-.55-1.1-1.1-1.1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Asisten Konsultasi AI</h3>
            <p className="text-sm text-gray-500">Diskusi dengan Gemini AI untuk pertanyaan gizi dan stunting</p>
          </div>
        </section>
      </main>
    </div>
  )
}