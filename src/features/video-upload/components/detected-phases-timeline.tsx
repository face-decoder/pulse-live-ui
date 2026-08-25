import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import type { DetectedPhase } from '#/types'

interface DetectedPhasesTimelineProps {
  phases: DetectedPhase[]
  n_frames?: number
}

export function DetectedPhasesTimeline({
  phases,
  n_frames = 150,
}: DetectedPhasesTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      setCanScrollLeft(scrollContainerRef.current.scrollLeft > 0)
      setCanScrollRight(
        scrollContainerRef.current.scrollLeft <
          scrollContainerRef.current.scrollWidth -
            scrollContainerRef.current.clientWidth -
            10,
      )
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }

  const getFramePercentage = (frame: number) => {
    return Math.max(0, Math.min(100, (frame / n_frames) * 100))
  }

  const getPhaseDuration = (phase: DetectedPhase) => {
    return phase.offset - phase.onset + 1
  }

  return (
    <div className="bg-surface-card p-4 rounded-lg border border-hairline">
      <h3 className="text-sm font-medium text-ink mb-3">
        Detected Phases Timeline
      </h3>

      <div className="space-y-4">
        <div className="px-2">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Frame 0</span>
            <span>Frame {Math.round(n_frames / 2)}</span>
            <span>Frame {n_frames}</span>
          </div>
          <div className="w-full h-1 bg-surface-strong rounded-full" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="shrink-0 p-1.5 rounded border border-hairline bg-surface-soft hover:bg-surface-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-ink" />
            </button>

            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex-1 overflow-x-auto scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="flex gap-3 min-w-min px-2 py-2">
                {phases.map((phase, idx) => {
                  const duration = getPhaseDuration(phase)
                  const onsetPercent = getFramePercentage(phase.onset)
                  const offsetPercent = getFramePercentage(phase.offset)
                  const phaseWidth = offsetPercent - onsetPercent

                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 p-3 bg-surface-soft rounded border border-brand-peach/20 min-w-max hover:border-brand-peach/50 transition-colors"
                    >
                      <div className="font-semibold text-ink text-sm">
                        Phase {idx + 1}
                      </div>

                      <div className="w-48 h-8 bg-surface-strong rounded overflow-hidden flex items-center relative">
                        <div className="absolute inset-0 flex">
                          <div
                            style={{ width: `${onsetPercent}%` }}
                            className="bg-transparent"
                          />
                          <div
                            style={{ width: `${phaseWidth}%` }}
                            className="bg-linear-to-r from-brand-peach/40 to-brand-peach/60"
                          />
                        </div>

                        <div
                          style={{
                            left: `${getFramePercentage(phase.apex)}%`,
                          }}
                          className="absolute w-0.5 h-full bg-brand-coral transform -translate-x-px shadow-lg"
                          title={`Apex: Frame ${phase.apex}`}
                        />

                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-ink pointer-events-none">
                          {duration} frames
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted">Onset</p>
                          <p className="font-semibold text-ink">
                            {phase.onset}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted">Apex</p>
                          <p className="font-semibold text-ink">{phase.apex}</p>
                        </div>
                        <div>
                          <p className="text-muted">Offset</p>
                          <p className="font-semibold text-ink">
                            {phase.offset}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="shrink-0 p-1.5 rounded border border-hairline bg-surface-soft hover:bg-surface-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-ink" />
            </button>
          </div>
        </div>

        <div className="flex gap-4 text-xs bg-surface-soft p-2 rounded border border-hairline">
          <div>
            <p className="text-muted">Total Phases</p>
            <p className="font-semibold text-ink">{phases.length}</p>
          </div>
          <div>
            <p className="text-muted">Total Duration</p>
            <p className="font-semibold text-ink">
              {phases.reduce((sum, phase) => sum + getPhaseDuration(phase), 0)}{' '}
              frames
            </p>
          </div>
          <div>
            <p className="text-muted">Video Length</p>
            <p className="font-semibold text-ink">{n_frames} frames</p>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
