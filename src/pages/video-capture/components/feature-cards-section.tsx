import type { RefObject } from 'react'

const cards = [
  {
    tone: 'bg-brand-pink text-white',
    halo: 'bg-white/5',
    badge: 'bg-white/20 text-white',
    badgeLabel: 'Pipeline',
    title: 'Neural Face Spotting',
    body: 'Advanced spatial-temporal models isolate 5 regions of interest per frame, filtering noise and highlighting micro-muscle shifts instantly.',
    bodyClass: 'text-white/80',
    cta: 'Learn about Onset/Apex →',
  },
  {
    tone: 'bg-brand-lavender text-ink',
    halo: 'bg-ink/5',
    badge: 'bg-ink/10 text-ink/70',
    badgeLabel: 'Signaling',
    title: 'Sub-100ms Inference',
    body: 'Using custom WebRTC channels and persistent WebSockets, raw camera frames bypass typical processing lag to return results directly to your screen.',
    bodyClass: 'text-ink/75',
    cta: 'WebSocket Spec →',
  },
  {
    tone: 'bg-brand-peach text-ink',
    halo: 'bg-ink/5',
    badge: 'bg-ink/10 text-ink/70',
    badgeLabel: 'Privacy',
    title: 'Sandboxed Sessions',
    body: 'No video streams or biometrics are ever stored. We run fully encrypted pipelines that process data transiently and discard sessions upon logout.',
    bodyClass: 'text-ink/75',
    cta: 'Read Trust Report →',
  },
] as const

interface FeatureCardsSectionProps {
  innerRef?: RefObject<HTMLElement | null>
}

export function FeatureCardsSection({ innerRef }: FeatureCardsSectionProps) {
  return (
    <section
      ref={innerRef}
      className="bg-surface-soft/40 border-y border-hairline py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
            State-of-the-art conversational analysis
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-3">
            Pulse Live leverages high-fidelity model endpoints to recognize
            facial cues in high-stakes settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`${card.tone} rounded-xl p-8 flex flex-col justify-between min-h-[300px] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow`}
            >
              <div
                className={`absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full ${card.halo} group-hover:scale-110 transition-transform`}
              />
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${card.badge}`}
                >
                  {card.badgeLabel}
                </span>
                <h3 className="text-xl font-bold tracking-tight mt-6 mb-2">
                  {card.title}
                </h3>
                <p className={`text-xs leading-relaxed ${card.bodyClass}`}>
                  {card.body}
                </p>
              </div>
              <div className="text-xs font-semibold underline underline-offset-4 cursor-pointer mt-6">
                {card.cta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
