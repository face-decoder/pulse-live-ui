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
  const base =
    'group relative flex h-11 w-11 items-center justify-center rounded-md transition-all duration-200 cursor-pointer border outline-none font-semibold text-sm select-none'

  let variant: string
  if (danger) {
    variant =
      'bg-primary text-on-primary hover:bg-brand-coral hover:text-white border-transparent shadow-sm'
  } else if (active) {
    variant =
      'bg-brand-pink text-white hover:bg-brand-pink/90 border-transparent shadow-sm'
  } else if (accent) {
    variant =
      'bg-brand-teal text-white hover:bg-brand-teal/90 border-transparent shadow-sm'
  } else {
    variant =
      'bg-canvas text-ink border-hairline hover:bg-surface-soft hover:border-muted-soft'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${variant}`}
      aria-label={label}
      title={label}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  )
}
