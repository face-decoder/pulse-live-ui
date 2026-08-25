import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useCaptureSummary } from '#/features/summary/services/use-capture-summary'
import { mergeSessionDetections } from '#/lib/detection'
import { MotionTelemetryChart } from '#/features/micro-expression/components/motion-telemetry-chart'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { DetectionLabelBadge } from '#/components/detection-label-badge'
import { PageLoader } from '#/components/page-loader'
import { QueryErrorState } from '#/components/query-error-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

export default function SummaryPage() {
  const { data, error, isPending } = useCaptureSummary()
  const detections = data?.detections ?? []

  const mergedData = useMemo(
    () => mergeSessionDetections(detections),
    [detections],
  )

  if (isPending) return <PageLoader />

  if (error) return <QueryErrorState error={error} />

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <Card className="w-full max-w-[95vw] mx-auto p-8">
        <CardHeader>
          <CardTitle className="text-2xl">Capture Summary Timeline</CardTitle>
          <Link
            to="/"
            className="text-brand-pink text-sm underline hover:text-brand-pink/80 transition-colors"
          >
            Back to Capture
          </Link>
        </CardHeader>

        <CardContent>
          {mergedData && mergedData.smoothed.length > 0 ? (
            <div className="space-y-8">
              <div className="p-4 border rounded-md bg-accent">
                <MotionTelemetryChart
                  magnitudes={[]}
                  smoothedMagnitudes={mergedData.smoothed}
                  detectedPhases={mergedData.phases}
                  chunks={mergedData.chunks}
                />
              </div>

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
                    {mergedData.chunks.map((chunk, i) => (
                      <TableRow key={i}>
                        <TableCell className="px-4 font-medium">
                          {i + 1}
                        </TableCell>
                        <TableCell className="px-4">
                          {(i * 1.5).toFixed(1)}s - {((i + 1) * 1.5).toFixed(1)}
                          s
                        </TableCell>
                        <TableCell className="px-4">
                          {chunk.latency_ms ?? '-'}
                        </TableCell>
                        <TableCell className="px-4">
                          <DetectionLabelBadge label={chunk.label} />
                        </TableCell>
                        <TableCell className="px-4 font-mono">
                          {chunk.confidence !== undefined
                            ? `${(chunk.confidence * 100).toFixed(1)}%`
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No predictions found in the log.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
