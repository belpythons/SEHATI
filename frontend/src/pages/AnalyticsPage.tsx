import React from 'react'

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-600">SEHATI</span>
            <span className="text-sm text-gray-500">Dashboard</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-gray-400">Selamat datang kembali</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Growth Chart Widget */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth Chart WHO</h3>
            <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-400">Chart placeholder</span>
            </div>
          </div>

          {/* Risk Gauge Widget */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Risk Gauge Meter</h3>
            <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-400">Gauge placeholder</span>
            </div>
          </div>

          {/* Determinant Radar Widget */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Determinant Radar</h3>
            <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-400">Radar placeholder</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Action Table Widget */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Actionable Nutrition Table</h3>
            <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-400">Table placeholder</span>
            </div>
          </div>

          {/* Shareable Link Widget */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Shareable Link Box</h3>
            <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-400">Link placeholder</span>
            </div>
          </div>

          {/* AI Chat Widget */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Chatbot Drawer</h3>
            <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-400">Chat placeholder</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}