import { useState, useCallback } from 'react'
import { AlertCircle, RotateCcw, Play } from 'lucide-react'
import { useVideoUpload } from '#/hooks/use-video-upload'
import {
  VideoFileInput,
  UploadProgress,
  VideoUploadResults,
} from './components'

interface VideoUploadFeatureProps {
  sessionId?: string
}

export function VideoUploadFeature({ sessionId }: VideoUploadFeatureProps) {
  const handleServerError = useCallback(() => {
    window.setTimeout(() => {
      window.location.reload()
    }, 3000)
  }, [])

  const {
    state,
    file: uploadedFile,
    progress,
    result,
    error,
    uploadFile,
    reset,
  } = useVideoUpload({ sessionId, onServerError: handleServerError })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleStartUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    reset()
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-brand-coral/10 border border-brand-coral/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-brand-coral flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-brand-coral">Upload Error</h3>
            <p className="text-sm text-brand-coral/80 mt-1">{error}</p>
            <p className="text-xs text-brand-coral/60 mt-2 italic">
              ↻ Page will reload automatically in 3 seconds...
            </p>
          </div>
        </div>
      )}

      {state === 'idle' && !result && (
        <div className="bg-surface-card p-6 rounded-lg border border-hairline">
          <VideoFileInput
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />

          {selectedFile && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleStartUpload}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-brand-coral disabled:bg-muted-soft disabled:cursor-not-allowed disabled:text-muted transition-colors font-medium text-sm"
              >
                <Play className="w-4 h-4" />
                Start Upload
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 bg-surface-strong text-ink rounded-md hover:bg-surface-strong transition-colors font-medium text-sm border border-hairline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {(state === 'uploading' || state === 'processing') && (
        <div className="bg-surface-card p-6 rounded-lg border border-hairline">
          <h2 className="text-lg font-semibold text-ink mb-4">
            Upload Progress
          </h2>
          <UploadProgress progress={progress} />

          {uploadedFile && (
            <div className="mt-4 text-sm text-muted bg-surface-soft p-3 rounded">
              <p>
                File:{' '}
                <span className="font-medium text-ink">
                  {uploadedFile.name}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {result?.prediction && (
        <div className="space-y-4">
          <div className="bg-surface-card p-6 rounded-lg border border-hairline">
            <h2 className="text-lg font-semibold text-ink mb-4">
              Analysis Results
            </h2>
            <VideoUploadResults result={result.prediction} />
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary rounded-lg hover:bg-brand-coral transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Upload Another Video
          </button>
        </div>
      )}

      {state === 'idle' && !selectedFile && !result && (
        <div className="text-center text-muted py-8">
          <p className="text-sm">Select a video file to begin analysis</p>
        </div>
      )}
    </div>
  )
}
