'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import {
  EXPORTABLE_COLLECTIONS,
  EXPORT_COLLECTION_LABELS,
  type ExportableCollection,
  type ExportFormat,
} from '@/src/lib/export/types'

type ExportStatus = 'queued' | 'processing' | 'completed' | 'failed'

type ExportResult = {
  id: string | number
  status: ExportStatus
  collectionLabel?: string
  format: string
  rowCount: number | null
  filename: string | null
  downloadUrl: string | null
  errorMessage: string | null
}

const POLL_MS = 1200
const MAX_POLLS = 60

export function ExportPanel() {
  const [collection, setCollection] =
    useState<ExportableCollection>('productions')
  const [format, setFormat] = useState<ExportFormat>('xlsx')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ExportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCount = useRef(0)

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    pollCount.current = 0
  }, [])

  useEffect(() => () => stopPoll(), [stopPoll])

  const pollStatus = useCallback(
    (id: string | number) => {
      stopPoll()
      pollCount.current = 0
      pollRef.current = setInterval(async () => {
        pollCount.current += 1
        if (pollCount.current > MAX_POLLS) {
          stopPoll()
          setBusy(false)
          setError('Export masih diproses. Coba cek lagi sebentar.')
          return
        }
        try {
          const res = await fetch(`/api/export?id=${encodeURIComponent(String(id))}`, {
            credentials: 'same-origin',
          })
          const data = (await res.json()) as ExportResult & { error?: string }
          if (!res.ok) {
            throw new Error(data.error || 'Gagal cek status export')
          }
          setResult(data)
          if (data.status === 'completed' || data.status === 'failed') {
            stopPoll()
            setBusy(false)
            if (data.status === 'completed' && data.downloadUrl) {
              // Auto-download when ready
              window.location.assign(data.downloadUrl)
            }
            if (data.status === 'failed') {
              setError(data.errorMessage || 'Export gagal')
            }
          }
        } catch (err) {
          stopPoll()
          setBusy(false)
          setError(err instanceof Error ? err.message : 'Gagal cek status')
        }
      }, POLL_MS)
    },
    [stopPoll],
  )

  const onExport = async () => {
    setError(null)
    setResult(null)
    setBusy(true)
    stopPoll()

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection,
          format,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
        }),
      })
      const data = (await res.json()) as ExportResult & { error?: string }
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengantri export')
      }

      setResult(data)

      if (data.status === 'completed' && data.downloadUrl) {
        setBusy(false)
        window.location.assign(data.downloadUrl)
        return
      }

      if (data.status === 'failed') {
        setBusy(false)
        setError(data.errorMessage || 'Export gagal')
        return
      }

      // Still queued/processing — poll (also re-triggers jobs.run on server)
      pollStatus(data.id)
    } catch (err) {
      setBusy(false)
      setError(err instanceof Error ? err.message : 'Export gagal')
    }
  }

  const showDates = collection !== 'customers'

  return (
    <section
      className="card-surface p-5 sm:p-6"
      aria-labelledby="export-heading"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" aria-hidden />
            <h2
              id="export-heading"
              className="text-base font-semibold text-foreground"
            >
              Export data
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-muted sm:text-sm">
            Unduh data ke CSV atau Excel. Proses lewat antrian job agar UI tetap
            responsif — file otomatis diunduh saat siap.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-xs font-medium text-muted">
          Sumber data
          <select
            className="focus-ring mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
            value={collection}
            disabled={busy}
            onChange={(e) =>
              setCollection(e.target.value as ExportableCollection)
            }
          >
            {EXPORTABLE_COLLECTIONS.map((slug) => (
              <option key={slug} value={slug}>
                {EXPORT_COLLECTION_LABELS[slug]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-muted">
          Format
          <select
            className="focus-ring mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
            value={format}
            disabled={busy}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
          >
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </label>

        {showDates ? (
          <>
            <label className="block text-xs font-medium text-muted">
              Dari tanggal
              <input
                type="date"
                className="focus-ring mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
                value={dateFrom}
                disabled={busy}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Sampai tanggal
              <input
                type="date"
                className="focus-ring mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
                value={dateTo}
                disabled={busy}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </label>
          </>
        ) : (
          <div className="sm:col-span-2 flex items-end">
            <p className="rounded-xl border border-dashed border-border bg-surface-muted/50 px-3 py-2.5 text-xs text-muted">
              Export pelanggan mengabaikan filter tanggal.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          disabled={busy}
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          {busy ? 'Memproses export…' : 'Export sekarang'}
        </button>

        {result && (
          <StatusBadge
            status={result.status}
            rowCount={result.rowCount}
            filename={result.filename}
            downloadUrl={result.downloadUrl}
          />
        )}
      </div>

      {error && (
        <p
          className="mt-3 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft/50 px-3 py-2 text-xs text-danger"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </section>
  )
}

function StatusBadge({
  status,
  rowCount,
  filename,
  downloadUrl,
}: {
  status: ExportStatus
  rowCount: number | null
  filename: string | null
  downloadUrl: string | null
}) {
  if (status === 'completed') {
    return (
      <div className="inline-flex flex-wrap items-center gap-2 text-xs font-medium text-primary">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        <span>
          Selesai
          {rowCount != null ? ` · ${rowCount.toLocaleString('id-ID')} baris` : ''}
          {filename ? ` · ${filename}` : ''}
        </span>
        {downloadUrl && (
          <a
            href={downloadUrl}
            className="focus-ring rounded-lg underline-offset-2 hover:underline"
          >
            Unduh lagi
          </a>
        )}
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-danger">
        <AlertCircle className="h-4 w-4" aria-hidden />
        Gagal
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      {status === 'processing' ? 'Sedang diproses…' : 'Dalam antrian…'}
    </span>
  )
}
