import { getPayload } from 'payload'
import config from '../payload.config'

export async function seed() {
  const payload = await getPayload({ config })
  console.log('🌱 Seeding database...')

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
  const customers = await Promise.all([
    payload.create({
      collection: 'customers',
      data: { nama: 'Pak Budi Santoso', kontak: '081234567890' },
    }),
    payload.create({
      collection: 'customers',
      data: { nama: 'Bu Siti Aminah', kontak: '082345678901' },
    }),
    payload.create({
      collection: 'customers',
      data: { nama: 'Pak Joko Widodo', kontak: '083456789012' },
    }),
    payload.create({
      collection: 'customers',
      data: { nama: 'Ibu Rina Marlina', kontak: '084567890123' },
    }),
  ])

  // === Productions (last 14 days) ===
  console.log('Creating production records...')
  const today = new Date()
  let currentDucks = 320

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const eggs = Math.floor(currentDucks * (0.68 + Math.random() * 0.12)) // ~68-80%
    const deaths = Math.random() > 0.85 ? Math.floor(Math.random() * 3) + 1 : 0
    currentDucks -= deaths

    await payload.create({
      collection: 'productions',
      data: {
        tanggal: date.toISOString().split('T')[0],
        jumlahItik: Math.max(currentDucks, 280),
        telurDiproduksi: eggs,
        kematian: deaths,
      },
    })
  }

  // === Sales ===
  console.log('Creating sales...')
  const salesData = [
    { customerIdx: 0, qty: 180, harga: 2800, daysAgo: 1 },
    { customerIdx: 1, qty: 120, harga: 2750, daysAgo: 2 },
    { customerIdx: 2, qty: 250, harga: 2900, daysAgo: 3 },
    { customerIdx: 0, qty: 90, harga: 2800, daysAgo: 5 },
    { customerIdx: 3, qty: 200, harga: 2850, daysAgo: 7 },
    { customerIdx: 1, qty: 150, harga: 2700, daysAgo: 9 },
    { customerIdx: 2, qty: 300, harga: 2950, daysAgo: 11 },
  ]

  for (const s of salesData) {
    const date = new Date(today)
    date.setDate(today.getDate() - s.daysAgo)

    await payload.create({
      collection: 'sales',
      data: {
        tanggal: date.toISOString().split('T')[0],
        item: 'Telur Itik',
        hargaSatuan: s.harga,
        qty: s.qty,
        customer: customers[s.customerIdx].id,
      },
    })
  }

  // === Cash Transactions ===
  console.log('Creating cashflow...')
  const cashData = [
    { type: 'MASUK', desc: 'Penjualan telur ke Pak Budi', amount: 504000, method: 'TRANSFER', daysAgo: 1 },
    { type: 'KELUAR', desc: 'Pembelian pakan', amount: 1250000, method: 'TRANSFER', daysAgo: 2 },
    { type: 'MASUK', desc: 'Penjualan telur ke Bu Siti', amount: 330000, method: 'CASH', daysAgo: 3 },
    { type: 'KELUAR', desc: 'Bayar listrik kandang', amount: 450000, method: 'TRANSFER', daysAgo: 4 },
    { type: 'MASUK', desc: 'Penjualan telur ke Pak Joko', amount: 725000, method: 'TRANSFER', daysAgo: 5 },
    { type: 'KELUAR', desc: 'Vitamin & obat', amount: 380000, method: 'CASH', daysAgo: 7 },
    { type: 'MASUK', desc: 'Penjualan telur ke Ibu Rina', amount: 570000, method: 'TRANSFER', daysAgo: 9 },
    { type: 'KELUAR', desc: 'Pembelian pakan tambahan', amount: 980000, method: 'TRANSFER', daysAgo: 10 },
  ]

  for (const c of cashData) {
    const date = new Date(today)
    date.setDate(today.getDate() - c.daysAgo)

    await payload.create({
      collection: 'cashTransactions',
      data: {
        tanggal: date.toISOString().split('T')[0],
        keterangan: c.desc,
        jenis: c.type,
        nominal: c.amount,
        metode: c.method,
      },
    })
  }

  // === Operational Expenses ===
  console.log('Creating operational expenses...')
  const expenses = [
    { cat: 'pakan', qty: 250, unit: 'kg', price: 4800, daysAgo: 2 },
    { cat: 'vitamin', qty: 5, unit: 'kg', price: 85000, daysAgo: 5 },
    { cat: 'listrik', qty: 1, unit: 'bulan', price: 450000, daysAgo: 4 },
    { cat: 'pakan', qty: 180, unit: 'kg', price: 4850, daysAgo: 10 },
    { cat: 'obat-obatan', qty: 2, unit: 'kg', price: 120000, daysAgo: 8 },
    { cat: 'air', qty: 1, unit: 'bulan', price: 180000, daysAgo: 12 },
  ]

  for (const e of expenses) {
    const date = new Date(today)
    date.setDate(today.getDate() - e.daysAgo)

    await payload.create({
      collection: 'operationalExpenses',
      data: {
        tanggal: date.toISOString().split('T')[0],
        kategori: e.cat,
        hargaNominal: e.price,
        qty: e.qty,
        satuan: e.unit,
      },
    })
  }

  console.log('✅ Seeding completed successfully!')
  console.log('You can now log in at /admin with the user you create.')
}

// Run directly when executed as script
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
  })
}
