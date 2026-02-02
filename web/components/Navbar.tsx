'use client'

import { FC } from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Flame, Menu, X } from 'lucide-react'
import { useState } from 'react'

export const Navbar: FC = () => {
  const { connected } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">AIFuel</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-gray-600 hover:text-primary transition">
              Features
            </Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-primary transition">
              Pricing
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-primary transition">
              Docs
            </Link>
            {connected && (
              <Link href="/dashboard" className="text-gray-600 hover:text-primary transition">
                Dashboard
              </Link>
            )}
          </div>

          {/* Wallet Button */}
          <div className="hidden md:block">
            <WalletMultiButton />
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
              <Link href="/#features" className="text-gray-600 hover:text-primary transition">
                Features
              </Link>
              <Link href="/#pricing" className="text-gray-600 hover:text-primary transition">
                Pricing
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-primary transition">
                Docs
              </Link>
              {connected && (
                <Link href="/dashboard" className="text-gray-600 hover:text-primary transition">
                  Dashboard
                </Link>
              )}
              <div className="pt-4">
                <WalletMultiButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
