import type { PredictionResult } from '#/types'

export function createSimulatedPrediction(tick: number): PredictionResult {
  const magnitudes = Array.from({ length: 22 }, (_, i) => {
    const value =
      0.05 + 0.03 * Math.sin((tick + i) * 0.5) + 0.01 * Math.random()
    return Math.max(0.01, value)
  })

  const smoothed = magnitudes.map((value, i) => {
    const prev = magnitudes[i - 1] ?? value
    const next = magnitudes[i + 1] ?? value
    return (prev + value + next) / 3
  })

  return {
    type: 'prediction',
    label: 'Low',
    confidence: 0.94,
    prob_high: 0.06,
    prob_low: 0.94,
    n_frames: 23,
    n_apex_detected: 1,
    top_features: [
      {
        name: 'Lip Corner Puller (AU12)',
        saliency: 0.85,
        direction: 'increasing',
        value: 0,
      },
      {
        name: 'Brow Lowerer (AU4)',
        saliency: 0.15,
        direction: 'decreasing',
        value: 0,
      },
    ],
    message: 'Telemetry simulated. Waiting for stream analysis...',
    magnitudes,
    smoothed_magnitudes: smoothed,
    detected_phases: [{ onset: 4, apex: 10, offset: 16 }],
    latency_ms: 142.58,
  }
}
