import { createFileRoute } from '@tanstack/react-router'
import VideoCapture from '#/pages/video-capture'

export const Route = createFileRoute('/')({
  component: VideoCapturePage,
  head: () => ({
    meta: [{ title: 'Pulse Live' }],
  }),
})

function VideoCapturePage() {
  return <VideoCapture />
}
