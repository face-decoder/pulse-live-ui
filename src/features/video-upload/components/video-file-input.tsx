import { Upload } from 'lucide-react'
import { formatFileSize } from '#/lib/format'

interface VideoFileInputProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  selectedFile?: File | null
}

export function VideoFileInput({
  onFileSelect,
  disabled = false,
  selectedFile,
}: VideoFileInputProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-ink mb-2">
        Select Video File
      </label>

      <div className="relative">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          id="video-input"
        />

        <label
          htmlFor="video-input"
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            disabled
              ? 'bg-surface-soft border-hairline cursor-not-allowed'
              : selectedFile
                ? 'bg-brand-mint/10 border-brand-mint'
                : 'bg-surface-soft border-hairline hover:bg-surface-strong hover:border-body-strong'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-2 pb-2">
            <Upload
              className={`w-10 h-10 mb-2 ${
                selectedFile ? 'text-brand-teal' : 'text-muted'
              }`}
            />
            {selectedFile ? (
              <>
                <p className="text-sm font-semibold text-ink">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
                <p className="text-xs text-brand-teal font-medium mt-2">
                  ✓ File selected
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-ink">
                  Click to select or drag video file
                </p>
                <p className="text-xs text-muted">
                  MP4, WebM, MOV or other video formats
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {selectedFile && (
        <div className="mt-2 text-xs text-muted">
          <p>
            Selected:{' '}
            <span className="font-medium text-ink">{selectedFile.name}</span>
          </p>
        </div>
      )}
    </div>
  )
}
