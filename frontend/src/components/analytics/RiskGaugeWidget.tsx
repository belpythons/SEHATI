import React from 'react'
import { GaugeComponent } from 'react-gauge-component'
import { ScreeningRecord } from '../../types/screening'
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Props {
  record: ScreeningRecord
}

export const RiskGaugeWidget: React.FC<Props> = ({ record }) => {
  const riskScore = record.riskScore ?? 0.5
  const riskPercent = Math.round(riskScore * 100)
  const tier = record.riskTier || 'MODERATE'

  const tierConfig = {
    LOW: {
      label: 'Risiko Rendah',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      desc: 'Pertumbuhan & determinan lingkungan balita terpantau baik. Pertahankan pola asuh dan gizi seimbang.',
    },
    MODERATE: {
      label: 'Risiko Sedang',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      desc: 'Ditemukan faktor determinan pemicu stunting yang memerlukan perhatian dan perbaikan pola asuh/sanitasi.',
    },
    HIGH: {
      label: 'Risiko Tinggi',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      icon: ShieldAlert,
      desc: 'Balita memerlukan intervensi gizi terpadu dan pendampingan kader posyandu / tenaga kesehatan segera.',
    },
  }[tier]

  const Icon = tierConfig.icon

  const arcTooltipStyle: React.CSSProperties = {
    zIndex: 9999,
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 10px',
    borderRadius: '8px',
    boxShadow: '0 8px 20px -2px rgba(0, 0, 0, 0.25)',
  }


  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Risk Gauge Meter
            </h3>
            <p className="text-xs text-slate-500">
              Derajat Kerentanan Stunting (Naïve Bayes)
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${tierConfig.badgeClass}`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span>{tierConfig.label}</span>
        </span>
      </div>

      {/* Gauge Component Container */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="w-full max-w-[230px] sm:max-w-[260px]">
          <GaugeComponent
            type="semicircle"
            value={riskPercent}
            minValue={0}
            maxValue={100}
            arc={{
              width: 0.2,
              padding: 0.02,
              cornerRadius: 4,
              subArcs: [
                {
                  limit: 40,
                  color: '#10B981',
                  showTick: true,
                  tooltip: {
                    text: 'Risiko Rendah (0-40%)',
                    style: arcTooltipStyle,
                  },
                },
                {
                  limit: 70,
                  color: '#F59E0B',
                  showTick: true,
                  tooltip: {
                    text: 'Risiko Sedang (40-70%)',
                    style: arcTooltipStyle,
                  },
                },
                {
                  limit: 100,
                  color: '#EF4444',
                  showTick: true,
                  tooltip: {
                    text: 'Risiko Tinggi (70-100%)',
                    style: arcTooltipStyle,
                  },
                },
              ],
            }}
            pointer={{
              type: 'needle',
              elastic: true,
              animationDelay: 100,
              color: '#334155',
            }}
            labels={{
              valueLabel: {
                formatTextValue: (value) => `${value}%`,
                style: {
                  fontSize: '24px',
                  fontWeight: 'bold',
                  fill: '#1e293b',
                  textShadow: 'none',
                },
              },
              tickLabels: {
                type: 'outer',
                ticks: [
                  { value: 0 },
                  { value: 40 },
                  { value: 70 },
                  { value: 100 },
                ],
              },
            }}
          />
        </div>
      </div>

      {/* Narrative Interpretation Box */}
      <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
        <p className="font-semibold text-slate-800 mb-0.5">
          Indeks Probabilitas Risiko: {riskScore.toFixed(2)} / 1.00
        </p>
        <p>{tierConfig.desc}</p>
      </div>
    </div>
  )
}
