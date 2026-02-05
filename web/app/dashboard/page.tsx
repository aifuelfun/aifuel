'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { 
  Flame, Copy, Check, Key, RefreshCw, 
  Zap, TrendingUp, Clock, AlertCircle,
  Diamond, LogOut, ExternalLink
} from 'lucide-react'
import { shortenAddress, formatUSD, formatNumber } from '@/lib/utils'
import { TOKEN_CA, CIRCULATING_SUPPLY, DAILY_CREDIT_POOL, API_BASE_URL } from '@/lib/constants'

interface ApiKeyData {
  id: string
  prefix: string
  createdAt: string
}

interface CreditsData {
  balance: number
  daily: number
  used: number
  remaining: number
  multiplier: number
  isDiamondHands: boolean
  resetsAt: string
}

// Token storage
const TOKEN_KEY = 'aifuel_jwt'
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
const setToken = (t: string) => typeof window !== 'undefined' && localStorage.setItem(TOKEN_KEY, t)
const clearToken = () => typeof window !== 'undefined' && localStorage.removeItem(TOKEN_KEY)

// v6.0.0 - Backend API Mode
export default function Dashboard() {
  const { connected, publicKey, signMessage, disconnect } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [apiKey, setApiKey] = useState<ApiKeyData | null>(null)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  
  const authAttemptedRef = useRef<string | null>(null)

  // Fetch token balance from chain (fallback)
  const fetchTokenBalance = useCallback(async () => {
    if (!publicKey || !connection) return 0
    
    try {
      setLoadingBalance(true)
      const { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = await import('@solana/spl-token')
      const tokenMint = new PublicKey(TOKEN_CA)
      const ataAddress = getAssociatedTokenAddressSync(tokenMint, publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
      
      try {
        const balanceInfo = await connection.getTokenAccountBalance(ataAddress)
        return balanceInfo.value.uiAmount || 0
      } catch {
        return 0
      }
    } catch {
      return 0
    } finally {
      setLoadingBalance(false)
    }
  }, [publicKey, connection])

  // API helpers
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken()
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Request failed')
    return data
  }

  // Authenticate with backend
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!publicKey || !signMessage) return false
    
    const wallet = publicKey.toBase58()
    
    try {
      setStatus('Getting nonce...')
      const { message } = await apiCall('/v1/auth/nonce', {
        method: 'POST',
        body: JSON.stringify({ wallet }),
      })
      
      setStatus('Please sign the message...')
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = bs58.encode(signatureBytes)
      
      setStatus('Authenticating...')
      const { token } = await apiCall('/v1/auth/connect', {
        method: 'POST',
        body: JSON.stringify({ wallet, signature, message }),
      })
      
      setToken(token)
      setStatus('')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      setStatus('')
      return false
    }
  }, [publicKey, signMessage])

  // Load credits from backend
  const loadCredits = useCallback(async () => {
    try {
      const data = await apiCall('/v1/credits')
      setCredits(data)
      return true
    } catch {
      return false
    }
  }, [])

  // Load API key from backend
  const loadApiKey = useCallback(async (): Promise<ApiKeyData | null> => {
    try {
      const { key } = await apiCall('/v1/keys')
      setApiKey(key)
      return key
    } catch {
      return null
    }
  }, [])

  // Generate API key
  const generateApiKey = useCallback(async () => {
    try {
      setRegenerating(true)
      const data = await apiCall('/v1/keys', { method: 'POST' })
      setApiKey({ id: data.id, prefix: data.prefix, createdAt: data.createdAt })
      setNewApiKey(data.key) // Full key shown once
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate key')
      return false
    } finally {
      setRegenerating(false)
    }
  }, [])

  // Main init
  useEffect(() => {
    const init = async () => {
      if (!connected || !publicKey) {
        setLoading(false)
        return
      }
      
      const wallet = publicKey.toBase58()
      
      // Get balance first (always works)
      const balance = await fetchTokenBalance()
      
      // Show basic info while loading
      setCredits({
        balance,
        daily: balance > 0 ? (balance / CIRCULATING_SUPPLY) * DAILY_CREDIT_POOL : 0,
        used: 0,
        remaining: balance > 0 ? (balance / CIRCULATING_SUPPLY) * DAILY_CREDIT_POOL : 0,
        multiplier: 1.0,
        isDiamondHands: true,
        resetsAt: '',
      })
      setLoading(false)
      
      // No tokens = no need to auth
      if (balance <= 0) return
      
      // Already tried for this wallet?
      if (authAttemptedRef.current === wallet) return
      authAttemptedRef.current = wallet
      
      // Try existing token
      if (getToken()) {
        const creditsOk = await loadCredits()
        if (creditsOk) {
          await loadApiKey()
          return
        }
        clearToken() // Token invalid
      }
      
      // Need to authenticate
      if (!signMessage) {
        setError('Wallet does not support message signing')
        return
      }
      
      const authOk = await authenticate()
      if (!authOk) return
      
      // Load data
      await loadCredits()
      const existingKey = await loadApiKey()
      
      // Auto-generate key if none exists
      if (!existingKey) {
        await generateApiKey()
      }
    }
    
    init()
  }, [connected, publicKey, signMessage, fetchTokenBalance, authenticate, loadCredits, loadApiKey, generateApiKey])

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

  const handleRegenerateKey = async () => {
    if (!getToken()) {
      const ok = await authenticate()
      if (!ok) return
    }
    await generateApiKey()
  }

  const refreshBalance = async () => {
    if (getToken()) {
      await loadCredits()
    } else {
      const balance = await fetchTokenBalance()
      if (credits) {
        setCredits({ ...credits, balance })
      }
    }
  }

  const handleDisconnect = async () => {
    authAttemptedRef.current = null
    clearToken()
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
      {/* Status */}
      {status && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            <p className="text-blue-800">{status}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
          </div>
        </div>
      )}

      {/* Wallet Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
              <img src="/logo.webp" alt="AIFuel" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Connected Wallet</span>
                {credits?.isDiamondHands && credits.balance > 0 && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Diamond className="h-3 w-3" /> Diamond Hands
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-lg font-mono font-semibold text-gray-900">
                  {publicKey && shortenAddress(publicKey.toBase58(), 6)}
                </code>
                <button onClick={() => copyToClipboard(publicKey?.toBase58() || '', 'wallet')} className="p-1.5 hover:bg-gray-100 rounded">
                  {copiedKey === 'wallet' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-400" />}
                </button>
                <a href={`https://solscan.io/account/${publicKey?.toBase58()}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
          <button onClick={handleDisconnect} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
            <LogOut className="h-4 w-4" /> Disconnect
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">$FUEL Holding</span>
            <button onClick={refreshBalance} disabled={loadingBalance} className="p-1 hover:bg-gray-100 rounded">
              <RefreshCw className={`h-4 w-4 text-gray-400 ${loadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(credits?.balance || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {credits?.balance === 0 ? (
              <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Buy $FUEL to get credits →
              </a>
            ) : <span className="text-yellow-600">💎 {(credits?.multiplier || 1) * 100}% multiplier</span>}
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/80 text-sm">Daily Credit</span>
            <Zap className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold">{formatUSD(credits?.daily || 0)}</p>
          <p className="text-sm text-white/80 mt-1">{credits?.balance && credits.balance > 0 ? '💎 Diamond Hands' : 'Hold $FUEL to earn'}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Used Today</span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatUSD(credits?.used || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">of {formatUSD(credits?.daily || 0)} daily</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Remaining</span>
            <Clock className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{formatUSD(credits?.remaining || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">resets at midnight UTC</p>
        </div>
      </div>

      {/* No tokens */}
      {credits?.balance === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-blue-600" />
            <div className="flex-grow">
              <p className="font-semibold text-blue-800">No $FUEL tokens found</p>
              <p className="text-sm text-blue-700">Buy $FUEL to unlock AI credits.</p>
            </div>
            <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Buy $FUEL
            </a>
          </div>
        </div>
      )}

      {/* API Key Section */}
      {credits && credits.balance > 0 && (
        <>
          {/* New Key Alert */}
          {newApiKey && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-grow">
                  <p className="font-semibold text-green-800">🎉 API Key Generated!</p>
                  <p className="text-sm text-green-700 mt-1">Copy this key now. You won&apos;t see it again.</p>
                  <div className="flex items-center gap-2 mt-3 bg-white rounded-lg p-3 border border-green-200">
                    <code className="flex-grow text-sm font-mono break-all">{newApiKey}</code>
                    <button onClick={() => copyToClipboard(newApiKey, 'newkey')} className="p-2 hover:bg-gray-100 rounded">
                      {copiedKey === 'newkey' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                    </button>
                  </div>
                  <button onClick={() => setNewApiKey(null)} className="mt-3 text-sm text-green-700">✓ I&apos;ve copied my key</button>
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
                {apiKey && (
                  <button onClick={handleRegenerateKey} disabled={regenerating} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} /> Regenerate
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {apiKey ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono text-gray-700">{apiKey.prefix}</code>
                    <span className="text-xs text-gray-500">Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">⚠️ Regenerating will invalidate your current key immediately.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-gray-300 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500">Generating your API key...</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Start */}
          {apiKey && (
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`curl https://api.aifuel.fun/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  )
}
