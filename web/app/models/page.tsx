'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

// Provider badge colors
const BADGE: any = {
  'openai': { bg: 'bg-green-100', text: 'text-green-800', label: 'OpenAI' },
  'anthropic': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Anthropic' },
  'google': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Google' },
  'meta-llama': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Meta' },
  'mistralai': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Mistral' },
  'deepseek': { bg: 'bg-red-100', text: 'text-red-800', label: 'DeepSeek' },
  'x-ai': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'xAI' },
  'qwen': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Qwen' },
  'cohere': { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Cohere' },
  'nvidia': { bg: 'bg-lime-100', text: 'text-lime-800', label: 'NVIDIA' },
  'amazon': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Amazon' },
}

function getProvider(id: string) {
  const slug = id.split('/')[0] || ''
  return BADGE[slug] || { bg: 'bg-gray-100', text: 'text-gray-800', label: slug }
}

function formatPrice(raw: string) {
  const val = parseFloat(raw || '0')
  if (val === 0) return '-'
  // raw is per token, convert to per 1M tokens
  const perMillion = val * 1000000
  if (perMillion >= 1) return `$${perMillion.toFixed(2)}`
  return `$${perMillion.toFixed(4)}`
}

export default function ModelsPage() {
  const { locale } = useLocale()
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterProvider, setFilterProvider] = useState('all')

  const isZh = locale === 'zh'

  useEffect(() => {
    fetch('https://api.aifuel.fun/v1/models')
      .then(r => r.json())
      .then(data => {
        const paid = (data.data || []).filter((m: any) => {
          const p = parseFloat(m.pricing?.prompt || '0')
          const c = parseFloat(m.pricing?.completion || '0')
          return p > 0 || c > 0
        })
        // Sort by provider then name
        paid.sort((a: any, b: any) => {
          const pa = a.id.split('/')[0] || ''
          const pb = b.id.split('/')[0] || ''
          if (pa !== pb) return pa.localeCompare(pb)
          return a.name.localeCompare(b.name)
        })
        setModels(paid)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Get unique providers
  const providers = Array.from(new Set(models.map(m => m.id.split('/')[0] || 'other'))).sort()

  // Filter
  const filtered = models.filter(m => {
    const slug = m.id.split('/')[0] || ''
    const matchProvider = filterProvider === 'all' || slug === filterProvider
    const matchSearch = !search || 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
    return matchProvider && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-hero-gradient text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold">{isZh ? 'AI 模型定价' : 'AI Model Pricing'}</h1>
          <p className="text-white/80 mt-2">{isZh ? '通过 AIFuel API 访问所有模型 · 仅显示付费模型' : 'Access all models via AIFuel API · Paid models only'}</p>
          <p className="text-white/60 mt-1 text-sm">{isZh ? '价格单位：每百万 tokens' : 'Prices per 1M tokens'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={isZh ? '搜索模型...' : 'Search models...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterProvider('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filterProvider === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            >
              {isZh ? '全部' : 'All'} ({models.length})
            </button>
            {providers.map(p => {
              const info = getProvider(p + '/x')
              const count = models.filter(m => (m.id.split('/')[0] || '') === p).length
              return (
                <button
                  key={p}
                  onClick={() => setFilterProvider(filterProvider === p ? 'all' : p)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filterProvider === p ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {info.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <p className="text-sm text-gray-500 mb-4">
          {isZh ? `显示 ${filtered.length} 个模型` : `Showing ${filtered.length} models`}
        </p>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">{isZh ? '加载中...' : 'Loading...'}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-600">{isZh ? '未找到模型' : 'No models found'}</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">{isZh ? '模型' : 'Model'}</div>
              <div className="col-span-2">{isZh ? '提供商' : 'Provider'}</div>
              <div className="col-span-2 text-right">{isZh ? '输入价格' : 'Input'}</div>
              <div className="col-span-2 text-right">{isZh ? '输出价格' : 'Output'}</div>
              <div className="col-span-1 text-right">{isZh ? '上下文' : 'Context'}</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filtered.map((model: any) => {
                const info = getProvider(model.id)
                const ctx = model.context_length || model.top_provider?.context_length
                const ctxStr = ctx ? (ctx >= 1000000 ? `${(ctx / 1000000).toFixed(1)}M` : ctx >= 1000 ? `${Math.round(ctx / 1000)}k` : ctx) : '-'
                
                return (
                  <div key={model.id} className="md:grid md:grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 transition items-center">
                    {/* Model name + id */}
                    <div className="col-span-5 mb-2 md:mb-0">
                      <p className="font-medium text-gray-900 text-sm">{model.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 break-all">{model.id}</p>
                    </div>
                    
                    {/* Provider badge */}
                    <div className="col-span-2 mb-2 md:mb-0">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${info.bg} ${info.text}`}>
                        {info.label}
                      </span>
                    </div>
                    
                    {/* Prices */}
                    <div className="col-span-2 text-right">
                      <span className="md:hidden text-xs text-gray-500">{isZh ? '输入: ' : 'In: '}</span>
                      <span className="text-sm font-mono text-gray-700">{formatPrice(model.pricing?.prompt)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="md:hidden text-xs text-gray-500">{isZh ? '输出: ' : 'Out: '}</span>
                      <span className="text-sm font-mono text-gray-700">{formatPrice(model.pricing?.completion)}</span>
                    </div>
                    
                    {/* Context */}
                    <div className="col-span-1 text-right">
                      <span className="md:hidden text-xs text-gray-500">{isZh ? '上下文: ' : 'Ctx: '}</span>
                      <span className="text-xs text-gray-500">{ctxStr}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
