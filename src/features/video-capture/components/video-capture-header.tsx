import { useState, useEffect } from 'react'
import { Shield, MonitorUp } from 'lucide-react'

export interface VideoCaptureHeaderProps {
  isScreenSharing: boolean
}

function useCurrentTime(): string {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function VideoCaptureHeader({
  isScreenSharing,
}: VideoCaptureHeaderProps) {
  const time = useCurrentTime()

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex items-center gap-2 rounded-xl bg-canvas/80 px-4 py-2 backdrop-blur-md border border-hairline">
        <span className="text-sm font-semibold text-ink">{time}</span>
        <span className="h-4 w-px bg-hairline" />
        <span className="text-sm text-muted font-medium">pulse-live</span>
      </div>

      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas/80 backdrop-blur-md border border-hairline text-muted hover:text-ink cursor-help transition-colors"
        title="End-to-end encrypted"
      >
        <Shield size={14} />
      </div>

      {isScreenSharing && (
        <div className="flex items-center gap-1.5 rounded-xl bg-brand-mint/20 px-3 py-1.5 border border-brand-mint/30">
          <MonitorUp size={14} className="text-brand-teal" />
          <span className="text-xs font-semibold text-brand-teal">
            Presenting
          </span>
        </div>
      )}
    </div>
  )
}

