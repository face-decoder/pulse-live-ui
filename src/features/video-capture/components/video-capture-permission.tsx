import { VideoOff } from "lucide-react";

export interface VideoCapturePermissionProps {
  error: string
}

export default function VideoCapturePermission({ error }: VideoCapturePermissionProps) {
  return (
    <div className="flex w-full min-h-[350px] items-center justify-center bg-canvas p-4">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-lg bg-surface-card p-6 text-center border border-hairline shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
          <VideoOff className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-ink">Camera access needed</h2>
        <p className="text-xs text-muted leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-on-primary transition hover:bg-brand-coral cursor-pointer border-0"
        >
          Try again
        </button>
      </div>
    </div>
  )
}