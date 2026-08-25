import { Link } from '@tanstack/react-router'
import { useGlobalLatencySummary } from '#/features/history/services/use-global-latency-summary'
import { Activity, Zap, Database, Clock } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { StatCard } from '#/components/stat-card'
import { LabeledProgressBar } from '#/components/labeled-progress-bar'
import { PageLoader } from '#/components/page-loader'
import { QueryErrorState } from '#/components/query-error-state'

interface PipelineStage {
  label: string
  value: number
  barClass: string
}

export default function GlobalLatencyPage() {
  const { data, error, isPending } = useGlobalLatencySummary()

  if (isPending) return <PageLoader />

  if (error) return <QueryErrorState error={error} />

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
          <StatCard
            size="lg"
            icon={Database}
            iconClass="bg-brand-blue/10 text-brand-blue"
            label="Total Deteksi Dianalisis"
            value={String(totalDetections)}
          />

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
              <LabeledProgressBar
                key={stage.label}
                layout="responsive"
                labelWidth="md"
                trackSize="md"
                label={stage.label}
                value={stage.value}
                maxValue={averages.total_latency_ms}
                barClass={stage.barClass}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
