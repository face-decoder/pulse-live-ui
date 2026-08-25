import { CheckCircle, Loader } from 'lucide-react'
import type { UploadProgressState, VideoStatus } from '#/types'
import { formatFileSize } from '#/lib/format'

interface UploadProgressProps {
  progress: UploadProgressState
}

const statusLabels: Record<VideoStatus, string> = {
  receiving: 'Uploading...',
  received: 'Upload Complete',
  processing: 'Processing...',
  completed: 'Completed',
}

const statusColors: Record<VideoStatus, string> = {
  completed: 'text-brand-teal',
  processing: 'text-brand-peach',
  receiving: 'text-brand-peach',
  received: 'text-muted',
}

const barColors: Record<VideoStatus, string> = {
  completed: 'bg-brand-teal',
  processing: 'bg-brand-peach',
  receiving: 'bg-brand-peach',
  received: 'bg-muted-soft',
}

export function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {progress.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-brand-teal" />
          ) : (
            <Loader className="w-5 h-5 text-brand-peach animate-spin" />
          )}
          <span className={`font-medium ${statusColors[progress.status]}`}>
            {statusLabels[progress.status]}
          </span>
        </div>
        <span className="text-sm text-muted">{progress.percentage}%</span>
      </div>

      <div className="w-full bg-surface-strong rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColors[progress.status]}`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {progress.totalBytes > 0 && (
        <div className="flex justify-between text-xs text-muted">
          <span>
            {formatFileSize(progress.bytesUploaded)} /{' '}
            {formatFileSize(progress.totalBytes)}
          </span>
          {progress.statusMessage && (
            <span className="text-right max-w-xs truncate">
              {progress.statusMessage}
            </span>
          )}
        </div>
      )}

      {progress.statusMessage && progress.status === 'processing' && (
        <div className="text-sm text-brand-peach bg-brand-peach/10 p-2 rounded border border-brand-peach/20">
          {progress.statusMessage}
        </div>
      )}
    </div>
  )
}
