import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useMemo } from 'react'
import { env } from '#/env'
import { MotionTelemetryChart } from '#/features/micro-expression/components/motion-telemetry-chart'
import { uploadFileOverWebSocket } from '#/lib/chunked-upload'
import { formatStatusLabel, isHighAnxietyLabel } from '#/lib/detection'
import type { PredictionResult, TelemetryChunk } from '#/types'
import { Card, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

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
      <Card className="w-full max-w-[95vw] mx-auto p-8">
        <CardHeader>
          <CardTitle className="text-2xl">Video Analysis Upload</CardTitle>
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
        </CardHeader>

        <div className="mb-8 p-4 border rounded-md bg-accent flex items-center justify-between">
          <input
            type="file"
            accept="video/webm"
            onChange={handleUpload}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-brand-coral transition-colors"
          />
          <span className="font-mono text-sm text-muted-foreground">
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
            <div className="p-4 border rounded-md bg-accent mb-8">
              <MotionTelemetryChart
                magnitudes={summary.magnitudes ?? []}
                smoothedMagnitudes={summary.smoothed_magnitudes}
                detectedPhases={summary.detected_phases ?? []}
                chunks={chartChunks}
              />
            </div>
          )}

        {predictions.length > 0 && (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">No.</TableHead>
                  <TableHead className="px-4">Waktu (Detik)</TableHead>
                  <TableHead className="px-4">Latency (ms)</TableHead>
                  <TableHead className="px-4">Hasil Deteksi</TableHead>
                  <TableHead className="px-4">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-4 font-medium">{i + 1}</TableCell>
                    <TableCell className="px-4">
                      {(i * 1.5).toFixed(1)}s - {((i + 1) * 1.5).toFixed(1)}s
                    </TableCell>
                    <TableCell className="px-4">{p.latency_ms ?? 0}</TableCell>
                    <TableCell className="px-4">
                      <Badge
                        className={
                          isHighAnxietyLabel(p.label)
                            ? 'bg-brand-coral/20 text-brand-coral hover:bg-brand-coral/20'
                            : 'bg-brand-mint/30 text-brand-teal hover:bg-brand-mint/30'
                        }
                      >
                        {formatStatusLabel(p.label)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 font-mono">
                      {p.confidence !== undefined
                        ? `${(p.confidence * 100).toFixed(1)}%`
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Card>
    </div>
  )
}
