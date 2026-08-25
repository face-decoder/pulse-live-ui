import { useState, useEffect, useCallback, useRef } from 'react'

type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed'

interface UseWebSocketOptions {
  onMessage?: (event: MessageEvent) => void
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  reconnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

const DEFAULT_URL = 'http://0.0.0.0:8000/ws'

export function useWebSocket(
  url: string = DEFAULT_URL,
  options: UseWebSocketOptions = {},
) {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options

  const [status, setStatus] = useState<WebSocketStatus>('closed')
  const [latestMessage, setLatestMessage] = useState<MessageEvent | null>(null)
  const [error, setError] = useState<Event | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimerRef = useRef<number | null>(null)

  const callbacksRef = useRef({ onMessage, onOpen, onClose, onError })

  useEffect(() => {
    callbacksRef.current = { onMessage, onOpen, onClose, onError }
  }, [onMessage, onOpen, onClose, onError])

  const connect = useCallback(() => {
    try {
      setStatus('connecting')

      const wsUrlStr = url.replace(/^http/, 'ws')

      const ws = new WebSocket(wsUrlStr)
      wsRef.current = ws

      ws.onopen = (event) => {
        setStatus('open')
        reconnectCountRef.current = 0
        callbacksRef.current.onOpen?.(event)
      }

      ws.onmessage = (event) => {
        setLatestMessage(event)
        callbacksRef.current.onMessage?.(event)
      }

      ws.onerror = (event) => {
        setError(event)
        callbacksRef.current.onError?.(event)
      }

      ws.onclose = (event) => {
        setStatus('closed')
        callbacksRef.current.onClose?.(event)

        if (reconnect && reconnectCountRef.current < reconnectAttempts) {
          reconnectTimerRef.current = window.setTimeout(() => {
            reconnectCountRef.current += 1
            connect()
          }, reconnectInterval)
        }
      }
    } catch {
      setStatus('closed')
    }
  }, [url, reconnect, reconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      wsRef.current.onopen = null
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const sendMessage = useCallback(
    (message: string | ArrayBuffer | Blob | ArrayBufferView) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(message)
      } else {
        console.warn('WebSocket is not open. Message not sent.')
      }
    },
    [],
  )

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return {
    status,
    latestMessage,
    error,
    sendMessage,
    disconnect,
    reconnect: connect,
  }
}
