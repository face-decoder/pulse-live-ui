import type {
  DetectedPhase,
  LatencyRecord,
  MergedSessionTelemetry,
  SessionDetection,
  TelemetryChunk,
} from '#/types'

export function formatStatusLabel(label: string | undefined): string {
  if (!label) return ''
  if (label === 'anxiety_tinggi') return 'Anxiety Tinggi'
  if (label === 'anxiety_rendah') return 'Anxiety Rendah'
  return label.toUpperCase()
}

export function isHighAnxietyLabel(label: string | undefined): boolean {
  return label === 'high' || label === 'anxiety_tinggi'
}

export function mergeSessionDetections(
  detections: SessionDetection[],
): MergedSessionTelemetry | null {
  if (detections.length === 0) return null

  let offsetAcc = 0
  const smoothed: number[] = []
  const phases: DetectedPhase[] = []
  const chunks: TelemetryChunk[] = []

  for (const detection of detections) {
    const magnitudes = detection.smoothed_magnitudes ?? []
    const len = magnitudes.length

    smoothed.push(...magnitudes)

    for (const phase of detection.detected_phases ?? []) {
      phases.push({
        onset: phase.onset + offsetAcc,
        apex: phase.apex + offsetAcc,
        offset: phase.offset + offsetAcc,
      })
    }

    chunks.push({
      startIndex: offsetAcc,
      endIndex: offsetAcc + len - 1,
      label: detection.label,
      confidence: detection.confidence,
      latency_ms: detection.latency_ms,
    })

    offsetAcc += len
  }

  return { smoothed, phases, chunks }
}

export interface SessionLatencyStats {
  avgTotal: string
  maxTotal: string
  minTotal: string
  avgWebrtc: string
  avgLandmark: string
  avgFlow: string
  avgSpotting: string
  avgInference: string
  count: number
}

export function computeLatencyStats(
  latencies: LatencyRecord[],
): SessionLatencyStats | null {
  if (latencies.length === 0) return null

  let total = 0
  let webrtc = 0
  let landmark = 0
  let flow = 0
  let spotting = 0
  let inference = 0
  let maxTotal = -Infinity
  let minTotal = Infinity

  for (const l of latencies) {
    total += l.total_latency_ms
    webrtc += l.webrtc_latency_avg_ms
    landmark += l.landmark_latency_avg_ms
    flow += l.flow_latency_avg_ms
    spotting += l.spotting_latency_ms
    inference += l.model_inference_latency_ms

    if (l.total_latency_ms > maxTotal) maxTotal = l.total_latency_ms
    if (l.total_latency_ms < minTotal) minTotal = l.total_latency_ms
  }

  const count = latencies.length
  const fixed = (n: number) => n.toFixed(2)

  return {
    avgTotal: fixed(total / count),
    maxTotal: fixed(maxTotal),
    minTotal: fixed(minTotal),
    avgWebrtc: fixed(webrtc / count),
    avgLandmark: fixed(landmark / count),
    avgFlow: fixed(flow / count),
    avgSpotting: fixed(spotting / count),
    avgInference: fixed(inference / count),
    count,
  }
}
