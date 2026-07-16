import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/src/lib/auth'
import {
  isExportFormat,
  isExportableCollection,
  EXPORT_COLLECTION_LABELS,
} from '@/src/lib/export/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Body = {
  collection?: string
  format?: string
  dateFrom?: string | null
  dateTo?: string | null
}

/**
 * Queue an export job and try to process it immediately (seamless for small/medium data).
 * Returns export job id + status; poll GET /api/export?id=... if still processing.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const collection = body.collection || ''
  const format = body.format || 'xlsx'
  const dateFrom = body.dateFrom || null
  const dateTo = body.dateTo || null

  if (!isExportableCollection(collection)) {
    return NextResponse.json(
      { error: 'Collection tidak valid untuk export' },
      { status: 400 },
    )
  }
  if (!isExportFormat(format)) {
    return NextResponse.json(
      { error: 'Format harus csv atau xlsx' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })

  // 1) Create tracking document
  const exportJob = await payload.create({
    collection: 'exportJobs',
    data: {
      collection,
      format,
      status: 'queued',
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      requestedBy: user.id,
    },
    user,
    overrideAccess: false,
  })

  // 2) Enqueue Payload job
  const job = await payload.jobs.queue({
    task: 'exportData',
    queue: 'exports',
    input: {
      exportJobId: String(exportJob.id),
      collection,
      format,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      userId: String(user.id),
    },
    req: undefined,
  })

  await payload.update({
    collection: 'exportJobs',
    id: exportJob.id,
    data: { jobId: String(job.id) },
    overrideAccess: true,
  })

  // 3) Run immediately so small exports feel seamless (no wait for cron)
  try {
    await payload.jobs.run({
      queue: 'exports',
      limit: 5,
      overrideAccess: true,
    })
  } catch (err) {
    console.error('[export] jobs.run failed (will retry via autoRun)', err)
  }

  // 4) Reload status
  const fresh = await payload.findByID({
    collection: 'exportJobs',
    id: exportJob.id,
    depth: 1,
    overrideAccess: true,
  })

  const file = fresh.file
  let downloadUrl: string | null = null
  if (file && typeof file === 'object' && 'url' in file && file.url) {
    downloadUrl = String(file.url)
  } else if (fresh.filename) {
    downloadUrl = `/api/media/file/${encodeURIComponent(String(fresh.filename))}`
  }

  return NextResponse.json({
    id: fresh.id,
    status: fresh.status,
    collection: fresh.collection,
    collectionLabel: EXPORT_COLLECTION_LABELS[collection],
    format: fresh.format,
    rowCount: fresh.rowCount ?? null,
    filename: fresh.filename ?? null,
    downloadUrl,
    errorMessage: fresh.errorMessage ?? null,
    jobId: fresh.jobId ?? String(job.id),
  })
}

/**
 * Poll export status: GET /api/export?id=<exportJobId>
 */
export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Parameter id wajib' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  // Nudge the queue if still pending (seamless without relying only on cron)
  try {
    await payload.jobs.run({
      queue: 'exports',
      limit: 5,
      overrideAccess: true,
    })
  } catch {
    // ignore — status endpoint still returns current state
  }

  let doc
  try {
    doc = await payload.findByID({
      collection: 'exportJobs',
      id,
      depth: 1,
      user,
      overrideAccess: false,
    })
  } catch {
    return NextResponse.json({ error: 'Export tidak ditemukan' }, { status: 404 })
  }

  const file = doc.file
  let downloadUrl: string | null = null
  if (file && typeof file === 'object' && 'url' in file && file.url) {
    downloadUrl = String(file.url)
  } else if (doc.filename) {
    downloadUrl = `/api/media/file/${encodeURIComponent(String(doc.filename))}`
  }

  return NextResponse.json({
    id: doc.id,
    status: doc.status,
    collection: doc.collection,
    collectionLabel:
      typeof doc.collection === 'string' &&
      doc.collection in EXPORT_COLLECTION_LABELS
        ? EXPORT_COLLECTION_LABELS[
            doc.collection as keyof typeof EXPORT_COLLECTION_LABELS
          ]
        : doc.collection,
    format: doc.format,
    rowCount: doc.rowCount ?? null,
    filename: doc.filename ?? null,
    downloadUrl,
    errorMessage: doc.errorMessage ?? null,
    jobId: doc.jobId ?? null,
  })
}
