import { cva  } from 'class-variance-authority'
import type {VariantProps} from 'class-variance-authority';
import { cn } from '#/lib/utils'

const labeledProgressBarVariants = cva('gap-2 sm:gap-4', {
  variants: {
    layout: {
      row: 'flex items-center gap-4',
      responsive: 'flex flex-col sm:flex-row sm:items-center',
    },
    labelWidth: {
      sm: 'w-32',
      md: 'w-40',
    },
    trackSize: {
      sm: 'h-3',
      md: 'h-4',
    },
  },
  defaultVariants: {
    layout: 'row',
    labelWidth: 'sm',
    trackSize: 'sm',
  },
})

const valueWidthByLayout = {
  row: 'w-16',
  responsive: 'w-20',
} as const

export interface LabeledProgressBarProps extends VariantProps<
  typeof labeledProgressBarVariants
> {
  label: string
  /** Numeric value used for the fill percentage and right-hand text. */
  value: number
  maxValue: number
  unit?: string
  barClass?: string
}

export function LabeledProgressBar({
  label,
  value,
  maxValue,
  unit = 'ms',
  barClass = 'bg-primary',
  layout,
  labelWidth,
  trackSize,
}: LabeledProgressBarProps) {
  return (
    <div className={cn(labeledProgressBarVariants({ layout, trackSize }))}>
      <div
        className={cn(
          'shrink-0 text-sm font-medium text-muted-foreground',
          labelWidth,
        )}
      >
        {label}
      </div>
      <div className="flex-1 bg-accent rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', barClass)}
          style={{ width: `${Math.min(100, (value / maxValue) * 100)}%` }}
        />
      </div>
      <div
        className={cn(
          'shrink-0 text-right text-sm font-mono font-bold',
          valueWidthByLayout[layout ?? 'row'],
        )}
      >
        {value.toFixed(2)}
        {unit}
      </div>
    </div>
  )
}
