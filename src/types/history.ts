import type { DetectedPhase } from './prediction'

export interface SessionSummary {
  session_id: string
  total_detections: number
}

export interface HistoryResponse {
  sessions: SessionSummary[]
}

export interface SessionDetection {
  detection_id?: string
  label?: string
  confidence?: number
  latency_ms?: number
  smoothed_magnitudes?: number[]
  detected_phases?: DetectedPhase[]
}

export interface SessionBatchResponse {
  detections: SessionDetection[]
}

export interface LatencyRecord {
  detection_id: string
  webrtc_latency_avg_ms: number
  landmark_latency_avg_ms: number
  flow_latency_avg_ms: number
  spotting_latency_ms: number
  model_inference_latency_ms: number
  total_latency_ms: number
}

export interface LatenciesResponse {
  latencies: LatencyRecord[]
}

export interface GlobalLatencyAverages {
  webrtc_latency_avg_ms: number
  landmark_latency_avg_ms: number
  flow_latency_avg_ms: number
  spotting_latency_ms: number
  model_inference_latency_ms: number
  total_latency_ms: number
}

export interface GlobalLatencySummary {
  total_detections_analyzed: number
  global_averages: GlobalLatencyAverages
}

export interface TelemetryChunk {
  startIndex: number
  endIndex: number
  label?: string
  confidence?: number
  latency_ms?: number
}

export interface MergedSessionTelemetry {
  smoothed: number[]
  phases: DetectedPhase[]
  chunks: TelemetryChunk[]
}
