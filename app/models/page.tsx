'use client'

import { useState } from 'react'
import { Search, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'
import Image from 'next/image'
import { MODELS } from '@/lib/constants'

// ─── Provider metadata ──────────────────────────────────────────────
const PROVIDERS = [
  { slug: 'OpenAI',      logo: '/logos/openai.svg' },
  { slug: 'Anthropic',   logo: '/logos/anthropic.svg' },
  { slug: 'Google',      logo: '/logos/google.svg' },
  { slug: 'DeepSeek',    logo: '/logos/deepseek.svg' },
  { slug: 'Meta',        logo: '/logos/meta.svg' },
  { slug: 'Mistral',     logo: '/logos/mistral.svg' },
  { slug: 'xAI',         logo: '/logos/xai.svg' },
  { slug: 'Qwen',        logo: '/logos/qwen.svg' },
  { slug: 'Perplexity',  logo: '/logos/perplexity.svg' },
  { slug: 'Cohere',      logo: '/logos/cohere.svg' },
  { slug: 'Moonshot',    logo: '/logos/moonshot.svg' },
  { slug: 'MiniMax',     logo: '/logos/minimax.svg' },
  { slug: 'ByteDance',   logo: '/logos/bytedance.svg' },
  { slug: 'Xiaomi',      logo: '/logos/xiaomi.svg' },
  { slug: 'Z.AI',        logo: '/logos/zai.svg' },
  { slug: 'Writer',      logo: '/logos/writer.svg' },
]

const PAGE_SIZE = 6

function fmtPrice(v: number) {
  if (v === 0) return 'Free'
  if (v >= 10) return `$${v.toFixed(0)}`
  if (v < 0.1) return `$${v.toFixed(3)}`
  return `$${v.toFixed(2)}`
}

function TagBadge({ tag }: { tag?: string }) {
  if (!tag) return null
  const styles: Record<string, string> = {
    new: 'bg-green-900/40 text-green-400 border-green-700/40',
    hot: 'bg-orange-900/40 text-orange-400 border-orange-700/40',
    reasoning: 'bg-purple-900/40 text-purple-400 border-purple-700/40',
  }
  const labels: Record<string, string> = { new: '🆕 New', hot: '🔥 Hot', reasoning: '🧠 Reasoning' }
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${styles[tag] || ''}`}>
      {labels[tag] || tag}
    </span>
  )
}

// ─── Page ───────────────────────────────────────────────────────────
export default function ModelsPage() {
  const { locale } = useLocale()
  const isZh = locale === 'zh'
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('OpenAI')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [page, setPage] = useState(0)

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

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Reset page when provider or search changes
  const selectProvider = (slug: string) => {
    setSelectedProvider(slug)
    setPage(0)
  }

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(0)
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-3 h-4 w-4 text-[#888]" />
          <input
            type="text"
            placeholder={isZh ? '搜索模型...' : 'Search models...'}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#2a2a2a] border border-[#444] rounded-lg text-sm text-white placeholder-[#888] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition"
          />
        </div>

        <div className="flex gap-6">

          {/* ─── Left Panel: Providers ─── */}
          <div className="w-52 flex-shrink-0 hidden md:block">
            <h2 className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-3 px-1">
              {isZh ? '提供商' : 'Providers'}
            </h2>
            <div className="space-y-1">
              {PROVIDERS.map(p => {
                const count = providerCounts.get(p.slug) || 0
                if (count === 0) return null
                const active = selectedProvider === p.slug
                return (
                  <button
                    key={p.slug}
                    onClick={() => selectProvider(p.slug)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                      active
                        ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/40 text-white'
                        : 'border border-transparent hover:bg-[#2a2a2a] text-[#ccc] hover:text-white'
                    }`}
                  >
                    <Image
                      src={p.logo}
                      alt={p.slug}
                      width={20}
                      height={20}
                      className="flex-shrink-0 rounded"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${active ? 'text-white' : ''}`}>
                        {p.slug}
                      </div>
                    </div>
                    <span className={`text-xs ${active ? 'text-[#00d4ff]' : 'text-[#888]'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ─── Mobile Provider Select ─── */}
          <div className="md:hidden w-full mb-4">
            <select
              value={selectedProvider}
              onChange={e => selectProvider(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-[#444] rounded-lg text-white text-sm"
            >
              {PROVIDERS.map(p => {
                const count = providerCounts.get(p.slug) || 0
                if (count === 0) return null
                return <option key={p.slug} value={p.slug}>{p.slug} ({count})</option>
              })}
            </select>
          </div>

          {/* ─── Right Panel: Model Cards ─── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-semibold text-[#888] uppercase tracking-wider">
                {selectedProvider} {isZh ? '模型' : 'Models'}
                <span className="ml-2 text-[#666]">({filtered.length})</span>
              </h2>
              <span className="text-[10px] text-[#888]">
                {isZh ? '价格 / 1M tokens · 零加价' : 'per 1M tokens · zero markup'}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-[#888]">
                {isZh ? '未找到模型' : 'No models found'}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {paged.map(m => (
                    <div
                      key={m.id}
                      className="p-4 bg-[#2a2a2a] border border-[#444] rounded-xl hover:border-[#00d4ff]/50 hover:bg-[#333] transition group"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-white group-hover:text-[#00d4ff] transition truncate">
                              {m.name}
                            </h3>
                            <TagBadge tag={m.tag} />
                          </div>
                          <p className="text-[10px] text-[#888] font-mono truncate">{m.id}</p>
                        </div>
                        <button
                          onClick={() => copy(m.id)}
                          title={isZh ? '复制模型 ID' : 'Copy model ID'}
                          className="ml-2 p-1.5 text-[#888] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-lg transition flex-shrink-0"
                        >
                          {copiedId === m.id ? (
                            <Check className="h-3.5 w-3.5 text-green-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex-1">
                          <div className="text-[#888] mb-0.5">{isZh ? '输入' : 'Input'}</div>
                          <div className="font-mono font-medium text-white">{fmtPrice(m.inputPrice)}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[#888] mb-0.5">{isZh ? '输出' : 'Output'}</div>
                          <div className="font-mono font-medium text-white">{fmtPrice(m.outputPrice)}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[#888] mb-0.5">{isZh ? '上下文' : 'Context'}</div>
                          <div className="font-mono text-[#ccc]">{m.context}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#2a2a2a] border border-[#444] rounded-lg text-sm text-[#ccc] hover:text-white hover:border-[#00d4ff] disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {isZh ? '上一页' : 'Prev'}
                    </button>
                    <span className="text-sm text-[#888]">
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#2a2a2a] border border-[#444] rounded-lg text-sm text-[#ccc] hover:text-white hover:border-[#00d4ff] disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      {isZh ? '下一页' : 'Next'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#444] text-center text-xs text-[#888]">
          {isZh
            ? `共 ${MODELS.length} 个付费模型 · 实际费用与 OpenRouter 完全一致 · 零加价透传`
            : `${MODELS.length} paid models · Exact same pricing as OpenRouter · Zero markup pass-through`}
        </div>
      </div>
    </div>
  )
}
