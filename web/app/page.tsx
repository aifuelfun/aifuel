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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Hold $FUEL, Use AI Free
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Access 200+ AI models for free by holding $FUEL tokens on Solana. No subscriptions, no credit cards.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {connected ? (
              <>
                <div className="text-white/80 mb-2 sm:mb-0 sm:mr-4">
                  Wallet connected ✓
                </div>
              </>
            ) : (
              <WalletButton className="!bg-transparent !border-2 !border-white hover:!bg-white/10" />
            )}
            <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition">
              Buy $FUEL <ExternalLink className="h-4 w-4" />
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
            <span className="text-sm text-white/70 shrink-0">CA:</span>
            <div className="flex items-center gap-2 min-w-0">
              <code className="text-xs sm:text-sm font-mono text-yellow-300 truncate max-w-[200px] sm:max-w-none">{TOKEN_CA}</code>
              <button 
                onClick={copyCA}
                className="shrink-0 p-1.5 hover:bg-white/20 rounded transition"
                title="Copy CA"
              >
                {caCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-white/60" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
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
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">200+ AI Models</h3>
              <p className="text-gray-600">
                Access GPT-4o, Claude, Gemini, DeepSeek and more through a single API endpoint.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hold, Don't Pay</h3>
              <p className="text-gray-600">
                Your tokens stay in your wallet. No subscriptions, no monthly fees, no credit cards.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Credits</h3>
              <p className="text-gray-600">
                Daily credits based on your holdings. Formula is public, treasury is on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Models Preview Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">200+ AI Models</h2>
            <p className="text-xl text-gray-600">All the models you need, one API endpoint</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MODELS.slice(0, 8).map((model) => (
              <div key={model.id} className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                <p className="font-semibold text-gray-900">{model.name}</p>
                <p className="text-sm text-gray-500">{model.provider}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/models" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium">
              View all 200+ models <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing/How it works */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to free AI</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Buy $FUEL</h3>
              <p className="text-gray-600">Get $FUEL tokens on Raydium or Jupiter. Your tokens stay in your wallet.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet</h3>
              <p className="text-gray-600">Connect your Phantom or Solflare wallet to aifuel.fun and get your API key.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Use AI Free</h3>
              <p className="text-gray-600">Call our API like OpenAI. Daily credits based on your token holdings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">FAQ</h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'How does AIFuel work?',
                a: 'Hold $FUEL tokens in your wallet to earn daily AI credits. The more tokens you hold, the more credits you get. No subscriptions, no recurring payments.'
              },
              {
                q: 'What is the Diamond Hand bonus?',
                a: 'If you hold your tokens for more than 30 days without transferring, you get a 10% bonus (up to 120% with Diamond Hand status).'
              },
              {
                q: 'Is my wallet safe?',
                a: 'Absolutely. We only read your wallet balance - your tokens never leave your wallet. No approvals, no transfers, no risks.'
              },
              {
                q: 'Which AI models are available?',
                a: 'We provide access to 200+ models including GPT-4o, Claude 3.5, Gemini, DeepSeek, Llama, and more. All through a single OpenAI-compatible API.'
              },
              {
                q: 'What happens when I run out of credits?',
                a: 'Credits reset daily at midnight UTC. You can also increase your $FUEL holding to earn more credits. Diamond Hands get the full amount.'
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <span className="text-gray-500">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size={24} />
              <span className="text-white font-bold">AIFuel</span>
            </div>
            <p>© 2026 AIFuel. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/docs" className="hover:text-white transition">Docs</Link>
              <a href="https://github.com/aifuelfun/aifuel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
              <a href={`https://t.me/aifuel_fun`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Telegram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}