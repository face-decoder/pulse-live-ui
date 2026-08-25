import { useMemo, useState } from 'react'
import type { DetectedPhase, TelemetryChunk } from '#/types'
import { env } from '#/env'
import { formatStatusLabel } from '#/lib/detection'

export interface MotionTelemetryChartProps {
  magnitudes?: number[]
  smoothedMagnitudes?: number[]
  detectedPhases?: DetectedPhase[]
  chunks?: TelemetryChunk[]
}

export function MotionTelemetryChart({
  magnitudes = [],
  smoothedMagnitudes = [],
  detectedPhases = [],
  chunks = [],
}: MotionTelemetryChartProps) {
  const rawData = magnitudes
  const smoothedData = smoothedMagnitudes

  const pointsCount = Math.max(rawData.length, smoothedData.length)

  const [clickedPhase, setClickedPhase] = useState<{
    x: number
    data: TelemetryChunk | undefined
  } | null>(null)

  const {
    pointsRaw,
    pointsSmoothed,
    phaseMarkers,
    phaseHighlights,
    chartWidth,
    xTicks,
    chunkBoundaries,
  } = useMemo(() => {
    let max = 0.2
    for (const v of rawData) if (v > max) max = v
    for (const v of smoothedData) if (v > max) max = v
    max = max * 1.15

    const width = Math.max(300, pointsCount * 15)
    const height = 400
    const paddingX = 15
    const paddingY = 15

    const getX = (index: number) => {
      if (pointsCount <= 1) return paddingX
      return paddingX + (index / (pointsCount - 1)) * (width - 2 * paddingX)
    }

    const getY = (val: number) => {
      return height - paddingY - (val / max) * (height - 2 * paddingY)
    }

    const pRaw = rawData.map((v, i) => ({ x: getX(i), y: getY(v) }))
    const pSmoothed = smoothedData.map((v, i) => ({ x: getX(i), y: getY(v) }))

    const markers: Array<{
      type: 'onset' | 'apex' | 'offset'
      x: number
      y: number
      label: string
    }> = []
    if (detectedPhases.length > 0) {
      detectedPhases.forEach((phase) => {
        if (typeof phase.onset === 'number' && phase.onset < pointsCount) {
          const val = smoothedData[phase.onset] || rawData[phase.onset] || 0
          markers.push({
            type: 'onset',
            x: getX(phase.onset),
            y: getY(val),
            label: 'Onset',
          })
        }
        if (typeof phase.apex === 'number' && phase.apex < pointsCount) {
          const val = smoothedData[phase.apex] || rawData[phase.apex] || 0
          markers.push({
            type: 'apex',
            x: getX(phase.apex),
            y: getY(val),
            label: 'Apex',
          })
        }
        if (
          env.VITE_SPOTTING_MODE !== 'onset-apex' &&
          typeof phase.offset === 'number' &&
          phase.offset < pointsCount
        ) {
          const val = smoothedData[phase.offset] || rawData[phase.offset] || 0
          markers.push({
            type: 'offset',
            x: getX(phase.offset),
            y: getY(val),
            label: 'Offset',
          })
        }
      })
    }

    const highlights: Array<{
      x: number
      width: number
      data: TelemetryChunk | undefined
    }> = []
    if (detectedPhases.length > 0) {
      detectedPhases.forEach((phase) => {
        let xStart = -1
        let xEnd = -1

        if (typeof phase.onset === 'number') {
          xStart = getX(phase.onset)

          if (
            env.VITE_SPOTTING_MODE !== 'onset-apex' &&
            typeof phase.offset === 'number'
          ) {
            xEnd = getX(phase.offset)
          } else if (typeof phase.apex === 'number') {
            xEnd = getX(phase.apex)
          }
        }

        if (xStart !== -1 && xEnd !== -1 && xEnd > xStart) {
          const frameIndex = phase.onset
          const chunkMatch = chunks.find(
            (c) => frameIndex >= c.startIndex && frameIndex <= c.endIndex,
          )
          highlights.push({ x: xStart, width: xEnd - xStart, data: chunkMatch })
        }
      })
    }

    const ticks: Array<{ x: number; label: string }> = []
    if (chunks.length > 0) {
      ticks.push({ x: getX(chunks[0].startIndex), label: '0.0s' })

      for (let i = 1; i < chunks.length; i++) {
        ticks.push({
          x: getX(chunks[i].startIndex),
          label: `${(i * 1.5).toFixed(1)}s`,
        })
      }

      const lastChunk = chunks[chunks.length - 1]
      ticks.push({
        x: getX(lastChunk.endIndex),
        label: `${(chunks.length * 1.5).toFixed(1)}s`,
      })
    }

    const boundaries: number[] = []
    for (let i = 1; i < chunks.length; i++) {
      boundaries.push(getX(chunks[i].startIndex))
    }

    return {
      maxValue: max,
      pointsRaw: pRaw,
      pointsSmoothed: pSmoothed,
      phaseMarkers: markers,
      phaseHighlights: highlights,
      chartWidth: width,
      xTicks: ticks,
      chunkBoundaries: boundaries,
    }
  }, [rawData, smoothedData, detectedPhases, pointsCount, chunks])

  if (pointsCount === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-[10px] text-muted font-semibold bg-canvas rounded-lg border border-hairline p-4">
        No motion telemetry available
      </div>
    )
  }

  const rawPath = pointsRaw
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')
  const smoothedPath = pointsSmoothed
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaPath =
    pointsSmoothed.length > 0
      ? `${smoothedPath} L ${pointsSmoothed[pointsSmoothed.length - 1].x} 385 L ${pointsSmoothed[0].x} 385 Z`
      : ''

  return (
    <div className="bg-surface-card border border-hairline rounded-xl p-4 shadow-sm relative">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[10px] font-bold text-ink uppercase tracking-wider">
          Motion Capture Signal
        </h4>
        <div className="flex gap-2.5 text-[9px] font-bold">
          {rawData.length > 0 && (
            <span className="flex items-center gap-1 text-muted">
              <span className="w-2 h-0.5 bg-brand-lavender inline-block" /> Raw
            </span>
          )}
          <span className="flex items-center gap-1 text-brand-pink">
            <span className="w-2 h-0.5 bg-brand-pink inline-block" /> Smoothed
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto overflow-y-hidden hide-scrollbar">
        <svg
          viewBox={`0 0 ${chartWidth} 400`}
          className="h-100 w-auto overflow-visible"
          style={{ minWidth: chartWidth }}
          onClick={() => setClickedPhase(null)}
        >
          <defs>
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-brand-pink)"
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor="var(--color-brand-pink)"
                stopOpacity="0.00"
              />
            </linearGradient>
            <pattern
              id="arsirPattern"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="10"
                stroke="var(--color-brand-mint)"
                strokeWidth="5"
                opacity="0.4"
              />
            </pattern>
          </defs>

          {phaseHighlights.map((hl, i) => (
            <rect
              key={`hl-${i}`}
              x={hl.x}
              y={15}
              width={hl.width}
              height={370}
              fill="url(#arsirPattern)"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                setClickedPhase({ x: hl.x + hl.width / 2, data: hl.data })
              }}
            />
          ))}

          {[15, 107.5, 200, 292.5, 385].map((y, i) => (
            <line
              key={i}
              x1="15"
              y1={y}
              x2={chartWidth - 15}
              y2={y}
              stroke="var(--color-hairline)"
              strokeWidth="0.5"
              strokeDasharray={i === 4 ? '0' : '3 3'}
              pointerEvents="none"
            />
          ))}

          {chunkBoundaries.map((xPos, i) => (
            <line
              key={`split-${i}`}
              x1={xPos}
              y1={15}
              x2={xPos}
              y2={385}
              stroke="var(--color-muted-soft)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.6"
              pointerEvents="none"
            />
          ))}

          {rawPath && (
            <path
              d={rawPath}
              fill="none"
              stroke="var(--color-brand-lavender)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.8"
              pointerEvents="none"
            />
          )}

          {areaPath && (
            <path
              d={areaPath}
              fill="url(#chartAreaGrad)"
              pointerEvents="none"
            />
          )}

          {smoothedPath && (
            <path
              d={smoothedPath}
              fill="none"
              stroke="var(--color-brand-pink)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}

          {phaseMarkers.map((marker, i) => (
            <g key={i} pointerEvents="none">
              <line
                x1={marker.x}
                y1="15"
                x2={marker.x}
                y2="385"
                stroke={
                  marker.type === 'onset'
                    ? 'var(--color-brand-mint)'
                    : marker.type === 'apex'
                      ? 'var(--color-brand-coral)'
                      : 'var(--color-brand-ochre)'
                }
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={marker.x}
                cy={marker.y}
                r="5"
                fill={
                  marker.type === 'onset'
                    ? 'var(--color-brand-mint)'
                    : marker.type === 'apex'
                      ? 'var(--color-brand-coral)'
                      : 'var(--color-brand-ochre)'
                }
                stroke="white"
                strokeWidth="1.5"
              />
              <text
                x={marker.x}
                y={marker.y > 35 ? marker.y - 12 : marker.y + 18}
                textAnchor="middle"
                fontSize="9px"
                fontWeight="bold"
                fill="var(--color-ink)"
                className="select-none bg-canvas"
                style={{
                  paintOrder: 'stroke',
                  stroke: 'var(--color-canvas)',
                  strokeWidth: 3,
                }}
              >
                {marker.label}
              </text>
            </g>
          ))}

          {xTicks.map((tick, i) => (
            <g key={`xtick-${i}`} pointerEvents="none">
              <line
                x1={tick.x}
                y1={385}
                x2={tick.x}
                y2={390}
                stroke="var(--color-muted)"
                strokeWidth="1"
              />
              <text
                x={tick.x}
                y={398}
                textAnchor="middle"
                fontSize="8px"
                fontWeight="600"
                fill="var(--color-muted)"
                className="select-none"
              >
                {tick.label}
              </text>
            </g>
          ))}
        </svg>

        {clickedPhase && clickedPhase.data && (
          <div
            className="absolute top-4 z-50 bg-ink text-canvas px-3 py-2 rounded-md shadow-lg pointer-events-none transition-all flex flex-col gap-1"
            style={{
              left: Math.min(clickedPhase.x, chartWidth - 150),
              transform: 'translateX(-50%)',
              minWidth: '130px',
            }}
          >
            <div className="text-[10px] uppercase font-bold text-muted-soft border-b border-surface-strong/30 pb-1 mb-1">
              Inference Data
            </div>
            <div className="text-xs font-bold">
              {formatStatusLabel(clickedPhase.data.label)}
            </div>
            <div className="text-xs">
              <span className="text-muted-soft">Conf:</span>{' '}
              {clickedPhase.data.confidence !== undefined
                ? `${(clickedPhase.data.confidence * 100).toFixed(1)}%`
                : '-'}
            </div>
            <div className="text-xs">
              <span className="text-muted-soft">Lat:</span>{' '}
              {clickedPhase.data.latency_ms ?? '-'}ms
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
