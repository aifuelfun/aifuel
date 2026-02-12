'use client'

import { FC } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from './Logo'
import { LanguageSwitch } from './LanguageSwitch'
import { WalletButton } from './WalletButton'
import { Locale } from '@/lib/i18n'
import { SOCIAL_LINKS } from '@/lib/constants'

// X (Twitter) icon
const XIcon: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Telegram icon
const TelegramIcon: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

interface Props {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: any) => string
}

export const Navbar: FC<Props> = ({ locale, setLocale, t }) => {
  const { connected } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleAnchorClick = (e: React.MouseEvent, anchor: string) => {
    e.preventDefault()
    if (pathname === '/') {
      // On home page, just scroll
      const el = document.getElementById(anchor)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      // On other pages, navigate to home then scroll
      router.push(`/#${anchor}`)
    }
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed w-full top-0 z-50 bg-dark/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold text-text">AIFuel</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Features Link Removed */}
            <Link href="/docs" className="text-text-muted hover:text-primary transition">
              {t('docs')}
            </Link>
            <Link href="/models" className="text-text-muted hover:text-primary transition">
              {t('models')}
            </Link>
          </div>

          {/* Social, Language Switch & Wallet Button */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition">
                <XIcon className="h-4 w-4" />
              </a>
              <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition">
                <TelegramIcon className="h-4 w-4" />
              </a>
            </div>
            <LanguageSwitch locale={locale} setLocale={setLocale} />
            <WalletButton />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-text-muted" />
            ) : (
              <Menu className="h-6 w-6 text-text-muted" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {/* Features Link Removed */}
              <Link href="/docs" className="text-text-muted hover:text-primary transition">
                {t('docs')}
              </Link>
              <Link href="/models" className="text-text-muted hover:text-primary transition">
                {t('models')}
              </Link>
              <div className="pt-2 flex items-center gap-4">
                <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition">
                  <XIcon className="h-4 w-4" />
                </a>
                <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition">
                  <TelegramIcon className="h-4 w-4" />
                </a>
                <LanguageSwitch locale={locale} setLocale={setLocale} />
              </div>
              <div className="pt-2">
                <WalletButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
