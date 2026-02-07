'use client'

import { FC, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import type { WalletName } from '@solana/wallet-adapter-base'
import { X, Download, QrCode, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

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
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1.5">{t('walletConnect')}</h2>
          <p className="text-white/90 text-sm">{t('walletConnectDesc')}</p>
        </div>
      </div>

      {/* 钱包列表 - 直接用 wallet adapter 提供的官方图标 */}
      <div className="p-6 overflow-y-auto max-h-[50vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {wallets.map((wallet) => {
            const isDetected = wallet.readyState === 'Installed'
            
            return (
              <button
                key={wallet.adapter.name}
                onClick={() => handleSelect(wallet.adapter.name as WalletName)}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                  isDetected 
                    ? 'border-primary bg-primary/5 hover:border-primary-dark' 
                    : 'border-gray-200 hover:border-primary'
                }`}
              >
                {/* 钱包图标 - 直接用 adapter 自带的官方图标 */}
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white shadow-md p-2">
                  <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-full h-full object-contain" />
                </div>
                
                {/* 钱包名称 */}
                <div className="text-center">
                  <h3 className="font-bold text-base text-gray-900">{wallet.adapter.name}</h3>
                  {isDetected && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <Check className="w-3 h-3" /> {t('installed')}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* 移动端钱包提示 */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-primary" />
            <div className="text-xs text-gray-600">
              {t('mobileWalletHint')}
            </div>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="bg-gray-50 px-6 py-3 text-center text-xs text-gray-500">
        {t('connectAgreement')}
      </div>
    </div>
  )

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {modalContent}
    </div>,
    document.body
  )
}