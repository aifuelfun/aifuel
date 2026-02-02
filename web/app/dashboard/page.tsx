'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { 
  Flame, Copy, Check, Key, RefreshCw, 
  Zap, TrendingUp, Clock, AlertCircle,
  Plus, Trash2, Eye, EyeOff
} from 'lucide-react'
import { shortenAddress, formatUSD, formatNumber } from '@/lib/utils'

interface ApiKey {
  id: string
  name: string
  key?: string
  createdAt: string
  lastUsedAt?: string
}

interface Credits {
  balance: number
  daily: number
  used: number
  remaining: number
  multiplier: number
}

export default function Dashboard() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [credits, setCredits] = useState<Credits | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)

  // Mock data for demo
  useEffect(() => {
    if (connected && publicKey) {
      // Simulate API call
      setTimeout(() => {
        setCredits({
          balance: 1_500_000,
          daily: 3.00,
          used: 1.25,
          remaining: 1.75,
          multiplier: 1.0,
        })
        setApiKeys([
          {
            id: '1',
            name: 'Development',
            createdAt: '2026-02-01T10:00:00Z',
            lastUsedAt: '2026-02-02T15:30:00Z',
          },
        ])
        setLoading(false)
      }, 1000)
    }
  }, [connected, publicKey])

  // Redirect if not connected
  useEffect(() => {
    if (!connected && !loading) {
      router.push('/')
    }
  }, [connected, loading, router])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const createApiKey = async () => {
    setCreatingKey(true)
    // Simulate API call
    setTimeout(() => {
      const newKey = {
        id: Date.now().toString(),
        name: newKeyName || 'Untitled',
        key: `fuel_sk_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
        createdAt: new Date().toISOString(),
      }
      setApiKeys([...apiKeys, newKey])
      setShowNewKey(newKey.key!)
      setNewKeyName('')
      setCreatingKey(false)
    }, 500)
  }

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id))
  }

  if (!connected) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Flame className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
        <p className="text-gray-600 mb-6">Connect your wallet to access your dashboard</p>
        <WalletMultiButton />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Wallet: {publicKey && shortenAddress(publicKey.toBase58())}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <WalletMultiButton />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Token Balance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">$FUEL Balance</span>
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(credits?.balance || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">tokens</p>
        </div>

        {/* Daily Credit */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/80 text-sm">Daily Credit</span>
            <Zap className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold">
            {formatUSD(credits?.daily || 0)}
          </p>
          <p className="text-sm text-white/80 mt-1">
            {credits?.multiplier === 1.0 ? '💎 Diamond Hands' : `${(credits?.multiplier || 0) * 100}% unlocked`}
          </p>
        </div>

        {/* Used Today */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Used Today</span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatUSD(credits?.used || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            of {formatUSD(credits?.daily || 0)}
          </p>
        </div>

        {/* Remaining */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Remaining</span>
            <Clock className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatUSD(credits?.remaining || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">resets at midnight UTC</p>
        </div>
      </div>

      {/* New Key Created Alert */}
      {showNewKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-grow">
              <p className="font-semibold text-green-800">API Key Created!</p>
              <p className="text-sm text-green-700 mt-1">
                Copy this key now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2 mt-3 bg-white rounded-lg p-3 border border-green-200">
                <code className="flex-grow text-sm font-mono break-all">{showNewKey}</code>
                <button
                  onClick={() => copyToClipboard(showNewKey, 'new')}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  {copiedKey === 'new' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setShowNewKey(null)}
                className="mt-3 text-sm text-green-700 hover:text-green-800"
              >
                I've copied my key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
            </div>
          </div>
        </div>

        {/* Create New Key */}
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Key name (optional)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={createApiKey}
              disabled={creatingKey}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {creatingKey ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Key
            </button>
          </div>
        </div>

        {/* Keys List */}
        <div className="divide-y divide-gray-100">
          {apiKeys.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No API keys yet. Create one to get started.
            </div>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{key.name}</p>
                    <p className="text-sm text-gray-500">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt && ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-gray-400 font-mono">
                      fuel_sk_••••••••
                    </code>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Start */}
      <div className="mt-8 bg-dark rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Quick Start</h3>
        <pre className="bg-dark-light rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`from openai import OpenAI

client = OpenAI(
    api_key="fuel_sk_your_key_here",
    base_url="https://api.aifuel.fun/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`}</code>
        </pre>
      </div>
    </div>
  )
}
