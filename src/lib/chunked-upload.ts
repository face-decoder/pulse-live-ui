export const DEFAULT_CHUNK_SIZE = 256 * 1024

export interface ChunkedUploadOptions {
  chunkSize?: number
  onStart?: (file: File) => void
  onChunkSent?: (bytesUploaded: number, totalBytes: number) => void
  onComplete?: () => void
  onError?: (message: string) => void
}

interface UploadStartMessage {
  type: 'start'
  filename: string
  size: number
}

interface UploadEndMessage {
  type: 'end'
}

export function uploadFileOverWebSocket(
  ws: WebSocket,
  file: File,
  options: ChunkedUploadOptions = {},
): () => void {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    onStart,
    onChunkSent,
    onComplete,
    onError,
  } = options

  const startMsg: UploadStartMessage = {
    type: 'start',
    filename: file.name,
    size: file.size,
  }
  ws.send(JSON.stringify(startMsg))
  onStart?.(file)

  let offset = 0
  let cancelled = false
  const reader = new FileReader()

  const readNext = () => {
    if (cancelled) return

    reader.onload = (ev) => {
      if (cancelled) return
      if (!ev.target?.result) return

      ws.send(ev.target.result)
      offset += chunkSize
      onChunkSent?.(Math.min(offset, file.size), file.size)

      if (offset < file.size) {
        readNext()
      } else {
        const endMsg: UploadEndMessage = { type: 'end' }
        ws.send(JSON.stringify(endMsg))
        onComplete?.()
      }
    }

    reader.onerror = () => {
      onError?.('Failed to read file')
    }

    reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
  }

  readNext()

  return () => {
    cancelled = true
  }
}
