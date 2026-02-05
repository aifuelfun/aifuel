'use client'

import { useEffect, useState, useCallback } from 'react'
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
import { TOKEN_CA, CIRCULATING_SUPPLY, DAILY_CREDIT_POOL } from '@/lib/constants'
import { useLocale } from '@/lib/LocaleContext'
import {
  getAuthToken,
  getNonce,
  connectWallet,
  getCredits,
  getApiKey,
  createApiKey,
  disconnectApi,
  CreditsResponse,
} from '@/lib/api'

interface ApiKeyState {
  prefix: string
  createdAt: string
}

// v3.0.0 - 2026-02-06 Backend Integration
export default function Dashboard() {
  const { connected, publicKey, signMessage, disconnect } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const { t } = useLocale()
  
  const [credits, setCredits] = useState<CreditsResponse | null>(null)
  const [apiKey, setApiKey] = useState<ApiKeyState | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authenticating, setAuthenticating] = useState(false)

  // Calculate daily credit based on holding (for immediate display before API response)
  const calculateCredit = useCallback((balance: number, multiplier: number = 1.0) => {
    if (balance <= 0) return 0
    const share = balance / CIRCULATING_SUPPLY
    return share * DAILY_CREDIT_POOL * multiplier
  }, [])

  // Fetch real token balance from chain using ATA address
  const fetchTokenBalance = useCallback(async () => {
    if (!publicKey || !connection) {
      console.log('[DEBUG] No publicKey or connection')
      return 0
    }
    
    try {
      setLoadingBalance(true)
      console.log('[DEBUG] Fetching balance for wallet:', publicKey.toBase58())
      console.log('[DEBUG] Token mint:', TOKEN_CA)
      
      // Import getAssociatedTokenAddressSync to compute ATA
      const { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = await import('@solana/spl-token')
      
      const tokenMint = new PublicKey(TOKEN_CA)
      
      // Compute the Associated Token Account address
      const ataAddress = getAssociatedTokenAddressSync(
        tokenMint,
        publicKey,
        false, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
      
      console.log('[DEBUG] ATA address:', ataAddress.toBase58())
      
      // Use getTokenAccountBalance which is allowed on public RPCs
      try {
        const balanceInfo = await connection.getTokenAccountBalance(ataAddress)
        console.log('[DEBUG] Balance info:', JSON.stringify(balanceInfo.value))
        return balanceInfo.value.uiAmount || 0
      } catch (ataErr: unknown) {
        // ATA doesn't exist = 0 balance
        const errMsg = ataErr instanceof Error ? ataErr.message : String(ataErr)
        if (errMsg.includes('could not find account') || errMsg.includes('Invalid param')) {
          console.log('[DEBUG] No ATA found, balance is 0')
          return 0
        }
        throw ataErr
      }
    } catch (err) {
      console.error('[DEBUG] Error fetching token balance:', err)
      return 0
    } finally {
      setLoadingBalance(false)
    }
  }, [publicKey, connection])

  // Authenticate with backend using wallet signature
  const authenticateWithBackend = useCallback(async () => {
    if (!publicKey || !signMessage) return false
    
    try {
      setAuthenticating(true)
      setError(null)
      
      const walletAddress = publicKey.toBase58()
      
      // Get nonce from backend
      const { message } = await getNonce(walletAddress)
      
      // Sign the message
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = bs58.encode(signatureBytes)
      
      // Connect to backend
      await connectWallet(walletAddress, signature, message)
      
      return true
    } catch (err) {
      console.error('Authentication error:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
      return false
    } finally {
      setAuthenticating(false)
    }
  }, [publicKey, signMessage])

  // Load data from backend
  const loadBackendData = useCallback(async () => {
    try {
      // Load credits
      const creditsData = await getCredits()
      setCredits(creditsData)
      
      // Load API key
      const keyData = await getApiKey()
      if (keyData.key) {
        setApiKey({
          prefix: keyData.key.prefix,
          createdAt: keyData.key.createdAt,
        })
      } else {
        setApiKey(null)
      }
      
      return true
    } catch (err) {
      console.error('Failed to load backend data:', err)
      return false
    }
  }, [])

  // Main load effect
  useEffect(() => {
    const loadData = async () => {
      if (!connected || !publicKey) {
        setLoading(false)
        return
      }
      
      try {
        // Check if already authenticated
        const token = getAuthToken()
        
        if (!token) {
          // Need to authenticate first
          // For now, get balance from chain and show it
          const balance = await fetchTokenBalance()
          setCredits({
            balance,
            daily: calculateCredit(balance, 1.0),
            used: 0,
            remaining: calculateCredit(balance, 1.0),
            multiplier: 1.0,
            isDiamondHands: true,
            resetsAt: new Date().toISOString(),
          })
          setLoading(false)
          return
        }
        
        // Already authenticated, load from backend
        const success = await loadBackendData()
        
        if (!success) {
          // Token might be expired, clear it
          disconnectApi()
          // Fall back to chain data
          const balance = await fetchTokenBalance()
          setCredits({
            balance,
            daily: calculateCredit(balance, 1.0),
            used: 0,
            remaining: calculateCredit(balance, 1.0),
            multiplier: 1.0,
            isDiamondHands: true,
            resetsAt: new Date().toISOString(),
          })
        }
        
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load wallet data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [connected, publicKey, fetchTokenBalance, calculateCredit, loadBackendData])

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

  // Authenticate and generate API key
  const handleGenerateKey = async () => {
    if (!signMessage) {
      setError('Please use a wallet that supports message signing')
      return
    }
    
    setRegenerating(true)
    setError(null)
    
    try {
      // Ensure authenticated
      let token = getAuthToken()
      
      if (!token) {
        const success = await authenticateWithBackend()
        if (!success) {
          setRegenerating(false)
          return
        }
      }
      
      // Create new API key
      const result = await createApiKey()
      
      setApiKey({
        prefix: result.prefix,
        createdAt: result.createdAt,
      })
      setShowNewKey(result.key)
      
      // Reload credits from backend
      await loadBackendData()
      
    } catch (err) {
      console.error('Failed to generate key:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate API key')
    } finally {
      setRegenerating(false)
    }
  }

  const refreshBalance = async () => {
    const balance = await fetchTokenBalance()
    if (credits) {
      setCredits({
        ...credits,
        balance,
        daily: calculateCredit(balance, credits.multiplier),
        remaining: Math.max(0, calculateCredit(balance, credits.multiplier) - credits.used),
      })
    }
  }

  const handleDisconnect = async () => {
    disconnectApi()
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
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header - Wallet Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Wallet Address */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
              <img src="/logo.webp" alt="AIFuel" className="w-10 h-10 object-contain" />
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

      {/* API Key Section - Only show if user has $FUEL tokens */}
      {credits && credits.balance > 0 && (
        <>
          {/* New Key Created Alert */}
          {showNewKey && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-grow">
                  <p className="font-semibold text-green-800">API Key Created!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Copy this key now. You won&apos;t be able to see it again.
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
                    I&apos;ve copied my key
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
                {apiKey && (
                  <button
                    onClick={handleGenerateKey}
                    disabled={regenerating || authenticating}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {!apiKey ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {getAuthToken() 
                      ? "You don't have an API key yet. Generate one to start using the API."
                      : "Sign a message to authenticate and generate your API key."
                    }
                  </p>
                  <button
                    onClick={handleGenerateKey}
                    disabled={regenerating || authenticating}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                  >
                    {authenticating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : regenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        {getAuthToken() ? 'Generate API Key' : 'Sign & Generate Key'}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono text-gray-700">{apiKey.prefix}</code>
                    </div>
                    <span className="text-xs text-gray-500">
                      Created {new Date(apiKey.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      ⚠️ Regenerating will invalidate your current key. Any applications using the old key will stop working.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Usage Info */}
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
        </>
      )}
    </div>
  )
}
