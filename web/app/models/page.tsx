'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

// Provider info with logos (SVG inline or emoji fallback)
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
  const [selectedModel, setSelectedModel] = useState<any>(null)
  const [search, setSearch] = useState('')

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6 min-h-[70vh]">

          {/* Left: Provider List */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {isZh ? '提供商' : 'Providers'}
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">{isZh ? '加载中...' : 'Loading...'}</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {providerSlugs.map(slug => {
                    const info = getProviderInfo(slug)
                    const count = grouped[slug].length
                    const isActive = selectedProvider === slug
                    return (
                      <button
                        key={slug}
                        onClick={() => { setSelectedProvider(slug); setSelectedModel(null); setSearch('') }}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition text-left ${isActive ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                      >
                        <span className="text-xl" role="img">{info.logo}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-gray-900'}`}>{info.label}</p>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Models List */}
          <div className="flex-1 min-w-0">
            {selectedProvider && (
              <>
                {/* Provider Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getProviderInfo(selectedProvider).logo}</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{getProviderInfo(selectedProvider).label}</h2>
                      <p className="text-sm text-gray-500">{filteredModels.length} {isZh ? '个模型' : 'models'}</p>
                    </div>
                  </div>
                  {/* Search */}
                  <div className="relative w-48 md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={isZh ? '搜索...' : 'Search...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Models Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredModels.map((model: any) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className="text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-primary hover:shadow-md transition group"
                    >
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-primary transition truncate">{model.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1 truncate">{model.id.split('/').slice(1).join('/')}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                        <span>{isZh ? '输入' : 'In'}: <span className="font-mono text-gray-700">{formatPrice(model.pricing?.prompt)}</span></span>
                        <span>{isZh ? '输出' : 'Out'}: <span className="font-mono text-gray-700">{formatPrice(model.pricing?.completion)}</span></span>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredModels.length === 0 && (
                  <div className="text-center py-12 text-gray-500">{isZh ? '未找到模型' : 'No models found'}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedModel(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedModel.name}</h3>
                <p className="text-sm text-gray-400 font-mono mt-1 break-all">{selectedModel.id}</p>
              </div>
              <button onClick={() => setSelectedModel(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Description */}
            {selectedModel.description && (
              <p className="text-sm text-gray-700 mb-4">{selectedModel.description}</p>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{isZh ? '输入价格' : 'Input Price'}</p>
                <p className="text-lg font-bold font-mono text-gray-900">{formatPrice(selectedModel.pricing?.prompt)}</p>
                <p className="text-xs text-gray-400">{isZh ? '每百万 tokens' : 'per 1M tokens'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{isZh ? '输出价格' : 'Output Price'}</p>
                <p className="text-lg font-bold font-mono text-gray-900">{formatPrice(selectedModel.pricing?.completion)}</p>
                <p className="text-xs text-gray-400">{isZh ? '每百万 tokens' : 'per 1M tokens'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{isZh ? '上下文长度' : 'Context Length'}</p>
                <p className="text-lg font-bold text-gray-900">{formatCtx(selectedModel)}</p>
                <p className="text-xs text-gray-400">tokens</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{isZh ? '最大输出' : 'Max Output'}</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedModel.top_provider?.max_completion_tokens 
                    ? (selectedModel.top_provider.max_completion_tokens >= 1000 
                        ? `${Math.round(selectedModel.top_provider.max_completion_tokens / 1000)}k` 
                        : selectedModel.top_provider.max_completion_tokens)
                    : '-'}
                </p>
                <p className="text-xs text-gray-400">tokens</p>
              </div>
            </div>

            {/* Modality */}
            {selectedModel.architecture && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">{isZh ? '支持模态' : 'Modality'}</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedModel.architecture.input_modalities || []).map((m: string) => (
                    <span key={`in-${m}`} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {isZh ? '输入' : 'Input'}: {m}
                    </span>
                  ))}
                  {(selectedModel.architecture.output_modalities || []).map((m: string) => (
                    <span key={`out-${m}`} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                      {isZh ? '输出' : 'Output'}: {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* API Usage */}
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <p className="text-xs text-gray-400 mb-2">{isZh ? '使用示例' : 'Usage Example'}</p>
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
{`curl https://api.aifuel.fun/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "${selectedModel.id}", "messages": [{"role": "user", "content": "Hello!"}]}'`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
