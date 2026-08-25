import { z } from 'zod'
import { VideoStatus } from '#/types'
import type {
  AlertMessage,
  ArtifactMessage,
  BBoxMessage,
  ErrorMessage,
  PredictionResult,
  ProgressMessage,
  ServerMessage,
  VideoStatusMessage,
} from '#/types'

export const faceBBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  abs_x: z.number().optional(),
  abs_y: z.number().optional(),
  abs_width: z.number().optional(),
  abs_height: z.number().optional(),
})

export const predictionResultSchema = z.object({
  type: z.literal('prediction'),
  label: z.string().optional(),
  confidence: z.number().optional(),
  prob_high: z.number().optional(),
  prob_low: z.number().optional(),
  n_apex_detected: z.number().optional(),
  n_frames: z.number().optional(),
  warning: z.string().optional(),
  top_features: z
    .array(
      z.object({
        name: z.string(),
        value: z.number(),
        saliency: z.number(),
        direction: z.string(),
      }),
    )
    .optional(),
  message: z.string().optional(),
  face_bboxes: z.array(faceBBoxSchema.nullable()).optional(),
  magnitudes: z.array(z.number()).optional(),
  smoothed_magnitudes: z.array(z.number()).optional(),
  detected_phases: z
    .array(
      z.object({
        onset: z.number(),
        apex: z.number(),
        offset: z.number(),
      }),
    )
    .optional(),
  latency_ms: z.number().optional(),
}) satisfies z.ZodType<PredictionResult>

export const videoStatusMessageSchema = z.object({
  type: z.literal('status'),
  status: z.enum(VideoStatus),
  message: z.string().optional(),
  bytes_received: z.number().optional(),
}) satisfies z.ZodType<VideoStatusMessage>

const progressMessageSchema = z.object({
  type: z.literal('progress'),
  step: z.enum(['optical_flow', 'uploading']),
  message: z.string().optional(),
  n_frames: z.number().optional(),
  n_apex: z.number().optional(),
}) satisfies z.ZodType<ProgressMessage>

const bboxMessageSchema = z.object({
  type: z.literal('bbox'),
  bbox: faceBBoxSchema.nullable(),
  latency_ms: z.number(),
}) satisfies z.ZodType<BBoxMessage>

const alertMessageSchema = z.object({
  type: z.literal('alert'),
  alert_type: z.string(),
  message: z.string(),
}) satisfies z.ZodType<AlertMessage>

const artifactMessageSchema = z.object({
  type: z.literal('artifacts'),
  csv_url: z.string(),
  npz_url: z.string(),
  csv_key: z.string(),
  npz_key: z.string(),
}) satisfies z.ZodType<ArtifactMessage>

export const errorMessageSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
}) satisfies z.ZodType<ErrorMessage>

export const serverMessageSchema = z.discriminatedUnion('type', [
  bboxMessageSchema,
  alertMessageSchema,
  videoStatusMessageSchema,
  progressMessageSchema,
  predictionResultSchema,
  artifactMessageSchema,
  errorMessageSchema,
]) satisfies z.ZodType<ServerMessage>

export function parseServerMessage(data: unknown): ServerMessage | null {
  const result = serverMessageSchema.safeParse(data)
  return result.success ? result.data : null
}
