import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api'
import type { HistoryResponse } from '#/types'

export function getHistorySessions() {
  return apiGet<HistoryResponse>('/history')
}

export function useHistorySessions() {
  return useQuery({
    queryKey: ['history'],
    queryFn: getHistorySessions,
  })
}
