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
  const [filter, setFilter] = useState('all')
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

  // Get unique providers
  const providerSlugs = Array.from(new Set(models.map(m => m.id.split('/')[0]))).sort((a, b) => getInfo(a).label.localeCompare(getInfo(b).label))

  // Filter
  const filtered = models.filter(m => {
    const slug = m.id.split('/')[0]
    if (filter !== 'all' && slug !== filter) return false
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={isZh ? '搜索模型...' : 'Search models...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
          />
        </div>

        {/* Provider Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
          >
            {isZh ? '全部' : 'All'}
          </button>
          {providerSlugs.map(slug => {
            const info = getInfo(slug)
            return (
              <button
                key={slug}
                onClick={() => setFilter(filter === slug ? 'all' : slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition border flex items-center gap-1.5 ${filter === slug ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
              >
                <span className="text-sm">{info.logo}</span>
                {info.label}
              </button>
            )
          })}
        </div>

        {/* Count */}
        <p className="text-xs text-gray-400 mb-3">
          {isZh ? `${filtered.length} 个模型 · 价格单位: /1M tokens` : `${filtered.length} models · Prices per 1M tokens`}
        </p>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">{isZh ? '加载中...' : 'Loading...'}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">{isZh ? '未找到模型' : 'No models found'}</div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">{isZh ? '模型' : 'Model'}</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden sm:table-cell">{isZh ? '提供商' : 'Provider'}</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase">{isZh ? '输入' : 'Input'}</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase">{isZh ? '输出' : 'Output'}</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">{isZh ? '上下文' : 'Context'}</th>
                  <th className="w-10 px-2 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m: any) => {
                  const slug = m.id.split('/')[0]
                  const info = getInfo(slug)
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[200px] md:max-w-[300px]">{m.id}</p>
                      </td>
                      <td className="text-right px-4 py-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <span>{info.logo}</span> {info.label}
                        </span>
                      </td>
                      <td className="text-right px-4 py-3 font-mono text-gray-700">{fmtPrice(m.pricing?.prompt)}</td>
                      <td className="text-right px-4 py-3 font-mono text-gray-700">{fmtPrice(m.pricing?.completion)}</td>
                      <td className="text-right px-4 py-3 text-gray-500 hidden md:table-cell">{fmtCtx(m)}</td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => copy(m.id)}
                          title={isZh ? '复制模型 ID' : 'Copy model ID'}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition"
                        >
                          {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
