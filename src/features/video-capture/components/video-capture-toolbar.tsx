import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  DoorOpen,
  type LucideIcon,
} from 'lucide-react'

export interface VideoCaptureToolbarProps {
  isMuted: boolean
  isCameraOff: boolean
  isScreenSharing: boolean
  onToggleMute: () => void
  onToggleCamera: () => void
  onToggleScreenShare: () => void
  onLeave: () => void
}

interface ToolbarControlProps {
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
}: ToolbarControlProps) {
  const base =
    'group relative flex h-11 w-11 items-center justify-center rounded-md transition-all duration-200 cursor-pointer border outline-none font-semibold text-sm select-none'

  let variant: string
  if (danger) {
    variant =
      'bg-primary text-on-primary hover:bg-brand-coral hover:text-white border-transparent shadow-sm'
  } else if (active) {
    variant = 'bg-brand-pink text-white hover:bg-brand-pink/90 border-transparent shadow-sm'
  } else if (accent) {
    variant = 'bg-brand-teal text-white hover:bg-brand-teal/90 border-transparent shadow-sm'
  } else {
    variant = 'bg-canvas text-ink border-hairline hover:bg-surface-soft hover:border-muted-soft'
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

export default function VideoCaptureToolbar({
  isMuted,
  isCameraOff,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onLeave,
}: VideoCaptureToolbarProps) {
  return (
    <div className="flex w-full items-center justify-center px-4 py-4 bg-surface-soft/60 border-t border-hairline">
      <div className="flex items-center gap-3">
        <ToolbarButton
          icon={isMuted ? MicOff : Mic}
          label={isMuted ? 'Unmute' : 'Mute'}
          active={isMuted}
          onClick={onToggleMute}
        />

        <ToolbarButton
          icon={isCameraOff ? VideoOff : Video}
          label={isCameraOff ? 'Open cam' : 'Close cam'}
          active={isCameraOff}
          onClick={onToggleCamera}
        />

        <ToolbarButton
          icon={MonitorUp}
          label={isScreenSharing ? 'Stop presenting' : 'Present now'}
          accent={isScreenSharing}
          onClick={onToggleScreenShare}
        />

        <span className="mx-1 h-6 w-px bg-hairline" />

        <ToolbarButton
          icon={DoorOpen}
          label="Leave Session"
          danger
          onClick={onLeave}
        />
      </div>
    </div>
  )
}

