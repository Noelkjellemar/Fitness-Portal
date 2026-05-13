import type { Metadata, Viewport } from 'next'
import Providers from '@/components/Providers'
import PWARegister from '@/components/PWARegister'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zenith — Reach Your Peak',
  description: 'Reach Your Peak. Coaching, plans, and the system to look — and feel — your best.',
  icons: {
    icon: '/zenith-icon.svg',
    apple: '/zenith-icon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Zenith',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  )
}
