import { Loader2 } from "lucide-react";

export default function VideoCaptureLoader() {
  return (
    <div className="meet-room flex h-screen w-screen items-center justify-center bg-[#111214]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#4fb8b2]" />
        <p className="text-base text-white/60 font-medium">Getting your camera ready…</p>
      </div>
    </div>
  )
}