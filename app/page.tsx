'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/WalletButton'
import Link from 'next/link'
import { Copy, Check, ExternalLink, Zap, Shield, Coins, ArrowRight } from 'lucide-react'
import { TOKEN_CA, MODELS } from '@/lib/constants'
import { useLocale } from '@/lib/LocaleContext'
import { WalletPanel } from '@/components/WalletPanel'

export default function Home() {
  const { connected } = useWallet()
  const { t } = useLocale()
  const [caCopied, setCaCopied] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  const copyCA = () => {
    navigator.clipboard.writeText(TOKEN_CA)
    setCaCopied(true)
    setTimeout(() => setCaCopied(false), 2000)
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen text-sol-text">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden bg-sol-dark">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
            <span className="block text-sol-text">{t('heroTitle')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-sol-text-muted mb-10 max-w-2xl mx-auto">
            {t('heroDesc')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {!connected && (
              <WalletButton className="!bg-gradient-sol !hover:bg-purple-500 !text-sol-text !border-0 !h-12 !px-8 !font-bold rounded-lg transition" />
            )}
            
            <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-2 px-8 py-3 bg-sol-dark-card border border-sol-border hover:border-primary text-sol-text rounded-lg transition font-medium group">
              {t('buyFuel')} 
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Wallet Panel (Floats here if connected) */}
          {connected && (
            <div className="mt-8 mb-16 max-w-4xl mx-auto">
              <WalletPanel />
            </div>
          )}

          {/* CA Address - Centered */}
          <div className="mt-12 inline-flex items-center gap-3 bg-sol-dark-card border border-sol-border rounded-full pl-5 pr-2 py-2 cursor-pointer hover:border-primary/50 transition">
            <span className="text-sol-text-muted text-sm font-medium">CA:</span>
            <code className="font-mono text-sol-text text-sm tracking-wide">
              {TOKEN_CA}
            </code>
            <button onClick={copyCA} className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full text-gray-300 transition-colors">
              {caCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Models Grid - Solid Dark */}
      <section className="py-24 bg-sol-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-sol-text mb-2">{t('modelsTitle')}</h2>
              <p className="text-sol-text-muted">{t('modelsDesc')}</p>
            </div>
            <Link href="/models" className="hidden md:flex items-center gap-2 text-primary hover:text-primary-light transition text-sm font-medium group">
              {t('viewAllModels')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {MODELS.slice(0, 8).map((model, idx) => (
              <div key={model.id} className="bg-sol-dark-card border border-sol-border rounded-xl p-5 relative group overflow-hidden hover:border-primary/30 transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-sol-text-muted border border-white/5 truncate max-w-[120px]">
                    {model.provider}
                  </div>
                  {idx < 2 && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>}
                </div>
                
                <h3 className="text-lg font-semibold text-sol-text mb-1 group-hover:text-primary-light transition-colors truncate">{model.name}</h3>
                <p className="text-xs text-gray-500 font-mono mb-4">{model.id}</p>
                
                <div className="flex items-center justify-between text-xs mt-auto">
                   <span className="text-sol-text-muted">In: <span className="text-sol-text">${model.inputPrice}</span></span>
                   <span className="text-sol-text-muted">Out: <span className="text-sol-text">${model.outputPrice}</span></span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/models" className="inline-flex items-center gap-2 text-primary transition text-sm font-medium">
              {t('viewAllModels')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features - Solid Dark */}
      <section id="features" className="py-24 bg-sol-dark border-t border-sol-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-sol-text mb-4">{t('whyAIFuel')}</h2>
            <p className="text-sol-text-muted max-w-2xl mx-auto">{t('whyAIFuelDesc')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-sol-dark-card border border-sol-border p-8 rounded-2xl flex flex-col justify-center text-center card-hover feature-card-1">
              <div className="w-12 h-12 rounded-full icon-bg-1 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="text-lg font-bold text-sol-text mb-3">{t('feature1Title')}</h3>
              <p className="text-sol-text-muted text-sm leading-relaxed">{t('feature1Desc')}</p>
            </div>
            
            <div className="bg-sol-dark-card border border-sol-border p-8 rounded-2xl flex flex-col justify-center text-center card-hover feature-card-2">
              <div className="w-12 h-12 rounded-full icon-bg-2 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <h3 className="text-lg font-bold text-sol-text mb-3">{t('feature2Title')}</h3>
              <p className="text-sol-text-muted text-sm leading-relaxed">{t('feature2Desc')}</p>
            </div>
            
            <div className="bg-sol-dark-card border border-sol-border p-8 rounded-2xl flex flex-col justify-center text-center card-hover feature-card-3">
              <div className="w-12 h-12 rounded-full icon-bg-3 flex items-center justify-center mx-auto mb-6">
                <Coins className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-bold text-sol-text mb-3">{t('feature3Title')}</h3>
              <p className="text-sol-text-muted text-sm leading-relaxed">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Solid Dark */}
      <section className="py-24 bg-sol-dark border-t border-sol-border">
        <div className="max-w-3xl mx-auto px-4 md:px-0">
          <h2 className="text-3xl font-bold text-sol-text mb-10 text-center">{t('faq')}</h2>
          
          <div className="space-y-3">
            {[
              { q: t('faq1Q'), a: t('faq1A') },
              { q: t('faq2Q'), a: t('faq2A') },
              { q: t('faq3Q'), a: t('faq3A') },
              { q: t('faq4Q'), a: t('faq4A') },
              { q: t('faq5Q'), a: t('faq5A') },
            ].map((faq, idx) => (
              <div key={idx} className={`bg-sol-dark-card border border-sol-border rounded-lg overflow-hidden transition-all duration-300 faq-item ${openFaq === idx ? 'open' : ''}`}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between group"
                >
                  <span className={`font-medium transition ${openFaq === idx ? 'text-sol-text' : 'text-gray-300'}`}>{faq.q}</span>
                  <span className={`text-gray-500 text-xl transition-transform duration-300 ${openFaq === idx ? 'rotate-45 text-primary' : ''}`}>+</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 animate-fade-in border-t border-sol-border/50">
                    <p className="text-sol-text-muted leading-relaxed text-sm">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
