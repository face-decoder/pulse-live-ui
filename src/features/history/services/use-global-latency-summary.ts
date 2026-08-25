import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api'
import type { GlobalLatencySummary } from '#/types'

export function getGlobalLatencySummary() {
  return apiGet<GlobalLatencySummary>('/history/latencies/summary')
}

export function useGlobalLatencySummary() {
  return useQuery({
    queryKey: ['history', 'latencies', 'summary'],
    queryFn: getGlobalLatencySummary,
  })
}
