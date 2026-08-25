import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useSessionLatencies } from '#/features/history/services/use-session-latencies'
import { getErrorMessage } from '#/lib/api'
import { computeLatencyStats } from '#/lib/detection'
import { Loader2, Activity, Clock, Zap, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

interface LatencyStage {
  label: string
  avgMs: string
  avgTotal: string
  barClass: string
}

interface LatencyKpi {
  icon: LucideIcon
  label: string
  value: string
  valueClass?: string
}

const kpis = (
  stats: NonNullable<ReturnType<typeof computeLatencyStats>>,
): LatencyKpi[] => [
  {
    icon: Clock,
    label: 'Rata-Rata Latensi Total',
    value: `${stats.avgTotal} ms`,
  },
  {
    icon: Zap,
    label: 'Latensi Maksimum',
    value: `${stats.maxTotal} ms`,
    valueClass: 'text-brand-coral',
  },
  {
    icon: Target,
    label: 'Latensi Minimum',
    value: `${stats.minTotal} ms`,
    valueClass: 'text-brand-mint',
  },
  { icon: Activity, label: 'Total Deteksi', value: String(stats.count) },
]

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
        <Card className="p-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-brand-blue" />
              Dashboard Latensi Sesi
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Sesi:{' '}
              <span className="font-mono text-sm bg-accent px-2 py-1 rounded-md border">
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
        </Card>

        {stats && stages ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {kpis(stats).map((kpi) => (
                <Card key={kpi.label} className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <kpi.icon className="w-4 h-4" /> <span>{kpi.label}</span>
                  </div>
                  <div
                    className={`text-3xl font-bold text-ink ${kpi.valueClass ?? ''}`}
                  >
                    {kpi.value}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-8">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Rata-Rata Komposisi Latensi Pipeline</CardTitle>
              </CardHeader>

              <CardContent className="px-0 pb-0">
                <div className="space-y-4 max-w-2xl">
                  {stages.map((stage) => (
                    <div key={stage.label} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-muted-foreground">
                        {stage.label}
                      </div>
                      <div className="flex-1 h-3 bg-accent rounded-full overflow-hidden">
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
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-accent">
                <CardTitle>Rincian Latensi per Deteksi</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-4">Detection ID</TableHead>
                    <TableHead className="p-4 text-right">WebRTC</TableHead>
                    <TableHead className="p-4 text-right">Landmark</TableHead>
                    <TableHead className="p-4 text-right">Flow</TableHead>
                    <TableHead className="p-4 text-right">Spotting</TableHead>
                    <TableHead className="p-4 text-right">Inference</TableHead>
                    <TableHead className="p-4 text-right">
                      Total Latensi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latencies.map((l) => (
                    <TableRow key={l.detection_id}>
                      <TableCell className="p-4 font-mono text-xs">
                        {l.detection_id}
                      </TableCell>
                      <TableCell className="p-4 text-right font-mono">
                        {l.webrtc_latency_avg_ms}
                      </TableCell>
                      <TableCell className="p-4 text-right font-mono">
                        {l.landmark_latency_avg_ms}
                      </TableCell>
                      <TableCell className="p-4 text-right font-mono">
                        {l.flow_latency_avg_ms}
                      </TableCell>
                      <TableCell className="p-4 text-right font-mono">
                        {l.spotting_latency_ms}
                      </TableCell>
                      <TableCell className="p-4 text-right font-mono">
                        {l.model_inference_latency_ms}
                      </TableCell>
                      <TableCell className="p-4 font-bold text-right font-mono">
                        {l.total_latency_ms} ms
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </>
        ) : (
          <Card className="text-center py-12">
            <p className="text-muted-foreground">
              Tidak ada data latensi untuk sesi ini.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
