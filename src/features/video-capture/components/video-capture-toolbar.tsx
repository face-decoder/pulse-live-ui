import { Mic, MicOff, Video, VideoOff, MonitorUp, DoorOpen } from 'lucide-react'
import { ToolbarButton } from './toolbar-button'

export interface VideoCaptureToolbarProps {
  isMuted: boolean
  isCameraOff: boolean
  isScreenSharing: boolean
  onToggleMute: () => void
  onToggleCamera: () => void
  onToggleScreenShare: () => void
  onLeave: () => void
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
