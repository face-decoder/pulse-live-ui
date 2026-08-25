import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { cn } from '#/lib/utils'

const statCardVariants = cva('flex', {
  variants: {
    size: {
      sm: 'p-6 gap-2',
      lg: 'p-8 items-center gap-6',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

const statCardValueVariants = cva('font-bold text-ink', {
  variants: {
    size: {
      sm: 'text-3xl',
      lg: 'text-4xl',
    },
    tone: {
      default: 'text-ink',
      coral: 'text-brand-coral',
      mint: 'text-brand-mint',
    },
  },
  defaultVariants: {
    size: 'sm',
    tone: 'default',
  },
})

const statCardIconVariants = cva('', {
  variants: {
    size: {
      sm: 'w-4 h-4 shrink-0',
      lg: 'w-8 h-8 p-4 rounded-full',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export interface StatCardProps
  extends
    VariantProps<typeof statCardVariants>,
    VariantProps<typeof statCardValueVariants> {
  icon: LucideIcon
  iconClass?: string
  label: string
  value: string
  className?: string
}

export function StatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  size,
  tone,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(statCardVariants({ size }), className)}>
      <Icon className={cn(statCardIconVariants({ size }), iconClass)} />
      <div className="min-w-0">
        <div className="text-muted-foreground mb-1 font-medium">{label}</div>
        <div className={cn(statCardValueVariants({ size, tone }))}>{value}</div>
      </div>
    </Card>
  )
}
