import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  VideoCaptureHeader,
  VideoCaptureLoader,
  VideoCapturePermission,
  VideoCaptureToolbar,
} from '#/features/video-capture/components'
import {
  MicroExpressionPredictionResultCard,
  MotionTelemetryChart,
} from '#/features/micro-expression/components'
import { useMediaStream } from '#/hooks/use-media-stream'
import { useWebRTC } from '#/hooks/use-web-rtc'
import { useSimulatedPrediction } from '#/features/video-capture/hooks/use-simulated-prediction'
import { ConnectionStatus } from '#/types'
import type { AlertMessage, PredictionResult } from '#/types'
import {
  MicOff,
  ChevronLeft,
  ShieldCheck,
  Cpu,
  AlertTriangle,
} from 'lucide-react'
import { env } from '#/env'
import { Button } from '#/components/ui/button'

export default function VideoCaptureDemo() {
  const {
    stream,
    isMuted,
    isCameraOff,
    isScreenSharing,
    error,
    isLoading,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useMediaStream()

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const alertTimeoutRef = useRef<number | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, isCameraOff, isScreenSharing])

  const navigate = useNavigate()

  const handleLeave = useCallback(() => {
    navigate({ to: '/summary' })
  }, [navigate])

  const sessionId = useMemo(() => crypto.randomUUID(), [])

  const handleAlert = useCallback((alert: AlertMessage) => {
    if (alert.alert_type === 'anxiety_tinggi') {
      setAlertMessage('Terdeteksi Kondisi Kecemasan Tinggi')
      if (alertTimeoutRef.current !== null) {
        clearTimeout(alertTimeoutRef.current)
      }
      alertTimeoutRef.current = window.setTimeout(() => {
        setAlertMessage(null)
      }, 5000)
    }
  }, [])

  const { status: rtcStatus } = useWebRTC({
    url: `${env.VITE_RTC_SOCKET_URL}/${sessionId}`,
    stream,
    onPrediction: setPrediction,
    onAlert: handleAlert,
  })

  const activePrediction = useSimulatedPrediction({
    prediction,
    active: Boolean(stream) && !isCameraOff,
  })

  if (isLoading) return <VideoCaptureLoader />

  const statusColor =
    rtcStatus === ConnectionStatus.Connected
      ? 'bg-brand-mint'
      : rtcStatus === ConnectionStatus.Connecting
        ? 'bg-brand-ochre animate-pulse'
        : 'bg-brand-coral'

  return (
    <div className="bg-canvas min-h-screen text-ink select-none font-sans flex flex-col relative">
      {alertMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-brand-coral/10 border border-brand-coral text-brand-coral px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
          <AlertTriangle size={20} />
          <span className="text-sm font-semibold">{alertMessage}</span>
        </div>
      )}

      <header className="border-b border-hairline bg-canvas h-16 shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="outline" asChild className="text-xs font-bold">
              <Link to="/">
                <ChevronLeft />
                Back to Home
              </Link>
            </Button>

            <span className="h-6 w-px bg-hairline" />

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-ink">
                pulse<span className="text-brand-pink">.</span>live
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-pink bg-brand-pink/10 border border-brand-pink/15 px-2 py-0.5 rounded-md">
                Live Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <ShieldCheck size={14} className="text-brand-teal" />
              <span>Session Secure</span>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-hairline bg-surface-soft/40 px-3 py-1.5 shadow-xs">
              <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
              <span className="text-[10px] font-bold text-ink uppercase tracking-wider">
                {rtcStatus === ConnectionStatus.Connected
                  ? 'Server Stream Connected'
                  : rtcStatus === ConnectionStatus.Connecting
                    ? 'Connecting Network'
                    : 'Stream Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 min-h-0">
        <div className="flex-1 flex flex-col bg-surface-card border border-hairline rounded-xl shadow-md overflow-hidden min-h-112.5">
          <div className="h-11 border-b border-hairline bg-surface-soft/60 px-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-brand-coral/40" />
              <div className="w-3 h-3 rounded-full bg-brand-ochre/40" />
              <div className="w-3 h-3 rounded-full bg-brand-mint/40" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Primary Video Stream
            </span>
            <div className="w-12" />
          </div>

          <div className="relative flex-1 bg-canvas overflow-hidden flex items-center justify-center min-h-0">
            <div className="absolute left-0 top-0 z-20 w-full">
              <VideoCaptureHeader isScreenSharing={isScreenSharing} />
            </div>

            {error ? (
              <VideoCapturePermission error={error} />
            ) : isCameraOff && !isScreenSharing ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
                <div className="h-44 w-44 relative flex items-center justify-center">
                  <img
                    src="/images/claymation_mascot.png"
                    alt="Pulse Live Mascot Waving"
                    className="h-40 w-40 object-contain animate-bounce"
                    style={{ animationDuration: '3.5s' }}
                  />
                </div>
                <div className="max-w-xs flex flex-col items-center gap-3">
                  <p className="text-sm font-bold text-ink">Webcam inactive</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Activate your camera using the controls below to start
                    real-time prediction.
                  </p>
                </div>
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

            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
              <span className="rounded-md bg-canvas/80 px-2.5 py-1 text-[11px] font-bold text-ink border border-hairline backdrop-blur-md">
                Stream Input 01
              </span>
              {isMuted && (
                <span className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-brand-pink border border-brand-pink/20 shadow-sm">
                  <MicOff size={12} className="text-white" />
                </span>
              )}
            </div>
          </div>

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

        <div className="w-full lg:w-80 flex flex-col shrink-0 gap-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <div className="flex items-center gap-1.5">
            <Cpu size={14} className="text-brand-pink" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Expression Telemetry
            </h2>
          </div>

          {activePrediction ? (
            <>
              <MicroExpressionPredictionResultCard
                prediction={activePrediction}
                className="w-full h-auto shadow-sm"
              />
              <MotionTelemetryChart
                magnitudes={activePrediction.magnitudes ?? []}
                smoothedMagnitudes={activePrediction.smoothed_magnitudes ?? []}
                detectedPhases={activePrediction.detected_phases ?? []}
              />
            </>
          ) : (
            <div className="flex-1 rounded-xl border border-hairline bg-surface-card p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-brand-lavender/30 text-brand-teal flex items-center justify-center mb-4">
                <Cpu size={24} />
              </div>
              <p className="text-xs font-bold text-ink">
                Telemetry Awaiting Input
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed max-w-50">
                Please turn on your camera stream. Once active, model results
                will populate this panel instantly.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
