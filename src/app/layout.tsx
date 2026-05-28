import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shoemakers Association — Billing',
  description: 'Monthly billing management for shoemaker association members',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shoemakers Billing',
  },
}

export const viewport: Viewport = {
  themeColor: '#92400e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 text-gray-900 antialiased`}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
