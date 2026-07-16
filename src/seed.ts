import path from 'path'
import { pathToFileURL } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config'

type SeedOptions = {
  /** Close DB pool after seeding (CLI only — never from Next.js request handlers). */
  destroy?: boolean
}

const SEED_MONTHS = 12
const CUSTOMER_NAMES = [
  { nama: 'Pak Budi Santoso', kontak: '081234567890' },
  { nama: 'Bu Siti Aminah', kontak: '082345678901' },
  { nama: 'Pak Joko Widodo', kontak: '083456789012' },
  { nama: 'Ibu Rina Marlina', kontak: '084567890123' },
  { nama: 'Pak Ahmad Fauzi', kontak: '085678901234' },
  { nama: 'Bu Dewi Lestari', kontak: '086789012345' },
] as const

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0]!
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function daysBetween(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

/** Deterministic-ish random in [0, 1) from a seed integer (stable per day index). */
function dayRand(seed: number, salt = 0): number {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function pick<T>(items: readonly T[], seed: number, salt = 0): T {
  return items[Math.floor(dayRand(seed, salt) * items.length)]!
}

function randInt(min: number, max: number, seed: number, salt = 0): number {
  return min + Math.floor(dayRand(seed, salt) * (max - min + 1))
}

async function createInBatches(
  items: Array<() => Promise<unknown>>,
  batchSize = 20,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.all(batch.map((fn) => fn()))
  }
}

export async function seed(options: SeedOptions = {}) {
  const payload = await getPayload({ config })
  console.log('🌱 Seeding database (12 months)...')

  try {
    // Clear existing data (for dev only)
    console.log('Clearing old data...')
    await payload.delete({ collection: 'sales', where: {} })
    await payload.delete({ collection: 'productions', where: {} })
    await payload.delete({ collection: 'cashTransactions', where: {} })
    await payload.delete({ collection: 'operationalExpenses', where: {} })
    await payload.delete({ collection: 'customers', where: {} })
    // Note: don't delete users

    // === Customers ===
    console.log('Creating customers...')
    const customers = await Promise.all(
      CUSTOMER_NAMES.map((c) =>
        payload.create({
          collection: 'customers',
          data: { nama: c.nama, kontak: c.kontak },
        }),
      ),
    )
    const customerIds = customers.map((c) => c.id)
    const customerNames = customers.map((c) => c.nama)

    const today = startOfDay(new Date())
    const startDate = startOfDay(new Date(today))
    startDate.setMonth(startDate.getMonth() - SEED_MONTHS)
    const totalDays = daysBetween(startDate, today)

    console.log(
      `Date range: ${toDateKey(startDate)} → ${toDateKey(today)} (${totalDays + 1} days)`,
    )

    // === Productions (daily for 12 months) ===
    // Start slightly higher ~12 months ago; occasional restocking offsets deaths.
    console.log('Creating production records...')
    let currentDucks = 360
    const productionJobs: Array<() => Promise<unknown>> = []

    for (let dayOffset = 0; dayOffset <= totalDays; dayOffset++) {
      const date = addDays(startDate, dayOffset)
      const seedKey = dayOffset + 1

      // Seasonal laying rate: slightly lower mid-year (rainy/heat stress)
      const month = date.getMonth() // 0–11
      const seasonal =
        month >= 10 || month <= 2
          ? 0.74 // Nov–Feb: better
          : month >= 6 && month <= 8
            ? 0.66 // Jul–Sep: lower
            : 0.7

      const rate = seasonal + dayRand(seedKey, 1) * 0.1 // ± variance
      const deaths =
        dayRand(seedKey, 2) > 0.92 ? randInt(1, 3, seedKey, 3) : 0
      currentDucks = Math.max(currentDucks - deaths, 250)

      // Restock every ~45–60 days
      if (dayOffset > 0 && dayOffset % 50 === 0 && currentDucks < 340) {
        currentDucks += randInt(20, 45, seedKey, 4)
      }

      const eggs = Math.floor(currentDucks * rate)
      const ducksToday = currentDucks
      const dateKey = toDateKey(date)

      productionJobs.push(() =>
        payload.create({
          collection: 'productions',
          data: {
            tanggal: dateKey,
            jumlahItik: ducksToday,
            telurDiproduksi: eggs,
            kematian: deaths,
          },
        }),
      )
    }

    await createInBatches(productionJobs, 25)
    console.log(`  → ${productionJobs.length} production days`)

    // === Sales (~2–4 per week over 12 months) ===
    console.log('Creating sales...')
    type SaleSeed = {
      dateKey: string
      customerIdx: number
      qty: number
      harga: number
      customerName: string
    }
    const salesList: SaleSeed[] = []

    for (let dayOffset = 0; dayOffset <= totalDays; dayOffset++) {
      const date = addDays(startDate, dayOffset)
      const seedKey = dayOffset + 1000
      const dow = date.getDay() // 0=Sun

      // More sales Mon/Wed/Fri/Sat; skip most Sundays
      const saleChance =
        dow === 0 ? 0.08 : dow === 1 || dow === 3 || dow === 5 || dow === 6 ? 0.55 : 0.28

      if (dayRand(seedKey, 5) > saleChance) continue

      // 1–2 sales that day
      const salesToday = dayRand(seedKey, 6) > 0.75 ? 2 : 1
      for (let s = 0; s < salesToday; s++) {
        const customerIdx = randInt(0, customerIds.length - 1, seedKey, 10 + s)
        // Price drifts up slowly over the year (~2700 → ~3000)
        const progress = dayOffset / Math.max(totalDays, 1)
        const basePrice = 2700 + Math.floor(progress * 300)
        const harga = basePrice + randInt(-100, 150, seedKey, 20 + s)
        const qty = randInt(80, 320, seedKey, 30 + s)

        salesList.push({
          dateKey: toDateKey(date),
          customerIdx,
          qty,
          harga,
          customerName: customerNames[customerIdx] ?? 'Pelanggan',
        })
      }
    }

    const saleJobs = salesList.map(
      (s) => () =>
        payload.create({
          collection: 'sales',
          data: {
            tanggal: s.dateKey,
            item: 'Telur Itik',
            hargaSatuan: s.harga,
            qty: s.qty,
            customer: customerIds[s.customerIdx],
          },
        }),
    )
    await createInBatches(saleJobs, 25)
    console.log(`  → ${salesList.length} sales`)

    // === Operational expenses (recurring monthly + irregular) ===
    console.log('Creating operational expenses...')
    type ExpenseSeed = {
      dateKey: string
      kategori: 'pakan' | 'vitamin' | 'obat-obatan' | 'listrik' | 'air'
      hargaNominal: number
      qty: number
      satuan: string
      cashDesc: string
    }
    const expenses: ExpenseSeed[] = []

    // Walk month by month from startDate
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const endMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    let monthIndex = 0

    while (cursor <= endMonth) {
      const y = cursor.getFullYear()
      const m = cursor.getMonth()
      const seedKey = y * 100 + m

      // Monthly utilities (around day 5–8)
      const utilityDay = randInt(5, 8, seedKey, 1)
      expenses.push({
        dateKey: toDateKey(new Date(y, m, utilityDay)),
        kategori: 'listrik',
        hargaNominal: randInt(400000, 520000, seedKey, 2),
        qty: 1,
        satuan: 'bulan',
        cashDesc: 'Bayar listrik kandang',
      })
      expenses.push({
        dateKey: toDateKey(new Date(y, m, utilityDay + 1)),
        kategori: 'air',
        hargaNominal: randInt(150000, 220000, seedKey, 3),
        qty: 1,
        satuan: 'bulan',
        cashDesc: 'Bayar air kandang',
      })

      // Feed 2–3 times per month
      const feedCount = randInt(2, 3, seedKey, 4)
      for (let f = 0; f < feedCount; f++) {
        const day = randInt(3 + f * 8, 8 + f * 10, seedKey, 10 + f)
        const qty = randInt(180, 280, seedKey, 20 + f)
        const unitPrice = randInt(4600, 5100, seedKey, 30 + f)
        expenses.push({
          dateKey: toDateKey(new Date(y, m, Math.min(day, 28))),
          kategori: 'pakan',
          hargaNominal: unitPrice,
          qty,
          satuan: 'kg',
          cashDesc: `Pembelian pakan ${qty} kg`,
        })
      }

      // Vitamin ~monthly
      expenses.push({
        dateKey: toDateKey(new Date(y, m, randInt(10, 20, seedKey, 40))),
        kategori: 'vitamin',
        hargaNominal: randInt(70000, 95000, seedKey, 41),
        qty: randInt(3, 8, seedKey, 42),
        satuan: 'kg',
        cashDesc: 'Pembelian vitamin ternak',
      })

      // Medicine every other month
      if (monthIndex % 2 === 0) {
        expenses.push({
          dateKey: toDateKey(new Date(y, m, randInt(12, 24, seedKey, 50))),
          kategori: 'obat-obatan',
          hargaNominal: randInt(90000, 140000, seedKey, 51),
          qty: randInt(1, 3, seedKey, 52),
          satuan: 'kg',
          cashDesc: 'Pembelian obat-obatan',
        })
      }

      cursor.setMonth(cursor.getMonth() + 1)
      monthIndex++
    }

    // Keep only expenses within [startDate, today]
    const expensesInRange = expenses.filter((e) => {
      const d = startOfDay(new Date(e.dateKey))
      return d >= startDate && d <= today
    })

    const expenseJobs = expensesInRange.map(
      (e) => () =>
        payload.create({
          collection: 'operationalExpenses',
          data: {
            tanggal: e.dateKey,
            kategori: e.kategori,
            hargaNominal: e.hargaNominal,
            qty: e.qty,
            satuan: e.satuan,
          },
        }),
    )
    await createInBatches(expenseJobs, 25)
    console.log(`  → ${expensesInRange.length} operational expenses`)

    // === Cashflow: sales inflows + expense outflows + occasional extras ===
    console.log('Creating cashflow...')
    type CashSeed = {
      dateKey: string
      jenis: 'MASUK' | 'KELUAR'
      keterangan: string
      nominal: number
      metode: 'CASH' | 'TRANSFER'
      sort: number
    }
    const cashList: CashSeed[] = []
    let sort = 0

    for (const s of salesList) {
      const nominal = s.harga * s.qty
      const metode = dayRand(sort + 7, 60) > 0.35 ? 'TRANSFER' : 'CASH'
      cashList.push({
        dateKey: s.dateKey,
        jenis: 'MASUK',
        keterangan: `Penjualan telur ke ${s.customerName}`,
        nominal,
        metode,
        sort: sort++,
      })
    }

    for (const e of expensesInRange) {
      const nominal =
        e.kategori === 'pakan' || e.kategori === 'vitamin' || e.kategori === 'obat-obatan'
          ? e.hargaNominal * e.qty
          : e.hargaNominal
      cashList.push({
        dateKey: e.dateKey,
        jenis: 'KELUAR',
        keterangan: e.cashDesc,
        nominal,
        metode: e.kategori === 'listrik' || e.kategori === 'air' ? 'TRANSFER' : pick(['CASH', 'TRANSFER'] as const, sort, 70),
        sort: sort++,
      })
    }

    // Occasional other cash (labor bonus, equipment, capital inject)
    for (let dayOffset = 0; dayOffset <= totalDays; dayOffset += 28) {
      const date = addDays(startDate, Math.min(dayOffset + randInt(0, 5, dayOffset, 80), totalDays))
      const seedKey = dayOffset + 2000
      if (dayRand(seedKey, 81) > 0.4) {
        cashList.push({
          dateKey: toDateKey(date),
          jenis: 'KELUAR',
          keterangan: pick(
            ['Upah pekerja harian', 'Perbaikan kandang', 'Beli sekam & litter', 'Transport ambil pakan'],
            seedKey,
            82,
          ),
          nominal: randInt(150000, 600000, seedKey, 83),
          metode: pick(['CASH', 'TRANSFER'] as const, seedKey, 84),
          sort: sort++,
        })
      }
      if (dayOffset > 0 && dayOffset % 90 === 0) {
        cashList.push({
          dateKey: toDateKey(date),
          jenis: 'MASUK',
          keterangan: 'Setoran modal tambahan',
          nominal: randInt(2000000, 5000000, seedKey, 85),
          metode: 'TRANSFER',
          sort: sort++,
        })
      }
    }

    // Chronological order helps running-balance hook stay sensible
    cashList.sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey)
      return a.sort - b.sort
    })

    // Cash hooks query previous txs — create sequentially for stable balances
    for (const c of cashList) {
      await payload.create({
        collection: 'cashTransactions',
        data: {
          tanggal: c.dateKey,
          keterangan: c.keterangan,
          jenis: c.jenis,
          nominal: c.nominal,
          metode: c.metode,
        },
      })
    }
    console.log(`  → ${cashList.length} cash transactions`)

    console.log('✅ Seeding completed successfully!')
    console.log(
      `Summary: ${customers.length} customers, ${productionJobs.length} productions, ${salesList.length} sales, ${expensesInRange.length} expenses, ${cashList.length} cashflow`,
    )
    console.log('You can now log in at /admin with the user you create.')
  } finally {
    if (options.destroy) {
      await payload.destroy()
    }
  }
}

// Run when executed as a CLI script (tsx / jiti / node).
const isDirectRun =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isDirectRun) {
  seed({ destroy: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err)
      process.exit(1)
    })
}
