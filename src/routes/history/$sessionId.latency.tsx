import { createFileRoute } from '@tanstack/react-router'
import HistoryLatencyPage from '#/pages/history/latency'

export const Route = createFileRoute('/history/$sessionId/latency')({
  component: HistoryLatencyRoute,
  head: () => ({
    meta: [{ title: 'Dashboard Latensi - Pulse Live' }],
  }),
})

function HistoryLatencyRoute() {
  const { sessionId } = Route.useParams()
  return <HistoryLatencyPage sessionId={sessionId} />
}
