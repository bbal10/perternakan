import React from 'react'

/** Primary nav CTA — back to frontend dashboard */
export default function DashboardNavLink() {
  return (
    <div className="farm-nav-actions mb-3 flex flex-col gap-2 px-0">
      <a
        href="/"
        className="farm-btn-primary w-full justify-center no-underline hover:no-underline"
      >
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
        Dashboard utama
      </a>
      <a
        href="/admin/collections/productions/create"
        className="farm-btn-ghost w-full justify-center text-center no-underline hover:no-underline"
      >
        + Produksi hari ini
      </a>
    </div>
  )
}
