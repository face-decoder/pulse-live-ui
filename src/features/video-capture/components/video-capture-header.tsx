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

export default function VideoCaptureToolbar({
  isScreenSharing,
}: VideoCaptureHeaderProps) {
  const time = useCurrentTime()

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2 backdrop-blur-xl border border-white/6">
        <span className="text-sm font-semibold text-white/90">{time}</span>
        <span className="h-4 w-px bg-white/15" />
        <span className="text-sm text-white/50 font-medium">pulse-live</span>
      </div>

      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 backdrop-blur-xl border border-white/6"
        title="End-to-end encrypted"
      >
        <Shield size={14} className="text-white/50" />
      </div>

      {isScreenSharing && (
        <div className="flex items-center gap-1.5 rounded-xl bg-[#4fb8b2]/20 px-3 py-1.5 border border-[#4fb8b2]/30">
          <MonitorUp size={14} className="text-[#4fb8b2]" />
          <span className="text-xs font-semibold text-[#4fb8b2]">
            Presenting
          </span>
        </div>
      )}
    </div>
  )
}
