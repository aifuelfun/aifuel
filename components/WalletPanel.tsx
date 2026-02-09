'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Copy, Check, RefreshCw, LogOut, Key, Flame, Zap, TrendingUp, Clock, Diamond, ExternalLink, AlertTriangle } from 'lucide-react'
import { useLocale } from '@/lib/LocaleContext'
import { API_BASE_URL, TOKEN_CA } from '@/lib/constants'
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

  // Authenticate
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!publicKey || !signMessage) return false
    
    const wallet = publicKey.toBase58()
    if (authAttemptedRef.current === wallet) return false
    authAttemptedRef.current = wallet
    
    const storedWallet = getStoredWallet()
    if (storedWallet && storedWallet !== wallet) {
      clearAllData()
    }
    
    if (getToken() && storedWallet === wallet) {
      return true
    }
    
    try {
      const { message } = await apiCall('/v1/auth/nonce', {
        method: 'POST',
        body: JSON.stringify({ wallet }),
      })
      
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = bs58.encode(signatureBytes)
      
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
      setStoredApiKey(data.key) // Persist locally!
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate key')
    } finally {
      setRegenerating(false)
    }
  }, [])

  // Init
  useEffect(() => {
    const init = async () => {
      if (!connected || !publicKey) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      setError(null)
      
      const authOk = await authenticate()
      if (!authOk) {
        setLoading(false)
        return
      }
      
      await Promise.all([loadCredits(), loadApiKey()])
      
      // Check local storage for FULL key
      const storedKey = getStoredApiKey()
      if (storedKey) {
        setFullApiKey(storedKey)
      } else {
        // If we don't have it, we don't have it. User must regen.
      }
      
      setLoading(false)
    }
    
    init()
  }, [connected, publicKey, authenticate, loadCredits, loadApiKey])

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
    window.location.reload()
  }

  if (!connected) return null

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center animate-pulse">
        <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">{t('walletLoading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card border-red-500/30 bg-red-900/10 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 text-red-500" />
          <p className="text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
        </div>
      </div>
    )
  }

  const address = publicKey?.toBase58() || ''
  const hasTokens = credits && credits.balance > 0

  return (
    <div className="space-y-6">
      {/* Wallet Info Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white/10 border border-white/10 shrink-0">
              <img src="/logo.webp" alt="AIFuel" className="w-8 h-8 object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('connectedWallet')}</span>
                {credits?.isDiamondHands && hasTokens && (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Diamond className="h-3 w-3" /> {t('diamondHand')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-lg font-mono font-bold text-white truncate">
                  {shortenAddress(address, 6)}
                </code>
                <button onClick={() => copyToClipboard(address, 'wallet')} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  {copiedKey === 'wallet' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-500" />}
                </button>
                <a href={`https://solscan.io/account/${address}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </a>
              </div>
            </div>
          </div>
          <button onClick={handleDisconnect} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all text-sm font-medium">
            <LogOut className="h-4 w-4" /> {t('disconnect')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          label={t('fuelHolding')} 
          value={formatNumber(credits?.balance || 0)} 
          sub={hasTokens ? `💎 +${Math.round((credits?.multiplier || 1) * 100 - 100)}% Bonus` : t('buyToEarnCredits')}
          action={<button onClick={refreshBalance} disabled={loadingBalance}><RefreshCw className={`h-3 w-3 ${loadingBalance ? 'animate-spin' : ''}`} /></button>}
        />
        
        <StatCard 
          label={t('dailyCredit')} 
          value={formatUSD(credits?.daily || 0)} 
          sub={t('dailyCreditDesc')}
          highlight 
          icon={<Zap className="h-4 w-4" />}
        />
        
        <StatCard 
          label={t('usedToday')} 
          value={formatUSD(credits?.used || 0)} 
          sub={t('ofDaily', { amount: formatUSD(credits?.daily || 0) })} 
          icon={<TrendingUp className="h-4 w-4 text-blue-400" />}
        />
        
        <StatCard 
          label={t('remaining')} 
          value={formatUSD(credits?.remaining || 0)} 
          sub={t('resetsAtMidnight')} 
          valueColor="text-green-400"
          icon={<Clock className="h-4 w-4 text-green-400" />}
        />
      </div>

      {/* No tokens Warning */}
      {!hasTokens && (
        <div className="glass-card bg-blue-500/10 border-blue-500/20 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-full shrink-0">
            <Flame className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <p className="font-bold text-blue-100">{t('noTokens')}</p>
            <p className="text-sm text-blue-300/80">{t('buyToUnlock')}</p>
          </div>
          <a href={`https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 w-full md:w-auto text-center">
            {t('buyFuel')}
          </a>
        </div>
      )}

      {/* API Key Section - REDESIGNED */}
      {hasTokens && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Key className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t('yourApiKey')}</h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">https://api.aifuel.fun/v1</p>
                </div>
              </div>
              <button 
                onClick={generateApiKey} 
                disabled={regenerating} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all text-sm font-medium w-full md:w-auto justify-center"
              >
                <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} /> 
                {t('regenerate')}
              </button>
            </div>
          </div>

          <div className="p-6 bg-black/20">
            {fullApiKey ? (
              // Case 1: Full Key Available
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-purple-500/5 rounded-xl blur-lg group-hover:bg-purple-500/10 transition-colors"></div>
                  <div className="relative bg-[#0a0a0f] border border-purple-500/30 rounded-xl p-4 flex flex-col gap-3">
                    <label className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Secret Key</label>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 font-mono text-sm md:text-base text-white break-all">{fullApiKey}</code>
                      <button 
                        onClick={() => copyToClipboard(fullApiKey, 'apikey')} 
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors shrink-0"
                      >
                        {copiedKey === 'apikey' ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-amber-400/80 bg-amber-900/10 p-3 rounded-lg border border-amber-900/30">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">{t('apiKeyWarning')}</p>
                </div>
              </div>
            ) : apiKey ? (
              // Case 2: Only Prefix Available
              <div className="space-y-4">
                <div className="bg-[#0a0a0f]/50 border border-white/10 rounded-xl p-4 flex flex-col gap-3 opacity-70">
                   <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Partial Key (Hidden)</label>
                   <div className="flex items-center gap-3">
                     <code className="flex-1 font-mono text-sm text-gray-400 break-all">{apiKey.prefix}...******</code>
                     <button disabled className="p-2 bg-white/5 rounded-lg text-gray-600 cursor-not-allowed">
                       <Copy className="h-5 w-5" />
                     </button>
                   </div>
                </div>
                <div className="flex items-start gap-2 text-rose-400/80 bg-rose-900/10 p-3 rounded-lg border border-rose-900/30">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    {t('hiddenKeyWarning') || "For your security, we don't store your full key. Click 'Regenerate' to get a new one."}
                  </p>
                </div>
              </div>
            ) : (
              // Case 3: Loading / No Key
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 text-gray-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500 text-sm">Generating secure key...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Start Code Snippet - Only if full key available */}
      {fullApiKey && hasTokens && (
        <div className="glass-card rounded-xl p-6 hidden md:block">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t('quickStart')}</h3>
          <div className="bg-[#050508] p-4 rounded-lg border border-white/10 overflow-x-auto relative group">
             <button 
                onClick={() => copyToClipboard(`curl https://api.aifuel.fun/v1/chat/completions ...`, 'curl')} 
                className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
             >
                <Copy className="h-3 w-3" />
             </button>
             <pre className="font-mono text-sm text-gray-300 leading-relaxed">
{`curl https://api.aifuel.fun/v1/chat/completions \\
  -H "Authorization: Bearer ${fullApiKey}" \\
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

function StatCard({ label, value, sub, highlight = false, valueColor = "text-white", icon, action }: any) {
  return (
    <div className={`glass-card rounded-xl p-4 md:p-5 flex flex-col justify-between min-h-[120px] ${highlight ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        {icon && <div className={`p-1.5 rounded-md ${highlight ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`}>{icon}</div>}
        {action && <div className="text-gray-400 hover:text-white transition-colors">{action}</div>}
      </div>
      <div>
        <div className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${valueColor}`}>{value}</div>
        <div className={`text-xs mt-1 ${highlight ? 'text-purple-200' : 'text-gray-500'}`}>{sub}</div>
      </div>
    </div>
  )
}
