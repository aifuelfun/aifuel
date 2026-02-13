'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/WalletButton'
import Link from 'next/link'
import { Copy, Check, ExternalLink, Zap, Shield, Coins, ArrowRight, Wallet, Calculator } from 'lucide-react'
import { TOKEN_CA, MODELS } from '@/lib/constants'
import { useLocale } from '@/lib/LocaleContext'
import { WalletPanel } from '@/components/WalletPanel'
import { WalletConnectModal } from '@/components/WalletConnectModal'

// Credit Calculator Component
function CreditCalculator() {
  const [fuelAmount, setFuelAmount] = useState<string>('230000')
  
  // Constants
  const CIRCULATING = 200_000_000
  const DAILY_POOL = 1000
  
  const balance = parseFloat(fuelAmount) || 0
  const dailyCredit = (balance / CIRCULATING) * DAILY_POOL
  
  return (
    <div className="bg-dark-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition">
      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
        <Calculator className="w-5 h-5 text-purple-400" />
      </div>
      <h3 className="font-bold text-text mb-3">额度计算器</h3>
      
      <div className="mb-4">
        <input
          type="number"
          value={fuelAmount}
          onChange={(e) => setFuelAmount(e.target.value)}
          placeholder="FUEL 数量"
          className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-text text-sm placeholder-[#666] focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-center"
        />
      </div>
      
      <div className="text-center">
        <p className="text-xs text-text-muted mb-1">每日额度</p>
        <p className="text-2xl font-bold text-primary">${dailyCredit.toFixed(2)}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { connected } = useWallet()
  const { t } = useLocale()
  const [caCopied, setCaCopied] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  
  const copyCA = () => {
    navigator.clipboard.writeText(TOKEN_CA)
    setCaCopied(true)
    setTimeout(() => setCaCopied(false), 2000)
  }

  // Mobile CA: Will use full CA with CSS truncation to fill available space
  // Desktop: Full CA

  return (
    <div className="min-h-screen text-text bg-dark">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
            <span className="block text-text">{t('heroTitle')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-muted mb-10 max-w-2xl mx-auto">
            {t('heroDesc')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {!connected && (
              <>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="flex items-center gap-2 px-8 py-3 bg-dark-card border border-border hover:border-primary text-text rounded-lg transition font-medium"
                >
                  <Wallet className="h-4 w-4" />
                  {t('walletConnect')}
                </button>
                <WalletConnectModal 
                  open={showConnectModal} 
                  onClose={() => setShowConnectModal(false)} 
                />
              </>
            )}
            
            <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-2 px-8 py-3 bg-dark-card border border-border hover:border-primary text-text rounded-lg transition font-medium group">
              {t('buyFuel')} 
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Wallet Panel (Floats here if connected) */}
          {connected && (
            <div className="mt-8 mb-16 max-w-4xl mx-auto animate-fade-in-up">
              <WalletPanel />
            </div>
          )}

          {/* CA Address - Full Width on Mobile (Fill space before copy button) */}
          <div className="mt-8 w-full max-w-md mx-auto md:w-auto md:inline-flex flex items-center gap-2 md:gap-3 bg-dark-card border border-border rounded-xl md:rounded-full px-3 py-3 md:pl-5 md:pr-1 md:py-1.5 cursor-pointer hover:border-primary/50 transition group shadow-lg md:shadow-none" onClick={copyCA}>
            <span className="text-text-muted text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0">CA:</span>
            {/* Mobile: Full width with CSS truncation */}
            <code className="md:hidden font-mono text-text text-sm tracking-wide truncate text-primary/90 min-w-0 flex-1">
              {TOKEN_CA}
            </code>
            {/* Desktop: Full CA */}
            <code className="hidden md:block font-mono text-text text-sm tracking-wide">
              {TOKEN_CA}
            </code>
            
            <div className="p-2 bg-white/5 group-hover:bg-white/10 rounded-full text-gray-400 transition-colors flex-shrink-0">
              {caCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </div>
          </div>

        </div>
      </section>

      {/* Models Grid */}
      <section className="py-16 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">
                {t('modelsTitle')}
              </h2>
              <p className="text-text-muted text-sm md:text-base max-w-xl">{t('modelsDesc')}</p>
            </div>
            <Link href="/models" className="hidden md:flex items-center gap-2 text-primary hover:text-primary-hover transition text-sm font-medium group">
              {t('viewAllModels')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              // Get unique providers with their best model (preferably tagged)
              const providerMap = new Map<string, typeof MODELS[0]>()
              for (const model of MODELS) {
                if (!providerMap.has(model.provider)) {
                  providerMap.set(model.provider, model)
                } else {
                  const existing = providerMap.get(model.provider)!
                  // Prefer models with tags
                  if (model.tag && !existing.tag) {
                    providerMap.set(model.provider, model)
                  }
                }
              }
              return Array.from(providerMap.values()).slice(0, 12)
            })().map((model) => (
              <Link href="/models" key={model.id} className="bg-dark-card border border-border rounded-xl p-4 hover:border-primary/50 transition group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  {model.tag && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      model.tag === 'new' ? 'bg-blue-500/20 text-blue-400' :
                      model.tag === 'hot' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {model.tag}
                    </span>
                  )}
                </div>
                
                <div className="text-[10px] font-mono text-text-muted mb-1 uppercase tracking-wider">{model.provider}</div>
                <h3 className="font-bold text-text text-lg mb-0.5 group-hover:text-primary transition-colors truncate pr-8">{model.name}</h3>
                
                <div className="flex items-center gap-3 text-xs text-text-muted mt-3 pt-3 border-t border-white/5">
                  <div>In: <span className="text-text">${model.inputPrice}</span></div>
                  <div>Out: <span className="text-text">${model.outputPrice}</span></div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/models" className="inline-flex items-center gap-2 text-primary transition text-sm font-medium">
              {t('viewAllModels')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Credit System Section */}
      <section className="py-16 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">{t('creditSystemTitle')}</h2>
            <p className="text-text-muted max-w-2xl mx-auto">{t('creditSystemDesc')}</p>
          </div>

          {/* Formula */}
          <div className="bg-dark-card border border-border rounded-2xl p-6 md:p-8 mb-8 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-sm text-text-muted mb-3">{t('creditFormulaLabel')}</p>
              <code className="text-lg md:text-xl font-mono text-primary bg-primary/10 px-4 py-2 rounded-lg inline-block">
                {t('creditFormula')}
              </code>
            </div>
          </div>

          {/* Three Cards: Calculator + Diamond Hand + Active Trader */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <CreditCalculator />
            
            <div className="bg-dark-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">💎</span>
              </div>
              <h3 className="font-bold text-text mb-1">{t('diamondHand')}</h3>
              <p className="text-2xl font-bold text-green-400 mb-1">100%</p>
              <p className="text-xs text-text-muted">{t('diamondHandDesc')}</p>
            </div>

            <div className="bg-dark-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="font-bold text-text mb-1">{t('activeTrader')}</h3>
              <p className="text-2xl font-bold text-blue-400 mb-1">80%</p>
              <p className="text-xs text-text-muted">{t('activeTraderDesc')}</p>
            </div>
          </div>

          <p className="text-center text-text-muted text-sm mt-6">
            {t('circulatingSupply')}: 200,000,000 FUEL · {t('dailyReset')}
          </p>
        </div>
      </section>

      {/* Features Section (Restored) */}
      <section id="features" className="py-24 bg-dark border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text mb-4">{t('whyAIFuel')}</h2>
            <p className="text-text-muted max-w-2xl mx-auto">{t('whyAIFuelDesc')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card border border-border p-8 rounded-2xl flex flex-col justify-center text-center card-hover feature-card-1">
              <div className="w-12 h-12 rounded-full icon-bg-1 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="text-lg font-bold text-text mb-3">{t('feature1Title')}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{t('feature1Desc')}</p>
            </div>
            
            <div className="bg-dark-card border border-border p-8 rounded-2xl flex flex-col justify-center text-center card-hover feature-card-2">
              <div className="w-12 h-12 rounded-full icon-bg-2 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <h3 className="text-lg font-bold text-text mb-3">{t('feature2Title')}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{t('feature2Desc')}</p>
            </div>
            
            <div className="bg-dark-card border border-border p-8 rounded-2xl flex flex-col justify-center text-center card-hover feature-card-3">
              <div className="w-12 h-12 rounded-full icon-bg-3 flex items-center justify-center mx-auto mb-6">
                <Coins className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-bold text-text mb-3">{t('feature3Title')}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  )
}
