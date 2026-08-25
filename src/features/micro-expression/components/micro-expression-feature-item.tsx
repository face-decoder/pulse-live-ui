import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '#/lib/utils'
import type { TopPredictedFeature } from '#/types'

interface MicroExpressionFeatureItemProps {
  feature: TopPredictedFeature
}

export function MicroExpressionFeatureItem({
  feature,
}: MicroExpressionFeatureItemProps) {
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
