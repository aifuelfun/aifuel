'use client'

import { FC } from 'react'
import { createPortal } from 'react-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import type { WalletName } from '@solana/wallet-adapter-base'
import { X, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

// Trust Wallet 官方 SVG viewBox 是 1920x1080 宽屏，图标只占中间一小块，导致显示很小
// 用裁剪过的本地版本替换
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
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-8">
      {/* 头部 - 更紧凑 */}
      <div className="bg-gradient-to-r from-primary to-primary-dark px-5 py-4 text-white">
        <button 
          onClick={onClose}
          className="absolute top-2.5 right-2.5 p-1 hover:bg-white/20 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold">{t('walletConnect')}</h2>
        <p className="text-white/80 text-xs mt-0.5">{t('walletConnectDesc')}</p>
      </div>

      {/* 钱包列表 - 2列紧凑网格 */}
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
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-primary'
                }`}
              >
                {/* 钱包图标 - 统一尺寸 */}
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-sm overflow-hidden">
                  <img 
                    src={ICON_OVERRIDES[wallet.adapter.name] || wallet.adapter.icon} 
                    alt={wallet.adapter.name} 
                    className="w-10 h-10 object-contain" 
                  />
                </div>
                
                {/* 钱包名称 */}
                <span className="font-semibold text-sm text-gray-900">{wallet.adapter.name}</span>
                {isDetected && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full -mt-1">
                    <Check className="w-2.5 h-2.5" /> {t('installed')}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 底部 */}
      <div className="bg-gray-50 px-4 py-2.5 text-center text-[10px] text-gray-400">
        {t('connectAgreement')}
      </div>
    </div>
  )

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {modalContent}
    </div>,
    document.body
  )
}