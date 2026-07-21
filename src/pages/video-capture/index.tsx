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
import { useWebSocket } from '#/hooks/use-web-socket'
import { useWebRTC } from '#/hooks/use-web-rtc'
import type { PredictionResult } from '#/types'
import { MicOff, Sparkles, CheckCircle2 } from 'lucide-react'
import { env } from '#/env'

export default function VideoCapture() {
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
    startStream,
    isStreamActive,
  } = useMediaStream({ enabled: false })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const demoSectionRef = useRef<HTMLDivElement>(null)
  const featuresSectionRef = useRef<HTMLDivElement>(null)
  const technologySectionRef = useRef<HTMLDivElement>(null)

  const scrollToSection = useCallback((ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, isCameraOff, isScreenSharing])

  const navigate = useNavigate()

  const handleLeave = useCallback(() => {
    // ponytail: just navigate to summary page
    navigate({ to: '/summary' })
  }, [navigate])

  const sessionId = useMemo(() => crypto.randomUUID(), [])

  useWebSocket(env.VITE_SOCKET_URL, {
    onOpen: () => console.log('WebSocket Connected!'),
    onMessage: (event) => console.log('WebSocket Received:', event.data),
  })

  const { status: rtcStatus } = useWebRTC({
    url: env.VITE_RTC_SOCKET_URL + `/${sessionId}`,
    stream,
    onPrediction: setPrediction,
  })

  // Simulated telemetry timer
  const [simulatedTime, setSimulatedTime] = useState(0)
  useEffect(() => {
    if (prediction || !stream || isCameraOff) return
    const interval = setInterval(() => {
      setSimulatedTime((t) => t + 1)
    }, 100)
    return () => clearInterval(interval)
  }, [prediction, stream, isCameraOff])

  // Simulated prediction telemetry when camera is on and no real prediction received yet
  const activePrediction = useMemo(() => {
    if (prediction) return prediction
    if (stream && !isCameraOff) {
      const mockMags = Array.from({ length: 22 }, (_, i) => {
        const val = 0.05 + 0.03 * Math.sin((simulatedTime + i) * 0.5) + 0.01 * Math.random()
        return Math.max(0.01, val)
      })
      const mockSmoothed = mockMags.map((v, i) => {
        const prev = mockMags[i - 1] || v
        const next = mockMags[i + 1] || v
        return (prev + v + next) / 3
      })

      return {
        label: 'Low',
        confidence: 0.94,
        prob_high: 0.06,
        prob_low: 0.94,
        n_frames: 23,
        n_apex_detected: 1,
        top_features: [
          { name: 'Lip Corner Puller (AU12)', saliency: 0.85, direction: 'increasing' },
          { name: 'Brow Lowerer (AU4)', saliency: 0.15, direction: 'decreasing' },
        ],
        message: 'Telemetry simulated. Waiting for stream analysis...',
        magnitudes: mockMags,
        smoothed_magnitudes: mockSmoothed,
        detected_phases: [{ onset: 4, apex: 10, offset: 16 }],
        latency_ms: 142.58,
      } as PredictionResult
    }
    return null
  }, [prediction, stream, isCameraOff, simulatedTime])



  if (isLoading) return <VideoCaptureLoader />

  const statusColor =
    rtcStatus === 'connected'
      ? 'bg-brand-mint'
      : rtcStatus === 'connecting'
        ? 'bg-brand-ochre animate-pulse'
        : 'bg-brand-coral'



  return (
    <div className="bg-canvas min-h-screen text-ink select-none font-sans overflow-x-hidden">
      {/* Navigation Header */}
      <header className="border-b border-hairline bg-canvas/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-ink">
              pulse<span className="text-brand-pink">.</span>live
            </span>
            <span className="bg-brand-lavender/50 text-[10px] text-ink font-semibold rounded-md px-1.5 py-0.5 border border-brand-lavender">
              Beta
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-muted">
            <Link to="/upload" className="hover:text-ink transition-colors">Upload</Link>
            <Link to="/demo" className="hover:text-ink transition-colors">Demo</Link>
            <button
              onClick={() => scrollToSection(featuresSectionRef)}
              className="hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold font-sans text-muted hover:text-ink"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection(technologySectionRef)}
              className="hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold font-sans text-muted hover:text-ink"
            >
              Technology
            </button>
            <button
              onClick={() => scrollToSection(demoSectionRef)}
              className="hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold font-sans text-muted hover:text-ink"
            >
              Sandbox
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/upload"
              className="rounded-md bg-surface-card text-ink hover:bg-surface-strong px-4 py-2 text-xs font-bold transition-all shadow-sm border border-hairline"
            >
              Upload Video
            </Link>
            <Link
              to="/demo"
              className="rounded-md bg-primary text-on-primary hover:bg-brand-pink hover:text-white px-4 py-2 text-xs font-bold transition-all shadow-sm"
            >
              Launch Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-pink/10 px-3 py-1 text-xs font-bold text-brand-pink mb-6 border border-brand-pink/15">
          <Sparkles size={12} />
          <span>Real-time Neural Analysis</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-ink max-w-4xl leading-[1.08] mb-6">
          Real-time micro-expression intelligence<span className="text-brand-pink">.</span>
        </h1>

        <p className="text-base md:text-lg text-muted max-w-2xl leading-relaxed mb-10">
          Understand the subtle emotional cues that define high-stakes decisions. 
          Pulse Live tracks neural facial muscle activity at sub-100ms latency.
        </p>

        {/* Product Mockup Container */}
        <div ref={demoSectionRef} className="w-full max-w-4xl bg-surface-card border border-hairline rounded-xl shadow-xl overflow-hidden flex flex-col mb-24 transition-all hover:shadow-2xl">
          {/* Mock Browser/App Header Bar */}
          <div className="h-10 border-b border-hairline bg-surface-soft/60 px-4 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-brand-coral/40" />
              <div className="w-3 h-3 rounded-full bg-brand-ochre/40" />
              <div className="w-3 h-3 rounded-full bg-brand-mint/40" />
            </div>
            <span className="text-[10px] font-bold text-muted mx-auto uppercase tracking-widest">
              Live Capture Sandbox
            </span>
          </div>

          {/* Video Stream Container */}
          <div className="relative flex-1 bg-canvas aspect-video min-h-[400px] overflow-hidden flex items-center justify-center">
            {/* Header Overlay */}
            <div className="absolute left-0 top-0 z-20 w-full">
              <VideoCaptureHeader isScreenSharing={isScreenSharing} />
            </div>

            {/* Video, Permission Error or Mascot */}
            {error ? (
              <VideoCapturePermission error={error} />
            ) : isCameraOff && !isScreenSharing ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
                <div className="h-48 w-48 relative flex items-center justify-center">
                  <img
                    src="/images/claymation_mascot.png"
                    alt="Pulse Live Mascot"
                    className="h-44 w-44 object-contain animate-bounce"
                    style={{ animationDuration: '3.5s' }}
                  />
                </div>
                <div className="max-w-xs flex flex-col items-center gap-3">
                  <p className="text-sm font-bold text-ink">Camera is offline</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Allow camera access to experience real-time neural face tracking.
                  </p>
                  {!isStreamActive && (
                    <button
                      onClick={startStream}
                      className="mt-1 rounded-md bg-brand-pink text-white hover:bg-brand-pink/90 px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer border-none font-sans"
                    >
                      Enable Camera Access
                    </button>
                  )}
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

            {/* Identity Badge */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
              <span className="rounded-md bg-canvas/80 px-2.5 py-1 text-[11px] font-bold text-ink border border-hairline backdrop-blur-md">
                You
              </span>
              {isMuted && (
                <span className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-brand-pink border border-brand-pink/20 shadow-sm">
                  <MicOff size={12} className="text-white" />
                </span>
              )}
            </div>

            {/* RTC Status Badge */}
            <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-md bg-canvas/80 px-2.5 py-1 border border-hairline backdrop-blur-md shadow-sm">
              <span className={`h-2 w-2 rounded-full ${statusColor}`} />
              <span className="text-[10px] font-bold text-ink uppercase tracking-wider">
                {rtcStatus === 'connected'
                  ? 'Live Server'
                  : rtcStatus === 'connecting'
                    ? 'Connecting'
                    : 'Offline'}
              </span>
            </div>

            {/* Prediction overlay */}
            {activePrediction && (
              <div className="absolute right-4 top-16 z-20 transition-all duration-300">
                <MicroExpressionPredictionResultCard prediction={activePrediction} />
              </div>
            )}
          </div>

          {/* Footer toolbar */}
          <VideoCaptureToolbar
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isScreenSharing={isScreenSharing}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            onLeave={handleLeave}
          />

          {/* Motion Capture Signal Chart Section */}
          {stream && !isCameraOff && activePrediction && (
            <div className="border-t border-hairline bg-surface-soft/40 p-6">
              <MotionTelemetryChart
                magnitudes={activePrediction.magnitudes || []}
                smoothedMagnitudes={activePrediction.smoothed_magnitudes || []}
                detectedPhases={activePrediction.detected_phases || []}
              />
            </div>
          )}
        </div>
      </section>

      {/* Feature Cards Grid Section */}
      <section ref={featuresSectionRef} className="bg-surface-soft/40 border-y border-hairline py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
              State-of-the-art conversational analysis
            </h2>
            <p className="text-xs md:text-sm text-muted mt-3">
              Pulse Live leverages high-fidelity model endpoints to recognize facial cues in high-stakes settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Brand Pink */}
            <div className="bg-brand-pink text-white rounded-xl p-8 flex flex-col justify-between min-h-[300px] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full bg-white/5 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                  Pipeline
                </span>
                <h3 className="text-xl font-bold tracking-tight mt-6 mb-2">
                  Neural Face Spotting
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Advanced spatial-temporal models isolate 5 regions of interest per frame, filtering noise and highlighting micro-muscle shifts instantly.
                </p>
              </div>
              <div className="text-xs font-semibold underline underline-offset-4 cursor-pointer mt-6">
                Learn about Onset/Apex →
              </div>
            </div>

            {/* Card 2: Brand Lavender */}
            <div className="bg-brand-lavender text-ink rounded-xl p-8 flex flex-col justify-between min-h-[300px] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full bg-ink/5 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-ink/10 text-ink/70 px-2 py-0.5 rounded">
                  Signaling
                </span>
                <h3 className="text-xl font-bold tracking-tight mt-6 mb-2">
                  Sub-100ms Inference
                </h3>
                <p className="text-xs text-ink/75 leading-relaxed">
                  Using custom WebRTC channels and persistent WebSockets, raw camera frames bypass typical processing lag to return results directly to your screen.
                </p>
              </div>
              <div className="text-xs font-semibold underline underline-offset-4 cursor-pointer mt-6">
                WebSocket Spec →
              </div>
            </div>

            {/* Card 3: Brand Peach */}
            <div className="bg-brand-peach text-ink rounded-xl p-8 flex flex-col justify-between min-h-[300px] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full bg-ink/5 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-ink/10 text-ink/70 px-2 py-0.5 rounded">
                  Privacy
                </span>
                <h3 className="text-xl font-bold tracking-tight mt-6 mb-2">
                  Sandboxed Sessions
                </h3>
                <p className="text-xs text-ink/75 leading-relaxed">
                  No video streams or biometrics are ever stored. We run fully encrypted pipelines that process data transiently and discard sessions upon logout.
                </p>
              </div>
              <div className="text-xs font-semibold underline underline-offset-4 cursor-pointer mt-6">
                Read Trust Report →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Integration Section */}
      <section ref={technologySectionRef} className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded">
              Stack
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink">
              Seamlessly integrated. Fully optimized.
            </h2>
            <p className="text-xs md:text-sm text-muted leading-relaxed">
              Pulse Live combines modern front-end tooling with optimized video decoding pipelines to bring raw performance right into your browser.
            </p>
            <ul className="space-y-3.5 text-xs text-ink/80 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand-teal" />
                <span>Feature-Sliced Design folder structures for modularity</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand-teal" />
                <span>Tailwind CSS v4 custom theme tokens & CSS variables</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand-teal" />
                <span>WebSocket telemetry synchronization with local state</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 bg-surface-card border border-hairline rounded-xl p-8 w-full">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">
              Real-time WebRTC Session Code
            </h4>
            <pre className="bg-canvas border border-hairline rounded-md p-4 text-[10px] font-mono text-ink/80 overflow-x-auto">
{`const pc = new RTCPeerConnection(config);
stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
});

pc.ontrack = (event) => {
  console.log("Telemetry channel active");
};`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer Section with Mountain Banner */}
      <footer className="max-w-6xl mx-auto px-6 mt-12 text-center pb-12">
        <div className="relative rounded-xl overflow-hidden border border-hairline h-48 md:h-64 mb-8 bg-surface-card flex items-center justify-center">
          <img
            src="/images/claymation_mountains.png"
            alt="Claymation Mountains Landscape"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <div className="relative z-10 p-6 bg-canvas/90 backdrop-blur-sm rounded-md max-w-md border border-hairline shadow-sm mx-4 flex flex-col items-center">
            <h3 className="text-lg font-bold text-ink">Ready to start analyzing?</h3>
            <p className="text-xs text-muted mt-2">
              Connect your webcam sandbox demo above. Experiment with expression telemetry instantly.
            </p>
            <button
              onClick={() => scrollToSection(demoSectionRef)}
              className="mt-4 rounded-md bg-brand-pink text-white hover:bg-brand-pink/90 px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer border-none font-sans"
            >
              Go to Sandbox
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-hairline pt-6 text-[10px] text-muted gap-4">
          <span>© 2026 Pulse Live. Powered by the Clay brand design system.</span>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-ink transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ink transition-colors">Security Audit</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
