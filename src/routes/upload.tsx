import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useMemo } from 'react'
import { env } from '#/env'
import { MotionTelemetryChart } from '#/features/micro-expression/components/motion-telemetry-chart'

export const Route = createFileRoute('/upload')({
  component: VideoUploadRoute,
  head: () => ({ meta: [{ title: 'Video Analysis - Pulse Live' }] }),
})

function VideoUploadRoute() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [status, setStatus] = useState<string>('Idle')
  const ws = useRef<WebSocket | null>(null)

  // ponytail: minimal streaming client receiving rolling summaries
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPredictions([])
    setSummary(null)
    setStatus(`Uploading ${file.name}...`)
    const id = crypto.randomUUID()
    
    const baseUrl = env.VITE_SOCKET_URL || 'ws://localhost:8000/ws'
    ws.current = new WebSocket(`${baseUrl}/video/${id}`)
    
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: 'start', filename: file.name, size: file.size }))
      
      let offset = 0
      const chunkSize = 256 * 1024
      const reader = new FileReader()
      
      const readNext = () => reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
      
      reader.onload = (ev) => {
        if (ev.target?.result) {
           ws.current?.send(ev.target.result)
           offset += chunkSize
           if (offset < file.size) {
             readNext()
           } else {
             ws.current?.send(JSON.stringify({ type: 'end' }))
             setStatus('Processing...')
           }
        }
      }
      readNext()
    }
    
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'prediction') {
        setPredictions(prev => [...prev, data])
      } else if (data.type === 'summary') {
        // ponytail: rolling update applies instantly
        setSummary(data.data)
      } else if (data.type === 'status' && data.status === 'completed') {
        setStatus('Completed')
      } else if (data.type === 'error') {
        setStatus(`Error: ${data.message}`)
      }
    }
  }

  // ponytail: map global summary back to chunks for the chart using even distribution
  const chartChunks = useMemo(() => {
    if (!summary?.smoothed_magnitudes || predictions.length === 0) return []
    const framesPerChunk = Math.floor(summary.smoothed_magnitudes.length / predictions.length)
    return predictions.map((p, i) => ({
      startIndex: i * framesPerChunk,
      endIndex: (i + 1) * framesPerChunk - 1,
      label: p.label,
      confidence: p.confidence,
      latency_ms: p.latency_ms || 0
    }))
  }, [summary, predictions])

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <div className="w-full max-w-[95vw] mx-auto bg-surface-card border border-hairline rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Video Analysis Upload</h1>
        <Link to="/" className="text-brand-pink text-sm underline mb-8 inline-block mr-4">
          Back to Capture
        </Link>
        <Link to="/summary" className="text-brand-pink text-sm underline mb-8 inline-block">
          View Summary
        </Link>
        
        <div className="mb-8 p-4 border border-hairline rounded bg-surface-soft flex items-center justify-between">
          <input 
            type="file" 
            accept="video/webm" 
            onChange={handleUpload} 
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-brand-coral transition-colors"
          />
          <span className="font-mono text-sm text-muted">{status}</span>
        </div>

        {summary && (
          <div className="bg-brand-teal/10 border border-brand-teal/20 rounded-xl p-6 mb-8 text-brand-teal flex gap-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1">Total Windows</div>
              <div className="text-2xl font-mono">{summary.total_windows}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1">Anxiety Detected</div>
              <div className="text-2xl font-mono">{summary.anxiety_detected}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1">Avg Confidence</div>
              <div className="text-2xl font-mono">{(summary.avg_confidence * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}

        {summary?.smoothed_magnitudes?.length > 0 && (
          <div className="p-4 border border-hairline rounded bg-surface-soft mb-8">
            <MotionTelemetryChart
              magnitudes={summary.magnitudes || []}
              smoothedMagnitudes={summary.smoothed_magnitudes}
              detectedPhases={summary.detected_phases || []}
              chunks={chartChunks}
            />
          </div>
        )}

        {predictions.length > 0 && (
          <div className="bg-surface-card border border-hairline rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-soft border-b border-hairline">
                  <tr>
                    <th className="p-3 px-4 font-semibold text-muted">No.</th>
                    <th className="p-3 px-4 font-semibold text-muted">Waktu (Detik)</th>
                    <th className="p-3 px-4 font-semibold text-muted">Latency (ms)</th>
                    <th className="p-3 px-4 font-semibold text-muted">Hasil Deteksi</th>
                    <th className="p-3 px-4 font-semibold text-muted">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {predictions.map((p, i) => {
                    const startTime = (i * 1.5).toFixed(1)
                    const endTime = ((i + 1) * 1.5).toFixed(1)
                    const isHigh = p.label === 'high' || p.label === 'anxiety_tinggi'
                    const formatLabel = (lbl: string) => {
                      if (lbl === 'anxiety_tinggi') return 'Anxiety Tinggi'
                      if (lbl === 'anxiety_rendah') return 'Anxiety Rendah'
                      return lbl.toUpperCase()
                    }

                    return (
                      <tr key={i} className="bg-white hover:bg-surface-soft/50 transition-colors">
                        <td className="p-3 px-4 text-ink font-medium">{i + 1}</td>
                        <td className="p-3 px-4 text-ink">{startTime}s - {endTime}s</td>
                        <td className="p-3 px-4 text-ink">{p.latency_ms || 0}</td>
                        <td className="p-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isHigh ? 'bg-brand-coral/20 text-brand-coral' : 'bg-brand-mint/20 text-brand-mint'}`}>
                            {formatLabel(p.label)}
                          </span>
                        </td>
                        <td className="p-3 px-4 text-ink font-mono">
                          {(p.confidence * 100).toFixed(1)}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
