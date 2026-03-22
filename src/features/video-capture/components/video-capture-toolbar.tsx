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
    'group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-white/40'

  let variant: string
  if (danger) {
    variant =
      'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30'
  } else if (active) {
    variant = 'bg-red-500/90 hover:bg-red-400 text-white'
  } else if (accent) {
    variant = 'bg-[#4fb8b2] hover:bg-[#60d7cf] text-white'
  } else {
    variant = 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${variant}`}
      aria-label={label}
      title={label}
    >
      <Icon size={20} strokeWidth={1.8} />
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
    <div className="flex w-full items-center justify-center px-4 pb-6 pt-16">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

      <div className="relative flex items-center gap-3 rounded-2xl bg-[#202124]/80 px-5 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl border border-white/6">
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

        <div className="mx-1 h-8 w-px bg-white/10" />

        <ToolbarButton
          icon={DoorOpen}
          label="Logout"
          danger
          onClick={onLeave}
        />
      </div>
    </div>
  )
}
