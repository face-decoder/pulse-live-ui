import { useEffect, useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { env } from '#/env'
import { MotionTelemetryChart } from '#/features/micro-expression/components/motion-telemetry-chart'

export default function SummaryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const baseUrl = env.VITE_SOCKET_URL.replace('ws://', 'http://')
      .replace('wss://', 'https://')
      .split('/ws')[0]
    fetch(`${baseUrl}/logs/summary`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }, [])

  const mergedData = useMemo(() => {
    if (!data || data.length === 0) return null

    let offsetAcc = 0
    const mergedSmoothed: number[] = []
    const mergedPhases: any[] = []
    const chunks: any[] = []

    data.forEach((d: any) => {
      const len = (d.smoothed_magnitudes || []).length

      mergedSmoothed.push(...(d.smoothed_magnitudes || []))

      if (d.detected_phases) {
        d.detected_phases.forEach((p: any) => {
          mergedPhases.push({
            onset: p.onset + offsetAcc,
            apex: p.apex + offsetAcc,
            offset: p.offset + offsetAcc,
          })
        })
      }

      chunks.push({
        startIndex: offsetAcc,
        endIndex: offsetAcc + len - 1,
        label: d.label,
        confidence: d.confidence,
        latency_ms: d.latency_ms,
      })

      offsetAcc += len
    })

    return {
      smoothed: mergedSmoothed,
      phases: mergedPhases,
      chunks: chunks,
    }
  }, [data])

  if (loading)
    return <div className="p-8 text-center text-ink">Loading summary...</div>

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <div className="w-full max-w-[95vw] mx-auto bg-surface-card border border-hairline rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Capture Summary Timeline</h1>
        <Link
          to="/"
          className="text-brand-pink text-sm underline mb-8 inline-block"
        >
          Back to Capture
        </Link>

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
                    {mergedData.chunks.map((chunk: any, i: number) => {
                      const startTime = (i * 1.5).toFixed(1)
                      const endTime = ((i + 1) * 1.5).toFixed(1)

                      const formatLabel = (lbl: string) => {
                        if (lbl === 'anxiety_tinggi') return 'Anxiety Tinggi'
                        if (lbl === 'anxiety_rendah') return 'Anxiety Rendah'
                        return lbl.toUpperCase()
                      }

                      const isHigh =
                        chunk.label === 'high' ||
                        chunk.label === 'anxiety_tinggi'

                      return (
                        <tr
                          key={i}
                          className="bg-white hover:bg-surface-soft/50 transition-colors"
                        >
                          <td className="p-3 px-4 text-ink font-medium">
                            {i + 1}
                          </td>
                          <td className="p-3 px-4 text-ink">
                            {startTime}s - {endTime}s
                          </td>
                          <td className="p-3 px-4 text-ink">
                            {chunk.latency_ms}
                          </td>
                          <td className="p-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                isHigh
                                  ? 'bg-brand-coral/20 text-brand-coral'
                                  : 'bg-brand-mint/20 text-brand-mint'
                              }`}
                            >
                              {formatLabel(chunk.label)}
                            </span>
                          </td>
                          <td className="p-3 px-4 text-ink font-mono">
                            {(chunk.confidence * 100).toFixed(1)}%
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
          <p className="text-muted">No predictions found in the log.</p>
        )}
      </div>
    </div>
  )
}
