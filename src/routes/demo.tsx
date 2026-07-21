import { createFileRoute } from '@tanstack/react-router'
import VideoCaptureDemo from '#/pages/video-capture-demo'

export const Route = createFileRoute('/demo')({
  component: VideoCaptureDemo,
  head: () => ({
    meta: [
      { title: 'Real-time Analytics Sandbox - Pulse Live' },
      {
        name: 'description',
        content:
          'Explore real-time micro-expression spotting and emotional analytics directly in your browser.',
      },
    ],
  }),
})
