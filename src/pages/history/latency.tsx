import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useSessionLatencies } from '#/features/history/services/use-session-latencies'
import { getErrorMessage } from '#/lib/api'
import { computeLatencyStats } from '#/lib/detection'
import { Loader2, Activity, Clock, Zap, Target } from 'lucide-react'

interface LatencyStage {
  label: string
  avgMs: string
  avgTotal: string
  barClass: string
}

export default function HistoryLatencyPage({
  sessionId,
}: {
  sessionId: string
}) {
  const { data, error, isPending } = useSessionLatencies(sessionId)
  const latencies = useMemo(() => data?.latencies ?? [], [data])

  const stats = useMemo(() => computeLatencyStats(latencies), [latencies])

  const stages: LatencyStage[] | null = useMemo(() => {
    if (!stats) return null
    return [
      {
        label: 'Model Inference',
        avgMs: stats.avgInference,
        avgTotal: stats.avgTotal,
        barClass: 'bg-brand-pink',
      },
      {
        label: 'Optical Flow',
        avgMs: stats.avgFlow,
        avgTotal: stats.avgTotal,
        barClass: 'bg-brand-blue',
      },
      {
        label: 'Landmark',
        avgMs: stats.avgLandmark,
        avgTotal: stats.avgTotal,
        barClass: 'bg-brand-mint',
      },
      {
        label: 'WebRTC',
        avgMs: stats.avgWebrtc,
        avgTotal: stats.avgTotal,
        barClass: 'bg-brand-coral',
      },
      {
        label: 'Phase Spotting',
        avgMs: stats.avgSpotting,
        avgTotal: stats.avgTotal,
        barClass: 'bg-yellow-400',
      },
    ]
  }, [stats])

  if (isPending)
    return (
      <div className="p-8 text-center text-ink flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-brand-pink" />
      </div>
    )

  if (error)
    return (
      <div className="p-8 text-center text-brand-coral">
        Error: {getErrorMessage(error)}
      </div>
    )

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <div className="w-full max-w-[95vw] mx-auto space-y-6">
        <div className="bg-surface-card border border-hairline rounded-xl p-8 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-brand-blue" />
              Dashboard Latensi Sesi
            </h1>
            <p className="text-muted mt-2 flex items-center gap-2">
              Sesi:{' '}
              <span className="font-mono text-sm bg-surface-soft px-2 py-1 rounded border border-hairline">
                {sessionId}
              </span>
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

        {stats && stages ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <Clock className="w-4 h-4" />{' '}
                  <span>Rata-Rata Latensi Total</span>
                </div>
                <div className="text-3xl font-bold text-ink">
                  {stats.avgTotal}{' '}
                  <span className="text-sm font-normal text-muted">ms</span>
                </div>
              </div>
              <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <Zap className="w-4 h-4 text-brand-coral" />{' '}
                  <span>Latensi Maksimum</span>
                </div>
                <div className="text-3xl font-bold text-brand-coral">
                  {stats.maxTotal}{' '}
                  <span className="text-sm font-normal text-muted">ms</span>
                </div>
              </div>
              <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <Target className="w-4 h-4 text-brand-mint" />{' '}
                  <span>Latensi Minimum</span>
                </div>
                <div className="text-3xl font-bold text-brand-mint">
                  {stats.minTotal}{' '}
                  <span className="text-sm font-normal text-muted">ms</span>
                </div>
              </div>
              <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <Activity className="w-4 h-4 text-brand-blue" />{' '}
                  <span>Total Deteksi</span>
                </div>
                <div className="text-3xl font-bold text-ink">{stats.count}</div>
              </div>
            </div>

            <div className="bg-surface-card border border-hairline rounded-xl p-8 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">
                Rata-Rata Komposisi Latensi Pipeline
              </h2>

              <div className="space-y-4 max-w-2xl">
                {stages.map((stage) => (
                  <div key={stage.label} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-muted">
                      {stage.label}
                    </div>
                    <div className="flex-1 h-3 bg-surface-soft rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stage.barClass}`}
                        style={{
                          width: `${Math.min(100, (parseFloat(stage.avgMs) / parseFloat(stage.avgTotal)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-mono">
                      {stage.avgMs}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-card border border-hairline rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-hairline bg-surface-soft">
                <h2 className="text-lg font-semibold text-ink">
                  Rincian Latensi per Deteksi
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b border-hairline">
                    <tr>
                      <th className="p-4 font-semibold text-muted">
                        Detection ID
                      </th>
                      <th className="p-4 font-semibold text-muted text-right">
                        WebRTC
                      </th>
                      <th className="p-4 font-semibold text-muted text-right">
                        Landmark
                      </th>
                      <th className="p-4 font-semibold text-muted text-right">
                        Flow
                      </th>
                      <th className="p-4 font-semibold text-muted text-right">
                        Spotting
                      </th>
                      <th className="p-4 font-semibold text-muted text-right">
                        Inference
                      </th>
                      <th className="p-4 font-semibold text-ink text-right">
                        Total Latensi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {latencies.map((l) => (
                      <tr
                        key={l.detection_id}
                        className="bg-white hover:bg-surface-soft/50 transition-colors"
                      >
                        <td className="p-4 text-ink font-mono text-xs">
                          {l.detection_id}
                        </td>
                        <td className="p-4 text-ink text-right font-mono">
                          {l.webrtc_latency_avg_ms}
                        </td>
                        <td className="p-4 text-ink text-right font-mono">
                          {l.landmark_latency_avg_ms}
                        </td>
                        <td className="p-4 text-ink text-right font-mono">
                          {l.flow_latency_avg_ms}
                        </td>
                        <td className="p-4 text-ink text-right font-mono">
                          {l.spotting_latency_ms}
                        </td>
                        <td className="p-4 text-ink text-right font-mono">
                          {l.model_inference_latency_ms}
                        </td>
                        <td className="p-4 font-bold text-ink text-right font-mono">
                          {l.total_latency_ms} ms
                        </td>
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
