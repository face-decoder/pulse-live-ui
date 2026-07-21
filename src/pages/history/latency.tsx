import { useEffect, useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { env } from '#/env'
import { Loader2, Activity, Clock, Zap, Target } from 'lucide-react'

type LatencyItem = {
  detection_id: string
  webrtc_latency_avg_ms: number
  landmark_latency_avg_ms: number
  flow_latency_avg_ms: number
  spotting_latency_ms: number
  model_inference_latency_ms: number
  total_latency_ms: number
}

export default function HistoryLatencyPage({
  sessionId,
}: {
  sessionId: string
}) {
  const [latencies, setLatencies] = useState<LatencyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const baseUrl = env.VITE_SOCKET_URL.replace('ws://', 'http://')
      .replace('wss://', 'https://')
      .split('/ws')[0]
      
    fetch(`${baseUrl}/history/${sessionId}/latencies`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch latencies data')
        return r.json()
      })
      .then((d) => {
        setLatencies(d.latencies || [])
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setError(e.message)
        setLoading(false)
      })
  }, [sessionId])

  const stats = useMemo(() => {
    if (latencies.length === 0) return null
    
    let total = 0
    let webrtc = 0
    let landmark = 0
    let flow = 0
    let spotting = 0
    let inference = 0
    let maxTotal = -Infinity
    let minTotal = Infinity
    
    latencies.forEach(l => {
      total += l.total_latency_ms
      webrtc += l.webrtc_latency_avg_ms
      landmark += l.landmark_latency_avg_ms
      flow += l.flow_latency_avg_ms
      spotting += l.spotting_latency_ms
      inference += l.model_inference_latency_ms
      
      if (l.total_latency_ms > maxTotal) maxTotal = l.total_latency_ms
      if (l.total_latency_ms < minTotal) minTotal = l.total_latency_ms
    })
    
    const count = latencies.length
    
    return {
      avgTotal: (total / count).toFixed(2),
      maxTotal: maxTotal.toFixed(2),
      minTotal: minTotal.toFixed(2),
      avgWebrtc: (webrtc / count).toFixed(2),
      avgLandmark: (landmark / count).toFixed(2),
      avgFlow: (flow / count).toFixed(2),
      avgSpotting: (spotting / count).toFixed(2),
      avgInference: (inference / count).toFixed(2),
      count
    }
  }, [latencies])

  if (loading)
    return <div className="p-8 text-center text-ink flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-6 h-6 text-brand-pink" /></div>

  if (error)
    return <div className="p-8 text-center text-brand-coral">Error: {error}</div>

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <div className="w-full max-w-[95vw] mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-surface-card border border-hairline rounded-xl p-8 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-brand-blue" />
              Dashboard Latensi Sesi
            </h1>
            <p className="text-muted mt-2 flex items-center gap-2">
              Sesi: <span className="font-mono text-sm bg-surface-soft px-2 py-1 rounded border border-hairline">{sessionId}</span>
            </p>
          </div>
          <Link
            to="/history/$sessionId"
            params={{ sessionId }}
            className="text-brand-pink text-sm underline hover:text-brand-pink/80 transition-colors"
          >
            Kembali ke Detail Sesi
          </Link>
        </div>

        {stats ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <Clock className="w-4 h-4" /> <span>Rata-Rata Latensi Total</span>
                </div>
                <div className="text-3xl font-bold text-ink">{stats.avgTotal} <span className="text-sm font-normal text-muted">ms</span></div>
              </div>
              <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <Zap className="w-4 h-4 text-brand-coral" /> <span>Latensi Maksimum</span>
                </div>
                <div className="text-3xl font-bold text-brand-coral">{stats.maxTotal} <span className="text-sm font-normal text-muted">ms</span></div>
              </div>
              <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <Target className="w-4 h-4 text-brand-mint" /> <span>Latensi Minimum</span>
                </div>
                <div className="text-3xl font-bold text-brand-mint">{stats.minTotal} <span className="text-sm font-normal text-muted">ms</span></div>
              </div>
              <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <Activity className="w-4 h-4 text-brand-blue" /> <span>Total Deteksi</span>
                </div>
                <div className="text-3xl font-bold text-ink">{stats.count}</div>
              </div>
            </div>

            {/* Breakdown Chart/Progress bars */}
            <div className="bg-surface-card border border-hairline rounded-xl p-8 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Rata-Rata Komposisi Latensi Pipeline</h2>
              
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-muted">Model Inference</div>
                  <div className="flex-1 h-3 bg-surface-soft rounded-full overflow-hidden">
                    <div className="h-full bg-brand-pink" style={{ width: `${Math.min(100, (parseFloat(stats.avgInference) / parseFloat(stats.avgTotal)) * 100)}%` }}></div>
                  </div>
                  <div className="w-16 text-right text-sm font-mono">{stats.avgInference}ms</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-muted">Optical Flow</div>
                  <div className="flex-1 h-3 bg-surface-soft rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue" style={{ width: `${Math.min(100, (parseFloat(stats.avgFlow) / parseFloat(stats.avgTotal)) * 100)}%` }}></div>
                  </div>
                  <div className="w-16 text-right text-sm font-mono">{stats.avgFlow}ms</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-muted">Landmark</div>
                  <div className="flex-1 h-3 bg-surface-soft rounded-full overflow-hidden">
                    <div className="h-full bg-brand-mint" style={{ width: `${Math.min(100, (parseFloat(stats.avgLandmark) / parseFloat(stats.avgTotal)) * 100)}%` }}></div>
                  </div>
                  <div className="w-16 text-right text-sm font-mono">{stats.avgLandmark}ms</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-muted">WebRTC</div>
                  <div className="flex-1 h-3 bg-surface-soft rounded-full overflow-hidden">
                    <div className="h-full bg-brand-coral" style={{ width: `${Math.min(100, (parseFloat(stats.avgWebrtc) / parseFloat(stats.avgTotal)) * 100)}%` }}></div>
                  </div>
                  <div className="w-16 text-right text-sm font-mono">{stats.avgWebrtc}ms</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-muted">Phase Spotting</div>
                  <div className="flex-1 h-3 bg-surface-soft rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${Math.min(100, (parseFloat(stats.avgSpotting) / parseFloat(stats.avgTotal)) * 100)}%` }}></div>
                  </div>
                  <div className="w-16 text-right text-sm font-mono">{stats.avgSpotting}ms</div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-surface-card border border-hairline rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-hairline bg-surface-soft">
                <h2 className="text-lg font-semibold text-ink">Rincian Latensi per Deteksi</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b border-hairline">
                    <tr>
                      <th className="p-4 font-semibold text-muted">Detection ID</th>
                      <th className="p-4 font-semibold text-muted text-right">WebRTC</th>
                      <th className="p-4 font-semibold text-muted text-right">Landmark</th>
                      <th className="p-4 font-semibold text-muted text-right">Flow</th>
                      <th className="p-4 font-semibold text-muted text-right">Spotting</th>
                      <th className="p-4 font-semibold text-muted text-right">Inference</th>
                      <th className="p-4 font-semibold text-ink text-right">Total Latensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {latencies.map((l) => (
                      <tr key={l.detection_id} className="bg-white hover:bg-surface-soft/50 transition-colors">
                        <td className="p-4 text-ink font-mono text-xs">{l.detection_id}</td>
                        <td className="p-4 text-ink text-right font-mono">{l.webrtc_latency_avg_ms}</td>
                        <td className="p-4 text-ink text-right font-mono">{l.landmark_latency_avg_ms}</td>
                        <td className="p-4 text-ink text-right font-mono">{l.flow_latency_avg_ms}</td>
                        <td className="p-4 text-ink text-right font-mono">{l.spotting_latency_ms}</td>
                        <td className="p-4 text-ink text-right font-mono">{l.model_inference_latency_ms}</td>
                        <td className="p-4 font-bold text-ink text-right font-mono">{l.total_latency_ms} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-surface-card rounded-xl border border-hairline shadow-sm">
            <p className="text-muted">Tidak ada data latensi untuk sesi ini.</p>
          </div>
        )}
      </div>
    </div>
  )
}
