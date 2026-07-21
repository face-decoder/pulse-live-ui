import { useState, useCallback, useRef, useEffect } from 'react'
import type {
  VideoStatusMessage,
  ProgressMessage,
  PredictionResult,
  ArtifactMessage,
} from '#/types'

const CHUNK_SIZE = 256 * 1024 // 256KB chunks

type UploadState = 'idle' | 'selecting' | 'uploading' | 'processing' | 'completed' | 'error'

export interface UploadProgress {
  bytesUploaded: number
  totalBytes: number
  percentage: number
  status: 'receiving' | 'received' | 'processing' | 'completed'
  statusMessage?: string
}

export interface UploadResult {
  prediction?: PredictionResult
  artifacts?: ArtifactMessage
  progressUpdates?: ProgressMessage[]
}

interface UseVideoUploadOptions {
  wsUrl?: string
  sessionId?: string
}

export function useVideoUpload(options: UseVideoUploadOptions = {}) {
  const {
    wsUrl = 'ws://localhost:8000/ws/video',
    sessionId: initialSessionId,
  } = options

  const [state, setState] = useState<UploadState>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<UploadProgress>({
    bytesUploaded: 0,
    totalBytes: 0,
    percentage: 0,
    status: 'receiving',
  })
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const sessionIdRef = useRef(
    initialSessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  )

  const connect = useCallback(() => {
    return new Promise<WebSocket>((resolve, reject) => {
      try {
        const url = `${wsUrl}/${sessionIdRef.current}`
        console.log(`Connecting to WebSocket at: ${url}`)

        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected for video upload')
          resolve(ws)
        }

        ws.onerror = (err) => {
          console.error('WebSocket error:', err)
          reject(new Error('WebSocket connection failed'))
        }

        ws.onclose = () => {
          console.log('WebSocket closed')
          wsRef.current = null
        }
      } catch (err) {
        reject(err)
      }
    })
  }, [wsUrl])

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)

      if (data.type === 'status') {
        const statusMsg = data as VideoStatusMessage
        setProgress((prev) => ({
          ...prev,
          status: statusMsg.status,
          statusMessage: statusMsg.message,
          bytesUploaded: statusMsg.bytes_received || prev.bytesUploaded,
        }))

        if (statusMsg.status === 'processing') {
          setState('processing')
        } else if (statusMsg.status === 'completed') {
          setState('completed')
        }
      }

      if (data.type === 'progress') {
        const progMsg = data as ProgressMessage
        console.log(`Progress: ${progMsg.step} - ${progMsg.message}`)
        setResult((prev) => ({
          ...prev,
          progressUpdates: [...(prev?.progressUpdates || []), progMsg],
        }))
      }

      if (data.type === 'prediction') {
        const predResult = data as PredictionResult
        console.log('Prediction received:', predResult)
        setResult((prev) => ({
          ...prev,
          prediction: predResult,
        }))
      }

      if (data.type === 'artifacts') {
        const artifacts = data as ArtifactMessage
        console.log('Artifacts received:', artifacts)
        setResult((prev) => ({
          ...prev,
          artifacts,
        }))
      }

      if (data.type === 'error') {
        const errorMsg = data.message || 'Unknown server error'
        console.error('Server error:', errorMsg)
        setError(errorMsg)
        setState('error')
        
        // Auto-reload page after 3 seconds on server error
        setTimeout(() => {
          console.log('Reloading page due to server error...')
          window.location.reload()
        }, 3000)
      }
    } catch (err) {
      console.error('Failed to parse message:', err)
    }
  }, [])

  const uploadFile = useCallback(
    async (selectedFile: File) => {
      try {
        setState('uploading')
        setError(null)
        setResult(null)
        setFile(selectedFile)

        // Connect to WebSocket
        const ws = await connect()

        // Set up message handler
        ws.onmessage = handleMessage

        // Send start message
        const startMsg = {
          type: 'start',
          filename: selectedFile.name,
          size: selectedFile.size,
        }
        ws.send(JSON.stringify(startMsg))
        console.log('Start message sent:', startMsg)

        // Read and upload file in chunks
        let bytesUploaded = 0
        const reader = new FileReader()

        const readNextChunk = () => {
          const start = bytesUploaded
          const end = Math.min(start + CHUNK_SIZE, selectedFile.size)
          const chunk = selectedFile.slice(start, end)

          reader.onload = (e) => {
            if (e.target?.result) {
              ws.send(e.target.result)
              bytesUploaded += CHUNK_SIZE

              setProgress((prev) => {
                const percentage = Math.round(
                  (Math.min(bytesUploaded, selectedFile.size) / selectedFile.size) * 100
                )
                return {
                  ...prev,
                  bytesUploaded: Math.min(bytesUploaded, selectedFile.size),
                  totalBytes: selectedFile.size,
                  percentage,
                }
              })

              if (bytesUploaded < selectedFile.size) {
                readNextChunk()
              } else {
                // Send end message
                const endMsg = { type: 'end' }
                ws.send(JSON.stringify(endMsg))
                console.log('End message sent, upload complete')
              }
            }
          }

          reader.onerror = () => {
            const errorMsg = 'Failed to read file'
            setError(errorMsg)
            setState('error')
            ws.close()
          }

          reader.readAsArrayBuffer(chunk)
        }

        readNextChunk()
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed'
        setError(errorMsg)
        setState('error')
        if (wsRef.current) {
          wsRef.current.close()
        }
      }
    },
    [connect, handleMessage]
  )

  const reset = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setState('idle')
    setFile(null)
    setProgress({
      bytesUploaded: 0,
      totalBytes: 0,
      percentage: 0,
      status: 'receiving',
    })
    setResult(null)
    setError(null)
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

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
