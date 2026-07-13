'use server'

import { logout } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'
import config from '@payload-config'

export async function logoutAction() {
  await logout({ config })
  redirect('/admin/login?redirect=/')
}
