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
import { ExportJobs } from './src/collections/ExportJobs'
import { exportDataTask } from './src/jobs/exportData'
import { migrations } from './src/migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isProd = process.env.NODE_ENV === 'production'
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Dev-only: drizzle push when NODE_ENV !== 'production'.
// Payload hardcodes push OFF in production regardless of this flag
// (see @payloadcms/db-postgres connect.js). Production uses prodMigrations.
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
    ExportJobs,
  ],
  upload: {
    limits: {
      fileSize: 10000000, // 10MB (exports can be larger than photo proofs)
    },
  },
  // Background jobs — export CSV/XLSX without blocking the UI
  jobs: {
    tasks: [exportDataTask],
    // Process queued jobs every minute (long-running Node / Docker)
    autoRun: [
      {
        cron: '* * * * *',
        limit: 10,
        queue: 'exports',
      },
    ],
    shouldAutoRun: async () => true,
    deleteJobOnComplete: false,
    access: {
      // Authenticated users may queue/run their export jobs via API
      queue: ({ req }) => !!req.user,
      run: ({ req }) => !!req.user,
    },
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Dev: drizzle push (ignored when NODE_ENV=production).
    push: databasePush,
    // Prod: run pending migrations on Payload init (empty DB first boot).
    prodMigrations: migrations,
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
