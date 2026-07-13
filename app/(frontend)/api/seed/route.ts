import { NextResponse } from 'next/server'
import { seed } from '../../../../src/seed'
import { getCurrentUser } from '@/src/lib/auth'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding disabled in production' }, { status: 403 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await seed()
    return NextResponse.json({ success: true, message: 'Database seeded successfully!' })
  } catch (error: unknown) {
    console.error(error)
    const message = error instanceof Error ? error.message : 'Seeding failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
