import React from 'react'

/**
 * Full logo for login / create-first-user.
 * Not used in the 18px step-nav slot (that's Icon.tsx).
 */
export default function Logo() {
  return (
    <div className="flex items-center gap-3" style={{ maxWidth: '100%' }}>
      <svg
        className="graphic-logo shrink-0"
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="24" height="24" rx="7" fill="#15803d" />
        <g
          stroke="#ffffff"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          transform="translate(1.5 1.5) scale(0.875)"
        >
          <path d="M16 7h.01" />
          <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
          <path d="m20 7 2 .5-2 .5" />
          <path d="M10 18v3" />
          <path d="M14 17.75V21" />
          <path d="M7 18a6 6 0 0 0 3.84-10.61" />
        </g>
      </svg>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[1.15rem] font-bold tracking-tight text-farm-text">
          Peternakan Itik
        </div>
        <div className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-farm-muted">
          Admin Panel
        </div>
      </div>
    </div>
  )
}
