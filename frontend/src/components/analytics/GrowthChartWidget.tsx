import React, { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts'
import { ScreeningRecord } from '../../types/screening'
import { TrendingUp, Activity, HelpCircle } from 'lucide-react'
import { getStatusGiziTBUStyle, getStatusGiziBBUStyle } from '../../lib/nutritionStatus'

interface Props {
  record: ScreeningRecord
}

// Generate WHO Reference Data Points for age 0 - 24 or 0 - 60 months
const WHO_TBU_DATA = [
  { month: 0, sd3Neg: 44.2, sd2Neg: 46.1, median: 49.9, sd2Pos: 53.7, sd3Pos: 55.6 },
  { month: 6, sd3Neg: 61.2, sd2Neg: 63.3, median: 67.6, sd2Pos: 71.9, sd3Pos: 74.0 },
  { month: 12, sd3Neg: 68.6, sd2Neg: 71.0, median: 75.7, sd2Pos: 80.5, sd3Pos: 82.9 },
  { month: 18, sd3Neg: 74.0, sd2Neg: 76.9, median: 82.3, sd2Pos: 87.7, sd3Pos: 90.4 },
  { month: 24, sd3Neg: 78.7, sd2Neg: 81.7, median: 87.8, sd2Pos: 93.9, sd3Pos: 97.0 },
  { month: 36, sd3Neg: 86.0, sd2Neg: 89.6, median: 96.1, sd2Pos: 102.7, sd3Pos: 106.0 },
  { month: 48, sd3Neg: 92.4, sd2Neg: 96.2, median: 103.3, sd2Pos: 110.5, sd3Pos: 114.2 },
  { month: 60, sd3Neg: 97.6, sd2Neg: 101.9, median: 110.0, sd2Pos: 117.8, sd3Pos: 122.0 },
]

const WHO_BBU_DATA = [
  { month: 0, sd3Neg: 2.1, sd2Neg: 2.5, median: 3.3, sd2Pos: 4.4, sd3Pos: 5.0 },
  { month: 6, sd3Neg: 5.5, sd2Neg: 6.4, median: 7.9, sd2Pos: 9.8, sd3Pos: 10.9 },
  { month: 12, sd3Neg: 7.1, sd2Neg: 8.4, median: 9.6, sd2Pos: 11.5, sd3Pos: 12.4 },
  { month: 18, sd3Neg: 8.1, sd2Neg: 9.5, median: 10.9, sd2Pos: 13.0, sd3Pos: 14.1 },
  { month: 24, sd3Neg: 9.0, sd2Neg: 10.8, median: 12.2, sd2Pos: 14.8, sd3Pos: 16.0 },
  { month: 36, sd3Neg: 10.8, sd2Neg: 12.7, median: 14.3, sd2Pos: 17.5, sd3Pos: 19.3 },
  { month: 48, sd3Neg: 12.3, sd2Neg: 14.4, median: 16.3, sd2Pos: 20.2, sd3Pos: 22.5 },
  { month: 60, sd3Neg: 13.7, sd2Neg: 16.0, median: 18.3, sd2Pos: 23.0, sd3Pos: 25.8 },
]

export const GrowthChartWidget: React.FC<Props> = ({ record }) => {
  const [activeTab, setActiveTab] = useState<'TBU' | 'BBU'>('TBU')

  const isTBU = activeTab === 'TBU'
  const currentChartData = isTBU ? WHO_TBU_DATA : WHO_BBU_DATA
  const currentValue = isTBU ? record.heightCm : record.weightKg
  const currentZScore = isTBU ? record.zScore : (record.zScoreWAZ ?? 0)
  const currentStatus = isTBU ? (record.statusGiziTBU || 'Normal') : (record.statusGiziBBU || 'Normal')
  const tbuBadgeStyle = getStatusGiziTBUStyle(record.statusGiziTBU, record.zScore)
  const bbuBadgeStyle = getStatusGiziBBUStyle(record.statusGiziBBU, record.zScoreWAZ ?? 0)
  const statusBadgeStyle = isTBU ? tbuBadgeStyle : bbuBadgeStyle

  console.log('[GrowthChartWidget Debug]', {
    activeTab,
    isTBU,
    'record.statusGiziTBU': record.statusGiziTBU,
    'record.statusGiziBBU': record.statusGiziBBU,
    'record.zScore': record.zScore,
    'record.zScoreWAZ': record.zScoreWAZ,
    currentValue,
    currentZScore,
    currentStatus,
    tbuBadgeStyle,
    bbuBadgeStyle,
    statusBadgeStyle,
    'classes match exactly': tbuBadgeStyle === bbuBadgeStyle,
  })

  return (
    <div className="flex flex-col h-full bg-[var(--color-paper)] rounded-2xl border border-[var(--color-rule)] p-4 sm:p-5 shadow-xs">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[var(--color-paper-2)] text-[var(--color-navy)] border border-[var(--color-rule)]">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="font-display font-medium text-[var(--color-ink)] text-base sm:text-lg">
              Kurva Pertumbuhan Baku WHO
            </h3>
          </div>
          <p className="text-xs text-[var(--color-ink-2)] mt-0.5">
            Standar Deviasi (SD) Antropometri Balita WHO 2006
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex w-full sm:w-auto bg-[var(--color-paper-2)] p-1 rounded-xl text-xs font-semibold border border-[var(--color-rule)]">
          <button
            type="button"
            onClick={() => setActiveTab('TBU')}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] ${
              isTBU
                ? 'bg-[var(--color-paper)] text-[var(--color-ink)] font-bold shadow-xs'
                : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
            }`}
          >
            Tinggi/Usia (TB/U)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BBU')}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] ${
              !isTBU
                ? 'bg-[var(--color-paper)] text-[var(--color-ink)] font-bold shadow-xs'
                : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
            }`}
          >
            Berat/Usia (BB/U)
          </button>
        </div>
      </div>

      {/* Score Summary Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-xl p-2.5 sm:p-3 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--color-ink-2)]">Posisi Balita:</span>
          <span className="font-bold text-[var(--color-ink)]">
            {record.ageMonths} bln / {currentValue} {isTBU ? 'cm' : 'kg'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-ink-2)]">Z-Score:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-full border ${statusBadgeStyle}`}
          >
            {currentZScore > 0 ? `+${currentZScore}` : currentZScore} SD ({currentStatus})
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={currentChartData}
            margin={{ top: 10, right: 12, left: -18, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickFormatter={(m) => `${m} bln`}
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <YAxis
              domain={isTBU ? [40, 130] : [2, 30]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              unit={isTBU ? 'cm' : 'kg'}
            />
            <Tooltip
              formatter={(val: any, name: any) => [
                `${val} ${isTBU ? 'cm' : 'kg'}`,
                name === 'median'
                  ? 'Median (0 SD)'
                  : name === 'sd2Neg'
                  ? 'Batas -2 SD (Stunted/Kurus)'
                  : name === 'sd3Neg'
                  ? 'Batas -3 SD (Severely)'
                  : name === 'sd2Pos'
                  ? 'Batas +2 SD'
                  : name,
              ]}
              labelFormatter={(label) => `Usia: ${label} Bulan`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
              formatter={(value) => {
                if (value === 'median') return 'Median (0 SD)'
                if (value === 'sd2Neg') return '-2 SD'
                if (value === 'sd3Neg') return '-3 SD'
                if (value === 'sd2Pos') return '+2 SD'
                return value
              }}
            />

            {/* Reference SD Curves */}
            <Line
              type="monotone"
              dataKey="sd3Neg"
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              name="sd3Neg"
            />
            <Line
              type="monotone"
              dataKey="sd2Neg"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              name="sd2Neg"
            />
            <Line
              type="monotone"
              dataKey="median"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              name="median"
            />
            <Line
              type="monotone"
              dataKey="sd2Pos"
              stroke="#0ea5e9"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              name="sd2Pos"
            />

            {/* Child's Measurement Dot */}
            <ReferenceDot
              x={record.ageMonths}
              y={currentValue}
              r={6}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth={2.5}
              label={{
                value: `📍 ${currentValue} ${isTBU ? 'cm' : 'kg'}`,
                position: 'top',
                fill: '#1e40af',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[11px] text-[var(--color-ink-2)] text-center">
        Titik biru menunjukkan posisi pengukuran antropometri balita saat ini.
      </div>
    </div>
  )
}
