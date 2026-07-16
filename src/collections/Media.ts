import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media & Bukti',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: [
      'image/*',
      'application/pdf',
      // Export data (CSV / Excel)
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream',
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Teks alternatif',
      admin: {
        description: 'Deskripsi singkat untuk aksesibilitas dan pencarian.',
      },
    },
  ],
  admin: {
    group: 'Master Data',
    useAsTitle: 'filename',
    description: 'Foto dan file bukti transfer / dokumentasi.',
  },
}
