'use client'

import { useState, useEffect } from 'react'
import { Search, Copy, Check } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

const PROVIDERS: any = {
  'openai': { label: 'OpenAI', logo: '🟢' },
  'anthropic': { label: 'Anthropic', logo: '🟠' },
  'google': { label: 'Google', logo: '🔵' },
  'meta-llama': { label: 'Meta', logo: '🟣' },
  'mistralai': { label: 'Mistral', logo: '🟡' },
  'deepseek': { label: 'DeepSeek', logo: '🔴' },
  'x-ai': { label: 'xAI', logo: '⚫' },
  'qwen': { label: 'Qwen', logo: '🟣' },
  'cohere': { label: 'Cohere', logo: '🩵' },
  'nvidia': { label: 'NVIDIA', logo: '🟩' },
  'amazon': { label: 'Amazon', logo: '🟧' },
  'microsoft': { label: 'Microsoft', logo: '🔷' },
  'perplexity': { label: 'Perplexity', logo: '🔮' },
  'minimax': { label: 'MiniMax', logo: '🩷' },
  'bytedance-research': { label: 'ByteDance', logo: '🎵' },
}

function getInfo(slug: string) {
  return PROVIDERS[slug] || { label: slug, logo: '⬜' }
}

function fmtPrice(raw: string) {
  const v = parseFloat(raw || '0')
  if (v === 0) return 'Free'
  const p = v * 1000000
  if (p >= 100) return `$${p.toFixed(0)}`
  if (p >= 1) return `$${p.toFixed(2)}`
  if (p >= 0.01) return `$${p.toFixed(3)}`
  return `$${p.toFixed(4)}`
}

function fmtCtx(m: any) {
  const c = m.context_length || m.top_provider?.context_length
  if (!c) return '-'
  if (c >= 1000000) return `${(c / 1000000).toFixed(1)}M`
  if (c >= 1000) return `${Math.round(c / 1000)}K`
  return String(c)
}

export default function ModelsPage() {
  const { locale } = useLocale()
  const isZh = locale === 'zh'
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string | null>('openai')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://api.aifuel.fun/v1/models')
      .then(r => r.json())
      .then(data => {
        const paid = (data.data || []).filter((m: any) => {
          const p = parseFloat(m.pricing?.prompt || '0')
          const c = parseFloat(m.pricing?.completion || '0')
          return p > 0 || c > 0
        })
        paid.sort((a: any, b: any) => a.name.localeCompare(b.name))
        setModels(paid)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Get unique providers with counts
  const providerStats = new Map<string, { label: string; logo: string; count: number }>()
  models.forEach(m => {
    const slug = m.id.split('/')[0]
    const info = getInfo(slug)
    if (!providerStats.has(slug)) {
      providerStats.set(slug, { ...info, count: 0 })
    }
    providerStats.get(slug)!.count++
  })

  const providerList = Array.from(providerStats.entries())
    .map(([slug, stats]) => ({ slug, ...stats }))
    .sort((a, b) => a.label.localeCompare(b.label))

  // Filter models
  const filteredModels = models.filter(m => {
    const slug = m.id.split('/')[0]
    if (selectedProvider && slug !== selectedProvider) return false
    if (search) {
      const s = search.toLowerCase()
      return m.name.toLowerCase().includes(s) || m.id.toLowerCase().includes(s)
    }
    return true
  })

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isZh ? '模型列表' : 'Models'}
          </h1>
          <p className="text-gray-500">
            {isZh ? '浏览所有付费模型并选择提供商' : 'Browse all paid models and select a provider'}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={isZh ? '搜索模型或提供商...' : 'Search models or providers...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
          />
        </div>

        <div className="flex gap-6">
          {/* Left Panel - Providers */}
          <div className="w-72 flex-shrink-0">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-3">
              {isZh ? '提供商' : 'Providers'}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {/* Provider cards */}
              {providerList.map(provider => (
                <button
                  key={provider.slug}
                  onClick={() => setSelectedProvider(selectedProvider === provider.slug ? null : provider.slug)}
                  className={`p-2 rounded-lg border transition text-center ${selectedProvider === provider.slug ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="text-lg mb-1">{provider.logo}</div>
                  <div className="font-medium text-xs text-gray-900 truncate">
                    {provider.label}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {provider.count}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Models */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase">
                {isZh ? '模型' : 'Models'}
                <span className="ml-2 text-gray-300">({filteredModels.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-400">{isZh ? '加载中...' : 'Loading...'}</div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-16 text-gray-400">{isZh ? '未找到模型' : 'No models found'}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredModels.map((m: any) => {
                  const slug = m.id.split('/')[0]
                  const info = getInfo(slug)
                  const modelName = m.name.replace(/^[a-zA-Z]+[.-]/, '') // Remove provider prefix

                  return (
                    <div
                      key={m.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-sm transition group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Model name */}
                          <h3 className="font-medium text-sm text-gray-900 mb-1 group-hover:text-primary transition truncate">
                            {modelName}
                          </h3>

                          {/* Full ID */}
                          <p className="text-[10px] text-gray-400 font-mono truncate mb-2">
                            {m.id}
                          </p>

                          {/* Prices */}
                          <div className="flex gap-3 text-xs">
                            <div>
                              <span className="text-gray-400">{isZh ? '输入' : 'In'}:</span>
                              <span className="ml-1 font-mono text-gray-600">{fmtPrice(m.pricing?.prompt)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">{isZh ? '输出' : 'Out'}:</span>
                              <span className="ml-1 font-mono text-gray-600">{fmtPrice(m.pricing?.completion)}</span>
                            </div>
                          </div>

                          {/* Context length */}
                          <div className="mt-1 text-[10px] text-gray-400">
                            {isZh ? '上下文' : 'Context'}: {fmtCtx(m)}
                          </div>
                        </div>

                        {/* Copy button */}
                        <button
                          onClick={() => copy(m.id)}
                          title={isZh ? '复制模型 ID' : 'Copy model ID'}
                          className="ml-2 p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition flex-shrink-0"
                        >
                          {copiedId === m.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        {!loading && filteredModels.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            {isZh
              ? '价格以每 1M tokens 为单位显示。点击复制按钮可复制模型 ID。'
              : 'Prices shown per 1M tokens. Click copy button to copy model ID.'}
          </div>
        )}
      </div>
    </div>
  )
}
