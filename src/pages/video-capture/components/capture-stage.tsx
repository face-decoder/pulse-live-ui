import type { ReactNode } from 'react'
import { MicOff } from 'lucide-react'
import { MicroExpressionPredictionResultCard } from '#/features/micro-expression/components'
import type { ConnectionStatus, PredictionResult } from '#/types'

interface CaptureStageProps {
  rtcStatus: ConnectionStatus
  prediction: PredictionResult | null
  isMuted: boolean

  children?: ReactNode
}

const statusColors: Record<ConnectionStatus, string> = {
  connected: 'bg-brand-mint',
  connecting: 'bg-brand-ochre animate-pulse',
  disconnected: 'bg-brand-coral',
  error: 'bg-brand-coral',
}

const statusLabels: Record<ConnectionStatus, string> = {
  connected: 'Live Server',
  connecting: 'Connecting',
  disconnected: 'Offline',
  error: 'Offline',
}

export function CaptureStage({
  rtcStatus,
  prediction,
  isMuted,
  children,
}: CaptureStageProps) {
  return (
    <div className="relative flex-1 bg-canvas aspect-video min-h-[400px] overflow-hidden flex items-center justify-center">
      {children}

      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <span className="rounded-md bg-canvas/80 px-2.5 py-1 text-[11px] font-bold text-ink border border-hairline backdrop-blur-md">
          You
        </span>
        {isMuted && (
          <span className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-brand-pink border border-brand-pink/20 shadow-sm">
            <MicOff size={12} className="text-white" />
          </span>
        )}
      </div>

      <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-md bg-canvas/80 px-2.5 py-1 border border-hairline backdrop-blur-md shadow-sm">
        <span className={`h-2 w-2 rounded-full ${statusColors[rtcStatus]}`} />
        <span className="text-[10px] font-bold text-ink uppercase tracking-wider">
          {statusLabels[rtcStatus]}
        </span>
      </div>

      {prediction && (
        <div className="absolute right-4 top-16 z-20 transition-all duration-300">
          <MicroExpressionPredictionResultCard prediction={prediction} />
        </div>
      )}
    </div>
  )
}
