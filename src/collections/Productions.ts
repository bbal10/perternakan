import type { CollectionConfig } from 'payload'

export const Productions: CollectionConfig = {
  slug: 'productions',
  labels: {
    singular: 'Produksi',
    plural: 'Produksi',
  },
  admin: {
    group: 'Operasional',
    useAsTitle: 'tanggal',
    defaultColumns: ['tanggal', 'jumlahItik', 'telurDiproduksi', 'persentaseProduksi', 'kematian'],
    description: 'Catat produksi telur harian, stok itik, dan kematian.',
    components: {
      edit: {
        // Setelah create sukses → dashboard utama
        SaveButton: '/src/components/admin/SaveButtonRedirectDashboard.tsx',
      },
    },
  },
  fields: [
    {
      name: 'tanggal',
      type: 'date',
      required: true,
      unique: true,
      label: 'Tanggal',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'jumlahItik',
      type: 'number',
      required: true,
      label: 'Jumlah Itik (ekor)',
      min: 0,
      admin: {
        description:
          'Jumlah ternak hari ini. Update manual saat ada kematian atau beli itik baru.',
      },
    },
    {
      name: 'telurDiproduksi',
      type: 'number',
      required: true,
      label: 'Jumlah Telur Diproduksi (butir)',
      min: 0,
    },
    {
      name: 'kematian',
      type: 'number',
      label: 'Kematian (ekor)',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Jumlah itik mati hari ini (opsional).',
      },
    },
    {
      name: 'persentaseProduksi',
      type: 'number',
      label: 'Persentase Produksi (%)',
      admin: {
        readOnly: true,
        description: 'Dihitung otomatis: telur ÷ jumlah itik × 100.',
      },
    },
    {
      name: 'catatan',
      type: 'textarea',
      label: 'Catatan',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.jumlahItik && data.jumlahItik > 0 && typeof data.telurDiproduksi === 'number') {
          data.persentaseProduksi = Math.round((data.telurDiproduksi / data.jumlahItik) * 1000) / 10
        } else if (data) {
          data.persentaseProduksi = 0
        }
        return data
      },
    ],
  },
  timestamps: true,
}
