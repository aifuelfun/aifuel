'use client'

import { useState } from 'react'
import { Search, Copy, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

// ─── Curated Model List ─────────────────────────────────────────────
interface Model {
  id: string
  name: string
  provider: string
  inputPrice: number   // per 1M tokens
  outputPrice: number  // per 1M tokens
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
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', inputPrice: 0.25, outputPrice: 1.25, context: '200K' },

  // Google
  { id: 'google/gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro', provider: 'Google', inputPrice: 0, outputPrice: 0, context: '2M' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', inputPrice: 0.10, outputPrice: 0.40, context: '1M' },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', inputPrice: 1.25, outputPrice: 5.00, context: '2M' },

  // DeepSeek
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', inputPrice: 0.14, outputPrice: 0.28, context: '64K' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', inputPrice: 0.55, outputPrice: 2.19, context: '64K' },

  // Meta
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', inputPrice: 2.00, outputPrice: 2.00, context: '128K' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', inputPrice: 0.40, outputPrice: 0.40, context: '128K' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta', inputPrice: 0.05, outputPrice: 0.05, context: '128K' },

  // Mistral
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', inputPrice: 2.00, outputPrice: 6.00, context: '128K' },
  { id: 'mistralai/mistral-medium', name: 'Mistral Medium', provider: 'Mistral', inputPrice: 2.75, outputPrice: 8.10, context: '32K' },
  { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', provider: 'Mistral', inputPrice: 0.90, outputPrice: 0.90, context: '64K' },

  // xAI
  { id: 'x-ai/grok-2-1212', name: 'Grok 2', provider: 'xAI', inputPrice: 2.00, outputPrice: 10.00, context: '128K' },

  // Qwen
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Qwen', inputPrice: 0.36, outputPrice: 0.36, context: '128K' },
]

// ─── Provider metadata ──────────────────────────────────────────────
const PROVIDER_META: Record<string, { emoji: string; color: string }> = {
  'OpenAI':    { emoji: '🟢', color: '#10a37f' },
  'Anthropic': { emoji: '🟠', color: '#d97706' },
  'Google':    { emoji: '🔵', color: '#4285f4' },
  'DeepSeek':  { emoji: '🔴', color: '#ef4444' },
  'Meta':      { emoji: '🟣', color: '#8b5cf6' },
  'Mistral':   { emoji: '🟡', color: '#eab308' },
  'xAI':       { emoji: '⚫', color: '#6b7280' },
  'Qwen':      { emoji: '🟣', color: '#a855f7' },
}

// ─── Helpers ────────────────────────────────────────────────────────
function fmtPrice(v: number) {
  if (v === 0) return 'Free'
  if (v >= 10) return `$${v.toFixed(0)}`
  if (v >= 1) return `$${v.toFixed(2)}`
  return `$${v.toFixed(2)}`
}

// ─── Group models by provider (preserve insertion order) ────────────
function groupByProvider(models: Model[]) {
  const groups: { provider: string; models: Model[] }[] = []
  const map = new Map<string, Model[]>()

  for (const m of models) {
    if (!map.has(m.provider)) {
      const arr: Model[] = []
      map.set(m.provider, arr)
      groups.push({ provider: m.provider, models: arr })
    }
    map.get(m.provider)!.push(m)
  }
  return groups
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

  // Filter
  const filtered = search
    ? MODELS.filter(m => {
        const s = search.toLowerCase()
        return m.name.toLowerCase().includes(s) ||
               m.id.toLowerCase().includes(s) ||
               m.provider.toLowerCase().includes(s)
      })
    : MODELS

  const groups = groupByProvider(filtered)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isZh ? '模型定价' : 'Model Pricing'}
          </h1>
          <p className="text-sm text-gray-500">
            {isZh
              ? '所有价格均以每 1M tokens 为单位 · 零加价透传'
              : 'All prices per 1M tokens · Zero markup pass-through'}
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
            className="w-full pl-11 pr-4 py-2.5 bg-[#16161f] border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition"
          />
        </div>

        {/* Model Groups */}
        {groups.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            {isZh ? '未找到模型' : 'No models found'}
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(group => {
              const meta = PROVIDER_META[group.provider] || { emoji: '⬜', color: '#6b7280' }
              return (
                <div key={group.provider}>
                  {/* Provider Header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-lg">{meta.emoji}</span>
                    <span className="text-sm font-semibold text-white">{group.provider}</span>
                    <span className="text-xs text-gray-600">({group.models.length})</span>
                    <div className="flex-1 h-px bg-gray-800 ml-3" />
                  </div>

                  {/* Table */}
                  <div className="bg-[#12121a] border border-gray-800/60 rounded-xl overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#16161f] text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="col-span-5">{isZh ? '模型' : 'Model'}</div>
                      <div className="col-span-2 text-right">{isZh ? '输入' : 'Input'}</div>
                      <div className="col-span-2 text-right">{isZh ? '输出' : 'Output'}</div>
                      <div className="col-span-2 text-right">{isZh ? '上下文' : 'Context'}</div>
                      <div className="col-span-1" />
                    </div>

                    {/* Rows */}
                    {group.models.map((m, i) => (
                      <div
                        key={m.id}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[#1a1a25] transition ${
                          i < group.models.length - 1 ? 'border-b border-gray-800/40' : ''
                        }`}
                      >
                        {/* Model Name + ID */}
                        <div className="col-span-5 min-w-0">
                          <div className="text-sm font-medium text-gray-100 truncate">{m.name}</div>
                          <div className="text-[10px] text-gray-600 font-mono truncate">{m.id}</div>
                        </div>

                        {/* Input Price */}
                        <div className="col-span-2 text-right">
                          <span className={`text-sm font-mono ${m.inputPrice === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                            {fmtPrice(m.inputPrice)}
                          </span>
                        </div>

                        {/* Output Price */}
                        <div className="col-span-2 text-right">
                          <span className={`text-sm font-mono ${m.outputPrice === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                            {fmtPrice(m.outputPrice)}
                          </span>
                        </div>

                        {/* Context */}
                        <div className="col-span-2 text-right">
                          <span className="text-sm text-gray-500">{m.context}</span>
                        </div>

                        {/* Copy */}
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => copy(m.id)}
                            title={isZh ? '复制模型 ID' : 'Copy model ID'}
                            className="p-1.5 text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 rounded transition"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-800/50 text-center text-xs text-gray-600">
          {isZh
            ? '价格以每 1M tokens 为单位 · 实际费用与 OpenRouter 完全一致 · 零加价'
            : 'Prices per 1M tokens · Exact same as OpenRouter · Zero markup'}
        </div>
      </div>
    </div>
  )
}
