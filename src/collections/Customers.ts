import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    singular: 'Pelanggan',
    plural: 'Pelanggan',
  },
  admin: {
    group: 'Master Data',
    useAsTitle: 'nama',
    defaultColumns: ['nama', 'kontak'],
    description: 'Daftar pelanggan dan kontak WhatsApp/HP.',
  },
  fields: [
    {
      name: 'nama',
      type: 'text',
      required: true,
      label: 'Nama Pelanggan',
    },
    {
      name: 'kontak',
      type: 'text',
      label: 'Kontak (WA / HP)',
      admin: {
        description: 'Nomor telepon atau WhatsApp',
      },
    },
  ],
  timestamps: true,
}
