'use client'

import { LogOut } from 'lucide-react'
import { logoutAction } from '../actions/auth'

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="focus-ring inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:border-border-strong hover:bg-primary-soft hover:text-primary"
        aria-label="Keluar dari akun"
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </form>
  )
}
