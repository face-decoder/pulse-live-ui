import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useMemo } from 'react'
import { env } from '#/env'
import { MotionTelemetryChart } from '#/features/micro-expression/components/motion-telemetry-chart'
import { uploadFileOverWebSocket } from '#/lib/chunked-upload'
import { VideoStatus } from '#/types'
import type { PredictionResult, TelemetryChunk } from '#/types'
import {
  errorMessageSchema,
  predictionResultSchema,
  videoStatusMessageSchema,
} from '#/lib/server-message'
import { z } from 'zod'
import { Card, CardHeader, CardTitle } from '#/components/ui/card'
import { DetectionLabelBadge } from '#/components/detection-label-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

const rollingSummarySchema = z.object({
  total_windows: z.number(),
  anxiety_detected: z.number(),
  avg_confidence: z.number(),
  magnitudes: z.array(z.number()).optional(),
  smoothed_magnitudes: z.array(z.number()).optional(),
  detected_phases: z
    .array(
      z.object({
        onset: z.number(),
        apex: z.number(),
        offset: z.number(),
      }),
    )
    .optional(),
})

type RollingSummary = z.infer<typeof rollingSummarySchema>

const uploadMessageSchema = z.discriminatedUnion('type', [
  predictionResultSchema,
  rollingSummarySchema.extend({ type: z.literal('summary') }),
  videoStatusMessageSchema,
  errorMessageSchema,
])

enum UploadStatus {
  Idle = 'idle',
  Uploading = 'uploading',
  Processing = 'processing',
  Completed = 'completed',
  Error = 'error',
}

export const Route = createFileRoute('/upload')({
  component: VideoUploadRoute,
  head: () => ({ meta: [{ title: 'Video Analysis - Pulse Live' }] }),
})

function VideoUploadRoute() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [summary, setSummary] = useState<RollingSummary | null>(null)
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.Idle)
  const wsRef = useRef<WebSocket | null>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPredictions([])
    setSummary(null)
    setStatus(UploadStatus.Uploading)
    const id = crypto.randomUUID()

    const ws = new WebSocket(`${env.VITE_SOCKET_URL}/video/${id}`)
    wsRef.current = ws

    ws.onopen = () => {
      uploadFileOverWebSocket(ws, file, {
        onComplete: () => setStatus(UploadStatus.Processing),
        onError: () => setStatus(UploadStatus.Error),
      })
    }

    ws.onmessage = (event) => {
      if (typeof event.data !== 'string') return

      let parsed: unknown
      try {
        parsed = JSON.parse(event.data)
      } catch {
        return
      }

      const result = uploadMessageSchema.safeParse(parsed)
      if (!result.success) return

      const message = result.data
      switch (message.type) {
        case 'prediction':
          setPredictions((prev) => [...prev, message])
          break
        case 'summary':
          setSummary(message)
          break
        case 'status':
          if (message.status === VideoStatus.Completed) {
            setStatus(UploadStatus.Completed)
          }
          break
        case 'error':
          setStatus(UploadStatus.Error)
          break
      }
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

  const statusLabels: Record<UploadStatus, string> = {
    [UploadStatus.Idle]: 'Idle',
    [UploadStatus.Uploading]: 'Uploading...',
    [UploadStatus.Processing]: 'Processing...',
    [UploadStatus.Completed]: 'Completed',
    [UploadStatus.Error]: 'Error',
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
            {statusLabels[status]}
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
                      <DetectionLabelBadge label={p.label} />
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
