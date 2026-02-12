import type { Metadata } from 'next'
import Script from 'next/script'

const GA_MEASUREMENT_ID = 'G-P89PKN5BTM'
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
    icon: [
      { url: '/favicon.webp', sizes: '32x32' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'AIFuel - Fuel Your AI',
    description: 'Hold $FUEL tokens to get free AI API credits. 200+ models including GPT-4, Claude, Gemini.',
    url: 'https://aifuel.fun',
    siteName: 'AIFuel',
    type: 'website',
    images: ['/logo.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIFuel - Hold $FUEL, Use AI Free',
    description: 'Access 200+ AI models for free by holding $FUEL tokens',
    images: ['/logo.webp'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
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
