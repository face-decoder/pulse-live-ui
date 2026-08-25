import { useState, useCallback } from 'react'
import { AlertCircle, RotateCcw, Play } from 'lucide-react'
import { useVideoUpload } from '#/hooks/use-video-upload'
import { UploadState } from '#/types'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
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
        <Alert
          variant="destructive"
          className="border-brand-coral/20 bg-brand-coral/10 text-brand-coral [&>svg]:text-brand-coral"
        >
          <AlertCircle />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>
            {error}
            <p className="mt-2 text-xs italic opacity-80">
              ↻ Page will reload automatically in 3 seconds...
            </p>
          </AlertDescription>
        </Alert>
      )}

      {state === UploadState.Idle && !result && (
        <Card>
          <CardContent>
            <VideoFileInput
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />

            {selectedFile && (
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleStartUpload}
                  className="hover:bg-brand-coral"
                >
                  <Play /> Start Upload
                </Button>
                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(state === UploadState.Uploading ||
        state === UploadState.Processing) && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadProgress progress={progress} />

            {uploadedFile && (
              <div className="mt-4 text-sm text-muted-foreground bg-accent p-3 rounded-md">
                File:{' '}
                <span className="font-medium text-ink">
                  {uploadedFile.name}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result?.prediction && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoUploadResults result={result.prediction} />
            </CardContent>
          </Card>

          <Button
            onClick={handleReset}
            size="lg"
            className="w-full hover:bg-brand-coral"
          >
            <RotateCcw /> Upload Another Video
          </Button>
        </div>
      )}

      {state === UploadState.Idle && !selectedFile && !result && (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">Select a video file to begin analysis</p>
        </div>
      )}
    </div>
  )
}
