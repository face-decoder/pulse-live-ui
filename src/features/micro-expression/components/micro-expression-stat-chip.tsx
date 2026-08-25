export interface MicroExpressionStatChipProps {
  label: string
  value: string | number
}

export function MicroExpressionStatChip({
  label,
  value,
}: MicroExpressionStatChipProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 rounded-md bg-canvas/80 border border-ink/5 px-1 py-1.5 min-w-0">
      <span className="text-xs font-bold text-ink truncate w-full text-center">
        {value}
      </span>
      <span className="text-center text-[8px] font-semibold leading-tight text-ink/50 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
