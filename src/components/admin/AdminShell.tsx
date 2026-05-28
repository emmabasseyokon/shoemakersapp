'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/billing', label: 'Billing' },
]

interface Props {
  fullName: string
  children: React.ReactNode
}

export function AdminShell({ fullName, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b border-amber-900 bg-amber-800 text-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/20">
              <svg className="h-5 w-5 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.5 15.5c.28 0 .5.22.5.5v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1c0-.28.22-.5.5-.5H6l1-3h2l.5 1.5h7L17 12l1.5 1.5 1 2h2z" />
              </svg>
            </div>
            <span className="font-semibold">Shoemakers Association</span>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-sm text-amber-100">{fullName}</span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="rounded-lg px-3 py-1.5 text-sm text-white hover:bg-amber-700">
                Sign out
              </button>
            </form>
          </div>

          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-amber-700 sm:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-amber-700 bg-amber-800 px-2 py-2 sm:hidden">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium ${isActive(item.href) ? 'bg-amber-700 text-white' : 'text-amber-100 hover:bg-amber-700 hover:text-white'}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-amber-700 pt-2">
              <p className="px-4 py-2 text-xs text-amber-200">{fullName}</p>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-white hover:bg-amber-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        )}
      </header>

      <div className="flex">
        <aside className="hidden w-52 shrink-0 border-r border-gray-200 sm:block">
          <nav className="sticky top-[57px] space-y-1 px-3 pt-6">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${isActive(item.href) ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-8 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
