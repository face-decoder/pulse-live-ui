import { Link } from '@tanstack/react-router'
import { useHistorySessions } from '#/features/history/services/use-history-sessions'
import { ArrowRight, Activity } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { PageLoader } from '#/components/page-loader'
import { QueryErrorState } from '#/components/query-error-state'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export default function HistoryPage() {
  const { data, error, isPending } = useHistorySessions()
  const sessions = data?.sessions ?? []

  if (isPending) return <PageLoader />

  if (error) return <QueryErrorState error={error} />

  return (
    <div className="bg-canvas min-h-screen text-ink p-8">
      <Card className="w-full max-w-4xl mx-auto p-8">
        <CardHeader>
          <CardTitle className="text-2xl">Riwayat Deteksi</CardTitle>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/"
              className="text-brand-pink text-sm underline hover:text-brand-pink/80 transition-colors"
            >
              Kembali ke Beranda
            </Link>

            <Button variant="outline" asChild>
              <Link to="/history/latency">
                <Activity className="w-4 h-4 text-brand-coral" />
                Dashboard Latensi Global
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className="border border-hairline rounded-lg p-5 bg-accent flex items-center justify-between transition-colors shadow-sm hover:shadow-md"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-ink">
                      Sesi:{' '}
                      <span className="font-mono text-sm bg-background px-2 py-1 rounded-md border ml-2">
                        {session.session_id}
                      </span>
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      {session.total_detections} deteksi ditemukan
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-brand-coral hover:bg-brand-coral/90"
                  >
                    <Link
                      to="/history/$sessionId"
                      params={{ sessionId: session.session_id }}
                    >
                      Lihat Detail Sesi <ArrowRight />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-accent rounded-xl border border-dashed">
              <p className="text-muted-foreground">
                Belum ada riwayat deteksi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
