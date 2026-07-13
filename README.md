# Manajemen Peternakan Itik

Aplikasi web manajemen peternakan itik menggunakan **Next.js + Payload CMS**.

## Fitur utama
- Dashboard ringkasan & statistik
- Data penjualan (relasi ke pelanggan)
- Data produksi + persentase otomatis
- Cashflow + upload bukti transfer
- Data operasional
- Master pelanggan

## Tech stack
- Next.js 16 (App Router)
- Payload CMS 3 (admin + data layer)
- PostgreSQL
- Tailwind CSS
- Recharts

---

## Development vs production

| | **Development** | **Production** |
|--|-----------------|----------------|
| Command | `npm run dev` / `docker:dev` | `npm run build && npm start` / `docker:prod` |
| Image / Dockerfile | `Dockerfile.dev` | `Dockerfile` (multi-stage) |
| Compose file | `docker-compose.yml` | `docker-compose.prod.yml` |
| Env file | `.env.local` | `.env.production.local` |
| `NODE_ENV` | `development` | `production` |
| Schema DB | **push** (`PAYLOAD_DATABASE_PUSH=true`) — tabel ikut berubah otomatis | **migrations** (`PAYLOAD_DATABASE_PUSH=false`) |
| Source code | Bind-mount + hot reload | Baked into image |
| Secrets | Dev placeholder OK | Wajib secret kuat (≥32 char) |
| Seed data | Boleh (`POST /api/seed`) | Diblokir |

### Alur schema

```text
Development
  collections berubah → app start → drizzle push → tabel sinkron

Production
  collections berubah → buat migration → deploy → jalankan migration → app start
```

Folder migration: `src/migrations/`  
(CLI `payload migrate` masih bisa gagal di beberapa setup Node/tsx + Lexical; di dev andalkan push.)

---

## Setup development

### A. Lokal (Node di host)

1. Pastikan PostgreSQL jalan dan buat database `perternakan`.
2. Environment:
   ```bash
   cp .env.example .env.local
   ```
3. Isi minimal:
   ```env
   PAYLOAD_SECRET=dev-secret-minimal-32-characters-long!!
   DATABASE_URI=postgresql://postgres:postgres@localhost:5432/perternakan
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   PAYLOAD_DATABASE_PUSH=true
   ```
4. Install & jalankan:
   ```bash
   npm install
   npm run dev
   ```
5. Buka:
   - Dashboard: http://localhost:3000 (wajib login; redirect ke `/admin/login` jika belum)
   - Admin: http://localhost:3000/admin (buat user pertama, lalu login)

### B. Docker / Podman (dev stack)

```bash
cp .env.example .env.local
# DATABASE_URI di .env.local akan di-override ke host "db" oleh compose

npm run docker:dev
# setara: podman compose -f docker-compose.yml up --build
```

- App: http://localhost:3000  
- Postgres: `localhost:5432`  
- Stop: `npm run docker:dev:down`

Hot reload aktif (source di-mount ke container).

---

## Setup production

### 1. Environment

```bash
cp .env.example .env.production.local
```

Isi **wajib** (contoh):

```env
NODE_ENV=production
PAYLOAD_SECRET=<hasil: openssl rand -base64 48>
POSTGRES_USER=perternakan
POSTGRES_PASSWORD=<password-kuat>
POSTGRES_DB=perternakan
DATABASE_URI=postgresql://perternakan:<password-kuat>@db:5432/perternakan
NEXT_PUBLIC_SERVER_URL=https://domain-anda.com
PAYLOAD_DATABASE_PUSH=false
APP_PORT=3000
```

Jangan commit `.env.production.local`.

### 2. Docker / Podman (prod stack)

```bash
npm run docker:prod
# setara:
# podman compose -f docker-compose.prod.yml --env-file .env.production.local up --build -d
```

- Image dibuild dari `Dockerfile` (multi-stage, `npm run build` + `npm start`)
- Tidak ada bind-mount source
- Upload media di volume `media_uploads`
- DB di volume `postgres_data_prod`

Stop:

```bash
npm run docker:prod:down
```

### 3. Production tanpa Docker

```bash
export NODE_ENV=production
export PAYLOAD_SECRET=...
export DATABASE_URI=...
export NEXT_PUBLIC_SERVER_URL=https://domain-anda.com
export PAYLOAD_DATABASE_PUSH=false

npm ci
npm run build
npm start
```

### 4. Bootstrap DB kosong di production

**Disarankan:** buat & jalankan migration Payload (`src/migrations`).

**Darurat (sekali saja):** set `PAYLOAD_DATABASE_PUSH=true` saat start pertama, biarkan schema terbentuk, lalu kembalikan ke `false` dan deploy ulang. Jangan biarkan push menyala di production jangka panjang.

---

## Perintah berguna

```bash
npm run dev                 # development server
npm run build               # production build
npm start                   # production server (setelah build)
npm run lint
npm run payload:generate    # generate TypeScript types
npm run payload:migrate     # jalankan migration (production-oriented)
npm run payload:migrate:create
npm run seed                # seed data (dev; butuh DATABASE_URI)
npm run docker:dev          # compose development
npm run docker:prod         # compose production (butuh .env.production.local)
```

---

## Struktur penting

```text
Dockerfile              # production image
Dockerfile.dev          # development image
docker-compose.yml      # development stack
docker-compose.prod.yml # production stack
.env.example            # template env (dev + prod notes)
payload.config.ts       # push/cors/secret mengikuti env
src/migrations/         # migration files (production)
app/(frontend)/         # dashboard (root layout frontend)
app/(payload)/          # admin + Payload REST API
```

---

## Payload Admin

Input data (penjualan, produksi, cashflow, dll.) lewat **Admin** di `/admin`.  
Dashboard di `/` membaca data lewat Local API Payload.

Admin dirombak agar selaras dashboard (Organic Biophilic, ui-ux-pro-max):

| Layer | File |
|-------|------|
| Tailwind v4 (tanpa preflight) | `app/(payload)/tailwind.css` |
| Tema shell/nav/list/form | `app/(payload)/custom.scss` |
| Beranda admin kustom | `src/components/admin/AdminHome.tsx` |
| Logo / Icon / nav CTA | `src/components/admin/*` |
| Group nav | Operasional · Keuangan · Master Data · Sistem |

Custom component admin boleh memakai class Tailwind (`bg-farm-primary`, `farm-btn-primary`, dll.). **Jangan** import preflight Tailwind di admin.

Lihat `docs/SPEC_MANAJEMEN_PETERNAKAN_ITIK.md` untuk spesifikasi lengkap.
