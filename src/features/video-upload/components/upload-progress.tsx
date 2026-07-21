import { CheckCircle, Loader } from 'lucide-react'
import type { UploadProgress } from '#/hooks/use-video-upload'

interface UploadProgressProps {
  progress: UploadProgress
}

export function UploadProgress({ progress }: UploadProgressProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'receiving':
        return 'Uploading...'
      case 'received':
        return 'Upload Complete'
      case 'processing':
        return 'Processing...'
      case 'completed':
        return 'Completed'
      default:
        return 'Processing'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-brand-teal'
      case 'processing':
        return 'text-brand-peach'
      case 'receiving':
        return 'text-brand-peach'
      default:
        return 'text-muted'
    }
  }

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-brand-teal'
      case 'processing':
        return 'bg-brand-peach'
      case 'receiving':
        return 'bg-brand-peach'
      default:
        return 'bg-muted-soft'
    }
  }

  return (
    <div className="w-full space-y-3">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {progress.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-brand-teal" />
          ) : progress.status === 'processing' ? (
            <Loader className="w-5 h-5 text-brand-peach animate-spin" />
          ) : (
            <Loader className="w-5 h-5 text-brand-peach animate-spin" />
          )}
          <span className={`font-medium ${getStatusColor(progress.status)}`}>
            {getStatusLabel(progress.status)}
          </span>
        </div>
        <span className="text-sm text-muted">{progress.percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-strong rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressBarColor(
            progress.status
          )}`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* File Size Info */}
      {progress.totalBytes > 0 && (
        <div className="flex justify-between text-xs text-muted">
          <span>
            {formatFileSize(progress.bytesUploaded)} / {formatFileSize(progress.totalBytes)}
          </span>
          {progress.statusMessage && (
            <span className="text-right max-w-xs truncate">{progress.statusMessage}</span>
          )}
        </div>
      )}

      {/* Status Message */}
      {progress.statusMessage && progress.status === 'processing' && (
        <div className="text-sm text-brand-peach bg-brand-peach/10 p-2 rounded border border-brand-peach/20">
          {progress.statusMessage}
        </div>
      )}
    </div>
  )
}
