import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { env } from '#/env'
import { Loader2, Activity, Zap, Database, Clock } from 'lucide-react'

type GlobalLatencySummary = {
  total_detections_analyzed: number
  global_averages: {
    webrtc_latency_avg_ms: number
    landmark_latency_avg_ms: number
    flow_latency_avg_ms: number
    spotting_latency_ms: number
    model_inference_latency_ms: number
    total_latency_ms: number
  }
}

export default function GlobalLatencyPage() {
  const [data, setData] = useState<GlobalLatencySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const baseUrl = env.VITE_SOCKET_URL.replace('ws://', 'http://')
      .replace('wss://', 'https://')
      .split('/ws')[0]
      
    fetch(`${baseUrl}/history/latencies/summary`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch global latency summary')
        return r.json()
      })
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setError(e.message)
        setLoading(false)
      })
  }, [])

  if (loading)
    return <div className="p-8 text-center text-ink flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-6 h-6 text-brand-pink" /></div>

  if (error)
    return <div className="p-8 text-center text-brand-coral">Error: {error}</div>

  if (!data) return null

  const { total_detections_analyzed, global_averages } = data

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <div className="w-full max-w-[95vw] mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-surface-card border border-hairline rounded-xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-ink">
              <Zap className="w-6 h-6 text-brand-coral" />
              Dashboard Latensi Global
            </h1>
            <p className="text-muted mt-2">
              Agregasi rata-rata latensi dari seluruh sesi dan deteksi yang pernah tercatat di sistem.
            </p>
          </div>
          <Link
            to="/history"
            className="text-brand-pink text-sm underline hover:text-brand-pink/80 transition-colors whitespace-nowrap"
          >
            Kembali ke Daftar Riwayat
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-card border border-hairline rounded-xl p-8 shadow-sm flex items-center gap-6">
            <div className="bg-brand-blue/10 p-4 rounded-full">
              <Database className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <div className="text-muted mb-1 font-medium">Total Deteksi Dianalisis</div>
              <div className="text-4xl font-bold text-ink">{total_detections_analyzed}</div>
            </div>
          </div>
          
          <div className="bg-surface-card border border-hairline rounded-xl p-8 shadow-sm flex items-center gap-6">
            <div className="bg-brand-coral/10 p-4 rounded-full">
              <Clock className="w-8 h-8 text-brand-coral" />
            </div>
            <div>
              <div className="text-muted mb-1 font-medium">Rata-Rata Latensi Total (Global)</div>
              <div className="text-4xl font-bold text-brand-coral">{global_averages.total_latency_ms.toFixed(2)} <span className="text-lg font-normal text-muted">ms</span></div>
            </div>
          </div>
        </div>

        {/* Breakdown Chart/Progress bars */}
        <div className="bg-surface-card border border-hairline rounded-xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-blue" />
            Komposisi Latensi Pipeline Global
          </h2>
          
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-40 text-sm font-medium text-muted">Model Inference</div>
              <div className="flex-1 h-4 bg-surface-soft rounded-full overflow-hidden">
                <div className="h-full bg-brand-pink transition-all duration-500" style={{ width: `${Math.min(100, (global_averages.model_inference_latency_ms / global_averages.total_latency_ms) * 100)}%` }}></div>
              </div>
              <div className="w-20 text-right text-sm font-mono font-bold">{global_averages.model_inference_latency_ms.toFixed(2)}ms</div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-40 text-sm font-medium text-muted">Optical Flow</div>
              <div className="flex-1 h-4 bg-surface-soft rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue transition-all duration-500" style={{ width: `${Math.min(100, (global_averages.flow_latency_avg_ms / global_averages.total_latency_ms) * 100)}%` }}></div>
              </div>
              <div className="w-20 text-right text-sm font-mono font-bold">{global_averages.flow_latency_avg_ms.toFixed(2)}ms</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-40 text-sm font-medium text-muted">Landmark</div>
              <div className="flex-1 h-4 bg-surface-soft rounded-full overflow-hidden">
                <div className="h-full bg-brand-mint transition-all duration-500" style={{ width: `${Math.min(100, (global_averages.landmark_latency_avg_ms / global_averages.total_latency_ms) * 100)}%` }}></div>
              </div>
              <div className="w-20 text-right text-sm font-mono font-bold">{global_averages.landmark_latency_avg_ms.toFixed(2)}ms</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-40 text-sm font-medium text-muted">WebRTC</div>
              <div className="flex-1 h-4 bg-surface-soft rounded-full overflow-hidden">
                <div className="h-full bg-brand-coral transition-all duration-500" style={{ width: `${Math.min(100, (global_averages.webrtc_latency_avg_ms / global_averages.total_latency_ms) * 100)}%` }}></div>
              </div>
              <div className="w-20 text-right text-sm font-mono font-bold">{global_averages.webrtc_latency_avg_ms.toFixed(2)}ms</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-40 text-sm font-medium text-muted">Phase Spotting</div>
              <div className="flex-1 h-4 bg-surface-soft rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${Math.min(100, (global_averages.spotting_latency_ms / global_averages.total_latency_ms) * 100)}%` }}></div>
              </div>
              <div className="w-20 text-right text-sm font-mono font-bold">{global_averages.spotting_latency_ms.toFixed(2)}ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
