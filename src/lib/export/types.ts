/** Collections that can be exported from the app. */
export const EXPORTABLE_COLLECTIONS = [
  'productions',
  'sales',
  'cashTransactions',
  'operationalExpenses',
  'customers',
] as const

export type ExportableCollection = (typeof EXPORTABLE_COLLECTIONS)[number]

export const EXPORT_FORMATS = ['csv', 'xlsx'] as const
export type ExportFormat = (typeof EXPORT_FORMATS)[number]

export const EXPORT_COLLECTION_LABELS: Record<ExportableCollection, string> = {
  productions: 'Produksi',
  sales: 'Penjualan',
  cashTransactions: 'Cashflow',
  operationalExpenses: 'Biaya operasional',
  customers: 'Pelanggan',
}

export function isExportableCollection(value: string): value is ExportableCollection {
  return (EXPORTABLE_COLLECTIONS as readonly string[]).includes(value)
}

export function isExportFormat(value: string): value is ExportFormat {
  return (EXPORT_FORMATS as readonly string[]).includes(value)
}
