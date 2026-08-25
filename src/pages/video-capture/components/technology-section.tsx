import { CheckCircle2 } from 'lucide-react'

export function TechnologySection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded">
            Stack
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">
            Seamlessly integrated. Fully optimized.
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Pulse Live combines modern front-end tooling with optimized video
            decoding pipelines to bring raw performance right into your browser.
          </p>
          <ul className="space-y-3.5 text-xs text-ink/80 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-brand-teal" />
              <span>
                Feature-Sliced Design folder structures for modularity
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-brand-teal" />
              <span>Tailwind CSS v4 custom theme tokens & CSS variables</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-brand-teal" />
              <span>WebSocket telemetry synchronization with local state</span>
            </li>
          </ul>
        </div>
        <div className="flex-1 bg-surface-card border border-hairline rounded-xl p-8 w-full">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Real-time WebRTC Session Code
          </h4>
          <pre className="bg-canvas border border-hairline rounded-md p-4 text-[10px] font-mono text-ink/80 overflow-x-auto">
            {`const pc = new RTCPeerConnection(config);
stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
});

pc.ontrack = (event) => {
  console.log("Telemetry channel active");
};`}
          </pre>
        </div>
      </div>
    </section>
  )
}
