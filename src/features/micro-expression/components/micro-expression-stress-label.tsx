import { cn } from '#/lib/utils'

export interface MicroExpressionStressLabelProps {
  label?: string
}

export function MicroExpressionStressLabel({
  label,
}: MicroExpressionStressLabelProps) {
  const normalized = label?.toLowerCase()
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-widest uppercase border',
        !normalized && 'bg-ink/10 text-ink/60 border-ink/10',
        normalized === 'high' &&
          'bg-brand-pink/20 text-brand-pink border-brand-pink/30',
        normalized === 'low' &&
          'bg-brand-mint/30 text-brand-teal border-brand-mint/40',
      )}
    >
      {label ?? 'Unknown'}
    </span>
  )
}
