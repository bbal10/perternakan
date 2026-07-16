import type { CollectionConfig } from 'payload'
import {
  EXPORTABLE_COLLECTIONS,
  EXPORT_COLLECTION_LABELS,
} from '../lib/export/types'

const collectionOptions = EXPORTABLE_COLLECTIONS.map((value) => ({
  label: EXPORT_COLLECTION_LABELS[value],
  value,
}))

/**
 * Tracks async export jobs (CSV/XLSX) processed by Payload Jobs Queue.
 */
export const ExportJobs: CollectionConfig = {
  slug: 'exportJobs',
  labels: {
    singular: 'Export',
    plural: 'Export Data',
  },
  admin: {
    group: 'Sistem',
    useAsTitle: 'filename',
    defaultColumns: ['collection', 'format', 'status', 'rowCount', 'createdAt'],
    description: 'Riwayat export data (antrian job). File tersedia setelah status selesai.',
  },
  access: {
    // Only logged-in users; create/read own jobs via API with override carefully
    create: ({ req }) => !!req.user,
    read: ({ req }) => {
      if (!req.user) return false
      // Admins see all; staff see own
      if ((req.user as { role?: string }).role === 'admin') return true
      return {
        requestedBy: {
          equals: req.user.id,
        },
      }
    },
    update: ({ req }) => (req.user as { role?: string } | null)?.role === 'admin',
    delete: ({ req }) => (req.user as { role?: string } | null)?.role === 'admin',
  },
  fields: [
    {
      name: 'collection',
      type: 'select',
      required: true,
      options: collectionOptions,
      label: 'Sumber data',
    },
    {
      name: 'format',
      type: 'select',
      required: true,
      options: [
        { label: 'CSV', value: 'csv' },
        { label: 'Excel (XLSX)', value: 'xlsx' },
      ],
      label: 'Format',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      options: [
        { label: 'Antri', value: 'queued' },
        { label: 'Diproses', value: 'processing' },
        { label: 'Selesai', value: 'completed' },
        { label: 'Gagal', value: 'failed' },
      ],
      label: 'Status',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'dateFrom',
      type: 'date',
      label: 'Dari tanggal',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        condition: (_, siblingData) => siblingData?.collection !== 'customers',
      },
    },
    {
      name: 'dateTo',
      type: 'date',
      label: 'Sampai tanggal',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        condition: (_, siblingData) => siblingData?.collection !== 'customers',
      },
    },
    {
      name: 'rowCount',
      type: 'number',
      label: 'Jumlah baris',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'filename',
      type: 'text',
      label: 'Nama file',
      admin: { readOnly: true },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      label: 'File hasil',
      admin: { readOnly: true },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      label: 'Pesan error',
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.status === 'failed',
      },
    },
    {
      name: 'requestedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Diminta oleh',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'jobId',
      type: 'text',
      label: 'ID job antrian',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Selesai pada',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
  timestamps: true,
}
