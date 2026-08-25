import { useState, useEffect, useCallback, useRef } from 'react'

declare global {
  interface MediaTrackConstraints {
    cursor?: 'always' | 'motion' | 'never'
  }
}

export interface UseMediaStreamReturn {
  stream: MediaStream | null
  isMuted: boolean
  isCameraOff: boolean
  isScreenSharing: boolean
  error: string | null
  isLoading: boolean
  toggleMute: () => void
  toggleCamera: () => void
  toggleScreenShare: () => Promise<void>
  startStream: () => Promise<void>
  isStreamActive: boolean
}

const cameraConstraints: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  audio: false,
}

function toErrorMessage(err: unknown): string {
  return err instanceof DOMException && err.name === 'NotAllowedError'
    ? 'Camera/microphone access denied. Please allow permissions and reload.'
    : 'Could not access camera or microphone.'
}

export function useMediaStream(
  options: { enabled?: boolean } = {},
): UseMediaStreamReturn {
  const { enabled = true } = options
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(!enabled)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [isStreamActive, setIsStreamActive] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  const applyStream = useCallback((mediaStream: MediaStream) => {
    streamRef.current = mediaStream
    setStream(mediaStream)
    setIsStreamActive(true)
    setIsCameraOff(false)
    setError(null)
  }, [])

  const startStream = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      applyStream(await navigator.mediaDevices.getUserMedia(cameraConstraints))
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [applyStream])

  useEffect(() => {
    if (!enabled) {
      setIsCameraOff(true)
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function initStream() {
      try {
        const mediaStream =
          await navigator.mediaDevices.getUserMedia(cameraConstraints)

        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop())
          return
        }

        applyStream(mediaStream)
      } catch (err) {
        if (!cancelled) setError(toErrorMessage(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void initStream()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [enabled, applyStream])

  const toggleMute = useCallback(() => {
    if (!streamRef.current) return
    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled
    })
    setIsMuted((prev) => !prev)
  }, [])

  const toggleCamera = useCallback(() => {
    if (!isStreamActive) {
      void startStream()
      return
    }
    if (!streamRef.current) return
    streamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled
    })
    setIsCameraOff((prev) => !prev)
  }, [isStreamActive, startStream])

  const stopScreenShare = useCallback(() => {
    screenStream?.getTracks().forEach((t) => t.stop())
    setScreenStream(null)
    setIsScreenSharing(false)
  }, [screenStream])

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare()
      return
    }

    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      })

      setScreenStream(display)
      setIsScreenSharing(true)

      display.getVideoTracks()[0]?.addEventListener('ended', () => {
        setScreenStream(null)
        setIsScreenSharing(false)
      })
    } catch {}
  }, [isScreenSharing, stopScreenShare])

  const activeStream = isScreenSharing && screenStream ? screenStream : stream

  return {
    stream: activeStream,
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
  }
}
