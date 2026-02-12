'use client'

import { FC } from 'react'
import { createPortal } from 'react-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import type { WalletName } from '@solana/wallet-adapter-base'
import { X, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

const ICON_OVERRIDES: Record<string, string> = {
  'Trust': '/wallets/trust.svg?v=5',
}

interface Props {
  open: boolean
  onClose: () => void
}

export const WalletConnectModal: FC<Props> = ({ open, onClose }) => {
  const { wallets, select } = useWallet()
  const { t } = useLocale()

  const handleSelect = (walletName: WalletName) => {
    select(walletName)
    onClose()
  }

  if (!open) return null

  const modalContent = (
    <div className="relative bg-[#2a2a2a] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-[#444]">
      {/* Header */}
      <div className="bg-[#333] px-5 py-4">
        <button 
          onClick={onClose}
          className="absolute top-2.5 right-2.5 p-1 hover:bg-[#555] rounded-full transition"
        >
          <X className="w-4 h-4 text-[#ccc]" />
        </button>
        <h2 className="text-lg font-bold text-white">{t('walletConnect')}</h2>
        <p className="text-[#aaa] text-xs mt-0.5">{t('walletConnectDesc')}</p>
      </div>

      {/* Wallet Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2.5">
          {wallets.map((wallet) => {
            const isDetected = wallet.readyState === 'Installed'
            
            return (
              <button
                key={wallet.adapter.name}
                onClick={() => handleSelect(wallet.adapter.name as WalletName)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:shadow-md ${
                  isDetected 
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10' 
                    : 'border-[#444] hover:border-[#00d4ff]'
                }`}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#1a1a1a] overflow-hidden">
                  <img 
                    src={ICON_OVERRIDES[wallet.adapter.name] || wallet.adapter.icon} 
                    alt={wallet.adapter.name} 
                    className="w-10 h-10 object-contain" 
                  />
                </div>
                
                <span className="font-semibold text-sm text-white">{wallet.adapter.name}</span>
                {isDetected && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-900/40 text-green-400 border border-green-700/40 text-[10px] font-medium rounded-full -mt-1">
                    <Check className="w-2.5 h-2.5" /> {t('installed')}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#333] px-4 py-2.5 text-center text-[10px] text-[#888]">
        {t('connectAgreement')}
      </div>
    </div>
  )

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {modalContent}
    </div>,
    document.body
  )
}
