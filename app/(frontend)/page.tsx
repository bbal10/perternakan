import { getPayload } from 'payload'
import config from '../../payload.config'
import { requireUser } from '@/src/lib/auth'
import { getDashboardData } from '@/src/lib/dashboard'
import { DashboardView } from './components/DashboardView'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ bulan?: string | string[] }>
}

export default async function CustomDashboard({ searchParams }: PageProps) {
  const user = await requireUser('/')
  const params = await searchParams
  const bulanRaw = params.bulan
  const bulan = Array.isArray(bulanRaw) ? bulanRaw[0] : bulanRaw

  const payload = await getPayload({ config })
  const data = await getDashboardData(payload, user, { bulan })

  const displayName =
    (user as { name?: string | null }).name?.trim() || user.email || 'Pengguna'

  return (
    <DashboardView
      data={data}
      displayName={displayName}
      email={user.email || ''}
      isDev={process.env.NODE_ENV !== 'production'}
    />
  )
}
