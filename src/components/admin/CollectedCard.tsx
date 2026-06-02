'use client'

import { useState } from 'react'

interface Props {
  total: string
  byCategory: Record<string, number>
}

export function CollectedCard({ total, byCategory }: Props) {
  const [open, setOpen] = useState(false)
  const entries = Object.entries(byCategory)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left"
      >
        <p className="text-xs font-medium text-gray-500">Collected this month</p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
          {entries.length === 0 ? (
            <p className="text-xs text-gray-400">Nothing collected yet.</p>
          ) : (
            entries.map(([name, amount]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{name}</span>
                <span className="font-medium text-gray-800">₦{amount.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
