import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import type { TypedUser } from 'payload'
import config from '@payload-config'

/**
 * Resolve the currently authenticated Payload user from request cookies/headers.
 * Returns null when not logged in.
 */
export async function getCurrentUser(): Promise<TypedUser | null> {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })
  return user
}

/**
 * Require login for frontend pages (dashboard, etc.).
 * Redirects to Payload admin login, then back to the requested path.
 */
export async function requireUser(redirectTo = '/'): Promise<TypedUser> {
  const user = await getCurrentUser()
  if (!user) {
    const loginUrl = `/admin/login?redirect=${encodeURIComponent(redirectTo)}`
    redirect(loginUrl)
  }
  return user
}
