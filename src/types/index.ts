export interface TopPredictedFeature {
  name: string
  value: number
  saliency: number
  direction: string
}

export interface FaceBBox {
  x: number
  y: number
  width: number
  height: number
  abs_x?: number
  abs_y?: number
  abs_width?: number
  abs_height?: number
}

export interface DetectedPhase {
  onset: number
  apex: number
  offset: number
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
  face_bboxes?: Array<FaceBBox | null>
  magnitudes?: Array<number>
  smoothed_magnitudes?: Array<number>
  detected_phases?: Array<DetectedPhase>
  latency_ms?: number
}

export interface BBoxMessage {
  type: 'bbox'
  bbox: FaceBBox | null
  latency_ms: number
}

export interface AlertMessage {
  type: 'alert'
  alert_type: string
  message: string
}

export interface VideoStatusMessage {
  type: 'status'
  status: 'receiving' | 'received' | 'processing' | 'completed'
  message?: string
  bytes_received?: number
}

export interface ProgressMessage {
  type: 'progress'
  step: 'optical_flow' | 'uploading'
  message?: string
  n_frames?: number
  n_apex?: number
}

export interface ArtifactMessage {
  type: 'artifacts'
  csv_url: string
  npz_url: string
  csv_key: string
  npz_key: string
}

export type VideoUploadMessage =
  | VideoStatusMessage
  | ProgressMessage
  | PredictionResult
  | ArtifactMessage
  | { type: 'error'; message: string }
