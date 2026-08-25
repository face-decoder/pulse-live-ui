import { useEffect, useState } from 'react'
import { createSimulatedPrediction } from '../lib/simulated-telemetry'
import type { PredictionResult } from '#/types'

interface UseSimulatedPredictionOptions {
  prediction: PredictionResult | null

  active: boolean
}

export function useSimulatedPrediction({
  prediction,
  active,
}: UseSimulatedPredictionOptions): PredictionResult | null {
  const [tick, setTick] = useState(0)

  const needsSimulation = active && !prediction

  useEffect(() => {
    if (!needsSimulation) return

    const interval = setInterval(() => setTick((t) => t + 1), 100)
    return () => clearInterval(interval)
  }, [needsSimulation])

  if (prediction) return prediction
  if (!needsSimulation) return null

  return createSimulatedPrediction(tick)
}
