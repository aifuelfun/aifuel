'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'
import { 
  Flame, Copy, Check, Key, RefreshCw, 
  Zap, TrendingUp, Clock, AlertCircle,
  Plus, Trash2, Diamond, LogOut, ExternalLink
} from 'lucide-react'
import { shortenAddress, formatUSD, formatNumber } from '@/lib/utils'
import { API_BASE_URL, TOKEN_CA, CIRCULATING_SUPPLY, DAILY_CREDIT_POOL } from '@/lib/constants'
import { useLocale } from '@/lib/LocaleContext'

interface ApiKey {
  id: string
  name: string
  prefix: string
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
  isDiamondHands: boolean
}

// Generate random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sk-'
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Mask API key for display
function maskApiKey(key: string): string {
  if (key.length < 12) return key
  return key.substring(0, 7) + '••••••••••••' + key.substring(key.length - 4)
}

export default function Dashboard() {
  const { connected, publicKey, disconnect } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const { t } = useLocale()
  
  const [credits, setCredits] = useState<Credits | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate daily credit based on holding
  const calculateCredit = useCallback((balance: number, multiplier: number = 1.0) => {
    if (balance <= 0) return 0
    const share = balance / CIRCULATING_SUPPLY
    return share * DAILY_CREDIT_POOL * multiplier
  }, [])

  // Fetch real token balance from chain
  const fetchTokenBalance = useCallback(async () => {
    if (!publicKey || !connection) return 0
    
    try {
      setLoadingBalance(true)
      
      // Get the token mint
      const tokenMint = new PublicKey(TOKEN_CA)
      
      // Find the associated token account
      const { TOKEN_PROGRAM_ID } = await import('@solana/spl-token')
      
      // Get all token accounts for this wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: tokenMint }
      )
      
      if (tokenAccounts.value.length === 0) {
        return 0
      }
      
      // Sum up all token account balances (usually just one)
      let totalBalance = 0
      for (const account of tokenAccounts.value) {
        const parsed = account.account.data.parsed
        if (parsed?.info?.tokenAmount?.uiAmount) {
          totalBalance += parsed.info.tokenAmount.uiAmount
        }
      }
      
      return totalBalance
    } catch (err) {
      console.error('Error fetching token balance:', err)
      return 0
    } finally {
      setLoadingBalance(false)
    }
  }, [publicKey, connection])

  // Load API keys from localStorage (for demo - in production use backend)
  const loadApiKeys = useCallback(() => {
    if (!publicKey) return []
    const storageKey = `aifuel_keys_${publicKey.toBase58()}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  }, [publicKey])

  // Save API keys to localStorage
  const saveApiKeys = useCallback((keys: ApiKey[]) => {
    if (!publicKey) return
    const storageKey = `aifuel_keys_${publicKey.toBase58()}`
    localStorage.setItem(storageKey, JSON.stringify(keys))
  }, [publicKey])

  // Load usage from localStorage (for demo)
  const loadUsage = useCallback(() => {
    if (!publicKey) return 0
    const today = new Date().toISOString().split('T')[0]
    const storageKey = `aifuel_usage_${publicKey.toBase58()}_${today}`
    const stored = localStorage.getItem(storageKey)
    return stored ? parseFloat(stored) : 0
  }, [publicKey])

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      if (!connected || !publicKey) {
        setLoading(false)
        return
      }
      
      try {
        // Fetch real token balance
        const balance = await fetchTokenBalance()
        
        // Calculate credits (assuming diamond hands for new users)
        const multiplier = 1.0 // In production, check if user ever transferred
        const isDiamondHands = multiplier >= 1.0
        const daily = calculateCredit(balance, multiplier)
        const used = loadUsage()
        const remaining = Math.max(0, daily - used)
        
        setCredits({
          balance,
          daily,
          used,
          remaining,
          multiplier,
          isDiamondHands,
        })
        
        // Load API keys
        const keys = loadApiKeys()
        setApiKeys(keys)
        
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load wallet data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [connected, publicKey, fetchTokenBalance, calculateCredit, loadApiKeys, loadUsage])

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
    
    // Generate new key
    const apiKey = generateApiKey()
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName || 'Untitled',
      prefix: maskApiKey(apiKey),
      key: apiKey,
      createdAt: new Date().toISOString(),
    }
    
    const updatedKeys = [...apiKeys, newKey]
    setApiKeys(updatedKeys)
    saveApiKeys(updatedKeys)
    setShowNewKey(apiKey)
    setNewKeyName('')
    setCreatingKey(false)
  }

  const deleteApiKey = (id: string) => {
    const updatedKeys = apiKeys.filter(k => k.id !== id)
    setApiKeys(updatedKeys)
    saveApiKeys(updatedKeys)
  }

  const refreshBalance = async () => {
    const balance = await fetchTokenBalance()
    if (credits) {
      const daily = calculateCredit(balance, credits.multiplier)
      const used = loadUsage()
      setCredits({
        ...credits,
        balance,
        daily,
        remaining: Math.max(0, daily - used),
      })
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
    router.push('/')
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-gray-600">Loading wallet data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header - Wallet Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Wallet Address */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Connected Wallet</span>
                {credits?.isDiamondHands && credits.balance > 0 && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Diamond className="h-3 w-3" />
                    Diamond Hands
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-lg font-mono font-semibold text-gray-900">
                  {publicKey && shortenAddress(publicKey.toBase58(), 6)}
                </code>
                <button
                  onClick={() => copyToClipboard(publicKey?.toBase58() || '', 'wallet')}
                  className="p-1.5 hover:bg-gray-100 rounded transition"
                  title="Copy address"
                >
                  {copiedKey === 'wallet' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <a
                  href={`https://solscan.io/account/${publicKey?.toBase58()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-100 rounded transition"
                  title="View on Solscan"
                >
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Right: Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Token Balance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">$FUEL Holding</span>
            <button 
              onClick={refreshBalance}
              disabled={loadingBalance}
              className="p-1 hover:bg-gray-100 rounded transition"
              title="Refresh balance"
            >
              <RefreshCw className={`h-4 w-4 text-gray-400 ${loadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(credits?.balance || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {credits?.balance === 0 ? (
              <a 
                href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Buy $FUEL to get credits →
              </a>
            ) : credits?.isDiamondHands ? (
              <span className="text-yellow-600">💎 100% multiplier</span>
            ) : (
              <span className="text-orange-600">{(credits?.multiplier || 0) * 100}% multiplier</span>
            )}
          </p>
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
            {credits?.isDiamondHands && credits.balance > 0 
              ? '💎 Diamond Hands Full Credit' 
              : credits?.balance === 0 
                ? 'Hold $FUEL to earn credits'
                : `${(credits?.multiplier || 0) * 100}% unlocked`
            }
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
            of {formatUSD(credits?.daily || 0)} daily
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

      {/* Diamond Hands Status */}
      {credits?.isDiamondHands && credits.balance > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Diamond className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-yellow-800">💎 Diamond Hands - Full Credit</p>
              <p className="text-sm text-yellow-700">Keep holding to maintain your diamond hands status and full credit multiplier!</p>
            </div>
          </div>
        </div>
      )}

      {/* No tokens warning */}
      {credits?.balance === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Flame className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-blue-800">No $FUEL tokens found</p>
              <p className="text-sm text-blue-700">Buy $FUEL tokens to unlock your daily AI credits. More tokens = more credits!</p>
            </div>
            <a
              href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Buy $FUEL
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

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
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">🔑 Your API Key</h2>
              <p className="text-sm text-gray-500">Base URL: https://api.aifuel.fun/v1</p>
            </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{key.name}</p>
                    <p className="text-sm text-gray-500">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt && ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1.5 rounded-lg">
                      {key.prefix}
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.key || '', key.id)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition"
                      title="Copy full key"
                    >
                      {copiedKey === key.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create New Key */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
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
              Generate New Key
            </button>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mt-8 bg-dark rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">⚡ Quick Start</h3>
        <pre className="bg-dark-light rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`from openai import OpenAI

client = OpenAI(
    api_key="your_api_key_here",
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
