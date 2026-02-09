'use client'

import { useState } from 'react'
import { Search, Copy, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'
import Image from 'next/image'

// ─── Curated Model List ─────────────────────────────────────────────
interface Model {
  id: string
  name: string
  provider: string
  inputPrice: number
  outputPrice: number
  context: string
}

const MODELS: Model[] = [
  // OpenAI
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputPrice: 2.50, outputPrice: 10.00, context: '128K' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', inputPrice: 0.15, outputPrice: 0.60, context: '128K' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', inputPrice: 10.00, outputPrice: 30.00, context: '128K' },
  { id: 'openai/o1', name: 'o1', provider: 'OpenAI', inputPrice: 15.00, outputPrice: 60.00, context: '200K' },
  { id: 'openai/o1-mini', name: 'o1 Mini', provider: 'OpenAI', inputPrice: 3.00, outputPrice: 12.00, context: '128K' },
  { id: 'openai/o3-mini', name: 'o3 Mini', provider: 'OpenAI', inputPrice: 1.10, outputPrice: 4.40, context: '200K' },

  // Anthropic
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPrice: 3.00, outputPrice: 15.00, context: '200K' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', inputPrice: 15.00, outputPrice: 75.00, context: '200K' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', inputPrice: 0.80, outputPrice: 4.00, context: '200K' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', inputPrice: 0.25, outputPrice: 1.25, context: '200K' },

  // Google
  { id: 'google/gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro', provider: 'Google', inputPrice: 0, outputPrice: 0, context: '2M' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', inputPrice: 0.10, outputPrice: 0.40, context: '1M' },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', inputPrice: 1.25, outputPrice: 5.00, context: '2M' },
  { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', inputPrice: 0.075, outputPrice: 0.30, context: '1M' },

  // DeepSeek
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', inputPrice: 0.14, outputPrice: 0.28, context: '64K' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', inputPrice: 0.55, outputPrice: 2.19, context: '64K' },

  // Meta
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', inputPrice: 2.00, outputPrice: 2.00, context: '128K' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', inputPrice: 0.40, outputPrice: 0.40, context: '128K' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta', inputPrice: 0.05, outputPrice: 0.05, context: '128K' },
  { id: 'meta-llama/llama-3.2-3b-instruct', name: 'Llama 3.2 3B', provider: 'Meta', inputPrice: 0.03, outputPrice: 0.05, context: '128K' },

  // Mistral
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', inputPrice: 2.00, outputPrice: 6.00, context: '128K' },
  { id: 'mistralai/mistral-medium', name: 'Mistral Medium', provider: 'Mistral', inputPrice: 2.75, outputPrice: 8.10, context: '32K' },
  { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', provider: 'Mistral', inputPrice: 0.90, outputPrice: 0.90, context: '64K' },
  { id: 'mistralai/mistral-small', name: 'Mistral Small', provider: 'Mistral', inputPrice: 0.20, outputPrice: 0.60, context: '32K' },

  // xAI
  { id: 'x-ai/grok-2-1212', name: 'Grok 2', provider: 'xAI', inputPrice: 2.00, outputPrice: 10.00, context: '128K' },

  // Qwen
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Qwen', inputPrice: 0.36, outputPrice: 0.36, context: '128K' },
  { id: 'qwen/qwen-2.5-32b-instruct', name: 'Qwen 2.5 32B', provider: 'Qwen', inputPrice: 0.18, outputPrice: 0.18, context: '128K' },
  { id: 'qwen/qwen-2.5-7b-instruct', name: 'Qwen 2.5 7B', provider: 'Qwen', inputPrice: 0.05, outputPrice: 0.05, context: '128K' },

  // Cohere
  { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere', inputPrice: 2.50, outputPrice: 10.00, context: '128K' },
  { id: 'cohere/command-r', name: 'Command R', provider: 'Cohere', inputPrice: 0.15, outputPrice: 0.60, context: '128K' },

  // Perplexity
  { id: 'perplexity/sonar-pro', name: 'Sonar Pro', provider: 'Perplexity', inputPrice: 3.00, outputPrice: 15.00, context: '200K' },
  { id: 'perplexity/sonar', name: 'Sonar', provider: 'Perplexity', inputPrice: 1.00, outputPrice: 1.00, context: '128K' },
]

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
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-3 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder={isZh ? '搜索模型...' : 'Search models...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#16161f] border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition"
          />
        </div>

        <div className="flex gap-6">

          {/* ─── Left Panel: Providers ─── */}
          <div className="w-52 flex-shrink-0">
            <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
              {isZh ? '提供商' : 'Providers'}
            </h2>
            <div className="space-y-1">
              {PROVIDERS.map(p => {
                const count = providerCounts.get(p.slug) || 0
                const active = selectedProvider === p.slug
                return (
                  <button
                    key={p.slug}
                    onClick={() => setSelectedProvider(p.slug)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                      active
                        ? 'bg-purple-500/10 border border-purple-500/30 text-white'
                        : 'border border-transparent hover:bg-[#16161f] text-gray-400 hover:text-gray-200'
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
          </div>

          {/* ─── Right Panel: Model Cards ─── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {selectedProvider} {isZh ? '模型' : 'Models'}
                <span className="ml-2 text-gray-600">({filtered.length})</span>
              </h2>
              <span className="text-[10px] text-gray-600">
                {isZh ? '价格 / 1M tokens · 零加价' : 'per 1M tokens · zero markup'}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                {isZh ? '未找到模型' : 'No models found'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map(m => (
                  <div
                    key={m.id}
                    className="p-4 bg-[#12121a] border border-gray-800/60 rounded-xl hover:border-purple-500/40 hover:bg-[#16161f] transition group"
                  >
                    {/* Header: name + copy */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition truncate">
                          {m.name}
                        </h3>
                        <p className="text-[10px] text-gray-600 font-mono truncate mt-0.5">{m.id}</p>
                      </div>
                      <button
                        onClick={() => copy(m.id)}
                        title={isZh ? '复制模型 ID' : 'Copy model ID'}
                        className="ml-2 p-1.5 text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition flex-shrink-0"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Pricing Row */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex-1">
                        <div className="text-gray-500 mb-0.5">{isZh ? '输入' : 'Input'}</div>
                        <div className={`font-mono font-medium ${m.inputPrice === 0 ? 'text-green-400' : 'text-gray-200'}`}>
                          {fmtPrice(m.inputPrice)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-500 mb-0.5">{isZh ? '输出' : 'Output'}</div>
                        <div className={`font-mono font-medium ${m.outputPrice === 0 ? 'text-green-400' : 'text-gray-200'}`}>
                          {fmtPrice(m.outputPrice)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-500 mb-0.5">{isZh ? '上下文' : 'Context'}</div>
                        <div className="font-mono text-gray-400">{m.context}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-800/50 text-center text-xs text-gray-600">
          {isZh
            ? '实际费用与 OpenRouter 完全一致 · 零加价透传'
            : 'Exact same pricing as OpenRouter · Zero markup pass-through'}
        </div>
      </div>
    </div>
  )
}
