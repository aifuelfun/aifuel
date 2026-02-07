'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter, 
  CoinbaseWalletAdapter, 
  TrustWalletAdapter 
} from '@solana/wallet-adapter-wallets'
import { X, Download, QrCode, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

// 钱包名称类型
type WalletName = 'Phantom' | 'Solflare' | 'CoinbaseWallet' | 'TrustWallet'

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
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">选择钱包</h2>
            <p className="text-white/90">连接您的 Solana 钱包以使用 AIFuel</p>
          </div>
        </div>

        {/* 钱包列表 */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WALLETS.map((wallet) => {
              const isDetected = detectedWallets.has(wallet.name)
              
              return (
                <button
                  key={wallet.name}
                  onClick={() => handleSelect(wallet.name)}
                  className={`relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                    isDetected 
                      ? 'border-primary bg-primary/5 hover:border-primary-dark' 
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  {/* 钱包图标 */}
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    style={{ backgroundColor: wallet.color }}
                  >
                    {wallet.name.charAt(0)}
                  </div>
                  
                  {/* 钱包名称 */}
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-gray-900">{wallet.name}</h3>
                    {isDetected && (
                      <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <Check className="w-3 h-3" /> 已安装
                      </span>
                    )}
                  </div>

                  {/* 未安装时的下载提示 */}
                  {!isDetected && (
                    <div className="absolute bottom-2 right-2">
                      <a
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        title="下载钱包"
                      >
                        <Download className="w-5 h-5 text-gray-500" />
                      </a>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* 移动端钱包提示 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-primary" />
              <div className="text-sm text-gray-600">
                在手机上使用？扫描二维码或访问钱包官网
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-500">
          连接即表示您同意我们的服务条款
        </div>
      </div>
    </div>
  )
}
