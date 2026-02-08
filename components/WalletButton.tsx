'use client'

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Copy, Check, ChevronDown, LogOut, Wallet } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'
import { WalletConnectModal } from './WalletConnectModal'

interface Props {
  className?: string
}

export const WalletButton: FC<Props> = ({ className }) => {
  const { publicKey, wallet, disconnect, connected, select } = useWallet()
  const { t } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const address = useMemo(() => {
    if (!publicKey) return ''
    const base58 = publicKey.toBase58()
    return base58.slice(0, 4) + '...' + base58.slice(-4)
  }, [publicKey])

  const copyAddress = useCallback(async () => {
    if (!publicKey) return
    await navigator.clipboard.writeText(publicKey.toBase58())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [publicKey])

  const handleDisconnect = useCallback(async () => {
    setMenuOpen(false)
    await disconnect()
  }, [disconnect])

  const handleChangeWallet = useCallback(() => {
    setMenuOpen(false)
    setShowConnectModal(true)
  }, [])

  // Not connected → custom button that opens the custom wallet modal
  if (!connected) {
    return (
      <>
        <button
          onClick={() => setShowConnectModal(true)}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition text-sm ${className || ''}`}
        >
          <Wallet className="h-4 w-4" />
          {t('walletConnect') || '连接钱包'}
        </button>
        <WalletConnectModal 
          open={showConnectModal} 
          onClose={() => setShowConnectModal(false)} 
        />
      </>
    )
  }

  // Connected → custom dropdown
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition text-sm ${className || ''}`}
      >
        {wallet?.adapter.icon && (
          <img src={wallet.adapter.icon} alt="" className="h-4 w-4" />
        )}
        <span className="font-mono">{address}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={copyAddress}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-400" />}
            {t('walletCopyAddress') || '复制地址'}
          </button>
          <button
            onClick={handleChangeWallet}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Wallet className="h-4 w-4 text-gray-400" />
            {t('walletChange') || '切换钱包'}
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {t('walletDisconnect') || '断开连接'}
          </button>
        </div>
      )}
    </div>
  )
}
