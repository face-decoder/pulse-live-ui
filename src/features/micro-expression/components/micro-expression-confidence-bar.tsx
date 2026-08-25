import { useMemo } from 'react'
import { cn } from '#/lib/utils'

export interface MicroExpressionConfidenceBarProps {
  value: number
}

export function MicroExpressionConfidenceBar({
  value,
}: MicroExpressionConfidenceBarProps) {
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
