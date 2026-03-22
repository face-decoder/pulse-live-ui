import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import {
  VideoCaptureHeader,
  VideoCaptureLoader,
  VideoCapturePermission,
  VideoCaptureToolbar,
} from '#/features/video-capture/components'
import { MicroExpressionPredictionResultCard } from '#/features/micro-expression/components'
import { useMediaStream } from '#/hooks/use-media-stream'
import { useWebSocket } from '#/hooks/use-web-socket'
import { useWebRTC } from '#/hooks/use-web-rtc'
import type { PredictionResult } from '#/types'
import { MicOff } from 'lucide-react'
import { env } from '#/env'

// prettier-ignore
export default function VideoCapture() {

  const { stream, isMuted, isCameraOff, isScreenSharing, error, isLoading, toggleMute, toggleCamera, toggleScreenShare } = useMediaStream()

  const [showControls, setShowControls] = useState(true)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, isCameraOff, isScreenSharing])

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setShowControls(false), 4000)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [resetHideTimer])

  const handleLeave = useCallback(() => {
    window.location.reload()
  }, [])

  const sessionId = useMemo(() => crypto.randomUUID(), [])

  useWebSocket(env.SOCKET_URL, {
    onOpen: () => console.log('WebSocket Connected!'),
    onMessage: (event) => console.log('WebSocket Received:', event.data),
  })

  const { status: rtcStatus } = useWebRTC({
    url: env.RTC_SOCKET_URL + `/${sessionId}`,
    stream,
    onPrediction: setPrediction,
  })

  if (isLoading) return <VideoCaptureLoader />
  if (error) return <VideoCapturePermission error={error} />

  const statusColor =
    rtcStatus === 'connected'
      ? 'bg-green-500'
      : rtcStatus === 'connecting'
        ? 'bg-yellow-500 animate-pulse'
        : 'bg-red-500'

  return (
    <div
      className="meet-room relative h-screen w-screen overflow-hidden bg-[#111214] select-none"
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
    >
      <div
        className={`absolute left-0 top-0 z-20 w-full transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <VideoCaptureHeader isScreenSharing={isScreenSharing} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4 pb-28">
        <div className="relative h-full w-full max-w-350 overflow-hidden rounded-2xl bg-[#1a1a1d] shadow-2xl shadow-black/50">
          {isCameraOff && !isScreenSharing ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-[#4fb8b2] to-[#328f97] shadow-lg shadow-[#4fb8b2]/20">
                <span className="text-4xl font-bold text-white">Y</span>
              </div>
              <p className="text-sm font-medium text-white/40">Camera is off</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${isScreenSharing ? '' : 'meet-video-mirror'}`}
            />
          )}

          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
              You
            </span>
            {isMuted && (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/90 backdrop-blur-md">
                <MicOff size={14} className="text-white" />
              </span>
            )}
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-md">
            <span
              className={`meet-live-dot h-2 w-2 rounded-full ${statusColor}`}
            />
            <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">
              {rtcStatus === 'connected'
                ? 'Live'
                : rtcStatus === 'connecting'
                  ? 'Connecting'
                  : 'Disconnected'}
            </span>
          </div>

          {prediction && (
            <div className="absolute left-4 top-4">
              <MicroExpressionPredictionResultCard prediction={prediction} />
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      >
        <VideoCaptureToolbar
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          onLeave={handleLeave}
        />
      </div>
    </div>
  )
}
