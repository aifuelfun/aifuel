'use client'

import { useState, useEffect } from 'react'
import { Search, X, Check, Copy } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

// Provider info with logos
const PROVIDERS: any = {
  'openai': { label: 'OpenAI', color: '#10A37F', logo: '🟢' },
  'anthropic': { label: 'Anthropic', color: '#D97706', logo: '🟠' },
  'google': { label: 'Google', color: '#4285F4', logo: '🔵' },
  'meta-llama': { label: 'Meta', color: '#0668E1', logo: '🟣' },
  'mistralai': { label: 'Mistral', color: '#F59E0B', logo: '🟡' },
  'deepseek': { label: 'DeepSeek', color: '#EF4444', logo: '🔴' },
  'x-ai': { label: 'xAI', color: '#6B7280', logo: '⚫' },
  'qwen': { label: 'Qwen', color: '#7C3AED', logo: '🟣' },
  'cohere': { label: 'Cohere', color: '#14B8A6', logo: '🩵' },
  'nvidia': { label: 'NVIDIA', color: '#76B900', logo: '🟩' },
  'amazon': { label: 'Amazon', color: '#FF9900', logo: '🟧' },
  'microsoft': { label: 'Microsoft', color: '#00BCF2', logo: '🔷' },
  'perplexity': { label: 'Perplexity', color: '#1FB8CD', logo: '🔮' },
  'minimax': { label: 'MiniMax', color: '#FF6B6B', logo: '🩷' },
  'bytedance-research': { label: 'ByteDance', color: '#00F2EA', logo: '🎵' },
}

function getProviderInfo(slug: string) {
  return PROVIDERS[slug] || { label: slug, color: '#9CA3AF', logo: '⬜' }
}

function formatPrice(raw: string) {
  const val = parseFloat(raw || '0')
  if (val === 0) return '-'
  const perMillion = val * 1000000
  if (perMillion >= 100) return `$${perMillion.toFixed(0)}`
  if (perMillion >= 1) return `$${perMillion.toFixed(2)}`
  return `$${perMillion.toFixed(4)}`
}

function formatCtx(model: any) {
  const ctx = model.context_length || model.top_provider?.context_length
  if (!ctx) return '-'
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(1)}M`
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}k`
  return String(ctx)
}

export default function ModelsPage() {
  const { locale } = useLocale()
  const isZh = locale === 'zh'
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [search, setSearch] = useState('')
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

  // Group by provider
  const grouped: any = {}
  models.forEach(m => {
    const slug = m.id.split('/')[0] || 'other'
    if (!grouped[slug]) grouped[slug] = []
    grouped[slug].push(m)
  })
  const providerSlugs = Object.keys(grouped).sort((a, b) => {
    const la = getProviderInfo(a).label
    const lb = getProviderInfo(b).label
    return la.localeCompare(lb)
  })

  // Auto-select first provider
  useEffect(() => {
    if (!selectedProvider && providerSlugs.length > 0) {
      setSelectedProvider(providerSlugs[0])
    }
  }, [providerSlugs, selectedProvider])

  // Current provider models
  const currentModels = selectedProvider ? (grouped[selectedProvider] || []) : []
  const filteredModels = search
    ? currentModels.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()))
    : currentModels

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-[70vh]">

          {/* Left: Provider List */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
              {isZh ? '提供商' : 'Providers'}
            </h2>
            <div className="space-y-1">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">{isZh ? '加载中...' : 'Loading...'}</div>
              ) : (
                providerSlugs.map(slug => {
                  const info = getProviderInfo(slug)
                  const count = grouped[slug].length
                  const isActive = selectedProvider === slug
                  return (
                    <button
                      key={slug}
                      onClick={() => { setSelectedProvider(slug); setSearch('') }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <span className="text-lg" role="img" aria-label={info.label}>{info.logo}</span>
                      <p className={`text-sm font-semibold truncate`}>{info.label}</p>
                      <span className="ml-auto text-xs font-medium bg-gray-200/80 px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right: Models List */}
          <div className="flex-1 min-w-0">
            {selectedProvider && (
              <>
                {/* Header + Search */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center gap-3 mb-3 md:mb-0">
                    <span className="text-2xl" role="img">{getProviderInfo(selectedProvider).logo}</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{getProviderInfo(selectedProvider).label}</h2>
                      <p className="text-sm text-gray-500">{filteredModels.length} {isZh ? '个可用模型' : 'models available'}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={isZh ? '搜索...' : 'Search...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full md:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Models Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                      <div className="col-span-5">{isZh ? '模型' : 'Model'}</div>
                      <div className="col-span-2 text-right">{isZh ? '输入价格' : 'Input'}</div>
                      <div className="col-span-2 text-right">{isZh ? '输出价格' : 'Output'}</div>
                      <div className="col-span-2 text-right">{isZh ? '上下文' : 'Context'}</div>
                      <div className="col-span-1"></div>
                    </div>

                    {filteredModels.map((model: any) => (
                      <div key={model.id} className="p-4 hover:bg-gray-50 transition">
                        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-4 gap-y-2 items-center">
                          {/* Model */}
                          <div className="md:col-span-5 col-span-2">
                            <p className="font-medium text-gray-900 text-sm truncate">{model.name}</p>
                          </div>

                          {/* Prices - Responsive */}
                          <div className="md:col-span-2 md:text-right">
                              <span className="md:hidden text-xs text-gray-500">{isZh ? '输入:' : 'Input:'} </span>
                              <span className="font-mono text-sm text-gray-800">{formatPrice(model.pricing?.prompt)}</span>
                          </div>
                          <div className="md:col-span-2 md:text-right">
                              <span className="md:hidden text-xs text-gray-500">{isZh ? '输出:' : 'Output:'} </span>
                              <span className="font-mono text-sm text-gray-800">{formatPrice(model.pricing?.completion)}</span>
                          </div>

                          {/* Context */}
                          <div className="md:col-span-2 md:text-right">
                            <span className="md:hidden text-xs text-gray-500">{isZh ? '上下文:' : 'Context:'} </span>
                            <span className="text-sm text-gray-600">{formatCtx(model)}</span>
                          </div>

                           {/* Copy Button */}
                          <div className="md:col-span-1 flex justify-end col-span-2 mt-2 md:mt-0">
                            <button 
                              onClick={() => copyToClipboard(model.id, model.id)}
                              title={isZh ? '复制模型 ID' : 'Copy Model ID'}
                              className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-200 rounded-md transition"
                            >
                              {copiedId === model.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredModels.length === 0 && (
                    <div className="text-center py-12 text-gray-500">{isZh ? '未找到模型' : 'No models found'}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
