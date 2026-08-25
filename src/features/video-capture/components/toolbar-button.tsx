import { Button } from '#/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface ToolbarButtonProps {
  icon: LucideIcon
  label: string
  active?: boolean
  danger?: boolean
  accent?: boolean
  onClick: () => void
}

export function ToolbarButton({
  icon: Icon,
  label,
  active = false,
  danger = false,
  accent = false,
  onClick,
}: ToolbarButtonProps) {
  const className = danger
    ? 'hover:bg-brand-coral'
    : active
      ? 'bg-brand-pink text-white hover:bg-brand-pink/90'
      : accent
        ? 'bg-brand-teal text-white hover:bg-brand-teal/90'
        : ''

  const variant = danger
    ? 'destructive'
    : active || accent
      ? 'default'
      : 'outline'

  return (
    <Button
      variant={variant}
      size="icon"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`size-11 rounded-md ${className}`}
    >
      <Icon />
    </Button>
  )
}
