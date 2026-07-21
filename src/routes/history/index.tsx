import { createFileRoute } from '@tanstack/react-router'
import HistoryPage from '#/pages/history/index'

export const Route = createFileRoute('/history/')({
  component: HistoryRoute,
  head: () => ({
    meta: [{ title: 'Riwayat Deteksi - Pulse Live' }],
  }),
})

function HistoryRoute() {
  return <HistoryPage />
}
