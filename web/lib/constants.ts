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

// Social Links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/aifuel_fun',
  discord: 'https://discord.gg/aifuel',
  telegram: 'https://t.me/aifuel_fun',
  github: 'https://github.com/aifuel-fun',
  docs: 'https://docs.aifuel.fun',
} as const
