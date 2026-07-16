import type { CollectionConfig } from 'payload'

export const Sales: CollectionConfig = {
  slug: 'sales',
  labels: {
    singular: 'Penjualan',
    plural: 'Penjualan',
  },
  admin: {
    group: 'Operasional',
    useAsTitle: 'tanggal',
    defaultColumns: ['tanggal', 'customer', 'item', 'qty', 'subtotal'],
    description: 'Catat penjualan telur dan relasi pelanggan.',
    components: {
      edit: {
        SaveButton: '/src/components/admin/SaveButtonRedirectDashboard.tsx',
      },
    },
  },
  fields: [
    {
      name: 'tanggal',
      type: 'date',
      required: true,
      label: 'Tanggal Penjualan',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'item',
      type: 'text',
      defaultValue: 'Telur Itik',
      label: 'Item',
      required: true,
    },
    {
      name: 'hargaSatuan',
      type: 'number',
      required: true,
      label: 'Harga Satuan (Rp)',
      min: 0,
    },
    {
      name: 'qty',
      type: 'number',
      required: true,
      label: 'Jumlah (butir)',
      min: 1,
    },
    {
      name: 'subtotal',
      type: 'number',
      label: 'Subtotal (Rp)',
      admin: {
        readOnly: true,
        description: 'Otomatis dihitung (harga × qty)',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data) {
              const harga = data.hargaSatuan || 0
              const jumlah = data.qty || 0
              return harga * jumlah
            }
            return 0
          },
        ],
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      label: 'Pelanggan',
    },
  ],
  timestamps: true,
}
