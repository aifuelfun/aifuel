'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, Shield, Coins, ArrowRight, Code, CheckCircle, Copy, Check, ExternalLink, ChevronDown } from 'lucide-react'
import { MODELS, TOKEN_CA, BUY_LINKS } from '@/lib/constants'
import { useLocale } from '@/lib/LocaleContext'
import { Countdown, Logo } from '@/components'

// Pool open time: 2026/2/6 04:42:00 UTC+8
const POOL_OPEN_DATE = new Date('2026-02-06T04:42:00+08:00')

export default function Home() {
  const { connected } = useWallet()
  const { t } = useLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  const [caCopied, setCaCopied] = useState(false)
  
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
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Logo size={20} />
              <span className="text-sm font-medium">{t('nowOnSolana')}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('fuelYourAI')}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              {t('heroDesc').split('$FUEL')[0]}
              <span className="font-bold text-yellow-300">$FUEL</span>
              {t('heroDesc').split('$FUEL')[1]}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={BUY_LINKS.raydium}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
              >
                <Logo size={20} />
                {t('buyFuel')}
                <ExternalLink className="h-4 w-4" />
              </a>
              {connected ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
                >
                  {t('goToDashboard')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <WalletMultiButton className="!bg-transparent !border-2 !border-white hover:!bg-white/10" />
              )}
            </div>
            
            {/* CA Address */}
            <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg max-w-full">
              <span className="text-sm text-white/70 shrink-0">CA:</span>
              <div className="flex items-center gap-2 min-w-0">
                <code className="text-xs sm:text-sm font-mono text-yellow-300 truncate max-w-[200px] sm:max-w-none">{TOKEN_CA}</code>
                <button 
                  onClick={copyCA}
                  className="shrink-0 p-1.5 hover:bg-white/20 rounded transition"
                  title="Copy CA"
                >
                  {caCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Countdown */}
            <Countdown targetDate={POOL_OPEN_DATE} label={t('poolOpenAt')} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
              <div>
                <p className="text-4xl font-bold">200+</p>
                <p className="text-white/70">{t('aiModels')}</p>
              </div>
              <div>
                <p className="text-4xl font-bold">$0</p>
                <p className="text-white/70">{t('monthlyFee')}</p>
              </div>
              <div>
                <p className="text-4xl font-bold">24/7</p>
                <p className="text-white/70">{t('apiAccess')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
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
            {[
              { icon: 'Zap', titleKey: 'feature1Title', descKey: 'feature1Desc' },
              { icon: 'Shield', titleKey: 'feature2Title', descKey: 'feature2Desc' },
              { icon: 'Coins', titleKey: 'feature3Title', descKey: 'feature3Desc' },
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition card-hover border border-gray-100"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon === 'Zap' && <Zap className="h-7 w-7 text-primary" />}
                  {feature.icon === 'Shield' && <Shield className="h-7 w-7 text-primary" />}
                  {feature.icon === 'Coins' && <Coins className="h-7 w-7 text-primary" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(feature.titleKey as any)}
                </h3>
                <p className="text-gray-600">
                  {t(feature.descKey as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('howItWorks')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('threeSteps')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
              { step: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
              { step: '3', titleKey: 'step3Title', descKey: 'step3Desc' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(item.titleKey as any)}
                </h3>
                <p className="text-gray-600">
                  {t(item.descKey as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section className="py-24 bg-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {t('modelsTitle')}
            </h2>
            <p className="text-xl text-gray-400">
              {t('modelsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MODELS.map((model, index) => (
              <div 
                key={index}
                className="bg-dark-light p-4 rounded-xl border border-gray-800 hover:border-primary/50 transition"
              >
                <p className="font-semibold text-white">{model.name}</p>
                <p className="text-sm text-gray-400">{model.provider}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 mt-8">
            <a href="/models" className="hover:text-primary transition underline">
              {t('moreModels')}
            </a>
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('simpleCreditSystem')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('moreTokensMoreCredits')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { tokens: '100K', daily: '$0.20', labelKey: 'starter' },
              { tokens: '1M', daily: '$2.00', labelKey: 'builder', featured: true },
              { tokens: '10M', daily: '$20.00', labelKey: 'pro' },
            ].map((tier, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl border-2 ${
                  tier.featured 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {tier.featured && (
                  <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    {t('popular')}
                  </span>
                )}
                <p className="text-sm text-gray-500 mb-2">{t(tier.labelKey as any)}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {tier.tokens} <span className="text-lg font-normal">$FUEL</span>
                </p>
                <p className="text-primary text-xl font-semibold mb-6">
                  {tier.daily}{t('perDay')}
                </p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('allModels')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('dailyRefresh')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('sdkCompatible')}
                  </li>
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8">
            {t('formula')}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('faq')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('faqSubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {[
              { q: t('faq1Q'), a: t('faq1A') },
              { q: t('faq2Q'), a: t('faq2A') },
              { q: t('faq3Q'), a: t('faq3A') },
              { q: t('faq4Q'), a: t('faq4A') },
              { q: t('faq5Q'), a: t('faq5A') },
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('readyToFuel')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('joinFuture')}
          </p>
          {connected ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              {t('goToDashboard')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <WalletMultiButton className="!bg-white !text-primary hover:!bg-gray-100" />
          )}
        </div>
      </section>
    </div>
  )
}
