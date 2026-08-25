import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useMemo } from 'react'
import { env } from '#/env'
import { MotionTelemetryChart } from '#/features/micro-expression/components/motion-telemetry-chart'
import { uploadFileOverWebSocket } from '#/lib/chunked-upload'
import { formatStatusLabel, isHighAnxietyLabel } from '#/lib/detection'
import type { PredictionResult, TelemetryChunk } from '#/types'

interface RollingSummary {
  total_windows: number
  anxiety_detected: number
  avg_confidence: number
  magnitudes?: number[]
  smoothed_magnitudes?: number[]
  detected_phases?: Array<{ onset: number; apex: number; offset: number }>
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error'

export const Route = createFileRoute('/upload')({
  component: VideoUploadRoute,
  head: () => ({ meta: [{ title: 'Video Analysis - Pulse Live' }] }),
})

function VideoUploadRoute() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [summary, setSummary] = useState<RollingSummary | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const wsRef = useRef<WebSocket | null>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPredictions([])
    setSummary(null)
    setStatus('uploading')
    const id = crypto.randomUUID()

    const ws = new WebSocket(`${env.VITE_SOCKET_URL}/video/${id}`)
    wsRef.current = ws

    ws.onopen = () => {
      uploadFileOverWebSocket(ws, file, {
        onComplete: () => setStatus('processing'),
        onError: () => setStatus('error'),
      })
    }

    ws.onmessage = (event) => {
      try {
        const data: unknown = JSON.parse(event.data as string)
        if (typeof data !== 'object' || data === null || !('type' in data))
          return

        if (data.type === 'prediction') {
          setPredictions((prev) => [...prev, data as PredictionResult])
        } else if (
          data.type === 'summary' &&
          'data' in data &&
          typeof data.data === 'object' &&
          data.data !== null
        ) {
          setSummary(data.data as RollingSummary)
        } else if (
          data.type === 'status' &&
          (data as { status?: string }).status === 'completed'
        ) {
          setStatus('completed')
        } else if (data.type === 'error') {
          setStatus('error')
        }
      } catch {}
    }
  }

  const chartChunks = useMemo<TelemetryChunk[]>(() => {
    const smoothedLength = summary?.smoothed_magnitudes?.length ?? 0
    if (smoothedLength === 0 || predictions.length === 0) return []

    const framesPerChunk = Math.floor(smoothedLength / predictions.length)
    return predictions.map((p, i) => ({
      startIndex: i * framesPerChunk,
      endIndex: (i + 1) * framesPerChunk - 1,
      label: p.label,
      confidence: p.confidence,
      latency_ms: p.latency_ms ?? 0,
    }))
  }, [summary, predictions])

  const statusLabel: Record<UploadStatus, string> = {
    idle: 'Idle',
    uploading: 'Uploading...',
    processing: 'Processing...',
    completed: 'Completed',
    error: 'Error',
  }

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <div className="w-full max-w-[95vw] mx-auto bg-surface-card border border-hairline rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Video Analysis Upload</h1>
        <Link
          to="/"
          className="text-brand-pink text-sm underline mb-8 inline-block mr-4"
        >
          Back to Capture
        </Link>
        <Link
          to="/summary"
          className="text-brand-pink text-sm underline mb-8 inline-block"
        >
          View Summary
        </Link>

        <div className="mb-8 p-4 border border-hairline rounded bg-surface-soft flex items-center justify-between">
          <input
            type="file"
            accept="video/webm"
            onChange={handleUpload}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-brand-coral transition-colors"
          />
          <span className="font-mono text-sm text-muted">
            {statusLabel[status]}
          </span>
        </div>

        {summary && (
          <div className="bg-brand-teal/10 border border-brand-teal/20 rounded-xl p-6 mb-8 text-brand-teal flex gap-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1">
                Total Windows
              </div>
              <div className="text-2xl font-mono">{summary.total_windows}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1">
                Anxiety Detected
              </div>
              <div className="text-2xl font-mono">
                {summary.anxiety_detected}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1">
                Avg Confidence
              </div>
              <div className="text-2xl font-mono">
                {(summary.avg_confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {summary &&
          summary.smoothed_magnitudes &&
          summary.smoothed_magnitudes.length > 0 && (
            <div className="p-4 border border-hairline rounded bg-surface-soft mb-8">
              <MotionTelemetryChart
                magnitudes={summary.magnitudes ?? []}
                smoothedMagnitudes={summary.smoothed_magnitudes}
                detectedPhases={summary.detected_phases ?? []}
                chunks={chartChunks}
              />
            </div>
          )}

        {predictions.length > 0 && (
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
                  {predictions.map((p, i) => {
                    const startTime = (i * 1.5).toFixed(1)
                    const endTime = ((i + 1) * 1.5).toFixed(1)

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
                          {p.latency_ms ?? 0}
                        </td>
                        <td className="p-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${isHighAnxietyLabel(p.label) ? 'bg-brand-coral/20 text-brand-coral' : 'bg-brand-mint/20 text-brand-mint'}`}
                          >
                            {formatStatusLabel(p.label)}
                          </span>
                        </td>
                        <td className="p-3 px-4 text-ink font-mono">
                          {p.confidence !== undefined
                            ? `${(p.confidence * 100).toFixed(1)}%`
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
