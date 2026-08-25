import { Loader2 } from 'lucide-react'
import { cn } from '#/lib/utils'

export interface PageLoaderProps {
  className?: string
}

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'p-8 text-center flex items-center justify-center min-h-screen',
        className,
      )}
    >
      <Loader2 className="animate-spin w-6 h-6 text-brand-pink" />
    </div>
  )
}
