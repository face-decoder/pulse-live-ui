import { Activity, AlertTriangle, BarChart2, Info } from 'lucide-react'
import { cn } from '#/lib/utils'
import type { PredictionResult } from '#/types'
import { MicroExpressionStressLabel } from './micro-expression-stress-label'
import { MicroExpressionConfidenceBar } from './micro-expression-confidence-bar'
import { MicroExpressionProbabilityBar } from './micro-expression-probability-bar'
import { MicroExpressionStatChip } from './micro-expression-stat-chip'
import { MicroExpressionFeatureItem } from './micro-expression-feature-item'

export interface MicroExpressionPredictionResultCardProps {
  prediction: PredictionResult
  className?: string
}

export default function MicroExpressionPredictionResultCard({
  prediction,
  className,
}: MicroExpressionPredictionResultCardProps) {
  const hasStats =
    prediction.n_frames !== undefined ||
    prediction.n_apex_detected !== undefined ||
    prediction.latency_ms !== undefined

  const hasFeatures =
    prediction.top_features && prediction.top_features.length > 0

  return (
    <div
      className={cn(
        'w-72 overflow-hidden rounded-xl border border-brand-lavender bg-brand-lavender text-ink p-4 shadow-xl select-none',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-ink/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-ink/10 bg-canvas">
            <Activity size={14} className="text-brand-teal" />
          </div>
          <span className="text-sm font-bold text-ink">Micro-Expression</span>
        </div>
        <MicroExpressionStressLabel label={prediction.label} />
      </div>

      <div className="space-y-4 pt-3">
        {prediction.confidence !== undefined && (
          <MicroExpressionConfidenceBar value={prediction.confidence} />
        )}

        {prediction.prob_high !== undefined &&
          prediction.prob_low !== undefined && (
            <MicroExpressionProbabilityBar
              probHigh={prediction.prob_high}
              probLow={prediction.prob_low}
            />
          )}

        {hasStats && (
          <div className="flex gap-2">
            {prediction.n_frames !== undefined && (
              <MicroExpressionStatChip
                label="Frames"
                value={prediction.n_frames}
              />
            )}
            {prediction.n_apex_detected !== undefined && (
              <MicroExpressionStatChip
                label="Apex"
                value={prediction.n_apex_detected}
              />
            )}
            {prediction.latency_ms !== undefined && (
              <MicroExpressionStatChip
                label="Latency"
                value={`${prediction.latency_ms.toFixed(1)}ms`}
              />
            )}
          </div>
        )}

        {hasFeatures && (
          <div className="border-t border-ink/10 pt-3">
            <div className="mb-2 flex items-center gap-1.5">
              <BarChart2 size={11} className="text-ink/40" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40">
                Key Features
              </span>
            </div>
            <ul className="space-y-2.5">
              {prediction.top_features!.map((feature, idx) => (
                <MicroExpressionFeatureItem key={idx} feature={feature} />
              ))}
            </ul>
          </div>
        )}

        {prediction.warning && (
          <div className="flex items-start gap-2 rounded-md border border-brand-coral/20 bg-canvas p-2">
            <AlertTriangle
              size={12}
              className="mt-0.5 shrink-0 text-brand-coral"
            />
            <p className="text-[10px] leading-relaxed text-ink/80">
              {prediction.warning}
            </p>
          </div>
        )}

        {prediction.message && (
          <div className="flex items-start gap-2 rounded-md border border-ink/5 bg-canvas p-2">
            <Info size={12} className="mt-0.5 shrink-0 text-ink/40" />
            <p className="text-[10px] leading-relaxed text-ink/75">
              {prediction.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
