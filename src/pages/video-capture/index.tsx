import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  VideoCaptureHeader,
  VideoCaptureLoader,
  VideoCapturePermission,
  VideoCaptureToolbar,
} from '#/features/video-capture/components'
import { MotionTelemetryChart } from '#/features/micro-expression/components'
import { useMediaStream } from '#/hooks/use-media-stream'
import { useWebRTC } from '#/hooks/use-web-rtc'
import { useSimulatedPrediction } from '#/features/video-capture/hooks/use-simulated-prediction'
import type { PredictionResult } from '#/types'
import { env } from '#/env'
import { SiteHeader } from './components/site-header'
import type { LandingSection } from './components/site-header'
import { HeroSection } from './components/hero-section'
import { CaptureStage } from './components/capture-stage'
import { FeatureCardsSection } from './components/feature-cards-section'
import { TechnologySection } from './components/technology-section'
import { SiteFooter } from './components/site-footer'

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

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, isCameraOff, isScreenSharing])

  const navigate = useNavigate()

  const scrollToSection = useCallback(
    (ref: React.RefObject<HTMLElement | null>) => {
      ref.current?.scrollIntoView({ behavior: 'smooth' })
    },
    [],
  )

  const handleNavigate = useCallback(
    (section: LandingSection) => {
      scrollToSection(
        section === 'features' ? featuresSectionRef : demoSectionRef,
      )
    },
    [scrollToSection],
  )

  const handleLeave = useCallback(() => {
    navigate({ to: '/summary' })
  }, [navigate])

  const sessionId = useMemo(() => crypto.randomUUID(), [])

  const { status: rtcStatus } = useWebRTC({
    url: `${env.VITE_RTC_SOCKET_URL}/${sessionId}`,
    stream,
    onPrediction: setPrediction,
  })

  const activePrediction = useSimulatedPrediction({
    prediction,
    active: Boolean(stream) && !isCameraOff,
  })

  if (isLoading) return <VideoCaptureLoader />

  return (
    <div className="bg-canvas min-h-screen text-ink select-none font-sans overflow-x-hidden">
      <SiteHeader onNavigate={handleNavigate} />

      <HeroSection>
        <div ref={demoSectionRef}>
          <CaptureStage
            rtcStatus={rtcStatus}
            prediction={activePrediction}
            isMuted={isMuted}
          >
            <div className="absolute left-0 top-0 z-20 w-full">
              <VideoCaptureHeader isScreenSharing={isScreenSharing} />
            </div>

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
                  <p className="text-sm font-bold text-ink">
                    Camera is offline
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    Allow camera access to experience real-time neural face
                    tracking.
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
          </CaptureStage>

          <VideoCaptureToolbar
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isScreenSharing={isScreenSharing}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            onLeave={handleLeave}
          />

          {stream && !isCameraOff && activePrediction && (
            <div className="border-t border-hairline bg-surface-soft/40 p-6">
              <MotionTelemetryChart
                magnitudes={activePrediction.magnitudes ?? []}
                smoothedMagnitudes={activePrediction.smoothed_magnitudes ?? []}
                detectedPhases={activePrediction.detected_phases ?? []}
              />
            </div>
          )}
        </div>
      </HeroSection>

      <FeatureCardsSection innerRef={featuresSectionRef} />

      <TechnologySection />

      <SiteFooter onGoToSandbox={() => scrollToSection(demoSectionRef)} />
    </div>
  )
}
