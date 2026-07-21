import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import type { PredictionResult, TopPredictedFeature } from '#/types'
import { MagnitudeLineChart } from './magnitude-line-chart'

interface VideoUploadResultsProps {
  result: PredictionResult
}

export function VideoUploadResults({ result }: VideoUploadResultsProps) {
  const getLabelColor = (label?: string) => {
    if (!label) return 'bg-surface-card text-ink'
    const lowerLabel = label.toLowerCase()
    if (lowerLabel.includes('high')) return 'bg-brand-coral/10 text-brand-coral'
    if (lowerLabel.includes('low')) return 'bg-brand-mint/10 text-brand-mint'
    return 'bg-brand-teal/10 text-brand-teal'
  }

  const getLabelBgColor = (label?: string) => {
    if (!label) return 'bg-surface-card'
    const lowerLabel = label.toLowerCase()
    if (lowerLabel.includes('high')) return 'bg-brand-coral/5'
    if (lowerLabel.includes('low')) return 'bg-brand-mint/5'
    return 'bg-brand-teal/5'
  }

  return (
    <div className="w-full space-y-6">
      {/* Prediction Header */}
      <div className={`p-6 rounded-lg border border-hairline ${getLabelBgColor(result.label)}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Prediction Result</h2>
            <p className="text-sm text-muted mt-1">
              {result.n_frames ? `Analyzed ${result.n_frames} frames` : 'Video analyzed'}
            </p>
          </div>
          {result.label && (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getLabelColor(result.label)}`}>
              {result.label.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Confidence Score */}
      {result.confidence !== undefined && (
        <div className="bg-surface-card p-4 rounded-lg border border-hairline">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-ink">Confidence Score</h3>
            <CheckCircle className="w-5 h-5 text-brand-teal" />
          </div>
          <div className="text-3xl font-bold text-ink">
            {(result.confidence * 100).toFixed(1)}%
          </div>
          <div className="mt-3 w-full bg-surface-strong rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-brand-teal transition-all"
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
          {result.prob_high !== undefined && result.prob_low !== undefined && (
            <div className="flex justify-between text-xs text-muted mt-2">
              <span>High: {(result.prob_high * 100).toFixed(1)}%</span>
              <span>Low: {(result.prob_low * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Apex Detection Summary */}
      {result.n_apex_detected !== undefined && (
        <div className="bg-surface-card p-4 rounded-lg border border-hairline">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-brand-peach" />
            <h3 className="text-sm font-medium text-ink">Micro-Expression Detection</h3>
          </div>
          <div className="text-2xl font-bold text-ink">
            {result.n_apex_detected} apex{result.n_apex_detected !== 1 ? 'es' : ''} detected
          </div>
        </div>
      )}

      {/* Top Features */}
      {result.top_features && result.top_features.length > 0 && (
        <div className="bg-surface-card p-4 rounded-lg border border-hairline">
          <h3 className="text-sm font-medium text-ink mb-3">Top Contributing Features</h3>
          <div className="space-y-3">
            {result.top_features.map((feature: TopPredictedFeature, idx: number) => (
              <div key={idx} className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">
                      {feature.name.replace(/_/g, ' ')}
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-surface-strong text-muted rounded">
                      {feature.direction}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-surface-strong rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-brand-peach"
                        style={{ width: `${Math.min(feature.saliency * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted whitespace-nowrap">
                      Saliency: {(feature.saliency * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-ink">{feature.value.toFixed(3)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Magnitude Chart with Detected Phases */}
      {(result.magnitudes && result.magnitudes.length > 0) || (result.detected_phases && result.detected_phases.length > 0) ? (
        <MagnitudeLineChart
          magnitudes={result.magnitudes || []}
          detected_phases={result.detected_phases}
          n_frames={result.n_frames}
        />
      ) : null}

      {/* Latency Info */}
      {result.latency_ms !== undefined && (
        <div className="text-xs text-muted text-right">
          Pipeline latency: {result.latency_ms.toFixed(2)}ms
        </div>
      )}

      {/* Warning Message */}
      {result.warning && (
        <div className="flex items-start gap-3 p-3 bg-brand-ochre/10 border border-brand-ochre/20 rounded">
          <AlertCircle className="w-5 h-5 text-brand-ochre flex-shrink-0 mt-0.5" />
          <p className="text-sm text-brand-ochre">{result.warning}</p>
        </div>
      )}
    </div>
  )
}
