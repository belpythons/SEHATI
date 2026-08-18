import React from 'react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts'
import { ScreeningRecord } from '../../types/screening'
import { PieChart, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Props {
  record: ScreeningRecord
}

export const DeterminantRadarWidget: React.FC<Props> = ({ record }) => {
  // bblrHistory & motherEducation are NOT stored in Prisma schema — they only exist
  // in sessionStorage for the submitting user. For shared links, these will be undefined.
  // In that case we show a neutral "Data tidak tersedia" state (score 50, gray) instead
  // of silently defaulting to a healthy or unhealthy value.
  const bblrKnown = typeof record.bblrHistory === 'boolean'
  const motherEdKnown = typeof record.motherEducation === 'boolean'

  // Convert boolean & categorical factors to 0-100 impact index for radar visualization
  const radarData = [
    {
      subject: 'Sanitasi',
      value: record.sanitationAccess ? 90 : 25,
      fullMark: 100,
      status: record.sanitationAccess ? 'Baik' : 'Beresiko',
      available: true,
    },
    {
      subject: 'Air Bersih',
      value: record.cleanWaterAccess ? 95 : 30,
      fullMark: 100,
      status: record.cleanWaterAccess ? 'Baik' : 'Beresiko',
      available: true,
    },
    {
      subject: 'Bebas Rokok',
      value: !record.smokeExposure ? 90 : 20,
      fullMark: 100,
      status: !record.smokeExposure ? 'Bebas Asap' : 'Paparan Tinggi',
      available: true,
    },
    {
      subject: 'ASI Eksklusif',
      value: record.exclusiveAsi ? 95 : 35,
      fullMark: 100,
      status: record.exclusiveAsi ? 'Lengkap' : 'Tidak Eksklusif',
      available: true,
    },
    {
      subject: 'Bebas Diare',
      value: !record.diarrheaHistory ? 90 : 25,
      fullMark: 100,
      status: !record.diarrheaHistory ? 'Jarang / Sehat' : 'Ada Riwayat',
      available: true,
    },
    {
      subject: 'Bebas BBLR',
      value: bblrKnown ? (!record.bblrHistory ? 90 : 25) : 50,
      fullMark: 100,
      status: bblrKnown
        ? (!record.bblrHistory ? 'Berat Lahir Cukup' : 'Riwayat BBLR')
        : 'Data tidak tersedia',
      available: bblrKnown,
    },
    {
      subject: 'Pendidikan Ibu',
      value: motherEdKnown ? (record.motherEducation ? 90 : 35) : 50,
      fullMark: 100,
      status: motherEdKnown
        ? (record.motherEducation ? 'Tamat SMA+' : 'Dasar / Menengah')
        : 'Data tidak tersedia',
      available: motherEdKnown,
    },
    {
      subject: 'Ekonomi (Q)',
      value: (record.economicQuintile || 3) * 20,
      fullMark: 100,
      status: `Kuintil ${record.economicQuintile || 3}`,
      available: true,
    },
  ]

  const dominantFactors = record.dominantFactors || []

  const factorLabels: Record<string, string> = {
    AKSES_SANITASI_BURUK: 'Akses Sanitasi / Jamban Belum Sehat',
    PAPARAN_ASAP_ROKOK: 'Paparan Asap Rokok di Lingkungan Rumah',
    AKSES_AIR_MINUM_TERBATAS: 'Keterbatasan Akses Air Minum Layak',
    TIDAK_ASI_EKSKLUSIF: 'Tidak Memperoleh ASI Eksklusif Adekuat',
    RIWAYAT_INFEKSI_DIARE: 'Riwayat Infeksi Diare Berulang',
    KUINTIL_EKONOMI_RENDAH: 'Kuintil Sosial Ekonomi Rendah',
    RIWAYAT_BBLR: 'Riwayat Berat Badan Lahir Rendah (BBLR)',
    INDIKASI_PERAWAKAN_PENDEK_TBU: 'Indikasi Perawakan Pendek (TB/U)',
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <PieChart className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Radar Determinan Stunting
            </h3>
            <p className="text-xs text-slate-500">
              Analisis Multi-Faktor Lingkungan & Pola Asuh
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart Visual */}
      <div className="flex-1 w-full min-h-[200px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Indeks Kualitas"
              dataKey="value"
              stroke="#6366f1"
              fill="#818cf8"
              fillOpacity={0.45}
            />
            <Tooltip
              formatter={(val: any, _name: any, item: any) => [
                item.payload.available
                  ? `${val}/100 (${item.payload.status})`
                  : `— (${item.payload.status})`,
                item.payload.available ? 'Skor Kualitas' : '⚠ Tidak Tersimpan di Database',
              ]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Notice when BBLR / Mother Education data is unavailable */}
      {(!bblrKnown || !motherEdKnown) && (
        <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-500 mb-3">
          <span className="font-semibold text-slate-600">ⓘ </span>
          Data <strong>Riwayat BBLR</strong> dan <strong>Pendidikan Ibu</strong> tidak tersimpan di database backend — sumbu abu-abu (50) menandakan data tidak tersedia pada tautan yang dibagikan.
        </div>
      )}

      {/* Dominant Risk Factors List */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-700 mb-2">
          Faktor Pemicu Dominan:
        </div>
        {dominantFactors.length > 0 ? (
          <div className="space-y-1.5">
            {dominantFactors.map((factor) => (
              <div
                key={factor}
                className="flex items-start gap-2 text-xs bg-amber-50/70 border border-amber-200/60 rounded-lg p-2 text-amber-900"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-medium">
                  {factorLabels[factor] || factor.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tidak ditemukan faktor risiko dominan yang mengkhawatirkan.</span>
          </div>
        )}
      </div>
    </div>
  )
}
