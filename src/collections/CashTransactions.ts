import type { CollectionConfig } from 'payload'

export const CashTransactions: CollectionConfig = {
  slug: 'cashTransactions',
  labels: {
    singular: 'Cashflow',
    plural: 'Cashflow',
  },
  admin: {
    group: 'Keuangan',
    useAsTitle: 'keterangan',
    defaultColumns: ['tanggal', 'jenis', 'nominal', 'metode', 'sisaSaldo'],
    description: 'Uang masuk/keluar, metode bayar, dan bukti transfer.',
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
      label: 'Tanggal',
    },
    {
      name: 'keterangan',
      type: 'text',
      required: true,
      label: 'Keterangan',
    },
    {
      name: 'jenis',
      type: 'select',
      options: [
        { label: 'Uang Masuk', value: 'MASUK' },
        { label: 'Uang Keluar', value: 'KELUAR' },
      ],
      required: true,
      label: 'Jenis Transaksi',
    },
    {
      name: 'nominal',
      type: 'number',
      required: true,
      label: 'Nominal (Rp)',
      min: 0,
    },
    {
      name: 'metode',
      type: 'select',
      options: [
        { label: 'Cash', value: 'CASH' },
        { label: 'Transfer', value: 'TRANSFER' },
      ],
      required: true,
      label: 'Metode Pembayaran',
    },
    {
      name: 'bukti',
      type: 'upload',
      relationTo: 'media',
      label: 'Bukti Transfer / Pembayaran',
      admin: {
        description: 'Unggah foto bukti (jpg/png/pdf). Direkomendasikan untuk transfer.',
      },
    },
    {
      name: 'sisaSaldo',
      type: 'number',
      label: 'Sisa Saldo',
      admin: {
        readOnly: true,
        description: 'Dihitung otomatis secara kumulatif (total masuk - total keluar hingga transaksi ini)',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if ((operation === 'create' || operation === 'update') && data) {
          // Fetch all previous transactions up to this date for running balance
          const previous = await req.payload.find({
            collection: 'cashTransactions',
            limit: 2000,
            where: {
              tanggal: {
                less_than_equal: data.tanggal,
              },
            },
            sort: ['tanggal', 'id'],
          });

          let balance = 0;
          for (const tx of previous.docs) {
            const amt = (tx as any).nominal || 0;
            balance += (tx as any).jenis === 'MASUK' ? amt : -amt;
          }
          // If update, adjust if needed (simplified for create mostly)
          if (operation === 'create') {
            const thisAmt = data.nominal || 0;
            balance += data.jenis === 'MASUK' ? thisAmt : -thisAmt;
          }
          data.sisaSaldo = balance;
        }
        return data;
      },
    ],
  },
}
