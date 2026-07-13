'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

/** Accessible palette aligned with Organic Biophilic design system */
const COLORS = ['#15803d', '#ca8a04', '#0369a1', '#b45309', '#4d7c0f', '#0f766e']

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #bbf7d0',
  boxShadow: '0 8px 24px rgb(20 83 45 / 0.08)',
  fontFamily: 'var(--font-fira-sans), system-ui, sans-serif',
  fontSize: 13,
}

type ProductionPoint = { date: string; telur: number; persen: number }
type SalesPoint = { date: string; revenue: number }
type PiePoint = { name: string; value: number }

function ChartEmpty({ label }: { label: string }) {
  return (
    <div
      className="flex h-[280px] items-center justify-center rounded-xl bg-surface-muted/60 text-sm text-muted"
      role="status"
    >
      {label}
    </div>
  )
}

export function ProductionChart({ data }: { data: ProductionPoint[] }) {
  if (data.length === 0) {
    return <ChartEmpty label="Belum ada data produksi" />
  }

  return (
    <div className="h-[280px] w-full" role="img" aria-label="Grafik produksi telur 14 hari terakhir">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#bbf7d0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#3f6212' }}
            axisLine={{ stroke: '#86efac' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#3f6212' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: '#14532d', fontWeight: 600 }}
            formatter={(value) => [`${Number(value).toLocaleString('id-ID')} butir`, 'Telur']}
          />
          <Line
            type="monotone"
            dataKey="telur"
            stroke="#15803d"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#15803d', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#ca8a04', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SalesChart({ data }: { data: SalesPoint[] }) {
  if (data.length === 0) {
    return <ChartEmpty label="Belum ada data penjualan" />
  }

  return (
    <div className="h-[280px] w-full" role="img" aria-label="Grafik subtotal penjualan terbaru">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#bbf7d0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#3f6212' }}
            axisLine={{ stroke: '#86efac' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#3f6212' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [
              `Rp ${Number(value).toLocaleString('id-ID')}`,
              'Pendapatan',
            ]}
          />
          <Bar dataKey="revenue" fill="#ca8a04" radius={[8, 8, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

type MonthlyProductionPoint = {
  label: string
  telurDiproduksi: number
}

type MonthlyFinancePoint = {
  label: string
  pendapatan: number
  biayaOperasional: number
}

export function MonthlyProductionChart({
  data,
}: {
  data: MonthlyProductionPoint[]
}) {
  const hasData = data.some((d) => d.telurDiproduksi > 0)
  if (!hasData) {
    return <ChartEmpty label="Belum ada data produksi bulanan" />
  }

  return (
    <div
      className="h-[280px] w-full"
      role="img"
      aria-label="Grafik produksi telur per bulan, 6 bulan terakhir"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#bbf7d0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#3f6212' }}
            axisLine={{ stroke: '#86efac' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#3f6212' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: '#14532d', fontWeight: 600 }}
            formatter={(value) => [
              `${Number(value).toLocaleString('id-ID')} butir`,
              'Produksi',
            ]}
          />
          <Bar
            dataKey="telurDiproduksi"
            fill="#15803d"
            radius={[8, 8, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlyFinanceChart({ data }: { data: MonthlyFinancePoint[] }) {
  const hasData = data.some((d) => d.pendapatan > 0 || d.biayaOperasional > 0)
  if (!hasData) {
    return <ChartEmpty label="Belum ada data keuangan bulanan" />
  }

  return (
    <div
      className="h-[280px] w-full"
      role="img"
      aria-label="Grafik pendapatan vs biaya operasional per bulan"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#bbf7d0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#3f6212' }}
            axisLine={{ stroke: '#86efac' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#3f6212' }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toLocaleString('id-ID')}jt`
                : v >= 1_000
                  ? `${(v / 1_000).toLocaleString('id-ID')}rb`
                  : String(v)
            }
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [
              `Rp ${Number(value).toLocaleString('id-ID')}`,
              name === 'pendapatan' ? 'Pendapatan' : 'Biaya operasional',
            ]}
          />
          <Bar
            dataKey="pendapatan"
            fill="#ca8a04"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="biayaOperasional"
            fill="#0f766e"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
      <ul
        className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-muted"
        aria-label="Legenda grafik keuangan"
      >
        <li className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: '#ca8a04' }}
            aria-hidden
          />
          Pendapatan
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: '#0f766e' }}
            aria-hidden
          />
          Biaya operasional
        </li>
      </ul>
    </div>
  )
}

export function ExpensePieChart({ data }: { data: PiePoint[] }) {
  if (data.length === 0) {
    return (
      <div
        className="flex h-[260px] items-center justify-center text-sm text-muted"
        role="status"
      >
        Belum ada data pengeluaran
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div>
      <div
        className="h-[220px] w-full"
        role="img"
        aria-label="Grafik pengeluaran per kategori"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
              stroke="#f0fdf4"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-2" aria-label="Rincian kategori pengeluaran">
        {data.map((item, i) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                  aria-hidden
                />
                <span className="truncate text-foreground">{item.name}</span>
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
                {pct}% · Rp {item.value.toLocaleString('id-ID')}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
