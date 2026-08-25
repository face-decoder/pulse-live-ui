import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

interface HeroSectionProps {
  children: ReactNode
}

export function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-pink/10 px-3 py-1 text-xs font-bold text-brand-pink mb-6 border border-brand-pink/15">
        <Sparkles size={12} />
        <span>Real-time Neural Analysis</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-ink max-w-4xl leading-[1.08] mb-6">
        Real-time micro-expression intelligence
        <span className="text-brand-pink">.</span>
      </h1>

      <p className="text-base md:text-lg text-muted max-w-2xl leading-relaxed mb-10">
        Understand the subtle emotional cues that define high-stakes decisions.
        Pulse Live tracks neural facial muscle activity at sub-100ms latency.
      </p>

      <div className="w-full max-w-4xl bg-surface-card border border-hairline rounded-xl shadow-xl overflow-hidden flex flex-col mb-24 transition-all hover:shadow-2xl">
        <div className="h-10 border-b border-hairline bg-surface-soft/60 px-4 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-brand-coral/40" />
            <div className="w-3 h-3 rounded-full bg-brand-ochre/40" />
            <div className="w-3 h-3 rounded-full bg-brand-mint/40" />
          </div>
          <span className="text-[10px] font-bold text-muted mx-auto uppercase tracking-widest">
            Live Capture Sandbox
          </span>
        </div>

        {children}
      </div>
    </section>
  )
}
