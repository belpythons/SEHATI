import React from 'react'
import { ScreeningRecord } from '../../types/screening'
import { Utensils, Fish, Egg, Leaf, Sparkles } from 'lucide-react'

interface Props {
  record: ScreeningRecord
}

interface NutritionItem {
  id: string
  name: string
  category: 'Protein Hewani Lokal' | 'Sayuran & Mikronutrien' | 'Lemak Sehat'
  bontangContext: string
  portionRecommendation: string
  keyNutrient: string
  priorityTag: 'Utama' | 'Dianjurkan'
}

const BONTANG_LOCAL_NUTRITION: NutritionItem[] = [
  {
    id: 'ikan-bawis',
    name: 'Ikan Bawis Segar (Khas Bontang)',
    category: 'Protein Hewani Lokal',
    bontangContext: 'Ikan laut khas pesisir Bontang (Bontang Kuala & Berbas Pantai)',
    portionRecommendation: '1-2 potong/hari (kukus, sup bening, atau pepes)',
    keyNutrient: 'Tinggi Asam Amino Esensial, Kalsium & Seng (Zn)',
    priorityTag: 'Utama',
  },
  {
    id: 'ikan-bandeng',
    name: 'Ikan Bandeng / Tongkol Laut',
    category: 'Protein Hewani Lokal',
    bontangContext: 'Mudah diperoleh di pasar lokal Rawa Indah & Loktuan',
    portionRecommendation: '50-75 gram per porsi makan balita',
    keyNutrient: 'Asam Lemak Omega-3, DHA, Protein Murni',
    priorityTag: 'Utama',
  },
  {
    id: 'telur-ayam',
    name: 'Telur Ayam Rebus / Orak-Arik',
    category: 'Protein Hewani Lokal',
    bontangContext: 'Sumber protein harian murah dan mudah diakses di seluruh kelurahan',
    portionRecommendation: '1 butir setiap hari secara konsisten',
    keyNutrient: 'Kolin, Vitamin B12, Protein Berdaya Serap Tinggi',
    priorityTag: 'Utama',
  },
  {
    id: 'hati-ayam',
    name: 'Hati Ayam / Daging Unggas',
    category: 'Protein Hewani Lokal',
    bontangContext: 'Pencegahan anemia defisiensi besi pemicu stunting',
    portionRecommendation: '1-2 kali per minggu (1 potong sedang)',
    keyNutrient: 'Zat Besi (Heme Iron) Tinggi, Vitamin A',
    priorityTag: 'Dianjurkan',
  },
  {
    id: 'daun-kelor',
    name: 'Daun Kelor / Sayur Bening Bayam',
    category: 'Sayuran & Mikronutrien',
    bontangContext: 'Pemberdayaan pekarangan rumah tangga di wilayah Bontang',
    portionRecommendation: '2-3 sendok makan sayur per waktu makan',
    keyNutrient: 'Kalsium Nabati, Vitamin C, Antioksidan',
    priorityTag: 'Dianjurkan',
  },
]

export const NutritionTableWidget: React.FC<Props> = ({ record }) => {
  const isStunted = record.zScore < -2.0 || record.statusGiziTBU?.includes('Pendek')

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Utensils className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Rekomendasi Gizi Pangan Lokal
            </h3>
            <p className="text-xs text-slate-500">
              Intervensi Makanan Tambahan Berbasis Potensi Kota Bontang
            </p>
          </div>
        </div>

        {isStunted && (
          <span className="text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-600" />
            <span>Fokus Protein Hewani</span>
          </span>
        )}
      </div>

      {/* Narrative Alert */}
      <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-xs text-emerald-900 mb-3 flex items-start gap-2">
        <Fish className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Potensi Maritim Bontang: </span>
          Kekayaan ikan laut segar lokal memiliki bioavailabilitas protein tinggi untuk mempercepat kejar tumbuh balita (Catch-up Growth).
        </div>
      </div>

      {/* Nutrition Recommendation Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <th className="pb-2">Bahan Makanan Lokal</th>
              <th className="pb-2 hidden sm:table-cell">Konteks & Keunggulan</th>
              <th className="pb-2">Porsi / Frekuensi</th>
              <th className="pb-2 text-right">Nutrisi Kunci</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {BONTANG_LOCAL_NUTRITION.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 pr-2">
                  <div className="font-semibold text-slate-800">{item.name}</div>
                  <div className="text-[10px] text-slate-500">{item.category}</div>
                </td>
                <td className="py-2.5 pr-2 text-slate-600 hidden sm:table-cell">
                  {item.bontangContext}
                </td>
                <td className="py-2.5 pr-2 font-medium text-slate-700">
                  {item.portionRecommendation}
                </td>
                <td className="py-2.5 text-right font-medium text-blue-700 text-[11px]">
                  {item.keyNutrient}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
