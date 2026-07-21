import { createFileRoute } from '@tanstack/react-router'
import HistoryDetailPage from '#/pages/history/detail'

export const Route = createFileRoute('/history/$sessionId')({
  component: HistoryDetailRoute,
  head: () => ({
    meta: [{ title: 'Detail Sesi - Pulse Live' }],
  }),
})

function HistoryDetailRoute() {
  const { sessionId } = Route.useParams()
  return <HistoryDetailPage sessionId={sessionId} />
}
