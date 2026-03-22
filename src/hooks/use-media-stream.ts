import { useState, useEffect, useCallback, useRef } from 'react'

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
}

/**
 * Manages local media stream (camera + mic) and screen sharing.
 * Handles getUserMedia acquisition, track toggling, and cleanup on unmount.
 */
export function useMediaStream(): UseMediaStreamReturn {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let cancelled = false

    async function initStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        })

        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = mediaStream
        setStream(mediaStream)
        setError(null)
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof DOMException && err.name === 'NotAllowedError'
              ? 'Camera/microphone access denied. Please allow permissions and reload.'
              : 'Could not access camera or microphone.'
          setError(message)
        }
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
  }, [])

  const toggleMute = useCallback(() => {
    if (!streamRef.current) return
    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled
    })
    setIsMuted((prev) => !prev)
  }, [])

  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return
    streamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled
    })
    setIsCameraOff((prev) => !prev)
  }, [])

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach((t) => t.stop())
      setScreenStream(null)
      setIsScreenSharing(false)
      return
    }

    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: false,
      })

      setScreenStream(display)
      setIsScreenSharing(true)

      display.getVideoTracks()[0]?.addEventListener('ended', () => {
        setScreenStream(null)
        setIsScreenSharing(false)
      })
    } catch {
      // User cancelled screen share picker — no action needed
    }
  }, [isScreenSharing, screenStream])

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
  }
}
