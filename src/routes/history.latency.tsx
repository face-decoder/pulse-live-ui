import { createFileRoute } from '@tanstack/react-router'
import GlobalLatencyPage from '#/pages/history/global-latency'

export const Route = createFileRoute('/history/latency')({
  component: GlobalLatencyPage,
  head: () => ({
    meta: [{ title: 'Global Latency Dashboard - Pulse Live' }],
  }),
})
