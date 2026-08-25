import { Loader2 } from 'lucide-react'

export default function VideoCaptureLoader() {
  return (
    <div className="flex h-64 w-full items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
        <p className="text-sm text-muted font-medium">
          Getting your camera ready…
        </p>
      </div>
    </div>
  )
}
