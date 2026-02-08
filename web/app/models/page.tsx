'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, ExternalLink } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'

export default function ModelsPage() {
  const { locale } = useLocale()
  const [modelsByProvider, setModelsByProvider] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)

  const t = locale === 'zh' ? {
    title: 'AI 模型',
    subtitle: '通过 AIFuel API 访问的高级模型',
    search: '搜索模型...',
    loading: '加载模型中...',
    noResults: '未找到模型',
    paidModels: '仅限付费模型',
    models: '个模型',
    price: '价格：',
  } : {
    title: 'AI Models',
    subtitle: 'Premium models accessible via AIFuel API',
    search: 'Search models...',
    loading: 'Loading models...',
    noResults: 'No models found',
    paidModels: 'Paid Models Only',
    models: 'models',
    price: 'Price:',
  }

  useEffect(() => {
    fetch('https://api.aifuel.fun/v1/models')
      .then(r => r.json())
      .then(data => {
        const grouped: any = {}
        const models = data.data || []
        
        models.forEach((m: any) => {
          const prompt = parseFloat(m.pricing?.prompt || '0')
          const completion = parseFloat(m.pricing?.completion || '0')
          
          // Only include paid models
          if (prompt > 0 || completion > 0) {
            const provider = m.id.split('/')[0] || 'Other'
            if (!grouped[provider]) grouped[provider] = []
            grouped[provider].push(m)
          }
        })
        
        setModelsByProvider(grouped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const providers = Object.keys(modelsByProvider).sort()
  const totalModels = providers.reduce((sum, p) => sum + modelsByProvider[p].length, 0)
  
  let displayedModels = 0
  const filtered: any = {}
  if (search) {
    const searchLower = search.toLowerCase()
    providers.forEach(p => {
      const matched = modelsByProvider[p].filter((m: any) =>
        m.name.toLowerCase().includes(searchLower) ||
        m.id.toLowerCase().includes(searchLower)
      )
      if (matched.length > 0) {
        filtered[p] = matched
        displayedModels += matched.length
      }
    })
  } else {
    Object.assign(filtered, modelsByProvider)
    displayedModels = totalModels
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-hero-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
          <p className="text-lg text-white/90">{t.subtitle}</p>
          <p className="text-sm text-white/70 mt-2">{t.paidModels}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <p className="text-sm text-gray-600">
          {displayedModels} {t.models} {totalModels > 0 && `(${totalModels} ${t.models})`}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-12 text-gray-600">{t.loading}</div>
        ) : Object.keys(filtered).length === 0 ? (
          <div className="text-center py-12 text-gray-600">{t.noResults}</div>
        ) : (
          <div className="space-y-6">
            {Object.keys(filtered).sort().map((provider) => (
              <div key={provider} className="rounded-lg border-2 border-gray-200 bg-gray-50 overflow-hidden">
                <button
                  onClick={() => setExpandedProvider(expandedProvider === provider ? null : provider)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{provider}</h3>
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                      {filtered[provider].length}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition ${expandedProvider === provider ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedProvider === provider && (
                  <div className="border-t border-gray-200 divide-y divide-gray-200">
                    {filtered[provider].map((model: any) => (
                      <div key={model.id} className="p-4 hover:bg-white transition flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{model.name}</h4>
                          <p className="text-xs text-gray-600 font-mono mt-1 break-all">{model.id}</p>
                          {model.description && (
                            <p className="text-sm text-gray-700 mt-2">{model.description}</p>
                          )}
                          {(model.pricing?.prompt || model.pricing?.completion) && (
                            <p className="text-xs text-gray-600 mt-2">
                              {t.price}
                              {model.pricing.prompt && ` $${model.pricing.prompt}/1k input`}
                              {model.pricing.prompt && model.pricing.completion && ' | '}
                              {model.pricing.completion && ` $${model.pricing.completion}/1k output`}
                            </p>
                          )}
                        </div>
                        <a
                          href="https://api.aifuel.fun/v1/models"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded transition"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-600" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
