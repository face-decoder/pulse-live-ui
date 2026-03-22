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

// prettier-ignore
export function MicroExpressionStressLabel({ label }: MicroExpressionStressLabelProps) {
  const normalized = label?.toLowerCase()
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-widest uppercase border',
        !normalized && 'bg-white/10 text-white/40 border-white/10',
        normalized === 'high' && 'bg-red-500/20 text-red-400 border-red-500/30',
        normalized === 'low' && 'bg-green-500/20 text-green-400 border-green-500/30',
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

  // prettier-ignore
  const barColor = useMemo(() => {
    if (value < 0.5) return 'bg-red-500'
    if (value < 0.75) return 'bg-yellow-500'
    return 'bg-[#4fb8b2]'
  }, [value])

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">Confidence</span>
        <span className="font-semibold text-white/90">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
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

// prettier-ignore
export function MicroExpressionProbabilityBar({ probHigh, probLow }: MicroExpressionProbabilityBarProps) {

  const highPct = (probHigh * 100).toFixed(1)
  const lowPct = (probLow * 100).toFixed(1)

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px]">
        <span className="font-semibold text-red-400">High {highPct}%</span>
        <span className="text-white/30 uppercase tracking-wider">
          Stress probability
        </span>
        <span className="font-semibold text-green-400">Low {lowPct}%</span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-l-full bg-red-500/70 transition-all duration-500"
          style={{ width: `${highPct}%` }}
        />
        <div className="h-full flex-1 rounded-r-full bg-green-500/70 transition-all duration-500" />
      </div>
    </div>
  )
}

function MicroExpressionStatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-white/5 px-3 py-2">
      <span className="text-sm font-bold text-white/90">{value}</span>
      <span className="text-center text-[10px] leading-tight text-white/40">
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
            <TrendingUp size={11} className="shrink-0 text-red-400" />
          ) : (
            <TrendingDown size={11} className="shrink-0 text-green-400" />
          )}
          <span className="truncate text-xs font-medium text-white/80">
            {feature.name}
          </span>
        </div>
        <span
          className={cn(
            'shrink-0 font-mono text-[10px] font-semibold',
            isIncreasing ? 'text-red-400' : 'text-green-400',
          )}
        >
          {saliencyPct}%
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isIncreasing ? 'bg-red-400/60' : 'bg-green-400/60',
          )}
          style={{ width: `${saliencyPct}%` }}
        />
      </div>
    </li>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MicroExpressionPredictionResultCard({
  prediction,
  className,
}: MicroExpressionPredictionResultCardProps) {
  const hasStats =
    prediction.n_frames !== undefined ||
    prediction.n_apex_detected !== undefined

  const hasFeatures =
    prediction.top_features && prediction.top_features.length > 0

  return (
    <div
      className={cn(
        'w-72 overflow-hidden rounded-2xl border border-white/10 bg-black/60 text-white shadow-2xl backdrop-blur-xl',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#4fb8b2]/30 bg-[#4fb8b2]/15">
            <Activity size={14} className="text-[#4fb8b2]" />
          </div>
          <span className="text-sm font-semibold text-white/90">
            Micro-Expression
          </span>
        </div>
        <MicroExpressionStressLabel label={prediction.label} />
      </div>

      {/* Body */}
      <div className="space-y-3 px-4 py-3">
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
                label="Apex Detected"
                value={prediction.n_apex_detected}
              />
            )}
          </div>
        )}

        {/* Top features */}
        {hasFeatures && (
          <div className="border-t border-white/8 pt-3">
            <div className="mb-2.5 flex items-center gap-1.5">
              <BarChart2 size={11} className="text-white/30" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
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
          <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2.5">
            <AlertTriangle
              size={12}
              className="mt-0.5 shrink-0 text-yellow-400"
            />
            <p className="text-[11px] leading-relaxed text-yellow-200/90">
              {prediction.warning}
            </p>
          </div>
        )}

        {/* Message */}
        {prediction.message && (
          <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5">
            <Info size={12} className="mt-0.5 shrink-0 text-white/40" />
            <p className="text-[11px] leading-relaxed text-white/60">
              {prediction.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
