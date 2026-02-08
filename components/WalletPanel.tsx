'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Copy, Check, RefreshCw, LogOut, Key, Flame, Zap, TrendingUp, Clock, Diamond, ExternalLink } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'
import { API_BASE_URL, CIRCULATING_SUPPLY, DAILY_CREDIT_POOL, TOKEN_CA } from '@/lib/constants'
import { shortenAddress, formatUSD, formatNumber } from '@/lib/utils'
import bs58 from 'bs58'

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

interface CreditsData {
  balance: number
  daily: number
  used: number
  remaining: number
  multiplier: number
  isDiamondHands: boolean
  resetsAt: string
}

interface ApiKeyData {
  id: string
  prefix: string
  createdAt: string
  key?: string
}

export function WalletPanel() {
  const { connected, publicKey, signMessage, disconnect } = useWallet()
  const { t } = useLocale()
  
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [apiKey, setApiKey] = useState<ApiKeyData | null>(null)
  const [fullApiKey, setFullApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  // Authenticate with backend (sign once)
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!publicKey || !signMessage) return false
    
    const wallet = publicKey.toBase58()
    
    // Already attempted for this wallet in this session?
    if (authAttemptedRef.current === wallet) return false
    authAttemptedRef.current = wallet
    
    // Clear old data if wallet changed
    const storedWallet = getStoredWallet()
    if (storedWallet && storedWallet !== wallet) {
      clearAllData()
    }
    
    // Already have token for this wallet?
    if (getToken() && storedWallet === wallet) {
      return true
    }
    
    try {
      // Get nonce
      const { message } = await apiCall('/v1/auth/nonce', {
        method: 'POST',
        body: JSON.stringify({ wallet }),
      })
      
      // Sign message
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = bs58.encode(signatureBytes)
      
      // Connect
      const { token } = await apiCall('/v1/auth/connect', {
        method: 'POST',
        body: JSON.stringify({ wallet, signature, message }),
      })
      
      setToken(token)
      setStoredWallet(wallet)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      authAttemptedRef.current = null
      return false
    }
  }, [publicKey, signMessage])

  // Load credits
  const loadCredits = useCallback(async () => {
    try {
      const data = await apiCall('/v1/credits')
      setCredits(data)
      return true
    } catch {
      return false
    }
  }, [])

  // Load API key
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
      setStoredApiKey(data.key)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate key')
    } finally {
      setRegenerating(false)
    }
  }, [])

  // Main init: authenticate and load data
  useEffect(() => {
    const init = async () => {
      if (!connected || !publicKey) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      setError(null)
      
      // Authenticate (if needed)
      const authOk = await authenticate()
      if (!authOk) {
        setLoading(false)
        return
      }
      
      // Load credits and API key in parallel
      await Promise.all([loadCredits(), loadApiKey()])
      
      // Ensure we have full API key stored
      const storedKey = getStoredApiKey()
      if (!storedKey) {
        await generateApiKey()
      }
      
      setLoading(false)
    }
    
    init()
  }, [connected, publicKey, authenticate, loadCredits, loadApiKey, generateApiKey])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
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
    // Reload page to reset state
    window.location.reload()
  }

  // Not connected? Should not render - caller handles this
  if (!connected) {
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{t('walletLoading')}</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
        </div>
      </div>
    )
  }

  const address = publicKey?.toBase58() || ''
  const hasTokens = credits && credits.balance > 0

  return (
    <div className="space-y-6">
      {/* Wallet Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
              <img src="/logo.webp" alt="AIFuel" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('connectedWallet')}</span>
                {credits?.isDiamondHands && hasTokens && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Diamond className="h-3 w-3" /> {t('diamondHand')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-lg font-mono font-semibold text-gray-900">
                  {shortenAddress(address, 6)}
                </code>
                <button onClick={() => copyToClipboard(address, 'wallet')} className="p-1.5 hover:bg-gray-100 rounded">
                  {copiedKey === 'wallet' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-400" />}
                </button>
                <a href={`https://solscan.io/account/${address}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
          <button onClick={handleDisconnect} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
            <LogOut className="h-4 w-4" /> {t('disconnect')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <span className="text-gray-500 text-xs md:text-sm">{t('fuelHolding')}</span>
            <button onClick={refreshBalance} disabled={loadingBalance} className="p-1 hover:bg-gray-100 rounded">
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 text-gray-400 ${loadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-lg md:text-3xl font-bold text-gray-900">{formatNumber(credits?.balance || 0)}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {hasTokens ? <span className="text-yellow-600">💎 {Math.round((credits?.multiplier || 1) * 100)}% {t('multiplier')}</span> : <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('buyToEarnCredits')}</a>}
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl md:rounded-2xl p-3 md:p-6 text-white">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <span className="text-white/80 text-xs md:text-sm">{t('dailyCredit')}</span>
            <Zap className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <p className="text-lg md:text-3xl font-bold">{formatUSD(credits?.daily || 0)}</p>
          <p className="text-xs md:text-sm text-white/80 mt-1">{hasTokens ? `💎 ${t('diamondHand')}` : t('holdToEarn')}</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <span className="text-gray-500 text-xs md:text-sm">{t('usedToday')}</span>
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
          </div>
          <p className="text-lg md:text-3xl font-bold text-gray-900">{formatUSD(credits?.used || 0)}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">{t('ofDaily', { amount: formatUSD(credits?.daily || 0) })}</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <span className="text-gray-500 text-xs md:text-sm">{t('remaining')}</span>
            <Clock className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
          </div>
          <p className="text-lg md:text-3xl font-bold text-green-600">{formatUSD(credits?.remaining || 0)}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">{t('resetsAtMidnight')}</p>
        </div>
      </div>

      {/* No tokens message */}
      {!hasTokens && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-blue-600" />
            <div className="flex-grow">
              <p className="font-semibold text-blue-800">{t('noTokens')}</p>
              <p className="text-sm text-blue-700">{t('buyToUnlock')}</p>
            </div>
            <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t('buyFuel')}
            </a>
          </div>
        </div>
      )}

      {/* API Key Section */}
      {hasTokens && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('yourApiKey')}</h2>
                  <p className="text-sm text-gray-500">{t('endpoint')}: https://api.aifuel.fun/v1</p>
                </div>
              </div>
              <button onClick={generateApiKey} disabled={regenerating} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} /> {t('regenerate')}
              </button>
            </div>
          </div>

          <div className="p-6">
            {fullApiKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col gap-3">
                    <code className="text-sm font-mono text-gray-900 break-all word-break">{fullApiKey}</code>
                    <button onClick={() => copyToClipboard(fullApiKey, 'apikey')} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm">
                      {copiedKey === 'apikey' ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">{t('copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>{t('copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">{t('apiKeyWarning')}</p>
                </div>
              </div>
            ) : apiKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <code className="text-sm font-mono text-gray-700 break-all">{apiKey.prefix}</code>
                      <span className="text-xs text-gray-500">Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => copyToClipboard(apiKey.prefix, 'apikey')} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm">
                      {copiedKey === 'apikey' ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">{t('copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>{t('copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">{t('apiKeyRegenNote')}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 text-gray-300 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">{t('generatingKey')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Start - Desktop only */}
      {(fullApiKey || apiKey) && hasTokens && (
        <div className="hidden md:block mt-8 bg-gray-50 rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickStart')}</h3>
          <div className="bg-gray-900 text-green-400 p-3 md:p-4 rounded-lg overflow-x-auto text-xs md:text-sm">
            <pre className="font-mono whitespace-pre-wrap md:whitespace-pre">
{`curl https://api.aifuel.fun/v1/chat/completions \\
  -H "Authorization: Bearer ${fullApiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}