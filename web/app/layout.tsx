import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components'
import { LocaleProvider } from '@/lib/LocaleContext'
import { ClientLayout } from './ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AIFuel - Hold $FUEL, Use AI Free',
  description: 'Access 200+ AI models for free by holding $FUEL tokens. No subscriptions, no credit cards. GPT-4, Claude, Gemini and more.',
  keywords: ['AI', 'API', 'Solana', 'Token', 'GPT-4', 'Claude', 'Free AI', 'FUEL'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'AIFuel - Fuel Your AI',
    description: 'Hold $FUEL tokens to get free AI API credits. 200+ models including GPT-4, Claude, Gemini.',
    url: 'https://aifuel.fun',
    siteName: 'AIFuel',
    type: 'website',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIFuel - Hold $FUEL, Use AI Free',
    description: 'Access 200+ AI models for free by holding $FUEL tokens',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <LocaleProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </LocaleProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
