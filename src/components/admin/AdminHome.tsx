import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { getDashboardData } from '@/src/lib/dashboard'

type LinkItem = {
  href: string
  title: string
  description: string
  badge?: string
  accent: 'primary' | 'cta' | 'muted'
}

const groups: { title: string; items: LinkItem[] }[] = [
  {
    title: 'Operasional harian',
    items: [
      {
        href: '/admin/collections/productions',
        title: 'Produksi',
        description: 'Catat telur harian, jumlah itik, dan kematian.',
        badge: 'Harian',
        accent: 'primary',
      },
      {
        href: '/admin/collections/productions/create',
        title: 'Input produksi hari ini',
        description: 'Form cepat untuk entri produksi baru.',
        accent: 'cta',
      },
      {
        href: '/admin/collections/sales',
        title: 'Penjualan',
        description: 'Transaksi jual telur & pelanggan.',
        badge: 'Penjualan',
        accent: 'primary',
      },
      {
        href: '/admin/collections/sales/create',
        title: 'Tambah penjualan',
        description: 'Buat nota penjualan baru.',
        accent: 'cta',
      },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      {
        href: '/admin/collections/cashTransactions',
        title: 'Cashflow',
        description: 'Uang masuk/keluar dan metode bayar.',
        accent: 'primary',
      },
      {
        href: '/admin/collections/cashTransactions/create',
        title: 'Catat cashflow',
        description: 'Input transaksi kas cepat.',
        accent: 'cta',
      },
      {
        href: '/admin/collections/operationalExpenses',
        title: 'Biaya operasional',
        description: 'Pakan, vitamin, listrik, air, obat.',
        accent: 'primary',
      },
      {
        href: '/admin/collections/operationalExpenses/create',
        title: 'Tambah biaya',
        description: 'Catat pengeluaran operasional.',
        accent: 'cta',
      },
    ],
  },
  {
    title: 'Master & sistem',
    items: [
      {
        href: '/admin/collections/customers',
        title: 'Pelanggan',
        description: 'Data pelanggan & kontak WA/HP.',
        accent: 'muted',
      },
      {
        href: '/admin/collections/media',
        title: 'Media / bukti',
        description: 'Upload foto atau bukti transfer.',
        accent: 'muted',
      },
      {
        href: '/admin/collections/users',
        title: 'Pengguna',
        description: 'Akun admin & staff.',
        accent: 'muted',
      },
    ],
  },
]

function accentClasses(accent: LinkItem['accent']) {
  if (accent === 'cta') {
    return {
      card: 'border-farm-cta/40 hover:border-farm-cta bg-gradient-to-br from-farm-cta-soft/80 to-farm-surface',
      badge: 'bg-farm-cta text-white',
    }
  }
  if (accent === 'muted') {
    return {
      card: 'border-farm-border hover:border-farm-border-strong bg-farm-surface',
      badge: 'bg-farm-primary-soft text-farm-primary',
    }
  }
  return {
    card: 'border-farm-border hover:border-farm-primary/40 bg-farm-surface',
    badge: 'bg-farm-primary-soft text-farm-primary',
  }
}

/**
 * Custom Payload admin homepage — Organic Biophilic, matching frontend dashboard UX.
 */
export default async function AdminHome(props: AdminViewServerProps) {
  const { initPageResult } = props
  const { req } = initPageResult
  const { user, payload } = req

  let stats: Awaited<ReturnType<typeof getDashboardData>> | null = null
  if (user) {
    try {
      stats = await getDashboardData(payload, user)
    } catch (err) {
      console.error('[AdminHome] failed to load stats', err)
    }
  }

  const displayName =
    (user as { name?: string | null } | null)?.name?.trim() ||
    user?.email ||
    'Pengguna'

  const kpis = stats
    ? [
        {
          label: 'Jumlah itik',
          value: stats.currentDucks.toLocaleString('id-ID'),
          hint: 'Produksi terakhir',
        },
        {
          label: 'Telur hari ini',
          value: `${stats.todayEggs.toLocaleString('id-ID')}`,
          hint: `${stats.latestProductionRate}% produksi`,
        },
        {
          label: 'Pendapatan bulan ini',
          value: `Rp ${stats.monthlyRevenue.toLocaleString('id-ID')}`,
          hint: 'Dari penjualan',
        },
        {
          label: 'Saldo cash',
          value: `Rp ${stats.cashBalanceCash.toLocaleString('id-ID')}`,
          hint: 'Tunai di tangan',
        },
        {
          label: 'Saldo transfer',
          value: `Rp ${stats.cashBalanceTransfer.toLocaleString('id-ID')}`,
          hint: 'Rekening / transfer',
        },
        {
          label: 'Total saldo',
          value: `Rp ${stats.cashBalance.toLocaleString('id-ID')}`,
          hint:
            stats.cashBalance >= 0
              ? 'Cash + transfer · Positif'
              : 'Cash + transfer · Perlu perhatian',
        },
      ]
    : []

  return (
    <div className="farm-admin-home px-4 py-6 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="farm-card relative mb-8 overflow-hidden">
        <div className="relative bg-gradient-to-br from-farm-primary-soft via-farm-surface to-farm-cta-soft p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-farm-secondary/15 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-farm-muted">
                Panel input data
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-farm-text sm:text-3xl">
                Halo, {displayName}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-farm-muted sm:text-base">
                Kelola produksi, penjualan, cashflow, dan biaya operasional di sini.
                Ringkasan visual lengkap ada di dashboard utama.
              </p>
              {stats && (
                <p className="mt-2 text-xs text-farm-muted">
                  {stats.dateLabel} · {stats.customersCount} pelanggan ·{' '}
                  {stats.productionsCount} hari produksi tercatat
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/" className="farm-btn-primary">
                Buka dashboard utama
              </a>
              <a href="/admin/collections/productions/create" className="farm-btn-ghost">
                + Produksi hari ini
              </a>
              <a href="/admin/collections/sales/create" className="farm-btn-ghost">
                + Penjualan
              </a>
              <a href="/#export-heading" className="farm-btn-ghost">
                Export CSV/Excel
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      {kpis.length > 0 && (
        <section className="mb-8" aria-label="Ringkasan cepat">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-farm-text">Ringkasan cepat</h2>
            <span className="text-xs text-farm-muted">Diambil saat halaman dibuka</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {kpis.map((kpi) => (
              <article
                key={kpi.label}
                className="farm-card p-4 transition-shadow duration-200 hover:shadow-md"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-farm-muted">
                  {kpi.label}
                </p>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums tracking-tight text-farm-text">
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs text-farm-muted">{kpi.hint}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Guided modules */}
      {groups.map((group) => (
        <section key={group.title} className="mb-8" aria-labelledby={`group-${group.title}`}>
          <h2
            id={`group-${group.title}`}
            className="mb-3 text-sm font-semibold text-farm-text"
          >
            {group.title}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {group.items.map((item) => {
              const a = accentClasses(item.accent)
              return (
                <a
                  key={item.href + item.title}
                  href={item.href}
                  className={`farm-card group block cursor-pointer p-4 no-underline transition-all duration-200 hover:shadow-md ${a.card}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-farm-text group-hover:text-farm-primary">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${a.badge}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-farm-muted">
                    {item.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-farm-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Buka →
                  </p>
                </a>
              )
            })}
          </div>
        </section>
      ))}

      {/* Workflow tip */}
      <section className="farm-card border-dashed p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-farm-text">Alur kerja disarankan</h2>
        <ol className="mt-3 grid list-decimal gap-2 pl-5 text-sm text-farm-muted sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <span className="font-semibold text-farm-text">Produksi</span> — catat telur &
            stok itik harian
          </li>
          <li>
            <span className="font-semibold text-farm-text">Penjualan</span> — catat order
            pelanggan
          </li>
          <li>
            <span className="font-semibold text-farm-text">Cashflow</span> — catat uang
            masuk/keluar
          </li>
          <li>
            <span className="font-semibold text-farm-text">Dashboard</span> — cek ringkasan
            visual di beranda
          </li>
        </ol>
      </section>
    </div>
  )
}
