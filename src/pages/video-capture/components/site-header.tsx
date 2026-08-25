import { Link } from '@tanstack/react-router'

export type LandingSection = 'demo' | 'features' | 'technology'

interface SiteHeaderProps {
  onNavigate: (section: LandingSection) => void
}

export function SiteHeader({ onNavigate }: SiteHeaderProps) {
  return (
    <header className="border-b border-hairline bg-canvas/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-ink">
            pulse<span className="text-brand-pink">.</span>live
          </span>
          <span className="bg-brand-lavender/50 text-[10px] text-ink font-semibold rounded-md px-1.5 py-0.5 border border-brand-lavender">
            Beta
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-muted">
          <Link to="/upload" className="hover:text-ink transition-colors">
            Upload
          </Link>
          <Link to="/demo" className="hover:text-ink transition-colors">
            Demo
          </Link>
          <button
            onClick={() => onNavigate('features')}
            className="hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold font-sans text-muted hover:text-ink"
          >
            Features
          </button>
          <button
            onClick={() => onNavigate('technology')}
            className="hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold font-sans text-muted hover:text-ink"
          >
            Technology
          </button>
          <button
            onClick={() => onNavigate('demo')}
            className="hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold font-sans text-muted hover:text-ink"
          >
            Sandbox
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="rounded-md bg-surface-card text-ink hover:bg-surface-strong px-4 py-2 text-xs font-bold transition-all shadow-sm border border-hairline"
          >
            Upload Video
          </Link>
          <Link
            to="/demo"
            className="rounded-md bg-primary text-on-primary hover:bg-brand-pink hover:text-white px-4 py-2 text-xs font-bold transition-all shadow-sm"
          >
            Launch Demo
          </Link>
        </div>
      </div>
    </header>
  )
}
