import { Link } from '@tanstack/react-router'
import { useHistorySessions } from '#/features/history/services/use-history-sessions'
import { getErrorMessage } from '#/lib/api'
import { ArrowRight, Activity, Loader2 } from 'lucide-react'

export default function HistoryPage() {
  const { data, error, isPending } = useHistorySessions()
  const sessions = data?.sessions ?? []

  if (isPending)
    return (
      <div className="p-8 text-center text-ink flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-brand-pink" />
      </div>
    )

  if (error)
    return (
      <div className="p-8 text-center text-brand-coral">
        Error: {getErrorMessage(error)}
      </div>
    )

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <div className="w-full max-w-4xl mx-auto bg-surface-card border border-hairline rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Riwayat Deteksi</h1>
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <Link
            to="/"
            className="text-brand-pink text-sm underline hover:text-brand-pink/80 transition-colors"
          >
            Kembali ke Beranda
          </Link>

          <Link
            to="/history/latency"
            className="flex items-center gap-2 bg-surface-soft hover:bg-surface-soft/80 border border-hairline px-4 py-2 rounded-lg text-sm transition-colors text-ink font-medium shadow-sm"
          >
            <Activity className="w-4 h-4 text-brand-coral" />
            Dashboard Latensi Global
          </Link>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className="border border-hairline rounded-xl p-5 bg-surface-soft flex items-center justify-between hover:bg-surface-soft/80 transition-colors shadow-sm hover:shadow-md"
              >
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    Sesi:{' '}
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded border border-hairline ml-2">
                      {session.session_id}
                    </span>
                  </h2>
                  <p className="text-sm text-muted mt-2">
                    {session.total_detections} deteksi ditemukan
                  </p>
                </div>
                <Link
                  to="/history/$sessionId"
                  params={{ sessionId: session.session_id }}
                  className="bg-brand-coral hover:bg-brand-coral/90 text-white px-5 py-2.5 rounded-lg text-sm transition-colors font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  Lihat Detail Sesi <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-soft rounded-xl border border-hairline border-dashed">
            <p className="text-muted">Belum ada riwayat deteksi.</p>
          </div>
        )}
      </div>
    </div>
  )
}
