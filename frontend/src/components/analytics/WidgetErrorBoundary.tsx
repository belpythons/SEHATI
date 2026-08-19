import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  widgetName?: string
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Per-widget error boundary for the Analytics dashboard.
 * Isolates rendering failures so that one broken widget does NOT
 * take down the entire page — only the failing widget shows an
 * inline error card while all others keep working.
 */
export class WidgetErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[WidgetErrorBoundary] "${this.props.widgetName ?? 'Unknown'}" crashed:`,
      error,
      errorInfo.componentStack
    )
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[180px] bg-white rounded-2xl border border-red-100 p-6 text-center">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">
            Widget Gagal Dimuat
          </h4>
          <p className="text-[11px] text-slate-500 max-w-[220px] leading-relaxed mb-3">
            {this.props.widgetName
              ? `Komponen "${this.props.widgetName}" mengalami error saat render.`
              : 'Widget ini mengalami error saat render.'}
          </p>
          {this.state.error && (
            <code className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded-md mb-3 max-w-full truncate block border border-red-100">
              {this.state.error.message}
            </code>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
