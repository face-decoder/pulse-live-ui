import {
  Activity,
  AlertTriangle,
  BarChart2,
  Info,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import type { PredictionResult, TopPredictedFeature } from '#/types'
import { useMemo } from 'react'

export interface MicroExpressionPredictionResultCardProps {
  prediction: PredictionResult
  className?: string
}

export interface MicroExpressionStressLabelProps {
  label?: string
}

export function MicroExpressionStressLabel({ label }: MicroExpressionStressLabelProps) {
  const normalized = label?.toLowerCase()
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-widest uppercase border',
        !normalized && 'bg-ink/10 text-ink/60 border-ink/10',
        normalized === 'high' && 'bg-brand-pink/20 text-brand-pink border-brand-pink/30',
        normalized === 'low' && 'bg-brand-mint/30 text-brand-teal border-brand-mint/40',
      )}
    >
      {label ?? 'Unknown'}
    </span>
  )
}

export interface MicroExpressionConfidenceBarProps {
  value: number
}

export function MicroExpressionConfidenceBar({ value }: MicroExpressionConfidenceBarProps) {
  const pct = Math.round(value * 100)

  const barColor = useMemo(() => {
    if (value < 0.5) return 'bg-brand-coral'
    if (value < 0.75) return 'bg-brand-ochre'
    return 'bg-brand-teal'
  }, [value])

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-ink/60">Confidence</span>
        <span className="font-bold text-ink">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            barColor,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export interface MicroExpressionProbabilityBarProps {
  probHigh: number
  probLow: number
}

export function MicroExpressionProbabilityBar({ probHigh, probLow }: MicroExpressionProbabilityBarProps) {
  const highPct = (probHigh * 100).toFixed(1)
  const lowPct = (probLow * 100).toFixed(1)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-medium">
        <span className="font-bold text-brand-pink">High {highPct}%</span>
        <span className="text-ink/40 uppercase tracking-wider text-[9px]">
          Stress probability
        </span>
        <span className="font-bold text-brand-teal">Low {lowPct}%</span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-l-full bg-brand-pink transition-all duration-500"
          style={{ width: `${highPct}%` }}
        />
        <div className="h-full flex-1 rounded-r-full bg-brand-mint" />
      </div>
    </div>
  )
}

function MicroExpressionStatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 rounded-md bg-canvas/80 border border-ink/5 px-1 py-1.5 min-w-0">
      <span className="text-xs font-bold text-ink truncate w-full text-center">{value}</span>
      <span className="text-center text-[8px] font-semibold leading-tight text-ink/50 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

function MicroExpressionFeatureItem({ feature }: { feature: TopPredictedFeature }) {
  const isIncreasing = feature.direction === 'increasing'
  const saliencyPct = (feature.saliency * 100).toFixed(1)

  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {isIncreasing ? (
            <TrendingUp size={11} className="shrink-0 text-brand-pink" />
          ) : (
            <TrendingDown size={11} className="shrink-0 text-brand-teal" />
          )}
          <span className="truncate text-xs font-medium text-ink/80">
            {feature.name}
          </span>
        </div>
        <span
          className={cn(
            'shrink-0 font-mono text-[10px] font-bold',
            isIncreasing ? 'text-brand-pink' : 'text-brand-teal',
          )}
        >
          {saliencyPct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isIncreasing ? 'bg-brand-pink' : 'bg-brand-teal',
          )}
          style={{ width: `${saliencyPct}%` }}
        />
      </div>
    </li>
  )
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-ink/10 bg-canvas">
            <Activity size={14} className="text-brand-teal" />
          </div>
          <span className="text-sm font-bold text-ink">
            Micro-Expression
          </span>
        </div>
        <MicroExpressionStressLabel label={prediction.label} />
      </div>

      {/* Body */}
      <div className="space-y-4 pt-3">
        {/* Confidence */}
        {prediction.confidence !== undefined && (
          <MicroExpressionConfidenceBar value={prediction.confidence} />
        )}

        {/* Probability distribution */}
        {prediction.prob_high !== undefined &&
          prediction.prob_low !== undefined && (
            <MicroExpressionProbabilityBar
              probHigh={prediction.prob_high}
              probLow={prediction.prob_low}
            />
          )}

        {/* Stats */}
        {hasStats && (
          <div className="flex gap-2">
            {prediction.n_frames !== undefined && (
              <MicroExpressionStatChip label="Frames" value={prediction.n_frames} />
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

        {/* Top features */}
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

        {/* Warning */}
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

        {/* Message */}
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

