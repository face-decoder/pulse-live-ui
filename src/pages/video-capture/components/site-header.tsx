import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

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

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-muted-foreground">
          <Link to="/upload" className="hover:text-ink transition-colors">
            Upload
          </Link>
          <Link to="/demo" className="hover:text-ink transition-colors">
            Demo
          </Link>
          <button
            onClick={() => onNavigate('features')}
            className="hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold font-sans text-muted-foreground hover:text-ink"
          >
            Features
          </button>
          <button
            onClick={() => onNavigate('technology')}
            className="hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold font-sans text-muted-foreground hover:text-ink"
          >
            Technology
          </button>
          <button
            onClick={() => onNavigate('demo')}
            className="hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold font-sans text-muted-foreground hover:text-ink"
          >
            Sandbox
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="text-xs font-bold">
            <Link to="/upload">Upload Video</Link>
          </Button>
          <Button asChild className="text-xs font-bold hover:bg-brand-pink">
            <Link to="/demo">Launch Demo</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
