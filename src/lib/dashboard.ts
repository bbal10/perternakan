import {
  format,
  subMonths,
  startOfMonth,
  parse,
  differenceInCalendarMonths,
  isValid,
} from 'date-fns'
import { id } from 'date-fns/locale'
import type { Payload, TypedUser } from 'payload'

/** Default months shown in trend charts & month picker */
const MONTHLY_WINDOW = 12
const MAX_HISTORY_MONTHS = 24
const RANGE_LIMIT = 1000

export type DashboardOptions = {
  /** Selected month as `yyyy-MM`. Defaults to current month. */
  bulan?: string | null
}

export type MonthlySeriesPoint = {
  key: string
  label: string
  telurDiproduksi: number
  avgPersenProduksi: number
  kematian: number
  telurTerjual: number
  pendapatan: number
  biayaOperasional: number
  kasMasuk: number
  kasKeluar: number
  kasNet: number
  margin: number
}

export type MonthlyStats = {
  telurDiproduksi: number
  avgPersenProduksi: number
  kematian: number
  telurTerjual: number
  pendapatan: number
  hargaRataRata: number
  biayaOperasional: number
  kasMasuk: number
  kasKeluar: number
  kasNet: number
  margin: number
  mom: {
    pendapatan: number | null
    telurDiproduksi: number | null
    margin: number | null
  }
}

export type DashboardData = {
  updatedAt: string
  dateLabel: string
  dateISO: string
  /** Full label of the month being inspected, e.g. "Januari 2026" */
  monthLabel: string
  /** `yyyy-MM` of the month being inspected */
  selectedMonthKey: string
  /** True when selected month is the calendar month of "now" */
  isSelectedCurrentMonth: boolean
  /** Current calendar month key (for top KPI "bulan ini") */
  currentMonthKey: string
  currentDucks: number
  todayEggs: number
  avgProductionRate: number
  latestProductionRate: number
  monthlyRevenue: number
  /** Saldo total (cash + transfer) */
  cashBalance: number
  /** Saldo metode CASH saja */
  cashBalanceCash: number
  /** Saldo metode TRANSFER saja */
  cashBalanceTransfer: number
  telurTerjualBulanIni: number
  kematianBulanIni: number
  customersCount: number
  productionsCount: number
  /** Stats for the selected month (history or MTD) */
  monthlyStats: MonthlyStats
  monthlySeries: MonthlySeriesPoint[]
  productionChartData: { date: string; telur: number; persen: number }[]
  salesByDay: { date: string; revenue: number }[]
  pieData: { name: string; value: number }[]
  recentSales: {
    id?: string | number
    item?: string
    qty?: number
    customerName: string
    tanggal: string
    tanggalLabel: string
    subtotal: number
  }[]
  recentCash: {
    id?: string | number
    jenis?: string
    nominal: number
    keterangan: string
    computedSaldo: number
    metode: string
    tanggal: string
    tanggalLabel: string
  }[]
}

type ProductionDoc = {
  id?: string | number
  tanggal: string
  jumlahItik?: number
  telurDiproduksi?: number
  persentaseProduksi?: number
  kematian?: number
}

type SaleDoc = {
  id?: string | number
  item?: string
  qty?: number
  tanggal: string
  subtotal?: number
  customer?: { nama?: string } | number | string | null
}

type CashDoc = {
  id?: string | number
  tanggal: string
  jenis?: string
  nominal?: number
  keterangan?: string
  metode?: string
}

type ExpenseDoc = {
  tanggal?: string
  kategori?: string
  hargaNominal?: number
  qty?: number
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
}

function buildMonthBuckets(now: Date, count: number) {
  const buckets: { key: string; label: string }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = startOfMonth(subMonths(now, i))
    buckets.push({
      key: format(d, 'yyyy-MM'),
      label: format(d, 'MMM yyyy', { locale: id }),
    })
  }
  return buckets
}

/** Parse and clamp `yyyy-MM` to a valid non-future month, or null. */
export function resolveMonthKey(
  raw: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!raw || !/^\d{4}-\d{2}$/.test(raw)) return null
  const parsed = parse(`${raw}-01`, 'yyyy-MM-dd', now)
  if (!isValid(parsed)) return null
  const currentKey = format(now, 'yyyy-MM')
  if (raw > currentKey) return null
  const monthsBack = differenceInCalendarMonths(startOfMonth(now), startOfMonth(parsed))
  if (monthsBack > MAX_HISTORY_MONTHS - 1) return null
  return raw
}

function statsFromPoint(
  point: MonthlySeriesPoint,
  previous: MonthlySeriesPoint | null,
): MonthlyStats {
  return {
    telurDiproduksi: point.telurDiproduksi,
    avgPersenProduksi: point.avgPersenProduksi,
    kematian: point.kematian,
    telurTerjual: point.telurTerjual,
    pendapatan: point.pendapatan,
    hargaRataRata:
      point.telurTerjual > 0
        ? Math.round(point.pendapatan / point.telurTerjual)
        : 0,
    biayaOperasional: point.biayaOperasional,
    kasMasuk: point.kasMasuk,
    kasKeluar: point.kasKeluar,
    kasNet: point.kasNet,
    margin: point.margin,
    mom: {
      pendapatan: previous
        ? momPercent(point.pendapatan, previous.pendapatan)
        : null,
      telurDiproduksi: previous
        ? momPercent(point.telurDiproduksi, previous.telurDiproduksi)
        : null,
      margin: previous ? momPercent(point.margin, previous.margin) : null,
    },
  }
}

function momPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0
    return null
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10
}

function emptySeriesPoint(key: string, label: string): MonthlySeriesPoint {
  return {
    key,
    label,
    telurDiproduksi: 0,
    avgPersenProduksi: 0,
    kematian: 0,
    telurTerjual: 0,
    pendapatan: 0,
    biayaOperasional: 0,
    kasMasuk: 0,
    kasKeluar: 0,
    kasNet: 0,
    margin: 0,
  }
}

function buildMonthlySeries(
  buckets: { key: string; label: string }[],
  productions: ProductionDoc[],
  sales: SaleDoc[],
  cashTransactions: CashDoc[],
  expenses: ExpenseDoc[],
): MonthlySeriesPoint[] {
  const map = new Map(
    buckets.map((b) => [b.key, emptySeriesPoint(b.key, b.label)]),
  )

  const prodCount = new Map<string, number>()

  for (const p of productions) {
    const key = monthKey(p.tanggal)
    const point = map.get(key)
    if (!point) continue
    point.telurDiproduksi += p.telurDiproduksi || 0
    point.kematian += p.kematian || 0
    point.avgPersenProduksi += p.persentaseProduksi || 0
    prodCount.set(key, (prodCount.get(key) || 0) + 1)
  }

  for (const [key, count] of prodCount) {
    const point = map.get(key)
    if (point && count > 0) {
      point.avgPersenProduksi =
        Math.round((point.avgPersenProduksi / count) * 10) / 10
    }
  }

  for (const s of sales) {
    const key = monthKey(s.tanggal)
    const point = map.get(key)
    if (!point) continue
    point.telurTerjual += s.qty || 0
    point.pendapatan += s.subtotal || 0
  }

  for (const e of expenses) {
    if (!e.tanggal) continue
    const key = monthKey(e.tanggal)
    const point = map.get(key)
    if (!point) continue
    point.biayaOperasional += (e.hargaNominal || 0) * (e.qty || 0)
  }

  for (const t of cashTransactions) {
    const key = monthKey(t.tanggal)
    const point = map.get(key)
    if (!point) continue
    const amount = t.nominal || 0
    if (t.jenis === 'MASUK') point.kasMasuk += amount
    else if (t.jenis === 'KELUAR') point.kasKeluar += amount
  }

  for (const point of map.values()) {
    point.kasNet = point.kasMasuk - point.kasKeluar
    point.margin = point.pendapatan - point.biayaOperasional
  }

  return buckets.map((b) => map.get(b.key)!)
}

export async function getDashboardData(
  payload: Payload,
  user: TypedUser,
  options: DashboardOptions = {},
): Promise<DashboardData> {
  const access = {
    user,
    overrideAccess: false as const,
  }

  const now = new Date()
  const currentMonthKey = format(now, 'yyyy-MM')
  const requestedKey = resolveMonthKey(options.bulan, now)
  const selectedMonthKey = requestedKey ?? currentMonthKey

  let windowMonths = MONTHLY_WINDOW
  if (requestedKey) {
    const selectedDate = parse(`${requestedKey}-01`, 'yyyy-MM-dd', now)
    const span =
      differenceInCalendarMonths(startOfMonth(now), startOfMonth(selectedDate)) +
      1
    windowMonths = Math.min(
      MAX_HISTORY_MONTHS,
      Math.max(MONTHLY_WINDOW, span),
    )
  }

  const buckets = buildMonthBuckets(now, windowMonths)
  const rangeStart = `${buckets[0].key}-01`
  const rangeWhere = {
    tanggal: {
      greater_than_equal: rangeStart,
    },
  }

  const [
    productionsRes,
    salesRes,
    cashRangeRes,
    cashAllRes,
    expensesRes,
    customersRes,
  ] = await Promise.all([
    payload.find({
      collection: 'productions',
      where: rangeWhere,
      limit: RANGE_LIMIT,
      sort: '-tanggal',
      ...access,
    }),
    payload.find({
      collection: 'sales',
      where: rangeWhere,
      limit: RANGE_LIMIT,
      sort: '-tanggal',
      depth: 1,
      ...access,
    }),
    payload.find({
      collection: 'cashTransactions',
      where: rangeWhere,
      limit: RANGE_LIMIT,
      sort: '-tanggal',
      ...access,
    }),
    // All-time cash for saldo kas (not limited to 6-month window)
    payload.find({
      collection: 'cashTransactions',
      limit: 2000,
      sort: '-tanggal',
      ...access,
    }),
    payload.find({
      collection: 'operationalExpenses',
      where: rangeWhere,
      limit: RANGE_LIMIT,
      sort: '-tanggal',
      ...access,
    }),
    payload.find({ collection: 'customers', limit: 200, ...access }),
  ])

  const productions = productionsRes.docs as ProductionDoc[]
  const sales = salesRes.docs as SaleDoc[]
  const cashInRange = cashRangeRes.docs as CashDoc[]
  const cashAll = cashAllRes.docs as CashDoc[]
  const expenses = expensesRes.docs as ExpenseDoc[]
  const customers = customersRes.docs

  const latestProduction = productions[0]
  const currentDucks = latestProduction?.jumlahItik || 0
  const todayEggs = latestProduction?.telurDiproduksi || 0

  // Recent productions for daily chart (last 14 by date among fetched)
  const recentProductions = [...productions]
    .sort((a, b) => (a.tanggal < b.tanggal ? 1 : a.tanggal > b.tanggal ? -1 : 0))
    .slice(0, 30)

  const avgProductionRate =
    recentProductions.length > 0
      ? Math.round(
          recentProductions.reduce(
            (sum, p) => sum + (p.persentaseProduksi || 0),
            0,
          ) / recentProductions.length,
        )
      : 0

  // Saldo per metode pembayaran + total (all-time)
  let cashBalanceCash = 0
  let cashBalanceTransfer = 0
  let cashBalanceOther = 0
  for (const t of cashAll) {
    const amount = t.nominal || 0
    const signed =
      t.jenis === 'MASUK' ? amount : t.jenis === 'KELUAR' ? -amount : 0
    if (t.metode === 'CASH') cashBalanceCash += signed
    else if (t.metode === 'TRANSFER') cashBalanceTransfer += signed
    else cashBalanceOther += signed
  }
  const cashBalance = cashBalanceCash + cashBalanceTransfer + cashBalanceOther

  const monthlySeries = buildMonthlySeries(
    buckets,
    productions,
    sales,
    cashInRange,
    expenses,
  )

  const selectedIndex = monthlySeries.findIndex(
    (p) => p.key === selectedMonthKey,
  )
  const selectedPoint =
    selectedIndex >= 0
      ? monthlySeries[selectedIndex]
      : monthlySeries[monthlySeries.length - 1]
  const previousPoint =
    selectedIndex > 0 ? monthlySeries[selectedIndex - 1] : null
  const monthlyStats = statsFromPoint(selectedPoint, previousPoint)

  // Top KPI "bulan ini" always reflects the live calendar month
  const currentIndex = monthlySeries.findIndex((p) => p.key === currentMonthKey)
  const currentPoint =
    currentIndex >= 0
      ? monthlySeries[currentIndex]
      : monthlySeries[monthlySeries.length - 1]
  const currentPrevious =
    currentIndex > 0 ? monthlySeries[currentIndex - 1] : null
  const currentMonthStats = statsFromPoint(currentPoint, currentPrevious)

  const selectedMonthDate = parse(
    `${selectedPoint.key}-01`,
    'yyyy-MM-dd',
    now,
  )
  const monthLabel = format(selectedMonthDate, 'MMMM yyyy', { locale: id })
  const isSelectedCurrentMonth = selectedPoint.key === currentMonthKey

  const productionChartData = [...recentProductions]
    .sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1))
    .slice(-14)
    .map((p) => ({
      date: format(new Date(p.tanggal), 'dd MMM', { locale: id }),
      telur: p.telurDiproduksi || 0,
      persen: p.persentaseProduksi || 0,
    }))

  const salesByDay = [...sales]
    .slice(0, 10)
    .reverse()
    .map((s) => ({
      date: format(new Date(s.tanggal), 'dd MMM', { locale: id }),
      revenue: s.subtotal || 0,
    }))

  // Pie: operational expenses for the selected month
  const selectedMonthExpenses = expenses.filter((e) =>
    e.tanggal?.startsWith(selectedPoint.key),
  )
  const expenseByCategory = selectedMonthExpenses.reduce(
    (acc: Record<string, number>, e) => {
      const cat = e.kategori || 'lainnya'
      const amount = (e.hargaNominal || 0) * (e.qty || 0)
      acc[cat] = (acc[cat] || 0) + amount
      return acc
    },
    {},
  )

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  const recentSales = [...sales].slice(0, 5).map((sale) => {
    const customerName =
      sale.customer &&
      typeof sale.customer === 'object' &&
      'nama' in sale.customer
        ? sale.customer.nama || 'Pelanggan'
        : 'Pelanggan'
    return {
      id: sale.id,
      item: sale.item,
      qty: sale.qty,
      customerName,
      tanggal: sale.tanggal,
      tanggalLabel: format(new Date(sale.tanggal), 'dd MMM', { locale: id }),
      subtotal: sale.subtotal || 0,
    }
  })

  const sortedCashForBalance = [...cashAll].sort((a, b) => {
    if (a.tanggal === b.tanggal) return Number(a.id || 0) - Number(b.id || 0)
    return a.tanggal < b.tanggal ? -1 : 1
  })
  let runningBalance = 0
  const cashWithSaldo = sortedCashForBalance.map((tx) => {
    const amount = tx.nominal || 0
    if (tx.jenis === 'MASUK') runningBalance += amount
    else runningBalance -= amount
    return {
      id: tx.id,
      jenis: tx.jenis,
      nominal: amount,
      keterangan: tx.keterangan || '—',
      computedSaldo: runningBalance,
      metode: tx.metode || '—',
      tanggal: tx.tanggal,
      tanggalLabel: format(new Date(tx.tanggal), 'dd MMM', { locale: id }),
    }
  })
  const recentCash = [...cashWithSaldo].reverse().slice(0, 5)

  return {
    updatedAt: now.toISOString(),
    dateLabel: format(now, 'EEEE, dd MMMM yyyy', { locale: id }),
    dateISO: now.toISOString(),
    monthLabel,
    selectedMonthKey: selectedPoint.key,
    isSelectedCurrentMonth,
    currentMonthKey,
    currentDucks,
    todayEggs,
    avgProductionRate,
    latestProductionRate: latestProduction?.persentaseProduksi || 0,
    monthlyRevenue: currentMonthStats.pendapatan,
    cashBalance,
    cashBalanceCash,
    cashBalanceTransfer,
    telurTerjualBulanIni: currentMonthStats.telurTerjual,
    kematianBulanIni: currentMonthStats.kematian,
    customersCount: customers.length,
    productionsCount: productions.length,
    monthlyStats,
    monthlySeries,
    productionChartData,
    salesByDay,
    pieData,
    recentSales,
    recentCash,
  }
}
