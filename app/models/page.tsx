'use client'

import { useState } from 'react'
import { Search, Copy, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'
import Image from 'next/image'
import { MODELS } from '@/lib/constants'

// ─── Provider metadata ──────────────────────────────────────────────
const PROVIDERS = [
  { slug: 'OpenAI',    logo: '/logos/openai.svg' },
  { slug: 'Anthropic', logo: '/logos/anthropic.svg' },
  { slug: 'Google',    logo: '/logos/google.svg' },
  { slug: 'DeepSeek',  logo: '/logos/deepseek.svg' },
  { slug: 'Meta',      logo: '/logos/meta.svg' },
  { slug: 'Mistral',   logo: '/logos/mistral.svg' },
  { slug: 'xAI',       logo: '/logos/xai.svg' },
  { slug: 'Qwen',      logo: '/logos/qwen.svg' },
  { slug: 'Cohere',    logo: '/logos/cohere.svg' },
  { slug: 'Perplexity', logo: '/logos/perplexity.svg' },
]

function fmtPrice(v: number) {
  if (v === 0) return 'Free'
  if (v >= 10) return `$${v.toFixed(0)}`
  return `$${v.toFixed(2)}`
}

// ─── Page ───────────────────────────────────────────────────────────
export default function ModelsPage() {
  const { locale } = useLocale()
  const isZh = locale === 'zh'
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('OpenAI')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Count models per provider
  const providerCounts = new Map<string, number>()
  MODELS.forEach(m => providerCounts.set(m.provider, (providerCounts.get(m.provider) || 0) + 1))

  // Filter
  const filtered = MODELS.filter(m => {
    if (m.provider !== selectedProvider) return false
    if (search) {
      const s = search.toLowerCase()
      return m.name.toLowerCase().includes(s) || m.id.toLowerCase().includes(s)
    }
    return true
  })

  return (
    <div className="min-h-screen text-gray-200">
      {/* Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full animate-float"></div>
        <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        {/* Search - Glass Style */}
        <div className="relative mb-6 max-w-md mx-auto">
          <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={isZh ? '搜索模型...' : 'Search models...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition backdrop-blur-sm"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* ─── Left Panel: Providers (Glass) ─── */}
          <div className="w-full md:w-52 flex-shrink-0 grid grid-cols-2 md:grid-cols-1 gap-1 md:gap-1 h-fit">
            <h2 className="hidden md:block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              {isZh ? '提供商' : 'Providers'}
            </h2>
            {PROVIDERS.map(p => {
              const count = providerCounts.get(p.slug) || 0
              // Only render provider if it has models
              if (count === 0) return null
              
              const active = selectedProvider === p.slug
              return (
                <button
                  key={p.slug}
                  onClick={() => setSelectedProvider(p.slug)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                    active
                      ? 'bg-purple-500/10 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'border border-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Image
                    src={p.logo}
                    alt={p.slug}
                    width={20}
                    height={20}
                    className="flex-shrink-0 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${active ? 'text-white' : ''}`}>
                      {p.slug}
                    </div>
                  </div>
                  <span className={`text-xs ${active ? 'text-purple-300' : 'text-gray-600'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ─── Right Panel: Model Cards ─── */}
          <div className="flex-1 min-h-[500px]">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {selectedProvider} {isZh ? '模型' : 'Models'}
                <span className="ml-2 text-gray-600">({filtered.length})</span>
              </h2>
              <span className="text-[10px] text-gray-600">
                {isZh ? '价格 / 1M tokens · 零加价' : 'per 1M tokens · zero markup'}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-600 bg-white/5 rounded-2xl border border-white/5">
                {isZh ? '未找到模型' : 'No models found'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map(m => (
                  <div
                    key={m.id}
                    className="glass-card rounded-xl p-4 hover:border-purple-500/30 group relative overflow-hidden"
                  >
                     <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Header: name + copy */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-200 group-hover:text-purple-300 transition truncate">
                          {m.name}
                        </h3>
                        <p className="text-[10px] text-gray-600 font-mono truncate mt-0.5">{m.id}</p>
                      </div>
                      <button
                        onClick={() => copy(m.id)}
                        title={isZh ? '复制模型 ID' : 'Copy model ID'}
                        className="ml-2 p-1.5 text-gray-600 hover:text-purple-400 hover:bg-white/10 rounded-lg transition flex-shrink-0"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Pricing Row */}
                    <div className="flex items-center gap-4 text-xs pt-2 border-t border-white/5">
                      <div className="flex-1">
                        <div className="text-gray-500 mb-0.5">{isZh ? '输入' : 'Input'}</div>
                        <div className={`font-mono font-medium ${m.inputPrice === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                          {fmtPrice(m.inputPrice)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-500 mb-0.5">{isZh ? '输出' : 'Output'}</div>
                        <div className={`font-mono font-medium ${m.outputPrice === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                          {fmtPrice(m.outputPrice)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-500 mb-0.5">{isZh ? '上下文' : 'Context'}</div>
                        <div className="font-mono text-gray-500">{m.context}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
          {isZh
            ? '实际费用与 OpenRouter 完全一致 · 零加价透传'
            : 'Exact same pricing as OpenRouter · Zero markup pass-through'}
        </div>
      </div>
    </div>
  )
}
