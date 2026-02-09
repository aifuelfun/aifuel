'use client'

import { useState } from 'react'
import { Search, Copy, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

// ─── Curated model data ────────────────────────────────────────────
interface Model {
  id: string
  name: string
  provider: string
  inputPrice: number   // $ per 1M tokens
  outputPrice: number  // $ per 1M tokens
  context: number      // tokens
}

interface ProviderGroup {
  slug: string
  label: string
  logo: string
  models: Model[]
}

const PROVIDERS: ProviderGroup[] = [
  {
    slug: 'openai',
    label: 'OpenAI',
    logo: '🟢',
    models: [
      { id: 'openai/gpt-4o',        name: 'GPT-4o',        provider: 'OpenAI', inputPrice: 2.50,  outputPrice: 10.00, context: 128000 },
      { id: 'openai/gpt-4o-mini',   name: 'GPT-4o Mini',   provider: 'OpenAI', inputPrice: 0.15,  outputPrice: 0.60,  context: 128000 },
      { id: 'openai/gpt-4-turbo',   name: 'GPT-4 Turbo',   provider: 'OpenAI', inputPrice: 10.00, outputPrice: 30.00, context: 128000 },
      { id: 'openai/o1',            name: 'o1',             provider: 'OpenAI', inputPrice: 15.00, outputPrice: 60.00, context: 200000 },
      { id: 'openai/o1-mini',       name: 'o1-mini',        provider: 'OpenAI', inputPrice: 3.00,  outputPrice: 12.00, context: 128000 },
      { id: 'openai/o3-mini',       name: 'o3-mini',        provider: 'OpenAI', inputPrice: 1.10,  outputPrice: 4.40,  context: 200000 },
    ],
  },
  {
    slug: 'anthropic',
    label: 'Anthropic',
    logo: '🟠',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPrice: 3.00,  outputPrice: 15.00, context: 200000 },
      { id: 'anthropic/claude-3-opus',     name: 'Claude 3 Opus',     provider: 'Anthropic', inputPrice: 15.00, outputPrice: 75.00, context: 200000 },
      { id: 'anthropic/claude-3-haiku',    name: 'Claude 3 Haiku',    provider: 'Anthropic', inputPrice: 0.25,  outputPrice: 1.25,  context: 200000 },
    ],
  },
  {
    slug: 'google',
    label: 'Google',
    logo: '🔵',
    models: [
      { id: 'google/gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro',  provider: 'Google', inputPrice: 0,     outputPrice: 0,     context: 2000000 },
      { id: 'google/gemini-2.0-flash-001',     name: 'Gemini 2.0 Flash', provider: 'Google', inputPrice: 0.10,  outputPrice: 0.40,  context: 1000000 },
      { id: 'google/gemini-pro-1.5',            name: 'Gemini 1.5 Pro',  provider: 'Google', inputPrice: 1.25,  outputPrice: 5.00,  context: 2000000 },
    ],
  },
  {
    slug: 'meta-llama',
    label: 'Meta',
    logo: '🟣',
    models: [
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', inputPrice: 2.00, outputPrice: 2.00, context: 131072 },
      { id: 'meta-llama/llama-3.1-70b-instruct',  name: 'Llama 3.1 70B',  provider: 'Meta', inputPrice: 0.40, outputPrice: 0.40, context: 131072 },
      { id: 'meta-llama/llama-3.1-8b-instruct',   name: 'Llama 3.1 8B',   provider: 'Meta', inputPrice: 0.05, outputPrice: 0.05, context: 131072 },
    ],
  },
  {
    slug: 'deepseek',
    label: 'DeepSeek',
    logo: '🔴',
    models: [
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', inputPrice: 0.14, outputPrice: 0.28, context: 131072 },
      { id: 'deepseek/deepseek-r1',   name: 'DeepSeek R1', provider: 'DeepSeek', inputPrice: 0.55, outputPrice: 2.19, context: 163840 },
    ],
  },
  {
    slug: 'mistralai',
    label: 'Mistral',
    logo: '🟡',
    models: [
      { id: 'mistralai/mistral-large-2411',    name: 'Mistral Large',  provider: 'Mistral', inputPrice: 2.00, outputPrice: 6.00,  context: 128000 },
      { id: 'mistralai/mistral-medium',         name: 'Mistral Medium', provider: 'Mistral', inputPrice: 2.75, outputPrice: 8.10,  context: 32000 },
      { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', provider: 'Mistral', inputPrice: 0.65, outputPrice: 0.65,  context: 65536 },
    ],
  },
  {
    slug: 'x-ai',
    label: 'xAI',
    logo: '⚫',
    models: [
      { id: 'x-ai/grok-2-1212', name: 'Grok 2', provider: 'xAI', inputPrice: 2.00, outputPrice: 10.00, context: 131072 },
    ],
  },
  {
    slug: 'qwen',
    label: 'Qwen',
    logo: '🟤',
    models: [
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Qwen', inputPrice: 0.35, outputPrice: 0.40, context: 131072 },
    ],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────

function fmtPrice(v: number): string {
  if (v === 0) return 'Free'
  if (v >= 100) return `$${v.toFixed(0)}`
  if (v >= 1) return `$${v.toFixed(2)}`
  return `$${v.toFixed(2)}`
}

function fmtCtx(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`
  return String(tokens)
}

// ─── Page ───────────────────────────────────────────────────────────

export default function ModelsPage() {
  const { locale } = useLocale()
  const isZh = locale === 'zh'

  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const q = search.toLowerCase().trim()

  // Filter providers & models by search
  const filtered: ProviderGroup[] = PROVIDERS
    .map(g => ({
      ...g,
      models: g.models.filter(m =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
      ),
    }))
    .filter(g => g.models.length > 0)

  const totalCount = filtered.reduce((s, g) => s + g.models.length, 0)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            {isZh ? 'AI 模型定价' : 'AI Model Pricing'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isZh
              ? `${totalCount} 个精选热门模型 · 价格以每 1M tokens 为单位`
              : `${totalCount} curated models · prices per 1M tokens`}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-4 top-3 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder={isZh ? '搜索模型或提供商...' : 'Search models or providers...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#14141f] border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition"
          />
        </div>

        {/* Provider groups */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            {isZh ? '未找到匹配的模型' : 'No models found'}
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(group => (
              <div key={group.slug} className="rounded-xl border border-gray-800/60 bg-[#111118] overflow-hidden">
                {/* Provider header */}
                <div className="px-5 py-3 border-b border-gray-800/60 bg-[#14141f] flex items-center gap-2">
                  <span className="text-lg">{group.logo}</span>
                  <span className="font-semibold text-sm text-gray-200">{group.label}</span>
                  <span className="ml-auto text-xs text-gray-600">
                    {group.models.length} {isZh ? '个模型' : group.models.length === 1 ? 'model' : 'models'}
                  </span>
                </div>

                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_100px_100px_80px_40px] gap-2 px-5 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800/40">
                  <span>{isZh ? '模型' : 'Model'}</span>
                  <span className="text-right">{isZh ? '输入价格' : 'Input'}</span>
                  <span className="text-right">{isZh ? '输出价格' : 'Output'}</span>
                  <span className="text-right">{isZh ? '上下文' : 'Context'}</span>
                  <span></span>
                </div>

                {/* Model rows */}
                {group.models.map((m, i) => (
                  <div
                    key={m.id}
                    className={`grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_80px_40px] gap-1 sm:gap-2 px-5 py-3 items-center hover:bg-white/[0.02] transition group ${
                      i < group.models.length - 1 ? 'border-b border-gray-800/30' : ''
                    }`}
                  >
                    {/* Name + ID */}
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-200 group-hover:text-purple-300 transition truncate">
                        {m.name}
                      </div>
                      <div className="text-[10px] text-gray-600 font-mono truncate">{m.id}</div>
                    </div>

                    {/* Input price */}
                    <div className="text-right font-mono text-sm text-emerald-400/80">
                      <span className="sm:hidden text-[10px] text-gray-500 mr-1">{isZh ? '输入' : 'In'}:</span>
                      {fmtPrice(m.inputPrice)}
                    </div>

                    {/* Output price */}
                    <div className="text-right font-mono text-sm text-orange-400/80">
                      <span className="sm:hidden text-[10px] text-gray-500 mr-1">{isZh ? '输出' : 'Out'}:</span>
                      {fmtPrice(m.outputPrice)}
                    </div>

                    {/* Context */}
                    <div className="text-right text-xs text-gray-400">
                      <span className="sm:hidden text-[10px] text-gray-500 mr-1">Ctx:</span>
                      {fmtCtx(m.context)}
                    </div>

                    {/* Copy */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => copy(m.id)}
                        title={isZh ? '复制模型 ID' : 'Copy model ID'}
                        className="p-1.5 text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 rounded transition"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-800/40 text-center text-xs text-gray-600">
          {isZh
            ? '价格以每 1M tokens 为单位显示（美元）。实际价格可能因 OpenRouter 路由和缓存而有所不同。'
            : 'Prices shown per 1M tokens (USD). Actual cost may vary based on OpenRouter routing and caching.'}
        </div>
      </div>
    </div>
  )
}
