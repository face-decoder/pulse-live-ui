# Pulse Live UI

Pulse Live UI is a web interface for real-time facial micro-expression analytics. It connects to the `pulse-live` computer vision backend over WebRTC and WebSockets for real-time video streaming, face tracking bounding box overlays, optical flow motion telemetry, micro-expression phase spotting, and video file batch analysis.

---

## Features

- **Real-Time Video Streaming**: WebRTC and binary WebSocket video frame ingestion.
- **Sub-Frame Face Tracking**: Real-time rendering of face bounding box overlays.
- **Motion Telemetry**: Live chart visualization of raw and smoothed optical flow magnitudes.
- **Micro-Expression Spotting**: Phase landmark analysis (Onset, Apex, Offset).
- **Video File Upload**: Chunked binary upload for file analysis with MinIO artifact exports (CSV and NPZ).
- **Session History & Latency**: Session monitoring and end-to-end latency metrics.

---

## Tech Stack

- **Framework**: React 19, TanStack Start, TanStack Router, Vite
- **Styling**: Tailwind CSS v4, Lucide React
- **Validation**: TypeScript, Zod, T3 Env

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_APP_TITLE="Pulse Live - Real-time Micro-Expression Analytics"
VITE_SOCKET_URL="ws://localhost:8000/ws/stream"
VITE_RTC_SOCKET_URL="ws://localhost:8000/ws/rtc"
VITE_SPOTTING_MODE="onset-apex-offset"
```

### Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter and formatting checks
npm run check
```

---

## Project Structure

```text
src/
├── features/         Domain features (micro-expression, video-capture, video-upload)
├── hooks/            Custom React hooks (WebRTC, MediaStream, VideoUpload)
├── pages/            Page view components
├── routes/           TanStack file-based routes
├── types/            TypeScript type definitions
└── env.ts            Environment variable schema
```

---

## API Documentation

For detailed WebSockets and WebRTC message schemas, refer to [API_CONTRACT.md](API_CONTRACT.md).
