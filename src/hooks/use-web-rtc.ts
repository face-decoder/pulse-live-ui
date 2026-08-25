import { useState, useEffect, useRef, useCallback } from 'react'
import { useWebSocket, WebSocketStatus } from './use-web-socket'
import { ConnectionStatus } from '#/types'
import type { PredictionResult, BBoxMessage, AlertMessage } from '#/types'

interface UseWebRTCOptions {
  url: string
  stream: MediaStream | null
  onPrediction?: (prediction: PredictionResult) => void
  onBBox?: (bbox: BBoxMessage) => void
  onAlert?: (alert: AlertMessage) => void
}

export function useWebRTC({
  url,
  stream,
  onPrediction,
  onBBox,
  onAlert,
}: UseWebRTCOptions) {
  const [status, setStatus] = useState<ConnectionStatus>(
    ConnectionStatus.Disconnected,
  )
  const [error, setError] = useState<string | null>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const isNegotiatingRef = useRef(false)
  const activeStreamRef = useRef<MediaStream | null>(null)

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
          setStatus(ConnectionStatus.Connected)
        } else if (msg.type === 'candidate' && msg.candidate) {
          await pc.addIceCandidate(
            new RTCIceCandidate({
              sdpMid: msg.candidate.sdpMid,
              sdpMLineIndex: msg.candidate.sdpMLineIndex,
              candidate: msg.candidate.candidate,
            }),
          )
        } else if (msg.type === 'prediction' || msg.type === 'error') {
          onPrediction?.(msg)
        } else if (msg.type === 'bbox') {
          onBBox?.(msg)
        } else if (msg.type === 'alert') {
          onAlert?.(msg)
        }
      } catch (err) {
        console.error('Error handling WebRTC message:', err)
      }
    },
    onClose: () => {
      setStatus(ConnectionStatus.Disconnected)
    },
  })

  const negotiate = useCallback(async () => {
    const pc = pcRef.current
    if (!pc || wsStatus !== WebSocketStatus.Open || isNegotiatingRef.current)
      return

    try {
      isNegotiatingRef.current = true
      setStatus(ConnectionStatus.Connecting)

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
      setStatus(ConnectionStatus.Disconnected)
    } finally {
      isNegotiatingRef.current = false
    }
  }, [sendMessage, wsStatus])

  useEffect(() => {
    if (wsStatus === WebSocketStatus.Open && stream && !pcRef.current) {
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
          setStatus(ConnectionStatus.Connected)
        } else if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed'
        ) {
          setStatus(ConnectionStatus.Disconnected)
        }
      }

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      void negotiate()
    }

    return () => {
      if (pcRef.current && activeStreamRef.current !== stream) {
        sendMessage(JSON.stringify({ type: 'stop' }))
        pcRef.current.close()
        pcRef.current = null
        activeStreamRef.current = null
        setStatus(ConnectionStatus.Disconnected)
      }
    }
  }, [stream, wsStatus, sendMessage, negotiate])

  return { status, error }
}
