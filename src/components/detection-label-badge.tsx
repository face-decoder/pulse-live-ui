import { cva  } from 'class-variance-authority'
import type {VariantProps} from 'class-variance-authority';
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import { formatStatusLabel, isHighAnxietyLabel } from '#/lib/detection'

const detectionLabelBadgeVariants = cva('', {
  variants: {
    level: {
      high: 'bg-brand-coral/20 text-brand-coral hover:bg-brand-coral/20',
      low: 'bg-brand-mint/30 text-brand-teal hover:bg-brand-mint/30',
    },
  },
  defaultVariants: {
    level: 'low',
  },
})

interface DetectionLabelBadgeProps extends VariantProps<
  typeof detectionLabelBadgeVariants
> {
  label?: string
  className?: string
}

export function DetectionLabelBadge({
  label,
  className,
}: DetectionLabelBadgeProps) {
  return (
    <Badge
      className={cn(
        detectionLabelBadgeVariants({
          level: isHighAnxietyLabel(label) ? 'high' : 'low',
        }),
        className,
      )}
    >
      {formatStatusLabel(label)}
    </Badge>
  )
}
