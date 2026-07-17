/**
 * Dev helper only — Payload never runs drizzle push when NODE_ENV=production.
 *
 * Prefer:
 *   - development: PAYLOAD_DATABASE_PUSH=true (default when not production)
 *   - production: src/migrations + prodMigrations in payload.config.ts
 *
 * Usage (local empty DB):
 *   DATABASE_URI=postgresql://... PAYLOAD_SECRET=... npx tsx scripts/push-schema.mjs
 *
 * Note: jiti may wrap default export; this script unwraps it.
 */
process.env.NODE_ENV = 'development'
process.env.PAYLOAD_DATABASE_PUSH = 'true'

if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = 'dev-secret-minimal-32-characters-long!!'
}
if (!process.env.DATABASE_URI) {
  console.error('DATABASE_URI is required')
  process.exit(1)
}

const { getPayload } = await import('payload')
const mod = await import('../payload.config.ts')
let config = mod.default?.default ?? mod.default
if (typeof config?.then === 'function') config = await config

const payload = await getPayload({ config })
const slugs = payload.config.collections.map((c) => c.slug)
console.log('[push-schema] OK. Collections:', slugs.join(', '))
process.exit(0)
