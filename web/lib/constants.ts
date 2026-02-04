import { PublicKey } from '@solana/web3.js'

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Solana Configuration
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com'
export const FUEL_TOKEN_MINT = process.env.NEXT_PUBLIC_TOKEN_MINT || ''

// Credit Calculation Constants
export const CREDITS_PER_TOKEN = 0.000001 // $1 per 1M tokens roughly
export const MIN_HOLDING_FOR_API = 1000 // Minimum $FUEL to use API

// Features for landing page
export const FEATURES = [
  {
    icon: 'Zap',
    title: '200+ AI Models',
    description: 'Access GPT-4o, Claude, Gemini, DeepSeek and more through a single API endpoint.',
  },
  {
    icon: 'Shield',
    title: 'Hold, Don\'t Pay',
    description: 'Your tokens stay in your wallet. No subscriptions, no monthly fees, no credit cards.',
  },
  {
    icon: 'Coins',
    title: 'Transparent Credits',
    description: 'Daily credits based on your holdings. Formula is public, treasury is on-chain.',
  },
] as const

// Supported Models
export const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', tier: 'premium' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', tier: 'standard' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', tier: 'premium' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', tier: 'budget' },
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', tier: 'budget' },
  { id: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'DeepSeek', tier: 'standard' },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', tier: 'standard' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', tier: 'premium' },
] as const

// Token Contract Address
export const TOKEN_CA = '5h2Pox9vA4gVouSboG7bMfcubnGS3885eexMGsCFUEL'

// Token Distribution
export const TOTAL_SUPPLY = 1_000_000_000 // 1B FUEL
export const CIRCULATING_SUPPLY = 200_000_000 // 200M (liquidity pool)
export const DAILY_CREDIT_POOL = 1000 // $1000 worth of credits distributed daily

// Wallets (On-Chain Verification)
export const WALLETS = {
  treasury: {
    address: '6tCcCWnfk2snJV2X7oPW6eWf7DdeGuqDJowe7Hiod17N',
    name: 'Treasury',
    amount: '350M FUEL (35%)',
  },
  liquidity: {
    address: 'HcUupBo7871m17HDNvomuRi3j5hnHeBYr1MUiDnPRhGm',
    name: 'Liquidity',
    amount: '200M FUEL (20%)',
  },
  operations: {
    address: '9rGnJqhVJtHbMqqALLVJSPs1M8zQo7zyabEJZkgJTfV',
    name: 'Operations',
    amount: '180M FUEL (18%)',
  },
  marketing: {
    address: '7hvSPnQmTTUM8MPgFLgfA8Y13vSNzMwp8un7yaAtqxGc',
    name: 'Marketing',
    amount: '120M FUEL (12%)',
  },
  team: {
    address: '8P8nyfacU7cUjh4YpBkwzcGeDXHzQwbypKExXXiFUyet',
    name: 'Team (Locked)',
    amount: '150M FUEL (15%)',
  },
} as const

// Buy Links
export const BUY_LINKS = {
  raydium: `https://raydium.io/swap/?inputMint=sol&outputMint=${TOKEN_CA}`,
  jupiter: `https://jup.ag/swap/SOL-${TOKEN_CA}`,
  dextools: 'https://www.dextools.io/app/solana/pair-explorer/8LpVD1ie8UgsWxm5uw2DpP6oSVg9Hg6WmfNQsHbcgsLn',
  birdeye: `https://birdeye.so/token/${TOKEN_CA}?chain=solana`,
  gmgn: `https://gmgn.ai/sol/token/${TOKEN_CA}`,
} as const

// Social Links
export const SOCIAL_LINKS = {
  twitter: 'https://x.com/aifuelfun',
  discord: 'https://discord.gg/aifuel',
  telegram: 'https://t.me/aifuel_fun',
  github: 'https://github.com/aifuelfun/aifuel',
  docs: 'https://docs.aifuel.fun',
} as const
