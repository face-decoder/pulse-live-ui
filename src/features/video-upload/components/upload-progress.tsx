import { CheckCircle, Loader } from 'lucide-react'
import { Progress } from '#/components/ui/progress'
import { VideoStatus } from '#/types'
import type { UploadProgressState } from '#/types'
import { formatFileSize } from '#/lib/format'

interface UploadProgressProps {
  progress: UploadProgressState
}

const statusLabels: Record<VideoStatus, string> = {
  [VideoStatus.Receiving]: 'Uploading...',
  [VideoStatus.Received]: 'Upload Complete',
  [VideoStatus.Processing]: 'Processing...',
  [VideoStatus.Completed]: 'Completed',
}

export function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {progress.status === VideoStatus.Completed ? (
            <CheckCircle className="w-5 h-5 text-brand-teal" />
          ) : (
            <Loader className="w-5 h-5 text-brand-peach animate-spin" />
          )}
          <span className="font-medium text-muted-foreground">
            {statusLabels[progress.status]}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {progress.percentage}%
        </span>
      </div>

      <Progress value={progress.percentage} className="h-2 bg-surface-strong" />

      {progress.totalBytes > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground">
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

      {progress.statusMessage && progress.status === VideoStatus.Processing && (
        <div className="text-sm text-brand-peach bg-brand-peach/10 p-2 rounded-md border border-brand-peach/20">
          {progress.statusMessage}
        </div>
      )}
    </div>
  )
}
