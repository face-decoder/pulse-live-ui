import { useState, useCallback, useRef, useEffect } from 'react'
import { uploadFileOverWebSocket } from '#/lib/chunked-upload'
import { UploadState, VideoStatus } from '#/types'
import type { ServerMessage, UploadProgressState, UploadResult } from '#/types'

interface UseVideoUploadOptions {
  wsUrl?: string
  sessionId?: string

  onServerError?: (message: string) => void
}

const DEFAULT_WS_URL = 'ws://localhost:8000/ws/video'

export function useVideoUpload(options: UseVideoUploadOptions = {}) {
  const {
    wsUrl = DEFAULT_WS_URL,
    sessionId: initialSessionId,
    onServerError,
  } = options

  const [state, setState] = useState<UploadState>(UploadState.Idle)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<UploadProgressState>({
    bytesUploaded: 0,
    totalBytes: 0,
    percentage: 0,
    status: VideoStatus.Receiving,
  })
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const sessionIdRef = useRef(
    initialSessionId ||
      `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  )

  const connect = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(`${wsUrl}/${sessionIdRef.current}`)
        wsRef.current = ws

        ws.onopen = () => resolve(ws)
        ws.onerror = () => reject(new Error('WebSocket connection failed'))
        ws.onclose = () => {
          if (wsRef.current === ws) wsRef.current = null
        }
      } catch (err) {
        reject(
          err instanceof Error ? err : new Error('WebSocket creation failed'),
        )
      }
    })
  }, [wsUrl])

  const applyMessage = useCallback(
    (message: ServerMessage) => {
      switch (message.type) {
        case 'status':
          setProgress((prev) => ({
            ...prev,
            status: message.status,
            statusMessage: message.message,
            bytesUploaded: message.bytes_received ?? prev.bytesUploaded,
          }))
          if (message.status === VideoStatus.Processing)
            setState(UploadState.Processing)
          if (message.status === VideoStatus.Completed)
            setState(UploadState.Completed)
          break

        case 'progress':
          setResult((prev) => ({
            ...prev,
            progressUpdates: [...(prev?.progressUpdates ?? []), message],
          }))
          break

        case 'prediction':
          setResult((prev) => ({ ...prev, prediction: message }))
          break

        case 'artifacts':
          setResult((prev) => ({ ...prev, artifacts: message }))
          break

        case 'error': {
          const errorMsg = message.message || 'Unknown server error'
          setError(errorMsg)
          setState(UploadState.Error)
          onServerError?.(errorMsg)
          break
        }

        default:
          break
      }
    },
    [onServerError],
  )

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      let data: unknown
      try {
        data = JSON.parse(event.data as string)
      } catch {
        return
      }

      if (typeof data === 'object' && data !== null && 'type' in data) {
        applyMessage(data as ServerMessage)
      }
    },
    [applyMessage],
  )

  const uploadFile = useCallback(
    async (selectedFile: File) => {
      try {
        setState(UploadState.Uploading)
        setError(null)
        setResult(null)
        setFile(selectedFile)

        const ws = await connect()
        ws.onmessage = handleMessage

        uploadFileOverWebSocket(ws, selectedFile, {
          onChunkSent: (bytesUploaded, totalBytes) => {
            setProgress((prev) => ({
              ...prev,
              bytesUploaded,
              totalBytes,
              percentage: Math.round((bytesUploaded / totalBytes) * 100),
            }))
          },
          onError: (message) => {
            setError(message)
            setState(UploadState.Error)
            ws.close()
          },
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        setState(UploadState.Error)
        wsRef.current?.close()
      }
    },
    [connect, handleMessage],
  )

  const reset = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setState(UploadState.Idle)
    setFile(null)
    setProgress({
      bytesUploaded: 0,
      totalBytes: 0,
      percentage: 0,
      status: VideoStatus.Receiving,
    })
    setResult(null)
    setError(null)
  }, [])

  useEffect(
    () => () => {
      wsRef.current?.close()
      wsRef.current = null
    },
    [],
  )

  return {
    state,
    file,
    progress,
    result,
    error,
    uploadFile,
    reset,
    sessionId: sessionIdRef.current,
  }
}
