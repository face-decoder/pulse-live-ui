import { useState } from 'react'
import type { DetectedPhase } from '#/types'

interface MagnitudeLineChartProps {
  magnitudes: number[]
  detected_phases?: DetectedPhase[]
  n_frames?: number
}

export function MagnitudeLineChart({
  magnitudes,
  detected_phases = [],
  n_frames,
}: MagnitudeLineChartProps) {
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number | null>(null)

  if (magnitudes.length === 0) {
    return (
      <div className="bg-surface-card p-4 rounded-lg border border-hairline flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">
          No magnitude data available
        </p>
      </div>
    )
  }

  const frameCount = n_frames || magnitudes.length
  const maxMagnitude = Math.max(...magnitudes, 1)
  const minMagnitude = Math.min(...magnitudes, 0)
  const magnitudeRange = maxMagnitude - minMagnitude || 1

  const width = 800
  const height = 300
  const margin = { top: 20, right: 30, bottom: 40, left: 50 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const xScale = (frameIdx: number) => {
    return margin.left + (frameIdx / (frameCount - 1)) * chartWidth
  }

  const yScale = (value: number) => {
    const normalizedValue = (value - minMagnitude) / magnitudeRange
    return margin.top + chartHeight - normalizedValue * chartHeight
  }

  const pathData = magnitudes
    .map((value, idx) => {
      const x = xScale(idx)
      const y = yScale(value)
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const areaData =
    'M ' +
    xScale(0) +
    ' ' +
    yScale(magnitudes[0]) +
    ' ' +
    pathData.substring(2) +
    ` L ${xScale(magnitudes.length - 1)} ${margin.top + chartHeight} L ${xScale(0)} ${margin.top + chartHeight} Z`

  const getPhaseColorHex = (idx: number) => {
    const colors = ['#FBBF6F', '#D84949', '#4ECDC4', '#A8E6D9', '#F4A46B']
    return colors[idx % colors.length]
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-surface-card p-4 rounded-lg border border-hairline">
        <h3 className="text-sm font-medium text-ink mb-3">
          Magnitude Over Time
        </h3>

        <div className="overflow-x-auto">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full min-w-max"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="1"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={chartHeight}
                  stroke="#E0E0E0"
                  strokeWidth="0.5"
                />
              </pattern>
              <linearGradient
                id="areaGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {detected_phases.map((phase, idx) => {
              const x1 = xScale(phase.onset)
              const x2 = xScale(phase.offset)
              const isSelected = selectedPhaseIdx === idx
              const opacity = isSelected ? 0.25 : 0.08

              return (
                <rect
                  key={`phase-${idx}`}
                  x={x1}
                  y={margin.top}
                  width={x2 - x1}
                  height={chartHeight}
                  fill={getPhaseColorHex(idx)}
                  opacity={opacity}
                  cursor="pointer"
                  onMouseEnter={() => setSelectedPhaseIdx(idx)}
                  onMouseLeave={() => setSelectedPhaseIdx(null)}
                />
              )
            })}

            <path d={areaData} fill="url(#areaGradient)" />

            <path
              d={pathData}
              stroke="#4ECDC4"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {detected_phases.map((phase, idx) => {
              const apexX = xScale(phase.apex)
              const apexValue = magnitudes[phase.apex] || 0
              const apexY = yScale(apexValue)

              return (
                <circle
                  key={`apex-${idx}`}
                  cx={apexX}
                  cy={apexY}
                  r="4"
                  fill={getPhaseColorHex(idx)}
                  stroke="white"
                  strokeWidth="2"
                />
              )
            })}

            <line
              x1={margin.left}
              y1={margin.top + chartHeight}
              x2={width - margin.right}
              y2={margin.top + chartHeight}
              stroke="#999999"
              strokeWidth="1"
            />

            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={margin.top + chartHeight}
              stroke="#999999"
              strokeWidth="1"
            />

            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const frameIdx = Math.round(ratio * (frameCount - 1))
              const x = xScale(frameIdx)

              return (
                <g key={`x-label-${idx}`}>
                  <line
                    x1={x}
                    y1={margin.top + chartHeight}
                    x2={x}
                    y2={margin.top + chartHeight + 5}
                    stroke="#999999"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={margin.top + chartHeight + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#999999"
                  >
                    Frame {frameIdx}
                  </text>
                </g>
              )
            })}

            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const value = minMagnitude + ratio * magnitudeRange
              const y = yScale(value)

              return (
                <g key={`y-label-${idx}`}>
                  <line
                    x1={margin.left - 5}
                    y1={y}
                    x2={margin.left}
                    y2={y}
                    stroke="#999999"
                    strokeWidth="1"
                  />
                  <text
                    x={margin.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#999999"
                  >
                    {value.toFixed(2)}
                  </text>
                </g>
              )
            })}

            <text
              x={width / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize="13"
              fill="#666666"
              fontWeight="500"
            >
              Frame Index
            </text>

            <text
              x={15}
              y={height / 2}
              textAnchor="middle"
              fontSize="13"
              fill="#666666"
              fontWeight="500"
              transform={`rotate(-90 15 ${height / 2})`}
            >
              Magnitude
            </text>
          </svg>
        </div>
      </div>

      {detected_phases.length > 0 && (
        <div className="bg-surface-card p-4 rounded-lg border border-hairline">
          <h4 className="text-sm font-medium text-ink mb-3">Detected Phases</h4>
          <div className="flex gap-3 overflow-x-auto">
            {detected_phases.map((phase, idx) => {
              const isSelected = selectedPhaseIdx === idx
              const duration = phase.offset - phase.onset + 1

              return (
                <div
                  key={`legend-${idx}`}
                  className={`min-w-55 shrink-0 p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-teal bg-brand-teal/10'
                      : 'border-hairline bg-surface-soft hover:bg-surface-strong'
                  }`}
                  onMouseEnter={() => setSelectedPhaseIdx(idx)}
                  onMouseLeave={() => setSelectedPhaseIdx(null)}
                  onClick={() =>
                    setSelectedPhaseIdx(selectedPhaseIdx === idx ? null : idx)
                  }
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: getPhaseColorHex(idx) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">
                        Phase {idx + 1}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <p>Onset: Frame {phase.onset}</p>
                        <p>Apex: Frame {phase.apex}</p>
                        <p>Offset: Frame {phase.offset}</p>
                        <p className="font-medium text-body">
                          Duration: {duration} frames
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-hairline">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Phases</p>
                <p className="text-lg font-semibold text-ink">
                  {detected_phases.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Duration</p>
                <p className="text-lg font-semibold text-ink">
                  {detected_phases.reduce(
                    (sum, p) => sum + (p.offset - p.onset + 1),
                    0,
                  )}{' '}
                  frames
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Video Length</p>
                <p className="text-lg font-semibold text-ink">
                  {frameCount} frames
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
