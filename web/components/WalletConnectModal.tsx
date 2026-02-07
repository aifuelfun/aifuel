'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import type { WalletName } from '@solana/wallet-adapter-base'
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter, 
  CoinbaseWalletAdapter, 
  TrustWalletAdapter 
} from '@solana/wallet-adapter-wallets'
import { X, Download, QrCode, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

// 钱包列表配置
const WALLETS = [
  {
    name: 'Phantom' as WalletName,
    adapter: PhantomWalletAdapter,
    color: '#4A90E2',
    downloadUrl: 'https://phantom.app/'
  },
  {
    name: 'Solflare' as WalletName,
    adapter: SolflareWalletAdapter,
    color: '#E81C4F',
    downloadUrl: 'https://solflare.com/'
  },
  {
    name: 'CoinbaseWallet' as WalletName,
    adapter: CoinbaseWalletAdapter,
    color: '#0052FF',
    downloadUrl: 'https://www.coinbase.com/wallet'
  },
  {
    name: 'TrustWallet' as WalletName,
    adapter: TrustWalletAdapter,
    color: '#3375BB',
    downloadUrl: 'https://trustwallet.com/'
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export const WalletConnectModal: FC<Props> = ({ open, onClose }) => {
  const { wallets, select } = useWallet()
  const { t } = useLocale()
  const [detectedWallets, setDetectedWallets] = useState<Set<string>>(new Set())
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  // 检测已安装的钱包
  useEffect(() => {
    const detected = new Set<string>()
    wallets.forEach(w => {
      if (w.readyState === 'Installed') {
        detected.add(w.adapter.name)
      }
    })
    setDetectedWallets(detected)
  }, [wallets])

  if (!open) return null

  const handleSelect = (walletName: WalletName) => {
    select(walletName)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1.5">选择钱包</h2>
            <p className="text-white/90 text-sm">连接您的 Solana 钱包以使用 AIFuel</p>
          </div>
        </div>

        {/* 钱包列表 */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WALLETS.map((wallet) => {
              const isDetected = detectedWallets.has(wallet.name)
              
              return (
                <button
                  key={wallet.name}
                  onClick={() => handleSelect(wallet.name)}
                  className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                    isDetected 
                      ? 'border-primary bg-primary/5 hover:border-primary-dark' 
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  {/* 钱包图标 */}
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md"
                    style={{ backgroundColor: wallet.color }}
                  >
                    {wallet.name.charAt(0)}
                  </div>
                  
                  {/* 钱包名称 */}
                  <div className="text-center">
                    <h3 className="font-bold text-base text-gray-900">{wallet.name}</h3>
                    {isDetected && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <Check className="w-3 h-3" /> 已安装
                      </span>
                    )}
                  </div>

                  {/* 未安装时的下载提示 */}
                  {!isDetected && (
                    <div className="absolute bottom-1.5 right-1.5">
                      <a
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition"
                        title="下载钱包"
                      >
                        <Download className="w-4 h-4 text-gray-500" />
                      </a>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* 移动端钱包提示 */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-primary" />
              <div className="text-xs text-gray-600">
                在手机上使用？扫描二维码或访问钱包官网
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="bg-gray-50 px-6 py-3 text-center text-xs text-gray-500">
          连接即表示您同意我们的服务条款
        </div>
      </div>
    </div>
  )
}
