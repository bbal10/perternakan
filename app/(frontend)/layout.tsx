import type { Metadata } from 'next'
import { Fira_Code, Fira_Sans } from 'next/font/google'
import '../globals.css'

const firaSans = Fira_Sans({
  variable: '--font-fira-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const firaCode = Fira_Code({
  variable: '--font-fira-code',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Peternakan Itik',
    template: '%s | Manajemen Peternakan Itik',
  },
  description:
    'Aplikasi Web Manajemen Peternakan Itik — Dashboard, Penjualan, Produksi, Cashflow, Operasional',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`${firaSans.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground flex flex-col">
        {children}
      </body>
    </html>
  )
}
