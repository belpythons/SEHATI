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
  // --- Calculate individual dimension scores (0-100) based on approved mapping table ---

  // 1. Pola Makan Components
  // exclusiveAsi: 1=Eksklusif (95), 2=Tidak/Formula (30), 3=Belum 6 Bln (70)
  const scoreAsi =
    record.exclusiveAsi === 1 ? 95 :
    record.exclusiveAsi === 2 ? 30 :
    record.exclusiveAsi === 3 ? 70 : 50

  // mpasiAge: 1=<6bln (35), 2=Tepat 6bln (95), 3=>6bln (40), 4=Belum MPASI (65)
  const scoreMpasi =
    record.mpasiAge === 1 ? 35 :
    record.mpasiAge === 2 ? 95 :
    record.mpasiAge === 3 ? 40 :
    record.mpasiAge === 4 ? 65 : 50

  // animalProtein: [1..5], 5=Sangat Jarang (15), 1 item (55), 2 items (75), >=3 items (95)
  const proteins = Array.isArray(record.animalProtein) ? record.animalProtein : []
  const scoreProtein =
    proteins.includes(5) ? 15 :
    proteins.length >= 3 ? 95 :
    proteins.length === 2 ? 75 :
    proteins.length === 1 ? 55 : 50

  // Composite Pola Makan: Worst-case of ASI, MPASI, Protein
  const scorePolaMakan = Math.min(scoreAsi, scoreMpasi, scoreProtein)
  const statusPolaMakan =
    scorePolaMakan >= 80 ? 'Optimal' :
    scorePolaMakan >= 50 ? 'Cukup / Perlu Evaluasi' : 'Beresiko / Kurang'

  // 2. Lingkungan Components
  // cleanWaterAccess: 1=Kemasan (95), 2=PDAM (90), 3=Sumur Bor (65), 4=Sumur Gali (30)
  const scoreAir =
    record.cleanWaterAccess === 1 ? 95 :
    record.cleanWaterAccess === 2 ? 90 :
    record.cleanWaterAccess === 3 ? 65 :
    record.cleanWaterAccess === 4 ? 30 : 50

  // sanitationAccess: 1=Milik Sendiri (95), 2=Cemplung (50), 3=MCK (45), 4=Tidak Memiliki (15)
  const scoreSanitasi =
    record.sanitationAccess === 1 ? 95 :
    record.sanitationAccess === 2 ? 50 :
    record.sanitationAccess === 3 ? 45 :
    record.sanitationAccess === 4 ? 15 : 50

  // smokeExposure: 1=Bebas (90), 2=Terpapar (20)
  const scoreRokok =
    record.smokeExposure === 1 ? 90 :
    record.smokeExposure === 2 ? 20 : 50

  // Composite Lingkungan: Worst-case of Air, Sanitasi, Rokok
  const scoreLingkungan = Math.min(scoreAir, scoreSanitasi, scoreRokok)
  const statusLingkungan =
    scoreLingkungan >= 80 ? 'Saniter & Sehat' :
    scoreLingkungan >= 50 ? 'Cukup Layak' : 'Sanitasi / Paparan Buruk'

  // 3. Bebas Diare: 1=Tidak/1x Ringan (90), 2=Sering >=2x (25)
  const scoreDiare =
    record.diarrheaHistory === 1 ? 90 :
    record.diarrheaHistory === 2 ? 25 : 50
  const statusDiare = record.diarrheaHistory === 1 ? 'Jarang / Bebas' : 'Ada Riwayat Diare'

  // 4. Bebas BBLR: 1=Normal (90), 2=BBLR (25), 3=Tidak Tahu (50)
  const scoreBblr =
    record.bblrOption === 1 ? 90 :
    record.bblrOption === 2 ? 25 : 50
  const statusBblr =
    record.bblrOption === 1 ? 'Berat Lahir Cukup' :
    record.bblrOption === 2 ? 'Riwayat BBLR' : 'Tidak Diketahui'

  // 5. Pend. Ibu: 1=SD (30), 2=SMP (50), 3=SMA (75), 4=Diploma/Sarjana (95)
  const scorePendIbu =
    record.motherEducation === 1 ? 30 :
    record.motherEducation === 2 ? 50 :
    record.motherEducation === 3 ? 75 :
    record.motherEducation === 4 ? 95 : 50
  const statusPendIbu =
    record.motherEducation === 4 ? 'Tinggi (PT/Sarjana)' :
    record.motherEducation === 3 ? 'Menengah (SMA)' :
    record.motherEducation === 2 ? 'Dasar (SMP)' :
    record.motherEducation === 1 ? 'Dasar (SD)' : 'Data Tidak Tersedia'

  // 6. Ekonomi: Quintile 1..5 -> 20..100
  const scoreEkonomi = Math.min(100, Math.max(20, (record.economicQuintile || 3) * 20))
  const statusEkonomi = `Kuintil ${record.economicQuintile || 3}`

  // 7. Posyandu: 1=Rutin+KIA (95), 2=Kadang (55), 3=Tidak Pernah (20)
  const scorePosyandu =
    record.posyanduKia === 1 ? 95 :
    record.posyanduKia === 2 ? 55 :
    record.posyanduKia === 3 ? 20 : 50
  const statusPosyandu =
    record.posyanduKia === 1 ? 'Rutin & Ada KIA' :
    record.posyanduKia === 2 ? 'Kurang Rutin' : 'Tidak Aktif'

  // --- 7-Axis Composite Radar Dataset ---
  const radarData = [
    {
      subject: 'Pola Makan',
      fullSubject: 'Kualitas Pola Makan (ASI, MPASI, Protein Hewani)',
      value: scorePolaMakan,
      fullMark: 100,
      status: statusPolaMakan,
    },
    {
      subject: 'Lingkungan',
      fullSubject: 'Kondisi Lingkungan (Air Bersih, Jamban, Bebas Rokok)',
      value: scoreLingkungan,
      fullMark: 100,
      status: statusLingkungan,
    },
    {
      subject: 'Bebas Diare',
      fullSubject: 'Ketahanan dari Infeksi Diare (3 Bulan Terakhir)',
      value: scoreDiare,
      fullMark: 100,
      status: statusDiare,
    },
    {
      subject: 'Bebas BBLR',
      fullSubject: 'Riwayat Berat Lahir (BBLR)',
      value: scoreBblr,
      fullMark: 100,
      status: statusBblr,
    },
    {
      subject: 'Pend. Ibu',
      fullSubject: 'Jenjang Pendidikan Ibu',
      value: scorePendIbu,
      fullMark: 100,
      status: statusPendIbu,
    },
    {
      subject: 'Ekonomi',
      fullSubject: 'Kuintil Sosial Ekonomi Keluarga',
      value: scoreEkonomi,
      fullMark: 100,
      status: statusEkonomi,
    },
    {
      subject: 'Posyandu',
      fullSubject: 'Keaktifan Posyandu & Kepemilikan Buku KIA',
      value: scorePosyandu,
      fullMark: 100,
      status: statusPosyandu,
    },
  ]

  const dominantFactors = record.dominantFactors || []

  const factorLabels: Record<string, string> = {
    RIWAYAT_BBLR: 'Riwayat Berat Badan Lahir Rendah (BBLR)',
    TIDAK_ASI_EKSKLUSIF: 'Tidak Memperoleh ASI Eksklusif Adekuat',
    MPASI_TERLALU_DINI: 'Pemberian MPASI Terlalu Dini (<6 Bulan)',
    MPASI_TERLAMBAT: 'Pemberian MPASI Terlambat (>6 Bulan)',
    PROTEIN_HEWANI_SANGAT_KURANG: 'Asupan Protein Hewani Sangat Terbatas',
    PROTEIN_HEWANI_TERBATAS: 'Keragaman Protein Hewani Rendah',
    AKSES_AIR_MINUM_TERBATAS: 'Keterbatasan Akses Air Minum Layak',
    AKSES_SANITASI_BURUK: 'Akses Sanitasi / Jamban Belum Sehat',
    AKSES_SANITASI_TERBATAS: 'Akses Sanitasi Terbatas / Jamban Cemplung',
    PAPARAN_ASAP_ROKOK: 'Paparan Asap Rokok di Lingkungan Rumah',
    PENDIDIKAN_IBU_RENDAH: 'Tingkat Pendidikan Ibu Dasar (≤SD)',
    KUINTIL_EKONOMI_RENDAH: 'Kuintil Sosial Ekonomi Rendah',
    RIWAYAT_INFEKSI_DIARE: 'Riwayat Infeksi Diare Berulang',
    POSYANDU_TIDAK_AKTIF: 'Tidak Aktif Mengunjungi Posyandu / Tanpa KIA',
    INDIKASI_PERAWAKAN_PENDEK_TBU: 'Indikasi Perawakan Pendek (TB/U)',
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <PieChart className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Radar Determinan Stunting
            </h3>
            <p className="text-xs text-slate-500">
              Analisis Komposit Multi-Faktor Lingkungan & Pola Asuh
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart Visual */}
      <div className="flex-1 w-full min-h-[230px] sm:min-h-[250px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="60%"
            margin={{ top: 10, right: 18, bottom: 10, left: 18 }}
            data={radarData}
          >
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
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
                `${val}/100 (${item.payload.status})`,
                item.payload.fullSubject || 'Skor Kualitas',
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
