import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
  },
  title: 'LedgerView — Base Network Explorer',
  description: 'Your trusted Base Network explorer for wallet management and token tracking.',
  other: {
    'base:app_id': '6a2a0efe0cfd412b2ab2b4b1',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}