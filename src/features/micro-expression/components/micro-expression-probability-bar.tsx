export interface MicroExpressionProbabilityBarProps {
  probHigh: number
  probLow: number
}

export function MicroExpressionProbabilityBar({
  probHigh,
  probLow,
}: MicroExpressionProbabilityBarProps) {
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
