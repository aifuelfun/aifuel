'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/WalletButton'
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
import { useLocale } from '@/lib/LocaleContext'

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

// Storage keys
const TOKEN_KEY = 'aifuel_jwt'
const API_KEY_STORAGE = 'aifuel_full_api_key'
const WALLET_KEY = 'aifuel_wallet'

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
const setToken = (t: string) => typeof window !== 'undefined' && localStorage.setItem(TOKEN_KEY, t)
const clearToken = () => typeof window !== 'undefined' && localStorage.removeItem(TOKEN_KEY)

const getStoredApiKey = () => typeof window !== 'undefined' ? localStorage.getItem(API_KEY_STORAGE) : null
const setStoredApiKey = (k: string) => typeof window !== 'undefined' && localStorage.setItem(API_KEY_STORAGE, k)
const clearStoredApiKey = () => typeof window !== 'undefined' && localStorage.removeItem(API_KEY_STORAGE)

const getStoredWallet = () => typeof window !== 'undefined' ? localStorage.getItem(WALLET_KEY) : null
const setStoredWallet = (w: string) => typeof window !== 'undefined' && localStorage.setItem(WALLET_KEY, w)

const clearAllData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(API_KEY_STORAGE)
  localStorage.removeItem(WALLET_KEY)
}

export default function Dashboard() {
  const { connected, publicKey, signMessage, disconnect } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const { t } = useLocale()
  
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [apiKey, setApiKey] = useState<ApiKeyData | null>(null)
  const [fullApiKey, setFullApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  
  const authAttemptedRef = useRef<string | null>(null)

  // API helper
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
      setFullApiKey(data.key)
      setStoredApiKey(data.key) // Store locally for persistence
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
      
      // Already tried for this wallet?
      if (authAttemptedRef.current === wallet) {
        setLoading(false)
        return
      }
      authAttemptedRef.current = wallet
      
      // Check if wallet changed - if so, clear old data
      const storedWallet = getStoredWallet()
      if (storedWallet && storedWallet !== wallet) {
        clearAllData()
        setFullApiKey(null)
        setApiKey(null)
        setCredits(null)
      }
      
      // Load stored API key first (only if same wallet)
      if (!storedWallet || storedWallet === wallet) {
        const storedKey = getStoredApiKey()
        if (storedKey) {
          setFullApiKey(storedKey)
        }
      }
      
      // Try existing token (only if same wallet)
      if (getToken() && storedWallet === wallet) {
        const creditsOk = await loadCredits()
        if (creditsOk) {
          const existingKey = await loadApiKey()
          const storedKey = getStoredApiKey()
          // Generate new key if none exists OR if we don't have the full key stored
          if (!existingKey || !storedKey) {
            await generateApiKey()
          }
          setLoading(false)
          return
        }
        clearToken() // Token invalid
      }
      
      // Need to authenticate
      if (!signMessage) {
        setError('Wallet does not support message signing')
        setLoading(false)
        return
      }
      
      const authOk = await authenticate()
      if (!authOk) {
        setLoading(false)
        return
      }
      
      // Store wallet after successful auth
      setStoredWallet(wallet)
      
      // Load data after auth
      await loadCredits()
      const existingKey = await loadApiKey()
      
      // Auto-generate key if none exists OR if we don't have the full key stored locally
      const storedKey = getStoredApiKey()
      if (!existingKey || !storedKey) {
        await generateApiKey()
      }
      
      setLoading(false)
    }
    
    init()
  }, [connected, publicKey, signMessage, authenticate, loadCredits, loadApiKey, generateApiKey])

  // Redirect if not connected (with delay to allow autoConnect)
  useEffect(() => {
    if (!connected && !loading) {
      // Give autoConnect a moment to restore connection
      const timer = setTimeout(() => {
        if (!connected) {
          router.push('/')
        }
      }, 1000) // 1 second delay
      return () => clearTimeout(timer)
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
    clearStoredApiKey() // Clear old stored key
    await generateApiKey()
  }

  const refreshBalance = async () => {
    if (getToken()) {
      setLoadingBalance(true)
      try {
        await loadCredits()
      } finally {
        setLoadingBalance(false)
      }
    }
  }

  const handleDisconnect = async () => {
    authAttemptedRef.current = null
    clearAllData()
    await disconnect()
    router.push('/')
  }

  if (!connected) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Flame className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('dashConnectWallet')}</h1>
        <p className="text-gray-600 mb-6">{t('dashConnectDesc')}</p>
        <WalletButton />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-gray-600">{status || t('dashLoading')}</p>
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
                <span className="text-sm text-gray-500">{t('dashConnectedWallet')}</span>
                {credits?.isDiamondHands && credits.balance > 0 && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Diamond className="h-3 w-3" /> {t('diamondHand')}
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
            <LogOut className="h-4 w-4" /> {t('dashDisconnect')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">{t('dashFuelHolding')}</span>
            <button onClick={refreshBalance} disabled={loadingBalance} className="p-1 hover:bg-gray-100 rounded">
              <RefreshCw className={`h-4 w-4 text-gray-400 ${loadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(credits?.balance || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {credits?.balance === 0 ? (
              <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {t('dashBuyToGetCredits')}
              </a>
            ) : <span className="text-yellow-600">💎 {Math.round((credits?.multiplier || 1) * 100)}% {t('multiplier').toLowerCase()}</span>}
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/80 text-sm">{t('dashDailyCredit')}</span>
            <Zap className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold">{formatUSD(credits?.daily || 0)}</p>
          <p className="text-sm text-white/80 mt-1">{credits?.balance && credits.balance > 0 ? `💎 ${t('diamondHand')}` : t('dashHoldToEarn')}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">{t('dashUsedToday')}</span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatUSD(credits?.used || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">{t('dashOfDaily').replace('{amount}', formatUSD(credits?.daily || 0))}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">{t('dashRemaining')}</span>
            <Clock className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{formatUSD(credits?.remaining || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">{t('dashResetsAtMidnight')}</p>
        </div>
      </div>

      {/* No tokens */}
      {credits?.balance === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-blue-600" />
            <div className="flex-grow">
              <p className="font-semibold text-blue-800">{t('dashNoTokens')}</p>
              <p className="text-sm text-blue-700">{t('dashBuyToUnlock')}</p>
            </div>
            <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t('buyFuel')}
            </a>
          </div>
        </div>
      )}

      {/* API Key Section */}
      {credits && credits.balance > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">🔑 {t('dashApiKey')}</h2>
                  <p className="text-sm text-gray-500">Base URL: https://api.aifuel.fun/v1</p>
                </div>
              </div>
              <button onClick={handleRegenerateKey} disabled={regenerating} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} /> {t('dashRegenerate')}
              </button>
            </div>
          </div>

          <div className="p-6">
            {fullApiKey ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <code className="flex-grow text-sm font-mono text-gray-900 break-all">{fullApiKey}</code>
                  <button onClick={() => copyToClipboard(fullApiKey, 'apikey')} className="p-2 hover:bg-gray-200 rounded flex-shrink-0">
                    {copiedKey === 'apikey' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
                  </button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">⚠️ {t('dashKeyWarning')}</p>
                </div>
              </div>
            ) : apiKey ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <code className="flex-grow text-sm font-mono text-gray-700">{apiKey.prefix}</code>
                  <span className="text-xs text-gray-500 flex-shrink-0">Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">⚠️ {t('dashKeyRegenNote')}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 text-gray-300 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">{t('dashGeneratingKey')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Start */}
      {(fullApiKey || apiKey) && (
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashQuickStart')}</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`curl https://api.aifuel.fun/v1/chat/completions \\
  -H "Authorization: Bearer ${fullApiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
          </pre>
        </div>
      )}
    </div>
  )
}
