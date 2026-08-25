import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useSessionDetections } from '#/features/history/services/use-session-detections'
import { mergeSessionDetections } from '#/lib/detection'
import { MotionTelemetryChart } from '#/features/micro-expression/components/motion-telemetry-chart'
import { Activity } from 'lucide-react'
import { Button } from '#/components/ui/button'
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

  if (isPending) return <PageLoader />

  if (error) return <QueryErrorState error={error} />

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <Card className="w-full max-w-[95vw] mx-auto p-8">
        <CardHeader>
          <div className="flex justify-between items-center gap-4">
            <CardTitle className="text-2xl">
              Detail Sesi:{' '}
              <span className="font-mono text-lg font-normal bg-accent px-2 py-1 rounded-md ml-2 border">
                {sessionId}
              </span>
            </CardTitle>
            <div className="flex gap-4 items-center">
              <Button variant="outline" asChild>
                <Link to="/history/$sessionId/latency" params={{ sessionId }}>
                  <Activity className="w-4 h-4 text-brand-blue" />
                  Lihat Dashboard Latensi
                </Link>
              </Button>
              <Link
                to="/history"
                className="text-brand-pink text-sm underline hover:text-brand-pink/80 transition-colors"
              >
                Kembali ke Riwayat
              </Link>
            </div>
          </div>
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
                      <TableHead className="px-4">Detection ID</TableHead>
                      <TableHead className="px-4">Waktu (Detik)</TableHead>
                      <TableHead className="px-4">Latency (ms)</TableHead>
                      <TableHead className="px-4">Hasil Deteksi</TableHead>
                      <TableHead className="px-4">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detections.map((detection, i) => (
                      <TableRow key={detection.detection_id ?? i}>
                        <TableCell className="px-4 font-medium">
                          {i + 1}
                        </TableCell>
                        <TableCell className="px-4 font-mono text-xs">
                          {detection.detection_id || '-'}
                        </TableCell>
                        <TableCell className="px-4">
                          {(i * 1.5).toFixed(1)}s - {((i + 1) * 1.5).toFixed(1)}
                          s
                        </TableCell>
                        <TableCell className="px-4">
                          {detection.latency_ms ?? '-'}
                        </TableCell>
                        <TableCell className="px-4">
                          <DetectionLabelBadge label={detection.label} />
                        </TableCell>
                        <TableCell className="px-4 font-mono">
                          {detection.confidence !== undefined
                            ? `${(detection.confidence * 100).toFixed(1)}%`
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 bg-accent rounded-xl border border-dashed">
              <p className="text-muted-foreground">
                Tidak ada data untuk sesi ini.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
