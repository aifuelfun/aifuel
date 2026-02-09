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
    <div className="relative min-h-screen text-gray-200 selection:bg-purple-500/30 selection:text-white">
      {/* Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full animate-float"></div>
        <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            AIFuel is Live on Solana
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            <span className="block text-white drop-shadow-lg">{t('heroTitle')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {t('heroDesc')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {!connected && (
              <div className="scale-110 shadow-lg shadow-purple-500/20 rounded-lg">
                <WalletButton className="!bg-white !text-black !border-0 !h-12 !px-8 !font-bold hover:!opacity-90 transition-opacity" />
              </div>
            )}
            
            <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-lg transition-all font-medium backdrop-blur-sm group">
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

          {/* CA Address - Ultra Clean */}
          <div className="mt-12 inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-full pl-5 pr-2 py-2 group hover:border-purple-500/30 transition-colors cursor-pointer" onClick={copyCA}>
            <span className="text-gray-400 text-sm font-medium">CA:</span>
            <code className="font-mono text-purple-300 text-sm tracking-wide">
              {TOKEN_CA.slice(0, 4)}...{TOKEN_CA.slice(-4)}
            </code>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 transition-colors">
              {caCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Models Grid - Glass Cards */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{t('modelsTitle')}</h2>
              <p className="text-gray-400">{t('modelsDesc')}</p>
            </div>
            <Link href="/models" className="hidden md:flex items-center gap-2 text-purple-400 hover:text-purple-300 transition text-sm font-medium group">
              {t('viewAllModels')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {MODELS.slice(0, 8).map((model, idx) => (
              <div key={model.id} className="glass-card rounded-xl p-5 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between mb-3">
                  <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-400 border border-white/5 truncate max-w-[120px]">
                    {model.provider}
                  </div>
                  {idx < 2 && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors truncate">{model.name}</h3>
                <p className="text-xs text-gray-500 font-mono mb-4">{model.id}</p>
                
                <div className="flex items-center justify-between text-xs mt-auto">
                   <span className="text-gray-400">In: <span className="text-white">${model.inputPrice}</span></span>
                   <span className="text-gray-400">Out: <span className="text-white">${model.outputPrice}</span></span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/models" className="inline-flex items-center gap-2 text-purple-400 transition text-sm font-medium">
              {t('viewAllModels')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features - Minimalist */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{t('whyAIFuel')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('whyAIFuelDesc')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title={t('feature1Title')}
              desc={t('feature1Desc')}
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-purple-400" />}
              title={t('feature2Title')}
              desc={t('feature2Desc')}
            />
            <FeatureCard 
              icon={<Coins className="w-6 h-6 text-green-400" />}
              title={t('feature3Title')}
              desc={t('feature3Desc')}
            />
          </div>
        </div>
      </section>

      {/* FAQ - Accordion */}
      <section className="py-24 border-t border-white/5 bg-black/20">
        <div className="max-w-3xl mx-auto px-4 md:px-0">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">{t('faq')}</h2>
          
          <div className="space-y-3">
            {[
              { q: t('faq1Q'), a: t('faq1A') },
              { q: t('faq2Q'), a: t('faq2A') },
              { q: t('faq3Q'), a: t('faq3A') },
              { q: t('faq4Q'), a: t('faq4A') },
              { q: t('faq5Q'), a: t('faq5A') },
            ].map((faq, idx) => (
              <div key={idx} className={`glass-card rounded-lg overflow-hidden transition-all duration-300 ${openFaq === idx ? 'bg-white/5 border-purple-500/30' : 'hover:bg-white/5'}`}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between group"
                >
                  <span className={`font-medium transition ${openFaq === idx ? 'text-white' : 'text-gray-300'}`}>{faq.q}</span>
                  <span className={`text-gray-500 text-xl transition-transform duration-300 ${openFaq === idx ? 'rotate-45 text-purple-400' : ''}`}>+</span>
                </button>
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${openFaq === idx ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden px-6">
                    <p className="text-gray-400 leading-relaxed text-sm">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="glass-card p-8 rounded-2xl md:min-h-[240px] flex flex-col justify-center text-center hover:bg-white/5 transition duration-300">
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
