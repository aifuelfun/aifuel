'use client'

import { useState, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/WalletButton'
import Link from 'next/link'
import { Copy, Check, ExternalLink, Zap, Shield, Coins } from 'lucide-react'
import { TOKEN_CA, MODELS } from '@/lib/constants'
import { useLocale } from '@/lib/LocaleContext'
import { CountUp } from '@/components'
import { WalletPanel } from '@/components/WalletPanel'
import { formatUSD } from '@/lib/utils'
import { Logo } from '@/components/Logo'

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
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient text-white py-24 md:py-32">
        {/* Enhanced background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            {t('heroDesc')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {connected ? (
              <>
                <div className="text-white/80 mb-2 sm:mb-0 sm:mr-4">
                  {t('walletConnected')}
                </div>
              </>
            ) : (
              <WalletButton className="!bg-transparent !border-2 !border-white hover:!bg-white/10 !text-sm !w-48 !justify-center" />
            )}
            <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/30 hover:border-white bg-white/5 text-white font-medium rounded-lg transition hover:bg-white/15 text-sm w-48 backdrop-blur-sm">
              {t('buyFuel')} <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Show WalletPanel if connected */}
          {connected && (
            <div className="mt-8 max-w-4xl mx-auto">
              <WalletPanel />
            </div>
          )}

          {/* CA Address */}
          <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg max-w-full">
            <span className="text-sm text-white/70 shrink-0">{t('caAddress')}</span>
            <div className="flex items-center gap-2 min-w-0">
              <code className="text-xs sm:text-sm font-mono text-yellow-300 truncate max-w-[200px] sm:max-w-none">{TOKEN_CA}</code>
              <button 
                onClick={copyCA}
                className="shrink-0 p-1.5 hover:bg-white/20 rounded transition"
                title={t('copyCa')}
              >
                {caCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-white/60" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('whyAIFuel')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('whyAIFuelDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 card-hover feature-card-1">
              <div className="w-12 h-12 rounded-xl icon-bg-1 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('feature1Title')}</h3>
              <p className="text-gray-600">
                {t('feature1Desc')}
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 card-hover feature-card-2">
              <div className="w-12 h-12 rounded-xl icon-bg-2 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('feature2Title')}</h3>
              <p className="text-gray-600">
                {t('feature2Desc')}
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 card-hover feature-card-3">
              <div className="w-12 h-12 rounded-xl icon-bg-3 flex items-center justify-center mb-4">
                <Coins className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('feature3Title')}</h3>
              <p className="text-gray-600">
                {t('feature3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Models Preview Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('modelsTitle')}</h2>
            <p className="text-xl text-gray-600">{t('modelsDesc')}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MODELS.slice(0, 8).map((model, idx) => (
              <div key={model.id} className="bg-white rounded-xl p-6 text-center border border-gray-200 card-hover group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-purple-400/0 group-hover:from-primary/5 group-hover:to-purple-400/5 transition-all duration-300" />
                <div className="relative z-10">
                  <p className="font-semibold text-gray-900">{model.name}</p>
                  <p className="text-sm text-gray-500">{model.provider}</p>
                  {idx < 4 && <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">⭐ Popular</span>}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/models" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium">
              {t('viewAllModels')} <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing/How it works */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('howItWorks')}</h2>
            <p className="text-xl text-gray-600">{t('threeSteps')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />
            
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-200 step-card text-center relative z-10">
              <div className="step-number w-16 h-16 rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('step1Title')}</h3>
              <p className="text-gray-600">{t('step1Desc')}</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-200 step-card text-center relative z-10">
              <div className="step-number w-16 h-16 rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('step2Title')}</h3>
              <p className="text-gray-600">{t('step2Desc')}</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-200 step-card text-center relative z-10">
              <div className="step-number w-16 h-16 rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('step3Title')}</h3>
              <p className="text-gray-600">{t('step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('faq')}</h2>
          
          <div className="space-y-4">
            {[
              {
                q: t('faq1Q'),
                a: t('faq1A'),
              },
              {
                q: t('faq2Q'),
                a: t('faq2A'),
              },
              {
                q: t('faq3Q'),
                a: t('faq3A'),
              },
              {
                q: t('faq4Q'),
                a: t('faq4A'),
              },
              {
                q: t('faq5Q'),
                a: t('faq5A'),
              },
            ].map((faq, idx) => (
              <div key={idx} className={`faq-item bg-white rounded-xl border border-gray-200 transition-all ${openFaq === idx ? 'open ring-2 ring-primary/30' : ''}`}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-xl"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <span className={`text-primary text-xl transition-transform ${openFaq === idx ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 animate-fade-in border-t border-gray-100">
                    <p className="text-gray-600">{faq.a}</p>
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