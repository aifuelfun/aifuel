import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider, Navbar, Footer } from '@/components'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AIFuel - Hold $FUEL, Use AI Free',
  description: 'Access 200+ AI models for free by holding $FUEL tokens. No subscriptions, no credit cards. GPT-4, Claude, Gemini and more.',
  keywords: ['AI', 'API', 'Solana', 'Token', 'GPT-4', 'Claude', 'Free AI'],
  openGraph: {
    title: 'AIFuel - Fuel Your AI',
    description: 'Hold $FUEL tokens to get free AI API credits',
    url: 'https://aifuel.fun',
    siteName: 'AIFuel',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIFuel - Hold $FUEL, Use AI Free',
    description: 'Access 200+ AI models for free by holding $FUEL tokens',
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
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}
