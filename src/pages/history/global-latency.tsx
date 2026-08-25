import { Link } from '@tanstack/react-router'
import { useGlobalLatencySummary } from '#/features/history/services/use-global-latency-summary'
import { getErrorMessage } from '#/lib/api'
import { Loader2, Activity, Zap, Database, Clock } from 'lucide-react'
import { Card } from '#/components/ui/card'

interface PipelineStage {
  label: string
  value: number
  barClass: string
}

export default function GlobalLatencyPage() {
  const { data, error, isPending } = useGlobalLatencySummary()

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

  const {
    total_detections_analyzed: totalDetections,
    global_averages: averages,
  } = data

  const stages: PipelineStage[] = [
    {
      label: 'Model Inference',
      value: averages.model_inference_latency_ms,
      barClass: 'bg-brand-pink',
    },
    {
      label: 'Optical Flow',
      value: averages.flow_latency_avg_ms,
      barClass: 'bg-brand-blue',
    },
    {
      label: 'Landmark',
      value: averages.landmark_latency_avg_ms,
      barClass: 'bg-brand-mint',
    },
    {
      label: 'WebRTC',
      value: averages.webrtc_latency_avg_ms,
      barClass: 'bg-brand-coral',
    },
    {
      label: 'Phase Spotting',
      value: averages.spotting_latency_ms,
      barClass: 'bg-yellow-400',
    },
  ]

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <div className="w-full max-w-[95vw] mx-auto space-y-6">
        <Card className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-ink">
              <Zap className="w-6 h-6 text-brand-coral" />
              Dashboard Latensi Global
            </h1>
            <p className="text-muted-foreground mt-2">
              Agregasi rata-rata latensi dari seluruh sesi dan deteksi yang
              pernah tercatat di sistem.
            </p>
          </div>
          <Link
            to="/history"
            className="text-brand-pink text-sm underline hover:text-brand-pink/80 transition-colors whitespace-nowrap"
          >
            Kembali ke Daftar Riwayat
          </Link>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-8 flex items-center gap-6">
            <div className="bg-brand-blue/10 p-4 rounded-full">
              <Database className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <div className="text-muted-foreground mb-1 font-medium">
                Total Deteksi Dianalisis
              </div>
              <div className="text-4xl font-bold text-ink">
                {totalDetections}
              </div>
            </div>
          </Card>

          <Card className="p-8 flex items-center gap-6">
            <div className="bg-brand-coral/10 p-4 rounded-full">
              <Clock className="w-8 h-8 text-brand-coral" />
            </div>
            <div>
              <div className="text-muted-foreground mb-1 font-medium">
                Rata-Rata Latensi Total (Global)
              </div>
              <div className="text-4xl font-bold text-brand-coral">
                {averages.total_latency_ms.toFixed(2)}{' '}
                <span className="text-lg font-normal text-muted-foreground">
                  ms
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-blue" />
            Komposisi Latensi Pipeline Global
          </h2>

          <div className="space-y-6 max-w-3xl">
            {stages.map((stage) => (
              <div
                key={stage.label}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="w-40 text-sm font-medium text-muted-foreground">
                  {stage.label}
                </div>
                <div className="flex-1 h-4 bg-surface-soft rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${stage.barClass}`}
                    style={{
                      width: `${Math.min(100, (stage.value / averages.total_latency_ms) * 100)}%`,
                    }}
                  />
                </div>
                <div className="w-20 text-right text-sm font-mono font-bold">
                  {stage.value.toFixed(2)}ms
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
