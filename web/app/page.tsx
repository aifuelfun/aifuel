'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { Zap, Shield, Coins, ArrowRight, Flame, Code, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { FEATURES, MODELS, TOKEN_CA, BUY_LINKS } from '@/lib/constants'

export default function Home() {
  const { connected } = useWallet()
  
  const copyCA = () => {
    navigator.clipboard.writeText(TOKEN_CA)
    alert('CA copied!')
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
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">Now on Solana</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Fuel Your AI
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Hold <span className="font-bold text-yellow-300">$FUEL</span> tokens, 
              get free access to 200+ AI models. No subscriptions. No credit cards.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={BUY_LINKS.raydium}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
              >
                <Flame className="h-5 w-5" />
                Buy $FUEL
                <ExternalLink className="h-4 w-4" />
              </a>
              {connected ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <WalletMultiButton className="!bg-transparent !border-2 !border-white hover:!bg-white/10" />
              )}
            </div>
            
            {/* CA Address */}
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
              <span className="text-sm text-white/70">CA:</span>
              <code className="text-sm font-mono text-yellow-300">{TOKEN_CA}</code>
              <button 
                onClick={copyCA}
                className="ml-2 p-1 hover:bg-white/20 rounded transition"
                title="Copy CA"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div>
                <p className="text-4xl font-bold">200+</p>
                <p className="text-white/70">AI Models</p>
              </div>
              <div>
                <p className="text-4xl font-bold">$0</p>
                <p className="text-white/70">Monthly Fee</p>
              </div>
              <div>
                <p className="text-4xl font-bold">24/7</p>
                <p className="text-white/70">API Access</p>
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
              Why AIFuel?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A new paradigm for AI access. Hold tokens, use AI forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
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
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
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
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to free AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Buy $FUEL',
                description: 'Get $FUEL tokens on Raydium or Jupiter. Your tokens stay in your wallet.',
                link: BUY_LINKS.raydium,
              },
              {
                step: '2',
                title: 'Connect Wallet',
                description: 'Connect your Phantom or Solflare wallet to aifuel.fun and get your API key.',
              },
              {
                step: '3',
                title: 'Use AI Free',
                description: 'Call our API like OpenAI. Daily credits based on your token holdings.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
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
              200+ AI Models
            </h2>
            <p className="text-xl text-gray-400">
              All the models you need, one API endpoint
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
            + 190 more models via OpenRouter
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple Credit System
            </h2>
            <p className="text-xl text-gray-600">
              More tokens = More daily credits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { tokens: '100K', daily: '$0.20', label: 'Starter' },
              { tokens: '1M', daily: '$2.00', label: 'Builder', featured: true },
              { tokens: '10M', daily: '$20.00', label: 'Pro' },
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
                    POPULAR
                  </span>
                )}
                <p className="text-sm text-gray-500 mb-2">{tier.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {tier.tokens} <span className="text-lg font-normal">$FUEL</span>
                </p>
                <p className="text-primary text-xl font-semibold mb-6">
                  {tier.daily}/day
                </p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    All 200+ models
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Daily credit refresh
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    OpenAI SDK compatible
                  </li>
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8">
            Formula: Daily Credit = (Your Balance / Circulating Supply) × Daily Pool
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Fuel Your AI?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join the future of AI access. No subscriptions, just tokens.
          </p>
          {connected ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              Go to Dashboard
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
