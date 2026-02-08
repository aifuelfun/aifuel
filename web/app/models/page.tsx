'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, ExternalLink } from 'lucide-react'
import { Logo } from '@/components'
import { useLocale } from '@/lib/LocaleContext'

interface Model {
  id: string
  name: string
  description: string
  pricing: {
    prompt: string
    completion: string
  }
}

const PROVIDER_COLORS: { [key: string]: string } = {
  'OpenAI': 'bg-green-50 border-green-200',
  'Anthropic': 'bg-blue-50 border-blue-200',
  'Google': 'bg-orange-50 border-orange-200',
  'Meta': 'bg-purple-50 border-purple-200',
  'Mistral': 'bg-yellow-50 border-yellow-200',
  'DeepSeek': 'bg-red-50 border-red-200',
  'xAI': 'bg-indigo-50 border-indigo-200',
}

export default function ModelsPage() {
  const { locale } = useLocale()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)

  const texts = {
    en: {
      title: 'AI Models',
      subtitle: 'Premium models accessible via AIFuel API',
      search: 'Search models...',
      loading: 'Loading models...',
      noResults: 'No models found',
      paidModels: 'Paid Models Only',
      viewAll: 'View All',
      hide: 'Hide',
      models: 'models',
    },
    zh: {
      title: 'AI 模型',
      subtitle: '通过 AIFuel API 访问的高级模型',
      search: '搜索模型...',
      loading: '加载模型中...',
      noResults: '未找到模型',
      paidModels: '仅限付费模型',
      viewAll: '查看全部',
      hide: '隐藏',
      models: '个模型',
    }
  }
  const t = texts[locale] || texts.en

  useEffect(() => {
    fetch('https://api.aifuel.fun/v1/models')
      .then(res => res.json())
      .then(data => {
        // Filter: only paid models (exclude free models)
        const paidModels = data.data?.filter((m: Model) => {
          const prompt = parseFloat(m.pricing?.prompt || '0')
          const completion = parseFloat(m.pricing?.completion || '0')
          return prompt > 0 || completion > 0
        }) || []
        setModels(paidModels)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Group by provider
  const modelsByProvider = useMemo(() => {
    const grouped: { [key: string]: Model[] } = {}
    models.forEach(model => {
      const provider = model.id.split('/')[0] || 'Other'
      if (!grouped[provider]) {
        grouped[provider] = []
      }
      grouped[provider].push(model)
    })
    return grouped
  }, [models])

  // Filter by search
  const filteredByProvider = useMemo(() => {
    if (!search) return modelsByProvider
    
    const searchLower = search.toLowerCase()
    const filtered: { [key: string]: Model[] } = {}
    
    Object.entries(modelsByProvider).forEach(([provider, providerModels]) => {
      const matched = providerModels.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        m.id.toLowerCase().includes(searchLower)
      )
      if (matched.length > 0) {
        filtered[provider] = matched
      }
    })
    return filtered
  }, [modelsByProvider, search])

  const totalModels = models.length
  const displayedModels = Object.values(filteredByProvider).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Logo size={40} />
            <span className="text-3xl font-bold">{t('title')}</span>
          </div>
          <p className="text-lg text-white/90">{t('subtitle')}</p>
          <p className="text-sm text-white/70 mt-2">{t('paidModels')}</p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <p className="text-sm text-gray-600 mt-3">
          {displayedModels} {t('models')} {totalModels > 0 && `(${totalModels} ${t('models')})`}
        </p>
      </div>

      {/* Models by Provider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-12 text-gray-600">{t('loading')}</div>
        ) : Object.keys(filteredByProvider).length === 0 ? (
          <div className="text-center py-12 text-gray-600">{t('noResults')}</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredByProvider).map(([provider, providerModels]) => (
              <div key={provider} className={`rounded-lg border-2 overflow-hidden ${PROVIDER_COLORS[provider] || 'bg-gray-50 border-gray-200'}`}>
                {/* Provider Header */}
                <button
                  onClick={() => setExpandedProvider(expandedProvider === provider ? null : provider)}
                  className="w-full flex items-center justify-between p-4 hover:opacity-75 transition"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{provider}</h3>
                    <span className="px-3 py-1 bg-white bg-opacity-70 rounded-full text-sm font-medium text-gray-700">
                      {providerModels.length}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition ${expandedProvider === provider ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Models List */}
                {expandedProvider === provider && (
                  <div className="border-t-2 border-current border-opacity-10 divide-y divide-opacity-20">
                    {providerModels.map((model) => (
                      <div key={model.id} className="p-4 hover:bg-white hover:bg-opacity-50 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 break-words">{model.name}</h4>
                            <p className="text-xs text-gray-600 font-mono mt-1 break-all">{model.id}</p>
                            {model.description && (
                              <p className="text-sm text-gray-700 mt-2">{model.description}</p>
                            )}
                            {(model.pricing?.prompt || model.pricing?.completion) && (
                              <p className="text-xs text-gray-600 mt-2">
                                {locale === 'zh' ? '价格：' : 'Price: '}
                                {model.pricing?.prompt && `$${model.pricing.prompt}/1k input`}
                                {model.pricing?.prompt && model.pricing?.completion && ' | '}
                                {model.pricing?.completion && `$${model.pricing.completion}/1k output`}
                              </p>
                            )}
                          </div>
                          <a
                            href={`https://api.aifuel.fun/v1/models`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-2 hover:bg-white hover:bg-opacity-50 rounded transition"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-600" />
                          </a>
                        </div>
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
