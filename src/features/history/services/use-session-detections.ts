import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api'
import type { SessionBatchResponse } from '#/types'

export function getSessionDetections(sessionId: string) {
  return apiGet<SessionBatchResponse>(`/history/${sessionId}/batch`)
}

export function useSessionDetections(sessionId: string) {
  return useQuery({
    queryKey: ['history', sessionId, 'batch'],
    queryFn: () => getSessionDetections(sessionId),
  })
}
