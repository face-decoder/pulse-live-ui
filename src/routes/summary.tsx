import { createFileRoute } from '@tanstack/react-router'
import SummaryPage from '#/pages/summary'

export const Route = createFileRoute('/summary')({
  component: SummaryPageRoute,
  head: () => ({
    meta: [{ title: 'Capture Summary - Pulse Live' }],
  }),
})

function SummaryPageRoute() {
  return <SummaryPage />
}
