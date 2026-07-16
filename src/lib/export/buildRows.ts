import type { Payload, TypedUser } from 'payload'
import type { ExportableCollection } from './types'
import { EXPORT_COLLECTION_LABELS } from './types'

type BuildArgs = {
  payload: Payload
  user: TypedUser
  collection: ExportableCollection
  dateFrom?: string | null
  dateTo?: string | null
}

export type ExportTable = {
  sheetName: string
  headers: string[]
  rows: (string | number | null)[][]
  rowCount: number
}

function dateWhere(dateFrom?: string | null, dateTo?: string | null) {
  if (!dateFrom && !dateTo) return undefined
  const tanggal: Record<string, string> = {}
  if (dateFrom) tanggal.greater_than_equal = dateFrom
  if (dateTo) tanggal.less_than_equal = dateTo
  return { tanggal }
}

function customerName(customer: unknown): string {
  if (customer && typeof customer === 'object' && 'nama' in customer) {
    return String((customer as { nama?: string }).nama || '')
  }
  return ''
}

/**
 * Fetch collection docs and flatten into tabular rows for CSV/XLSX.
 */
export async function buildExportTable({
  payload,
  user,
  collection,
  dateFrom,
  dateTo,
}: BuildArgs): Promise<ExportTable> {
  const access = { user, overrideAccess: false as const }
  const where = dateWhere(dateFrom, dateTo)
  const sheetName = EXPORT_COLLECTION_LABELS[collection]

  switch (collection) {
    case 'productions': {
      const res = await payload.find({
        collection: 'productions',
        where,
        limit: 5000,
        sort: '-tanggal',
        ...access,
      })
      const headers = [
        'Tanggal',
        'Jumlah Itik',
        'Telur Diproduksi',
        'Kematian',
        'Persentase Produksi (%)',
        'Catatan',
      ]
      const rows = res.docs.map((d) => [
        String(d.tanggal ?? ''),
        d.jumlahItik ?? 0,
        d.telurDiproduksi ?? 0,
        d.kematian ?? 0,
        d.persentaseProduksi ?? 0,
        String(d.catatan ?? ''),
      ])
      return { sheetName, headers, rows, rowCount: rows.length }
    }

    case 'sales': {
      const res = await payload.find({
        collection: 'sales',
        where,
        limit: 5000,
        sort: '-tanggal',
        depth: 1,
        ...access,
      })
      const headers = [
        'Tanggal',
        'Item',
        'Harga Satuan',
        'Qty',
        'Subtotal',
        'Pelanggan',
      ]
      const rows = res.docs.map((d) => [
        String(d.tanggal ?? ''),
        String(d.item ?? ''),
        d.hargaSatuan ?? 0,
        d.qty ?? 0,
        d.subtotal ?? 0,
        customerName(d.customer),
      ])
      return { sheetName, headers, rows, rowCount: rows.length }
    }

    case 'cashTransactions': {
      const res = await payload.find({
        collection: 'cashTransactions',
        where,
        limit: 5000,
        sort: '-tanggal',
        ...access,
      })
      const headers = [
        'Tanggal',
        'Jenis',
        'Keterangan',
        'Nominal',
        'Metode',
        'Sisa Saldo',
      ]
      const rows = res.docs.map((d) => [
        String(d.tanggal ?? ''),
        String(d.jenis ?? ''),
        String(d.keterangan ?? ''),
        d.nominal ?? 0,
        String(d.metode ?? ''),
        d.sisaSaldo ?? '',
      ])
      return { sheetName, headers, rows, rowCount: rows.length }
    }

    case 'operationalExpenses': {
      const res = await payload.find({
        collection: 'operationalExpenses',
        where,
        limit: 5000,
        sort: '-tanggal',
        ...access,
      })
      const headers = ['Tanggal', 'Kategori', 'Harga', 'Qty', 'Satuan', 'Total']
      const rows = res.docs.map((d) => {
        const harga = Number(d.hargaNominal ?? 0)
        const qty = Number(d.qty ?? 0)
        return [
          String(d.tanggal ?? ''),
          String(d.kategori ?? ''),
          harga,
          qty,
          String(d.satuan ?? ''),
          harga * qty,
        ]
      })
      return { sheetName, headers, rows, rowCount: rows.length }
    }

    case 'customers': {
      // Customers have no tanggal field — ignore date filter
      const res = await payload.find({
        collection: 'customers',
        limit: 5000,
        sort: 'nama',
        ...access,
      })
      const headers = ['Nama', 'Kontak', 'Dibuat']
      const rows = res.docs.map((d) => [
        String(d.nama ?? ''),
        String(d.kontak ?? ''),
        String(d.createdAt ?? ''),
      ])
      return { sheetName, headers, rows, rowCount: rows.length }
    }

    default: {
      const _exhaustive: never = collection
      throw new Error(`Unsupported collection: ${_exhaustive}`)
    }
  }
}
