import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { Providers } from './providers'
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#5C4033',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  applicationName: 'Café Montilla',
  title: {
    default: 'Café Montilla',
    template: '%s · Café Montilla',
  },
  description: 'Ventas, productos y cuentas por cobrar — Café Montilla',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Café Montilla',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
        <RegisterServiceWorker />
      </body>
    </html>
  )
}
