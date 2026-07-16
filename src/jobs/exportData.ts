import type { TaskConfig, TypedUser } from 'payload'
import { buildExportTable } from '../lib/export/buildRows'
import { generateExportFile } from '../lib/export/generateFile'
import {
  EXPORT_COLLECTION_LABELS,
  type ExportFormat,
  type ExportableCollection,
} from '../lib/export/types'
import { format } from 'date-fns'

/**
 * Background task: build CSV/XLSX from a collection and attach to ExportJobs + Media.
 * Queued via `payload.jobs.queue({ task: 'exportData', ... })` then run by autoRun or explicit `jobs.run`.
 */
export const exportDataTask: TaskConfig = {
  slug: 'exportData',
  label: 'Export data ke CSV/Excel',
  retries: 2,
  inputSchema: [
    {
      name: 'exportJobId',
      type: 'text',
      required: true,
    },
    {
      name: 'collection',
      type: 'text',
      required: true,
    },
    {
      name: 'format',
      type: 'text',
      required: true,
    },
    {
      name: 'dateFrom',
      type: 'text',
      required: false,
    },
    {
      name: 'dateTo',
      type: 'text',
      required: false,
    },
    {
      name: 'userId',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    { name: 'mediaId', type: 'text' },
    { name: 'filename', type: 'text' },
    { name: 'rowCount', type: 'number' },
    { name: 'downloadUrl', type: 'text' },
  ],
  handler: async ({ input, req }) => {
    const { payload } = req
    if (!input?.exportJobId || !input.collection || !input.format || !input.userId) {
      throw new Error('exportData task missing required input (exportJobId, collection, format, userId)')
    }
    const exportJobId = String(input.exportJobId)
    const collection = input.collection as ExportableCollection
    const formatType = input.format as ExportFormat
    const dateFrom = input.dateFrom ? String(input.dateFrom) : null
    const dateTo = input.dateTo ? String(input.dateTo) : null
    const userId = String(input.userId)

    await payload.update({
      collection: 'exportJobs',
      id: exportJobId,
      data: { status: 'processing', errorMessage: null },
      overrideAccess: true,
    })

    try {
      // Load user for access-scoped queries (data isolation)
      const userDoc = await payload.findByID({
        collection: 'users',
        id: userId,
        overrideAccess: true,
      })

      if (!userDoc) {
        throw new Error('User peminta export tidak ditemukan')
      }

      // findByID returns a doc without auth `collection` — required by TypedUser / access control
      const user = { ...userDoc, collection: 'users' as const } as TypedUser

      const table = await buildExportTable({
        payload,
        user,
        collection,
        dateFrom,
        dateTo,
      })

      const label = EXPORT_COLLECTION_LABELS[collection] || collection
      const stamp = format(new Date(), 'yyyyMMdd-HHmmss')
      const basename = `export-${collection}-${stamp}`

      const file = await generateExportFile(table, formatType, basename)

      const media = await payload.create({
        collection: 'media',
        data: {
          alt: `Export ${label} (${formatType.toUpperCase()}) — ${table.rowCount} baris`,
        },
        file: {
          data: file.buffer,
          mimetype: file.mimetype,
          name: file.filename,
          size: file.buffer.length,
        },
        overrideAccess: true,
      })

      const downloadUrl =
        typeof media.url === 'string' && media.url
          ? media.url
          : `/api/media/file/${encodeURIComponent(file.filename)}`

      await payload.update({
        collection: 'exportJobs',
        id: exportJobId,
        data: {
          status: 'completed',
          rowCount: table.rowCount,
          filename: file.filename,
          file: media.id,
          completedAt: new Date().toISOString(),
          errorMessage: null,
        },
        overrideAccess: true,
      })

      return {
        output: {
          mediaId: String(media.id),
          filename: file.filename,
          rowCount: table.rowCount,
          downloadUrl,
        },
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export gagal'
      await payload.update({
        collection: 'exportJobs',
        id: exportJobId,
        data: {
          status: 'failed',
          errorMessage: message,
        },
        overrideAccess: true,
      })
      throw err
    }
  },
}
