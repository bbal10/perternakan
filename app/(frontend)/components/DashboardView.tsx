import {
  TrendingUp,
  Wallet,
  Egg,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Bird,
  Settings2,
  ShoppingCart,
  Factory,
  Banknote,
  Wrench,
  UserPlus,
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  Leaf,
  PiggyBank,
  Scale,
} from 'lucide-react'
import Link from 'next/link'
import {
  ProductionChart,
  SalesChart,
  ExpensePieChart,
  MonthlyProductionChart,
  MonthlyFinanceChart,
} from './DashboardCharts'
import { LogoutButton } from './LogoutButton'
import type { DashboardData } from '@/src/lib/dashboard'

function formatMomTrend(value: number | null | undefined, label = 'vs bulan lalu') {
  if (value === null || value === undefined) return undefined
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toLocaleString('id-ID')}% ${label}`
}

function momTrendUp(value: number | null | undefined): boolean | undefined {
  if (value === null || value === undefined) return undefined
  if (value === 0) return undefined
  return value > 0
}

type Tone = 'primary' | 'cta' | 'danger' | 'muted'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: string
  trendUp?: boolean
  tone?: Tone
}

const toneStyles: Record<
  Tone,
  { iconWrap: string; icon: string; accent: string }
> = {
  primary: {
    iconWrap: 'bg-primary-soft',
    icon: 'text-primary',
    accent: 'from-primary/10 to-transparent',
  },
  cta: {
    iconWrap: 'bg-cta-soft',
    icon: 'text-cta',
    accent: 'from-cta/10 to-transparent',
  },
  danger: {
    iconWrap: 'bg-danger-soft',
    icon: 'text-danger',
    accent: 'from-danger/10 to-transparent',
  },
  muted: {
    iconWrap: 'bg-surface-muted',
    icon: 'text-muted',
    accent: 'from-secondary/10 to-transparent',
  },
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  tone = 'primary',
}: StatCardProps) {
  const t = toneStyles[tone]
  return (
    <article className="card-surface group relative overflow-hidden p-5 transition-shadow duration-200">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${t.accent}`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {title}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[1.65rem]">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${t.iconWrap}`}
          aria-hidden
        >
          <Icon className={`h-5 w-5 ${t.icon}`} />
        </div>
      </div>
      {trend && (
        <div
          className={`relative mt-3 inline-flex items-center gap-1 text-xs font-medium ${
            trendUp === undefined
              ? 'text-muted'
              : trendUp
                ? 'text-primary'
                : 'text-danger'
          }`}
        >
          {trendUp === true && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />}
          {trendUp === false && (
            <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
          )}
          <span>{trend}</span>
        </div>
      )}
    </article>
  )
}

const quickActions = [
  {
    href: '/admin/collections/sales/create',
    label: 'Penjualan',
    icon: ShoppingCart,
  },
  {
    href: '/admin/collections/productions/create',
    label: 'Produksi',
    icon: Factory,
  },
  {
    href: '/admin/collections/cashTransactions/create',
    label: 'Cashflow',
    icon: Banknote,
  },
  {
    href: '/admin/collections/operationalExpenses/create',
    label: 'Operasional',
    icon: Wrench,
  },
  {
    href: '/admin/collections/customers/create',
    label: 'Pelanggan',
    icon: UserPlus,
    muted: true,
  },
] as const

type Props = {
  data: DashboardData
  displayName: string
  email: string
  isDev: boolean
}

export function DashboardView({ data, displayName, email, isDev }: Props) {
  return (
    <div className="bg-organic min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm"
              aria-hidden
            >
              <Bird className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                Peternakan Itik
              </p>
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                <Leaf className="h-3 w-3" aria-hidden />
                Manajemen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[160px] truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p className="max-w-[160px] truncate text-xs text-muted">{email}</p>
            </div>
            <a
              href="/admin"
              className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
            >
              <Settings2 className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Admin</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-80" aria-hidden />
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />
              <time dateTime={data.dateISO}>{data.dateLabel}</time>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Dashboard operasional
            </h1>
            <p className="mt-2 max-w-xl text-base text-muted">
              Ringkasan dihitung saat halaman dibuka. Muat ulang halaman untuk data
              terbaru dari Admin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
              {data.customersCount} pelanggan
            </span>
            <span className="inline-flex items-center rounded-full bg-cta-soft px-3 py-1.5 text-xs font-semibold text-cta-hover">
              {data.productionsCount} hari produksi
            </span>
          </div>
        </section>

        <section className="mb-8" aria-labelledby="quick-input-heading">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="quick-input-heading" className="text-sm font-semibold text-foreground">
              Input cepat
            </h2>
            <p className="text-xs text-muted">Form lengkap di Admin Panel</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map(({ href, label, icon: Icon, ...rest }) => {
              const muted = 'muted' in rest && rest.muted
              return (
                <a
                  key={href}
                  href={href}
                  className={`focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                    muted
                      ? 'border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-muted'
                      : 'border-transparent bg-primary text-white hover:bg-primary-hover'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </a>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="kpi-heading" className="mb-8">
          <h2 id="kpi-heading" className="sr-only">
            Indikator utama
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard
              title="Jumlah itik"
              value={data.currentDucks.toLocaleString('id-ID')}
              icon={Bird}
              trend="Dari produksi terakhir"
              tone="primary"
            />
            <StatCard
              title="Produksi hari ini"
              value={`${data.todayEggs.toLocaleString('id-ID')} butir`}
              icon={Egg}
              trend={`${data.latestProductionRate}% tingkat produksi`}
              tone="cta"
            />
            <StatCard
              title="Rata-rata produksi"
              value={`${data.avgProductionRate}%`}
              icon={TrendingUp}
              tone="primary"
            />
            <StatCard
              title="Saldo kas"
              value={`Rp ${data.cashBalance.toLocaleString('id-ID')}`}
              icon={Banknote}
              trend={data.cashBalance >= 0 ? 'Positif' : 'Perlu perhatian'}
              trendUp={data.cashBalance >= 0}
              tone={data.cashBalance >= 0 ? 'primary' : 'danger'}
            />
            <StatCard
              title="Pendapatan bulan ini"
              value={`Rp ${data.monthlyRevenue.toLocaleString('id-ID')}`}
              icon={Wallet}
              trend="Dari penjualan · bulan berjalan"
              trendUp
              tone="cta"
            />
            <StatCard
              title="Telur terjual bulan ini"
              value={`${data.telurTerjualBulanIni.toLocaleString('id-ID')} butir`}
              icon={ShoppingCart}
              tone="muted"
            />
            <StatCard
              title="Kematian bulan ini"
              value={data.kematianBulanIni.toLocaleString('id-ID')}
              icon={AlertTriangle}
              tone={data.kematianBulanIni > 0 ? 'danger' : 'muted'}
            />
            <StatCard
              title="Pelanggan aktif"
              value={data.customersCount.toLocaleString('id-ID')}
              icon={Users}
              tone="muted"
            />
          </div>
        </section>

        <section
          id="statistik-bulanan"
          className="mb-8 scroll-mt-24"
          aria-labelledby="monthly-stats-heading"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <CalendarRange
                  className="h-4 w-4 text-primary"
                  aria-hidden
                />
                <h2
                  id="monthly-stats-heading"
                  className="text-base font-semibold text-foreground sm:text-lg"
                >
                  Statistik bulanan
                </h2>
              </div>
              <p className="text-sm text-muted">
                {data.isSelectedCurrentMonth
                  ? 'Produksi, penjualan, biaya, dan kas · bulan berjalan (MTD)'
                  : `Riwayat lengkap · ${data.monthLabel}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
                {data.monthLabel}
                {data.isSelectedCurrentMonth ? ' · MTD' : ' · riwayat'}
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted">
                Tren {data.monthlySeries.length} bulan
              </span>
              {!data.isSelectedCurrentMonth && (
                <Link
                  href="/#statistik-bulanan"
                  className="focus-ring inline-flex min-h-9 items-center rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-surface-muted"
                >
                  Kembali ke bulan ini
                </Link>
              )}
            </div>
          </div>

          <nav
            className="mb-4"
            aria-label="Pilih bulan untuk riwayat statistik"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Pilih bulan
            </p>
            <ul className="flex flex-wrap gap-2">
              {[...data.monthlySeries].reverse().map((m) => {
                const isActive = m.key === data.selectedMonthKey
                const href =
                  m.key === data.currentMonthKey
                    ? '/#statistik-bulanan'
                    : `/?bulan=${m.key}#statistik-bulanan`
                return (
                  <li key={m.key}>
                    <Link
                      href={href}
                      scroll
                      aria-current={isActive ? 'page' : undefined}
                      className={`focus-ring inline-flex min-h-9 items-center rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'border-transparent bg-primary text-white'
                          : 'border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-muted'
                      }`}
                    >
                      {m.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Produksi telur"
              value={`${data.monthlyStats.telurDiproduksi.toLocaleString('id-ID')} butir`}
              icon={Egg}
              trend={formatMomTrend(data.monthlyStats.mom.telurDiproduksi)}
              trendUp={momTrendUp(data.monthlyStats.mom.telurDiproduksi)}
              tone="primary"
            />
            <StatCard
              title="Rata-rata % produksi"
              value={`${data.monthlyStats.avgPersenProduksi.toLocaleString('id-ID')}%`}
              icon={TrendingUp}
              tone="primary"
            />
            <StatCard
              title="Pendapatan"
              value={`Rp ${data.monthlyStats.pendapatan.toLocaleString('id-ID')}`}
              icon={Wallet}
              trend={formatMomTrend(data.monthlyStats.mom.pendapatan)}
              trendUp={momTrendUp(data.monthlyStats.mom.pendapatan)}
              tone="cta"
            />
            <StatCard
              title="Biaya operasional"
              value={`Rp ${data.monthlyStats.biayaOperasional.toLocaleString('id-ID')}`}
              icon={Wrench}
              tone="muted"
            />
            <StatCard
              title="Margin kotor"
              value={`Rp ${data.monthlyStats.margin.toLocaleString('id-ID')}`}
              icon={Scale}
              trend={
                formatMomTrend(data.monthlyStats.mom.margin) ??
                'Pendapatan − biaya operasional'
              }
              trendUp={momTrendUp(data.monthlyStats.mom.margin)}
              tone={data.monthlyStats.margin >= 0 ? 'primary' : 'danger'}
            />
            <StatCard
              title="Kas net"
              value={`Rp ${data.monthlyStats.kasNet.toLocaleString('id-ID')}`}
              icon={PiggyBank}
              trend={`Masuk − keluar · ${data.monthLabel}`}
              trendUp={data.monthlyStats.kasNet >= 0}
              tone={data.monthlyStats.kasNet >= 0 ? 'primary' : 'danger'}
            />
            <StatCard
              title="Telur terjual"
              value={`${data.monthlyStats.telurTerjual.toLocaleString('id-ID')} butir`}
              icon={ShoppingCart}
              trend={
                data.monthlyStats.hargaRataRata > 0
                  ? `Avg Rp ${data.monthlyStats.hargaRataRata.toLocaleString('id-ID')}/butir`
                  : undefined
              }
              tone="muted"
            />
            <StatCard
              title="Kematian"
              value={`${data.monthlyStats.kematian.toLocaleString('id-ID')} ekor`}
              icon={AlertTriangle}
              tone={data.monthlyStats.kematian > 0 ? 'danger' : 'muted'}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card-surface p-5 sm:p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">
                  Produksi telur per bulan
                </h3>
                <p className="text-sm text-muted">
                  {data.monthlySeries.length} bulan terakhir · butir
                </p>
              </div>
              <MonthlyProductionChart data={data.monthlySeries} />
            </div>
            <div className="card-surface p-5 sm:p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">
                  Pendapatan vs biaya operasional
                </h3>
                <p className="text-sm text-muted">
                  {data.monthlySeries.length} bulan terakhir · Rupiah
                </p>
              </div>
              <MonthlyFinanceChart data={data.monthlySeries} />
            </div>
          </div>
        </section>

        <section
          className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2"
          aria-labelledby="charts-heading"
        >
          <h2 id="charts-heading" className="sr-only">
            Grafik tren
          </h2>
          <div className="card-surface p-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground">
                Produksi telur
              </h3>
              <p className="text-sm text-muted">14 hari terakhir · butir per hari</p>
            </div>
            <ProductionChart data={data.productionChartData} />
          </div>
          <div className="card-surface p-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground">
                Penjualan terbaru
              </h3>
              <p className="text-sm text-muted">Subtotal per transaksi</p>
            </div>
            <SalesChart data={data.salesByDay} />
          </div>
        </section>

        <section
          className="grid grid-cols-1 gap-4 lg:grid-cols-3"
          aria-labelledby="activity-heading"
        >
          <h2 id="activity-heading" className="sr-only">
            Aktivitas dan pengeluaran
          </h2>

          <div className="card-surface p-5 sm:p-6 lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground">
                Pengeluaran per kategori
              </h3>
              <p className="text-sm text-muted">
                {data.isSelectedCurrentMonth
                  ? 'Bulan ini'
                  : data.monthLabel}
              </p>
            </div>
            <ExpensePieChart data={data.pieData} />
          </div>

          <div className="card-surface p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">
                Penjualan terbaru
              </h3>
              <a
                href="/admin/collections/sales"
                className="focus-ring inline-flex min-h-9 cursor-pointer items-center rounded-lg px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                Lihat semua
              </a>
            </div>
            <ul className="divide-y divide-border">
              {data.recentSales.length > 0 ? (
                data.recentSales.map((sale, idx) => (
                  <li
                    key={sale.id ?? idx}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {sale.item} × {sale.qty}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {sale.customerName} · {sale.tanggalLabel}
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
                      Rp {sale.subtotal.toLocaleString('id-ID')}
                    </p>
                  </li>
                ))
              ) : (
                <li className="py-8 text-center text-sm text-muted">
                  Belum ada data penjualan
                </li>
              )}
            </ul>
          </div>

          <div className="card-surface p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">
                Arus kas terbaru
              </h3>
              <a
                href="/admin/collections/cashTransactions"
                className="focus-ring inline-flex min-h-9 cursor-pointer items-center rounded-lg px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                Lihat semua
              </a>
            </div>
            <ul className="divide-y divide-border">
              {data.recentCash.length > 0 ? (
                data.recentCash.map((tx, idx) => {
                  const isIn = tx.jenis === 'MASUK'
                  return (
                    <li
                      key={tx.id ?? idx}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p
                          className={`font-mono text-sm font-semibold tabular-nums ${
                            isIn ? 'text-primary' : 'text-danger'
                          }`}
                        >
                          {isIn ? '+' : '−'} Rp{' '}
                          {tx.nominal.toLocaleString('id-ID')}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {tx.keterangan}
                        </p>
                        <p className="text-[11px] font-medium text-muted-soft">
                          Saldo: Rp {tx.computedSaldo.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                          {tx.metode}
                        </p>
                        <p className="text-xs text-muted">{tx.tanggalLabel}</p>
                      </div>
                    </li>
                  )
                })
              ) : (
                <li className="py-8 text-center text-sm text-muted">
                  Belum ada transaksi kas
                </li>
              )}
            </ul>
          </div>
        </section>

        <footer className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs leading-relaxed text-muted">
            Data dihitung on-demand saat halaman dimuat · Sumber: PostgreSQL via Payload
            · Muat ulang untuk update
          </p>
          {isDev && (
            <form action="/api/seed" method="POST" className="mt-3">
              <button
                type="submit"
                className="focus-ring inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-border bg-surface px-4 py-2 text-xs font-medium text-muted transition-colors duration-200 hover:border-border-strong hover:bg-surface-muted hover:text-foreground"
              >
                Seed data contoh (dev only)
              </button>
            </form>
          )}
        </footer>
      </main>
    </div>
  )
}
