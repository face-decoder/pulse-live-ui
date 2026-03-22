export interface TopPredictedFeature {
  name: string
  value: number
  saliency: number
  direction: string
}

export interface PredictionResult {
  type: string
  label?: string
  confidence?: number
  prob_high?: number
  prob_low?: number
  n_apex_detected?: number
  n_frames?: number
  warning?: string
  top_features?: Array<TopPredictedFeature>
  message?: string
}
