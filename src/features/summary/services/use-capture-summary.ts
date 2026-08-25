import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api'
import type { SessionBatchResponse } from '#/types'

export function getCaptureSummary() {
  return apiGet<SessionBatchResponse>('/logs/summary')
}

export function useCaptureSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: getCaptureSummary,
  })
}
