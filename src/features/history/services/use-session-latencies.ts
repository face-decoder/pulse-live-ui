import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api'
import type { LatenciesResponse } from '#/types'

export function getSessionLatencies(sessionId: string) {
  return apiGet<LatenciesResponse>(`/history/${sessionId}/latencies`)
}

export function useSessionLatencies(sessionId: string) {
  return useQuery({
    queryKey: ['history', sessionId, 'latencies'],
    queryFn: () => getSessionLatencies(sessionId),
  })
}
