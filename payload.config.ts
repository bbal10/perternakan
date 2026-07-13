import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Customers } from './src/collections/Customers'
import { Sales } from './src/collections/Sales'
import { Productions } from './src/collections/Productions'
import { CashTransactions } from './src/collections/CashTransactions'
import { OperationalExpenses } from './src/collections/OperationalExpenses'
import { Media } from './src/collections/Media'
import { Users } from './src/collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isProd = process.env.NODE_ENV === 'production'
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Explicit override wins; otherwise push only outside production.
const databasePush =
  process.env.PAYLOAD_DATABASE_PUSH !== undefined
    ? process.env.PAYLOAD_DATABASE_PUSH === 'true'
    : !isProd

const payloadSecret = process.env.PAYLOAD_SECRET || ''
if (isProd && (!payloadSecret || payloadSecret.length < 32)) {
  throw new Error(
    'PAYLOAD_SECRET must be set to a strong value (min 32 characters) when NODE_ENV=production',
  )
}

export default buildConfig({
  admin: {
    user: 'users',
    // Organic Biophilic — matched to frontend dashboard
    theme: 'light',
    meta: {
      titleSuffix: ' · Peternakan Itik',
      description: 'Admin panel manajemen peternakan itik',
    },
    dateFormat: 'dd MMM yyyy',
    components: {
      graphics: {
        Logo: '/src/components/admin/Logo.tsx',
        Icon: '/src/components/admin/Icon.tsx',
      },
      afterNavLinks: ['/src/components/admin/DashboardNavLink.tsx'],
      views: {
        dashboard: {
          Component: '/src/components/admin/AdminHome.tsx',
        },
      },
    },
  },
  editor: lexicalEditor({}),
  // Order shapes nav groups: Operasional → Keuangan → Master → Sistem
  collections: [
    Productions,
    Sales,
    CashTransactions,
    OperationalExpenses,
    Customers,
    Media,
    Users,
  ],
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Dev: push schema. Prod: migrations only (set PAYLOAD_DATABASE_PUSH=true only for emergency bootstrap).
    push: databasePush,
    migrationDir: path.resolve(dirname, 'src/migrations'),
  }),
  secret: payloadSecret || 'dev-only-secret-change-me-min-32-chars!!',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  serverURL,
  cors: [serverURL],
  csrf: [serverURL],
  sharp,
})
