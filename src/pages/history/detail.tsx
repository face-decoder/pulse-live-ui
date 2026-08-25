import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useSessionDetections } from '#/features/history/services/use-session-detections'
import { getErrorMessage } from '#/lib/api'
import {
  mergeSessionDetections,
  formatStatusLabel,
  isHighAnxietyLabel,
} from '#/lib/detection'
import { MotionTelemetryChart } from '#/features/micro-expression/components/motion-telemetry-chart'
import { Loader2, Activity } from 'lucide-react'

export default function HistoryDetailPage({
  sessionId,
}: {
  sessionId: string
}) {
  const { data, error, isPending } = useSessionDetections(sessionId)
  const detections = useMemo(() => data?.detections ?? [], [data])

  const mergedData = useMemo(
    () => mergeSessionDetections(detections),
    [detections],
  )

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
      <div className="w-full max-w-[95vw] mx-auto bg-surface-card border border-hairline rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Detail Sesi:{' '}
            <span className="font-mono text-lg font-normal bg-surface-soft px-2 py-1 rounded ml-2 border border-hairline">
              {sessionId}
            </span>
          </h1>
          <div className="flex gap-4 items-center">
            <Link
              to="/history/$sessionId/latency"
              params={{ sessionId }}
              className="flex items-center gap-2 bg-surface-soft hover:bg-surface-soft/80 border border-hairline px-4 py-2 rounded-lg text-sm transition-colors text-ink font-medium shadow-sm"
            >
              <Activity className="w-4 h-4 text-brand-blue" />
              Lihat Dashboard Latensi
            </Link>
            <Link
              to="/history"
              className="text-brand-pink text-sm underline hover:text-brand-pink/80 transition-colors"
            >
              Kembali ke Riwayat
            </Link>
          </div>
        </div>

        {mergedData && mergedData.smoothed.length > 0 ? (
          <div className="space-y-8">
            <div className="p-4 border border-hairline rounded bg-surface-soft">
              <MotionTelemetryChart
                magnitudes={[]}
                smoothedMagnitudes={mergedData.smoothed}
                detectedPhases={mergedData.phases}
                chunks={mergedData.chunks}
              />
            </div>

            <div className="bg-surface-card border border-hairline rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-soft border-b border-hairline">
                    <tr>
                      <th className="p-3 px-4 font-semibold text-muted">No.</th>
                      <th className="p-3 px-4 font-semibold text-muted">
                        Detection ID
                      </th>
                      <th className="p-3 px-4 font-semibold text-muted">
                        Waktu (Detik)
                      </th>
                      <th className="p-3 px-4 font-semibold text-muted">
                        Latency (ms)
                      </th>
                      <th className="p-3 px-4 font-semibold text-muted">
                        Hasil Deteksi
                      </th>
                      <th className="p-3 px-4 font-semibold text-muted">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {detections.map((detection, i) => {
                      const startTime = (i * 1.5).toFixed(1)
                      const endTime = ((i + 1) * 1.5).toFixed(1)

                      return (
                        <tr
                          key={detection.detection_id ?? i}
                          className="bg-white hover:bg-surface-soft/50 transition-colors"
                        >
                          <td className="p-3 px-4 text-ink font-medium">
                            {i + 1}
                          </td>
                          <td className="p-3 px-4 text-ink font-mono text-xs">
                            {detection.detection_id || '-'}
                          </td>
                          <td className="p-3 px-4 text-ink">
                            {startTime}s - {endTime}s
                          </td>
                          <td className="p-3 px-4 text-ink">
                            {detection.latency_ms ?? '-'}
                          </td>
                          <td className="p-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                isHighAnxietyLabel(detection.label)
                                  ? 'bg-brand-coral/20 text-brand-coral'
                                  : 'bg-brand-mint/20 text-brand-mint'
                              }`}
                            >
                              {formatStatusLabel(detection.label)}
                            </span>
                          </td>
                          <td className="p-3 px-4 text-ink font-mono">
                            {detection.confidence !== undefined
                              ? `${(detection.confidence * 100).toFixed(1)}%`
                              : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-soft rounded-xl border border-hairline border-dashed">
            <p className="text-muted">Tidak ada data untuk sesi ini.</p>
          </div>
        )}
      </div>
    </div>
  )
}
