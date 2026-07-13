import type { CollectionConfig } from 'payload'

export const OperationalExpenses: CollectionConfig = {
  slug: 'operationalExpenses',
  labels: {
    singular: 'Biaya Operasional',
    plural: 'Biaya Operasional',
  },
  admin: {
    group: 'Keuangan',
    useAsTitle: 'kategori',
    defaultColumns: ['tanggal', 'kategori', 'qty', 'hargaNominal', 'satuan'],
    description: 'Pengeluaran pakan, vitamin, obat, listrik, dan air.',
  },
  fields: [
    {
      name: 'tanggal',
      type: 'date',
      required: true,
      label: 'Tanggal',
    },
    {
      name: 'kategori',
      type: 'select',
      options: [
        { label: 'Pakan', value: 'pakan' },
        { label: 'Vitamin', value: 'vitamin' },
        { label: 'Obat-obatan', value: 'obat-obatan' },
        { label: 'Listrik', value: 'listrik' },
        { label: 'Air', value: 'air' },
      ],
      required: true,
      label: 'Kategori',
    },
    {
      name: 'hargaNominal',
      type: 'number',
      required: true,
      label: 'Harga (Rp)',
      min: 0,
    },
    {
      name: 'qty',
      type: 'number',
      required: true,
      label: 'Qty',
      min: 0,
    },
    {
      name: 'satuan',
      type: 'text',
      required: true,
      label: 'Satuan',
      admin: {
        description: 'Contoh: kg, gr, bulan, kWh',
      },
    },
  ],
  timestamps: true,
}
