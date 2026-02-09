// Supported Models (Source of Truth)
export interface Model {
  id: string
  name: string
  provider: string
  inputPrice: number   // per 1M tokens
  outputPrice: number  // per 1M tokens
  context: string
  tier: 'premium' | 'standard' | 'budget'
}

export const MODELS: Model[] = [
  // OpenAI
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputPrice: 2.50, outputPrice: 10.00, context: '128K', tier: 'premium' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', inputPrice: 0.15, outputPrice: 0.60, context: '128K', tier: 'budget' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', inputPrice: 10.00, outputPrice: 30.00, context: '128K', tier: 'premium' },
  { id: 'openai/o1', name: 'o1', provider: 'OpenAI', inputPrice: 15.00, outputPrice: 60.00, context: '200K', tier: 'premium' },
  { id: 'openai/o1-mini', name: 'o1 Mini', provider: 'OpenAI', inputPrice: 3.00, outputPrice: 12.00, context: '128K', tier: 'standard' },

  // Anthropic
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPrice: 3.00, outputPrice: 15.00, context: '200K', tier: 'premium' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', inputPrice: 15.00, outputPrice: 75.00, context: '200K', tier: 'premium' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', inputPrice: 0.25, outputPrice: 1.25, context: '200K', tier: 'budget' },

  // Google
  { id: 'google/gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro', provider: 'Google', inputPrice: 0, outputPrice: 0, context: '2M', tier: 'budget' },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', inputPrice: 1.25, outputPrice: 5.00, context: '2M', tier: 'standard' },

  // DeepSeek
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', inputPrice: 0.14, outputPrice: 0.28, context: '64K', tier: 'budget' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', inputPrice: 0.55, outputPrice: 2.19, context: '64K', tier: 'budget' },

  // Meta
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', inputPrice: 2.00, outputPrice: 2.00, context: '128K', tier: 'standard' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', inputPrice: 0.40, outputPrice: 0.40, context: '128K', tier: 'budget' },
  { id: 'meta-llama/llama-3.2-3b-instruct', name: 'Llama 3.2 3B', provider: 'Meta', inputPrice: 0.03, outputPrice: 0.05, context: '128K', tier: 'budget' },

  // Mistral
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', inputPrice: 2.00, outputPrice: 6.00, context: '128K', tier: 'standard' },
  { id: 'mistralai/mistral-medium', name: 'Mistral Medium', provider: 'Mistral', inputPrice: 2.75, outputPrice: 8.10, context: '32K', tier: 'standard' },

  // xAI
  { id: 'x-ai/grok-2-1212', name: 'Grok 2', provider: 'xAI', inputPrice: 2.00, outputPrice: 10.00, context: '128K', tier: 'standard' },

  // Qwen
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Qwen', inputPrice: 0.36, outputPrice: 0.36, context: '128K', tier: 'budget' },

  // Perplexity
  { id: 'perplexity/sonar-pro', name: 'Sonar Pro', provider: 'Perplexity', inputPrice: 3.00, outputPrice: 15.00, context: '200K', tier: 'standard' },
]

import { PublicKey } from '@solana/web3.js'

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aifuel.fun'

// Solana Configuration
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://solana-rpc.publicnode.com'
export const FUEL_TOKEN_MINT = process.env.NEXT_PUBLIC_TOKEN_MINT || '5h2Pox9vA4gVouSboG7bMfcubnGS3885eexMGsCFUEL'

// Credit Calculation
export const CREDITS_PER_TOKEN = 0.000001
export const MIN_HOLDING_FOR_API = 1000

// Features
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

// Token Contract Address
export const TOKEN_CA = '5h2Pox9vA4gVouSboG7bMfcubnGS3885eexMGsCFUEL'
export const TOTAL_SUPPLY = 1_000_000_000
export const CIRCULATING_SUPPLY = 200_000_000
export const DAILY_CREDIT_POOL = 1000

// Wallets
export const WALLETS = {
  treasury: { address: '6tCcCWnfk2snJV2X7oPW6eWf7DdeGuqDJowe7Hiod17N', name: 'Treasury', amount: '350M FUEL (35%)' },
  liquidity: { address: 'HcUupBo7871m17HDNvomuRi3j5hnHeBYr1MUiDnPRhGm', name: 'Liquidity', amount: '200M FUEL (20%)' },
  operations: { address: '9rGnJqhVJtHbMqqALLVJSPs1M8zQo7zyabEJZkgJTfV', name: 'Operations', amount: '180M FUEL (18%)' },
  marketing: { address: '7hvSPnQmTTUM8MPgFLgfA8Y13vSNzMwp8un7yaAtqxGc', name: 'Marketing', amount: '120M FUEL (12%)' },
  team: { address: '8P8nyfacU7cUjh4YpBkwzcGeDXHzQwbypKExXXiFUyet', name: 'Team (Locked)', amount: '150M FUEL (15%)' },
} as const

// Social Links
export const SOCIAL_LINKS = {
  twitter: 'https://x.com/aifuelfun',
  discord: 'https://discord.gg/dFc34GyU',
  telegram: 'https://t.me/aifuel_fun',
  github: 'https://github.com/aifuelfun/aifuel',
  docs: 'https://docs.aifuel.fun',
} as const
