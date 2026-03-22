import { VideoOff } from "lucide-react";

export interface VideoCapturePermissionProps {
  error: string
}

export default function VideoCapturePermission({ error }: VideoCapturePermissionProps) {
  return (
    <div className="meet-room flex h-screen w-screen items-center justify-center bg-[#111214]">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white/5 p-8 text-center border border-white/10 backdrop-blur-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <VideoOff className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Camera access needed</h2>
        <p className="text-sm text-white/50 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full bg-[#4fb8b2] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#60d7cf] cursor-pointer border-0"
        >
          Try again
        </button>
      </div>
    </div>
  )
}