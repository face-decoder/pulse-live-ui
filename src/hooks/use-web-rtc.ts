import { useState, useEffect, useRef, useCallback } from 'react'
import { useWebSocket } from './use-web-socket'
import type { PredictionResult } from '#/types'
import { ConnectionStatus } from '#/types/rtc'

interface UseWebRTCOptions {
  url: string
  stream: MediaStream | null
  onPrediction?: (prediction: PredictionResult) => void
}

export function useWebRTC({ url, stream, onPrediction }: UseWebRTCOptions) {
  // prettier-ignore
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
  const [error, setError] = useState<string | null>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const isNegotiatingRef = useRef(false)
  const activeStreamRef = useRef<MediaStream | null>(null)

  // Use the existing WebSocket hook for signaling
  const { sendMessage, status: wsStatus } = useWebSocket(url, {
    onMessage: async (event) => {
      try {
        const msg = JSON.parse(event.data)
        const pc = pcRef.current

        if (!pc) return

        if (msg.type === 'answer') {
          await pc.setRemoteDescription(
            new RTCSessionDescription({
              type: msg.sdpType || 'answer',
              sdp: msg.sdp,
            }),
          )
          setStatus(ConnectionStatus.CONNECTED)
        } else if (msg.type === 'candidate' && msg.candidate) {
          await pc.addIceCandidate(
            new RTCIceCandidate({
              sdpMid: msg.candidate.sdpMid,
              sdpMLineIndex: msg.candidate.sdpMLineIndex,
              candidate: msg.candidate.candidate,
            }),
          )
        } else if (msg.type === 'prediction' || msg.type === 'error') {
          if (onPrediction) {
            onPrediction(msg)
          }
        } else if (msg.type === 'heartbeat') {
          // ignore heartbeat
        }
      } catch (err) {
        console.error('Error handling WebRTC message:', err)
      }
    },
    onClose: () => {
      setStatus(ConnectionStatus.DISCONNECTED)
    },
  })

  const negotiate = useCallback(async () => {
    const pc = pcRef.current
    if (!pc || wsStatus !== 'open' || isNegotiatingRef.current) return

    try {
      isNegotiatingRef.current = true
      setStatus(ConnectionStatus.CONNECTING)

      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      })
      await pc.setLocalDescription(offer)

      sendMessage(
        JSON.stringify({
          type: 'offer',
          sdp: pc.localDescription?.sdp,
          sdpType: pc.localDescription?.type,
        }),
      )
    } catch (err) {
      console.error('Error during WebRTC negotiation:', err)
      setError('Failed to negotiate WebRTC connection.')
      setStatus(ConnectionStatus.DISCONNECTED)
    } finally {
      isNegotiatingRef.current = false
    }
  }, [sendMessage, wsStatus])

  useEffect(() => {
    if (wsStatus === 'open' && stream && !pcRef.current) {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })

      pcRef.current = pc
      activeStreamRef.current = stream

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendMessage(
            JSON.stringify({
              type: 'candidate',
              candidate: {
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                candidate: event.candidate.candidate,
              },
            }),
          )
        }
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setStatus(ConnectionStatus.CONNECTED)
        } else if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed'
        ) {
          setStatus(ConnectionStatus.DISCONNECTED)
        }
      }

      // Add all tracks from the stream
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      // Initiate negotiation
      void negotiate()
    }

    return () => {
      // If stream changes or unmounts, we should clean up the peer connection
      if (pcRef.current && activeStreamRef.current !== stream) {
        sendMessage(JSON.stringify({ type: 'stop' }))
        pcRef.current.close()
        pcRef.current = null
        activeStreamRef.current = null
        setStatus(ConnectionStatus.DISCONNECTED)
      }
    }
  }, [stream, wsStatus, sendMessage, negotiate])

  return { status, error }
}
