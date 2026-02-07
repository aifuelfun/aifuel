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

// Discord icon
const DiscordIcon: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
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
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold text-gray-900">AIFuel</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" onClick={(e) => handleAnchorClick(e, 'features')} className="text-gray-600 hover:text-primary transition cursor-pointer">
              {t('features')}
            </a>
            <a href="/#pricing" onClick={(e) => handleAnchorClick(e, 'pricing')} className="text-gray-600 hover:text-primary transition cursor-pointer">
              {t('pricing')}
            </a>
            <Link href="/docs" className="text-gray-600 hover:text-primary transition">
              {t('docs')}
            </Link>
            <Link href="/models" className="text-gray-600 hover:text-primary transition">
              Models
            </Link>
            {connected && (
              <Link href="/dashboard" className="text-gray-600 hover:text-primary transition">
                {t('dashboard')}
              </Link>
            )}
          </div>

          {/* Social, Language Switch & Wallet Button */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition">
                <XIcon className="h-4 w-4" />
              </a>
              <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition">
                <DiscordIcon className="h-4 w-4" />
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
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <a href="/#features" onClick={(e) => handleAnchorClick(e, 'features')} className="text-gray-600 hover:text-primary transition cursor-pointer">
                {t('features')}
              </a>
              <a href="/#pricing" onClick={(e) => handleAnchorClick(e, 'pricing')} className="text-gray-600 hover:text-primary transition cursor-pointer">
                {t('pricing')}
              </a>
              <Link href="/docs" className="text-gray-600 hover:text-primary transition">
                {t('docs')}
              </Link>
              <Link href="/models" className="text-gray-600 hover:text-primary transition">
                Models
              </Link>
              {connected && (
                <Link href="/dashboard" className="text-gray-600 hover:text-primary transition">
                  {t('dashboard')}
                </Link>
              )}
              <div className="pt-2 flex items-center gap-4">
                <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition">
                  <XIcon className="h-4 w-4" />
                </a>
                <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition">
                  <DiscordIcon className="h-4 w-4" />
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
