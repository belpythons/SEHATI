import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  Activity,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  PlusCircle,
  Sparkles,
  Database,
  RefreshCw,
  Baby,
} from 'lucide-react'
import { ScreeningRecord, ScreeningSubmitResponse } from '../types/screening'
import { screeningService } from '../services/screeningService'
import { getMappedRealHash } from '../services/offlineQueueService'
import { GrowthChartWidget } from '../components/analytics/GrowthChartWidget'
import { RiskGaugeWidget } from '../components/analytics/RiskGaugeWidget'
import { DeterminantRadarWidget } from '../components/analytics/DeterminantRadarWidget'
import { NutritionTableWidget } from '../components/analytics/NutritionTableWidget'
import { ShareableLinkWidget } from '../components/analytics/ShareableLinkWidget'
import { AIChatWidget } from '../components/analytics/AIChatWidget'
import { DraggableWidget } from '../components/analytics/DraggableWidget'
import { AIChatDrawer } from '../components/chat/AIChatDrawer'

const DEFAULT_WIDGET_ORDER = [
  'growth-chart',
  'risk-gauge',
  'determinant-radar',
  'nutrition-table',
  'shareable-link',
  'ai-chat',
]

export const AnalyticsPage: React.FC = () => {
  const { shareHash } = useParams<{ shareHash?: string }>()
  const navigate = useNavigate()

  const [widgetOrder, setWidgetOrder] = useState<string[]>(DEFAULT_WIDGET_ORDER)
  const [record, setRecord] = useState<ScreeningRecord | null>(null)
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch / Load Screening Record Data
  useEffect(() => {
    let isMounted = true

    const loadScreeningData = async () => {
      setIsLoading(true)
      try {
        // Always check sessionStorage first — it contains enriched data
        // (bblrHistory & motherEducation from formData) that backend does not persist.
        const cachedSession = sessionStorage.getItem('sehati_active_screening')
        let cachedParsed: ScreeningSubmitResponse | null = null

        if (cachedSession) {
          try {
            cachedParsed = JSON.parse(cachedSession) as ScreeningSubmitResponse
          } catch {
            cachedParsed = null
          }
        }

        if (shareHash) {
          // Check if this hash was an offline mock hash that has since been synced to a real backend hash
          const mappedRealHash = getMappedRealHash(shareHash)
          const targetHash = mappedRealHash || shareHash

          // URL has :shareHash — check if sessionStorage holds THIS screening
          if (cachedParsed && (cachedParsed.shareHash === targetHash || cachedParsed.shareHash === shareHash)) {
            // Priority 1: sessionStorage matches URL hash (user who just submitted)
            // This preserves enriched bblrHistory & motherEducation from formData.
            if (isMounted) {
              setRecord(cachedParsed.data)
              setDataSource(cachedParsed.dataSource || (cachedParsed.isMockData ? 'mock' : 'live'))
            }
          } else {
            // Priority 2: Fetch targetHash from backend/mock
            const response: ScreeningSubmitResponse = await screeningService.getScreeningByHash(
              targetHash
            )
            if (isMounted) {
              setRecord(response.data)
              setDataSource(response.dataSource || (response.isMockData ? 'mock' : 'live'))
            }
          }
        } else if (cachedParsed) {
          // No shareHash in URL — use sessionStorage if available
          if (isMounted) {
            setRecord(cachedParsed.data)
            setDataSource(cachedParsed.dataSource || (cachedParsed.isMockData ? 'mock' : 'live'))
          }
        } else {
          // No shareHash, no sessionStorage — fallback to default demo sample.
          // mockApi.getByShareHash() auto-generates a Loktuan demo profile (18 bln, L)
          // when no matching hash is found — this key is not a literal seed entry.
          const fallback: ScreeningSubmitResponse = await screeningService.getScreeningByHash(
            'demo-sample'
          )
          if (isMounted) {
            setRecord(fallback.data)
            setDataSource('mock')
          }
        }
      } catch (err) {
        console.error('Failed to load screening record:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadScreeningData()

    return () => {
      isMounted = false
    }
  }, [shareHash])

  // Handle widget re-ordering drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(String(active.id))
        const newIndex = items.indexOf(String(over.id))
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Render individual widget component by ID
  const renderWidget = (widgetId: string) => {
    if (!record) return null

    switch (widgetId) {
      case 'growth-chart':
        return (
          <DraggableWidget key={widgetId} id={widgetId} span="col-span-1">
            <GrowthChartWidget record={record} />
          </DraggableWidget>
        )
      case 'risk-gauge':
        return (
          <DraggableWidget key={widgetId} id={widgetId} span="col-span-1">
            <RiskGaugeWidget record={record} />
          </DraggableWidget>
        )
      case 'determinant-radar':
        return (
          <DraggableWidget key={widgetId} id={widgetId} span="col-span-1">
            <DeterminantRadarWidget record={record} />
          </DraggableWidget>
        )
      case 'nutrition-table':
        return (
          <DraggableWidget key={widgetId} id={widgetId} span="col-span-1">
            <NutritionTableWidget record={record} />
          </DraggableWidget>
        )
      case 'shareable-link':
        return (
          <DraggableWidget key={widgetId} id={widgetId} span="col-span-1">
            <ShareableLinkWidget record={record} dataSource={dataSource} />
          </DraggableWidget>
        )
      case 'ai-chat':
        return (
          <DraggableWidget key={widgetId} id={widgetId} span="col-span-1">
            <AIChatWidget record={record} onOpenChat={() => setIsChatOpen(true)} />
          </DraggableWidget>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-lg">Memuat Dashboard Analitik...</h3>
          <p className="text-sm text-slate-500 mt-1">Mengolah data Z-Score dan inferensi risiko Naïve Bayes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Navbar */}
      <header className="glass-nav sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-blue-600">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                <Activity className="w-4 h-4" />
              </span>
              <span>SEHATI</span>
            </Link>
            <span className="text-xs text-slate-400 hidden sm:inline">|</span>
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
              Dashboard Analitik & Konsultasi
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live vs Mock Data Source Indicator Badge */}
            {dataSource === 'live' ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Backend API</span>
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Mode Simulasi (Mock Data)</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => navigate('/questionnaire')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Skrining Baru</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Analytics Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Child Profile Overview Header Banner */}
        {record && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                <Baby className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    Balita ({record.gender === 'L' ? 'Laki-laki' : 'Perempuan'}), {record.ageMonths} Bulan
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                    #{record.shareHash}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kelurahan {record.kelurahan}, Bontang</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Persona: {record.persona}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(record.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50/80 border border-slate-100 rounded-xl p-3 shrink-0">
              <div className="text-center px-2">
                <div className="text-[10px] uppercase font-semibold text-slate-400">TB / PB</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{record.heightCm} cm</div>
              </div>
              <div className="text-center px-2 border-x border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Berat Badan</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{record.weightKg} kg</div>
              </div>
              <div className="text-center px-2">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Z-Score TB/U</div>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    record.zScore < -2.0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {record.zScore > 0 ? `+${record.zScore}` : record.zScore} SD
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drag and Drop Instructions Tip */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
          <span>Tata Letak Widget Interaktif (Tahan ikon di pojok kanan atas untuk menggeser susunan)</span>
          <button
            type="button"
            onClick={() => setWidgetOrder(DEFAULT_WIDGET_ORDER)}
            className="hover:text-blue-600 font-medium transition-colors cursor-pointer"
          >
            Reset Susunan Default
          </button>
        </div>

        {/* Draggable Widgets Grid */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {widgetOrder.map((id) => renderWidget(id))}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      {/* Floating AI Chat Drawer */}
      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        record={record}
      />
    </div>
  )
}