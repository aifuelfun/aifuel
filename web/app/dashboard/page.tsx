'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'
import { 
  Flame, Copy, Check, Key, RefreshCw, 
  Zap, TrendingUp, Clock, AlertCircle,
  Diamond, LogOut, ExternalLink
} from 'lucide-react'
import { shortenAddress, formatUSD, formatNumber } from '@/lib/utils'
import { TOKEN_CA, CIRCULATING_SUPPLY, DAILY_CREDIT_POOL } from '@/lib/constants'

interface ApiKeyState {
  key: string
  prefix: string
  createdAt: string
}

// Generate random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'fuel_sk_'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// v5.0.0 - 2026-02-06 LocalStorage mode (simpler, reliable)
export default function Dashboard() {
  const { connected, publicKey, disconnect } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  
  const [balance, setBalance] = useState<number>(0)
  const [apiKey, setApiKey] = useState<ApiKeyState | null>(null)
  const [showFullKey, setShowFullKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  // Calculate credits
  const daily = balance > 0 ? (balance / CIRCULATING_SUPPLY) * DAILY_CREDIT_POOL : 0
  const isDiamondHands = true // For now, assume diamond hands

  // Fetch token balance from chain
  const fetchTokenBalance = useCallback(async () => {
    if (!publicKey || !connection) return 0
    
    try {
      setLoadingBalance(true)
      
      const { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = await import('@solana/spl-token')
      const tokenMint = new PublicKey(TOKEN_CA)
      
      const ataAddress = getAssociatedTokenAddressSync(
        tokenMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
      
      try {
        const balanceInfo = await connection.getTokenAccountBalance(ataAddress)
        return balanceInfo.value.uiAmount || 0
      } catch {
        return 0
      }
    } catch (err) {
      console.error('Error fetching balance:', err)
      return 0
    } finally {
      setLoadingBalance(false)
    }
  }, [publicKey, connection])

  // Load API key from localStorage
  const loadApiKey = useCallback((): ApiKeyState | null => {
    if (!publicKey || typeof window === 'undefined') return null
    const storageKey = `aifuel_apikey_${publicKey.toBase58()}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  }, [publicKey])

  // Save API key to localStorage
  const saveApiKey = useCallback((keyData: ApiKeyState) => {
    if (!publicKey || typeof window === 'undefined') return
    const storageKey = `aifuel_apikey_${publicKey.toBase58()}`
    localStorage.setItem(storageKey, JSON.stringify(keyData))
  }, [publicKey])

  // Generate or load API key
  const ensureApiKey = useCallback(() => {
    // Check if already have key
    const existing = loadApiKey()
    if (existing) {
      setApiKey(existing)
      return existing
    }
    
    // Generate new key
    const newKey = generateApiKey()
    const keyData: ApiKeyState = {
      key: newKey,
      prefix: newKey.substring(0, 12) + '...' + newKey.substring(newKey.length - 4),
      createdAt: new Date().toISOString(),
    }
    
    saveApiKey(keyData)
    setApiKey(keyData)
    setShowFullKey(true) // Show full key on first generation
    
    return keyData
  }, [loadApiKey, saveApiKey])

  // Initialize
  useEffect(() => {
    const init = async () => {
      if (!connected || !publicKey) {
        setLoading(false)
        return
      }
      
      // Load balance
      const bal = await fetchTokenBalance()
      setBalance(bal)
      
      // Auto-generate API key if user has tokens
      if (bal > 0) {
        ensureApiKey()
      }
      
      setLoading(false)
    }
    
    init()
  }, [connected, publicKey, fetchTokenBalance, ensureApiKey])

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

  // Regenerate API key
  const handleRegenerateKey = async () => {
    setRegenerating(true)
    
    // Generate new key (invalidates old)
    const newKey = generateApiKey()
    const keyData: ApiKeyState = {
      key: newKey,
      prefix: newKey.substring(0, 12) + '...' + newKey.substring(newKey.length - 4),
      createdAt: new Date().toISOString(),
    }
    
    saveApiKey(keyData)
    setApiKey(keyData)
    setShowFullKey(true)
    setRegenerating(false)
  }

  const refreshBalance = async () => {
    const bal = await fetchTokenBalance()
    setBalance(bal)
    
    // Auto-generate key if now has tokens
    if (bal > 0 && !apiKey) {
      ensureApiKey()
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
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
              <img src="/logo.webp" alt="AIFuel" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Connected Wallet</span>
                {isDiamondHands && balance > 0 && (
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
                >
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition"
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
            >
              <RefreshCw className={`h-4 w-4 text-gray-400 ${loadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(balance)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {balance === 0 ? (
              <a 
                href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Buy $FUEL to get credits →
              </a>
            ) : (
              <span className="text-yellow-600">💎 100% multiplier</span>
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
            {formatUSD(daily)}
          </p>
          <p className="text-sm text-white/80 mt-1">
            {balance > 0 ? '💎 Diamond Hands' : 'Hold $FUEL to earn'}
          </p>
        </div>

        {/* Used Today */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Used Today</span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatUSD(0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            of {formatUSD(daily)} daily
          </p>
        </div>

        {/* Remaining */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Remaining</span>
            <Clock className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatUSD(daily)}
          </p>
          <p className="text-sm text-gray-500 mt-1">resets at midnight UTC</p>
        </div>
      </div>

      {/* No tokens warning */}
      {balance === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Flame className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-blue-800">No $FUEL tokens found</p>
              <p className="text-sm text-blue-700">Buy $FUEL tokens to unlock your daily AI credits.</p>
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

      {/* API Key Section - Only show if user has $FUEL tokens */}
      {balance > 0 && apiKey && (
        <>
          {/* New Key Alert */}
          {showFullKey && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-grow">
                  <p className="font-semibold text-green-800">🎉 API Key Generated!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Copy this key now. You won&apos;t be able to see it again after leaving this page.
                  </p>
                  <div className="flex items-center gap-2 mt-3 bg-white rounded-lg p-3 border border-green-200">
                    <code className="flex-grow text-sm font-mono break-all">{apiKey.key}</code>
                    <button
                      onClick={() => copyToClipboard(apiKey.key, 'newkey')}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      {copiedKey === 'newkey' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowFullKey(false)}
                    className="mt-3 text-sm text-green-700 hover:text-green-800"
                  >
                    ✓ I&apos;ve copied my key
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Key Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">🔑 Your API Key</h2>
                    <p className="text-sm text-gray-500">Base URL: https://api.aifuel.fun/v1</p>
                  </div>
                </div>
                <button
                  onClick={handleRegenerateKey}
                  disabled={regenerating}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <code className="text-sm font-mono text-gray-700">{apiKey.prefix}</code>
                  <span className="text-xs text-gray-500">
                    Created {new Date(apiKey.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    ⚠️ Regenerating will invalidate your current key immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`curl https://api.aifuel.fun/v1/chat/completions \\
  -H "Authorization: Bearer ${apiKey.key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
            </pre>
          </div>
        </>
      )}
    </div>
  )
}
