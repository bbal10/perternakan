import React from 'react'

/**
 * Compact mark for admin navbar / step-nav home.
 * Parent (.step-nav__home) is ~18–28px — use 100% SVG, no outer box.
 */
export default function Icon() {
  return (
    <svg
      className="graphic-icon"
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Peternakan Itik"
      role="img"
    >
      {/* Soft brand plate */}
      <rect width="24" height="24" rx="6" fill="#15803d" />
      {/* Bird glyph */}
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
  )
}
