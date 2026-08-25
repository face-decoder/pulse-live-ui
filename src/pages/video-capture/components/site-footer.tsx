import { Button } from '#/components/ui/button'

interface SiteFooterProps {
  onGoToSandbox: () => void
}

export function SiteFooter({ onGoToSandbox }: SiteFooterProps) {
  return (
    <footer className="max-w-6xl mx-auto px-6 mt-12 text-center pb-12">
      <div className="relative rounded-xl overflow-hidden border border-hairline h-48 md:h-64 mb-8 bg-surface-card flex items-center justify-center">
        <img
          src="/images/claymation_mountains.png"
          alt="Claymation Mountains Landscape"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="relative z-10 p-6 bg-canvas/90 backdrop-blur-sm rounded-md max-w-md border border-hairline shadow-sm mx-4 flex flex-col items-center">
          <h3 className="text-lg font-bold text-ink">
            Ready to start analyzing?
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            Connect your webcam sandbox demo above. Experiment with expression
            telemetry instantly.
          </p>
          <Button
            onClick={onGoToSandbox}
            className="mt-4 bg-brand-pink text-white hover:bg-brand-pink/90 text-xs font-bold"
          >
            Go to Sandbox
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between border-t border-hairline pt-6 text-[10px] text-muted-foreground gap-4">
        <span>© 2026 Pulse Live. Powered by the Clay brand design system.</span>
        <div className="flex gap-6 font-semibold">
          <a href="#" className="hover:text-ink transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-ink transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-ink transition-colors">
            Security Audit
          </a>
        </div>
      </div>
    </footer>
  )
}
