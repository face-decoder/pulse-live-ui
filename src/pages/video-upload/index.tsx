import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { VideoUploadFeature } from '#/features/video-upload'

export default function VideoUploadPage() {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Header */}
      <header className="border-b border-hairline bg-canvas h-16 shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition-colors px-3 py-1.5 rounded-md border border-hairline bg-surface-soft/40 hover:bg-surface-soft"
            >
              <ChevronLeft size={14} />
              <span>Back to Home</span>
            </Link>

            <span className="h-6 w-px bg-hairline" />

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-ink">
                pulse<span className="text-brand-pink">.</span>live
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-teal bg-brand-teal/10 border border-brand-teal/15 px-2 py-0.5 rounded-md">
                Batch Upload
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">Video Analysis</h1>
            <p className="mt-2 text-lg text-body">
              Upload a video to analyze micro-expressions and detect emotional spotting phases
            </p>
          </div>

          <VideoUploadFeature sessionId={sessionId} />
        </div>
      </main>
    </div>
  )
}
