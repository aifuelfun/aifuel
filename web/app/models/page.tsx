'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Zap, Brain, Image, Mic, Video, ChevronDown, ExternalLink, Copy, Check } from 'lucide-react'
import { Logo } from '@/components'

interface Model {
  id: string
  name: string
  description: string
  context_length: number
  architecture: {
    modality: string
    input_modalities: string[]
    output_modalities: string[]
  }
  pricing: {
    prompt: string
    completion: string
  }
  top_provider: {
    context_length: number
    max_completion_tokens: number | null
    is_moderated: boolean
  }
}

const PROVIDERS = [
  'All', 'OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'DeepSeek', 
  'Qwen', 'Cohere', 'xAI', 'MiniMax', 'ByteDance', 'NVIDIA', 'Other'
]

const MODALITIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'text', label: 'Text', icon: Brain },
  { id: 'image', label: 'Vision', icon: Image },
  { id: 'audio', label: 'Audio', icon: Mic },
  { id: 'video', label: 'Video', icon: Video },
]

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('All')
  const [modality, setModality] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'context'>('name')
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://api.aifuel.fun/v1/models')
      .then(res => res.json())
      .then(data => {
        setModels(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch models:', err)
        setLoading(false)
      })
  }, [])

  const getProvider = (id: string): string => {
    const parts = id.split('/')
    if (parts.length < 2) return 'Other'
    const p = parts[0].toLowerCase()
    if (p.includes('openai')) return 'OpenAI'
    if (p.includes('anthropic')) return 'Anthropic'
    if (p.includes('google')) return 'Google'
    if (p.includes('meta') || p.includes('llama')) return 'Meta'
    if (p.includes('mistral')) return 'Mistral'
    if (p.includes('deepseek')) return 'DeepSeek'
    if (p.includes('qwen')) return 'Qwen'
    if (p.includes('cohere')) return 'Cohere'
    if (p.includes('xai') || p.includes('grok')) return 'xAI'
    if (p.includes('minimax')) return 'MiniMax'
    if (p.includes('bytedance')) return 'ByteDance'
    if (p.includes('nvidia')) return 'NVIDIA'
    return 'Other'
  }

  const formatPrice = (price: string): string => {
    const num = parseFloat(price)
    if (num === 0) return 'FREE'
    if (num < 0.0000001) return '<$0.01'
    return `$${(num * 1000000).toFixed(2)}`
  }

  const formatContext = (ctx: number): string => {
    if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(1)}M`
    if (ctx >= 1000) return `${(ctx / 1000).toFixed(0)}K`
    return ctx.toString()
  }

  const isFree = (model: Model): boolean => {
    return parseFloat(model.pricing.prompt) === 0 && parseFloat(model.pricing.completion) === 0
  }

  const hasModality = (model: Model, mod: string): boolean => {
    if (mod === 'all') return true
    return model.architecture.input_modalities.includes(mod)
  }

  const copyModelId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredModels = useMemo(() => {
    return models
      .filter(m => {
        // Search
        if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && 
            !m.id.toLowerCase().includes(search.toLowerCase())) {
          return false
        }
        // Provider
        if (provider !== 'All' && getProvider(m.id) !== provider) {
          return false
        }
        // Modality
        if (!hasModality(m, modality)) {
          return false
        }
        // Free only
        if (showFreeOnly && !isFree(m)) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price') {
          return parseFloat(a.pricing.prompt) - parseFloat(b.pricing.prompt)
        }
        if (sortBy === 'context') {
          return b.context_length - a.context_length
        }
        return a.name.localeCompare(b.name)
      })
  }, [models, search, provider, modality, showFreeOnly, sortBy])

  const stats = useMemo(() => {
    const total = models.length
    const free = models.filter(isFree).length
    const vision = models.filter(m => hasModality(m, 'image')).length
    return { total, free, vision }
  }, [models])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Logo size={40} />
            <h1 className="text-4xl font-bold">AI Models</h1>
          </div>
          <p className="text-xl text-white/80 max-w-2xl">
            Access {stats.total}+ AI models through a single API. 
            Including {stats.free} free models and {stats.vision} vision models.
          </p>
          
          {/* Stats */}
          <div className="flex gap-8 mt-8">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
              <p className="text-3xl font-bold">{stats.total}+</p>
              <p className="text-sm text-white/70">Total Models</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
              <p className="text-3xl font-bold">{stats.free}</p>
              <p className="text-sm text-white/70">Free Models</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
              <p className="text-3xl font-bold">{stats.vision}</p>
              <p className="text-sm text-white/70">Vision Models</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Provider */}
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary"
            >
              {PROVIDERS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Modality */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {MODALITIES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModality(m.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    modality === m.id 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Free Only */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-600">Free only</span>
            </label>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary"
            >
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
              <option value="context">Sort: Context</option>
            </select>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading models...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {filteredModels.length} of {models.length} models
            </p>
            
            <div className="grid gap-4">
              {filteredModels.map(model => (
                <div 
                  key={model.id}
                  className="bg-white rounded-xl border hover:shadow-lg transition p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Model Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {model.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              {model.id}
                            </code>
                            <button
                              onClick={() => copyModelId(model.id)}
                              className="p-1 hover:bg-gray-100 rounded transition"
                              title="Copy model ID"
                            >
                              {copiedId === model.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {model.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {model.architecture.input_modalities.map(mod => (
                          <span 
                            key={mod}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                          >
                            {mod}
                          </span>
                        ))}
                        {isFree(model) && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Stats */}
                    <div className="flex flex-row md:flex-col gap-4 md:gap-2 md:text-right md:min-w-[150px]">
                      <div>
                        <p className="text-xs text-gray-500">Input</p>
                        <p className={`font-semibold ${isFree(model) ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatPrice(model.pricing.prompt)}
                          {!isFree(model) && <span className="text-xs font-normal text-gray-500">/M</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Output</p>
                        <p className={`font-semibold ${isFree(model) ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatPrice(model.pricing.completion)}
                          {!isFree(model) && <span className="text-xs font-normal text-gray-500">/M</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Context</p>
                        <p className="font-semibold text-gray-900">
                          {formatContext(model.context_length)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredModels.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">No models found matching your criteria</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* API Info */}
      <div className="bg-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
          <div className="bg-dark-light rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-gray-300">
{`curl https://api.aifuel.fun/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
            </pre>
          </div>
          <p className="text-gray-400 mt-4">
            Use the model ID from the list above. All models are accessible via a single, unified API endpoint.
          </p>
        </div>
      </div>
    </div>
  )
}
