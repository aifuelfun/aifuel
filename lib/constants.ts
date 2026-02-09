// ─── Model type ─────────────────────────────────────────────────────
export interface Model {
  id: string
  name: string
  provider: string
  inputPrice: number   // per 1M tokens
  outputPrice: number  // per 1M tokens
  context: string
  tier: 'premium' | 'standard' | 'budget'
  tag?: string         // 'new' | 'hot' | 'reasoning'
}

// ─── Curated Model List (NO free models) ────────────────────────────
// Prices per 1M tokens, sourced from OpenRouter (2026-02)
export const MODELS: Model[] = [

  // ── OpenAI ────────────────────────────────────────────────────────
  { id: 'openai/gpt-5.2-codex', name: 'GPT-5.2 Codex', provider: 'OpenAI', inputPrice: 1.75, outputPrice: 14.00, context: '400K', tier: 'premium', tag: 'new' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputPrice: 2.50, outputPrice: 10.00, context: '128K', tier: 'premium', tag: 'hot' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', inputPrice: 0.15, outputPrice: 0.60, context: '128K', tier: 'budget' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', inputPrice: 10.00, outputPrice: 30.00, context: '128K', tier: 'premium' },
  { id: 'openai/o1', name: 'o1', provider: 'OpenAI', inputPrice: 15.00, outputPrice: 60.00, context: '200K', tier: 'premium', tag: 'reasoning' },
  { id: 'openai/o1-mini', name: 'o1 Mini', provider: 'OpenAI', inputPrice: 3.00, outputPrice: 12.00, context: '128K', tier: 'standard' },
  { id: 'openai/gpt-audio', name: 'GPT Audio', provider: 'OpenAI', inputPrice: 2.50, outputPrice: 10.00, context: '128K', tier: 'premium', tag: 'new' },
  { id: 'openai/gpt-audio-mini', name: 'GPT Audio Mini', provider: 'OpenAI', inputPrice: 0.60, outputPrice: 2.40, context: '128K', tier: 'budget' },

  // ── Anthropic ─────────────────────────────────────────────────────
  { id: 'anthropic/claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'Anthropic', inputPrice: 5.00, outputPrice: 25.00, context: '1M', tier: 'premium', tag: 'new' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPrice: 3.00, outputPrice: 15.00, context: '200K', tier: 'premium', tag: 'hot' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', inputPrice: 15.00, outputPrice: 75.00, context: '200K', tier: 'premium' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', inputPrice: 0.25, outputPrice: 1.25, context: '200K', tier: 'budget' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', inputPrice: 0.80, outputPrice: 4.00, context: '200K', tier: 'standard' },

  // ── Google ────────────────────────────────────────────────────────
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', provider: 'Google', inputPrice: 0.50, outputPrice: 3.00, context: '1M', tier: 'standard', tag: 'new' },
  { id: 'google/gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro', provider: 'Google', inputPrice: 1.25, outputPrice: 10.00, context: '1M', tier: 'premium', tag: 'hot' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', inputPrice: 0.10, outputPrice: 0.40, context: '1M', tier: 'budget' },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', inputPrice: 1.25, outputPrice: 5.00, context: '2M', tier: 'standard' },

  // ── DeepSeek ──────────────────────────────────────────────────────
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', inputPrice: 0.14, outputPrice: 0.28, context: '64K', tier: 'budget', tag: 'hot' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', inputPrice: 0.55, outputPrice: 2.19, context: '64K', tier: 'budget', tag: 'reasoning' },

  // ── Meta (Llama) ──────────────────────────────────────────────────
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', inputPrice: 2.00, outputPrice: 2.00, context: '128K', tier: 'standard' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', inputPrice: 0.40, outputPrice: 0.40, context: '128K', tier: 'budget' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', inputPrice: 0.10, outputPrice: 0.10, context: '128K', tier: 'budget', tag: 'hot' },
  { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', inputPrice: 0.20, outputPrice: 0.60, context: '1M', tier: 'standard', tag: 'new' },

  // ── Mistral ───────────────────────────────────────────────────────
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', inputPrice: 2.00, outputPrice: 6.00, context: '128K', tier: 'standard' },
  { id: 'mistralai/mistral-medium', name: 'Mistral Medium', provider: 'Mistral', inputPrice: 2.75, outputPrice: 8.10, context: '32K', tier: 'standard' },
  { id: 'mistralai/mistral-small', name: 'Mistral Small', provider: 'Mistral', inputPrice: 0.10, outputPrice: 0.30, context: '32K', tier: 'budget' },
  { id: 'mistralai/mistral-small-creative', name: 'Mistral Small Creative', provider: 'Mistral', inputPrice: 0.10, outputPrice: 0.30, context: '32K', tier: 'budget', tag: 'new' },
  { id: 'mistralai/codestral', name: 'Codestral', provider: 'Mistral', inputPrice: 0.30, outputPrice: 0.90, context: '256K', tier: 'standard' },

  // ── xAI (Grok) ───────────────────────────────────────────────────
  { id: 'x-ai/grok-2-1212', name: 'Grok 2', provider: 'xAI', inputPrice: 2.00, outputPrice: 10.00, context: '128K', tier: 'standard' },
  { id: 'x-ai/grok-3', name: 'Grok 3', provider: 'xAI', inputPrice: 3.00, outputPrice: 15.00, context: '128K', tier: 'premium', tag: 'new' },
  { id: 'x-ai/grok-3-mini', name: 'Grok 3 Mini', provider: 'xAI', inputPrice: 0.30, outputPrice: 0.50, context: '128K', tier: 'budget', tag: 'reasoning' },

  // ── Qwen ──────────────────────────────────────────────────────────
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Qwen', inputPrice: 0.36, outputPrice: 0.36, context: '128K', tier: 'budget' },
  { id: 'qwen/qwen3-coder-next', name: 'Qwen3 Coder Next', provider: 'Qwen', inputPrice: 0.07, outputPrice: 0.30, context: '256K', tier: 'budget', tag: 'new' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B', provider: 'Qwen', inputPrice: 0.07, outputPrice: 0.16, context: '32K', tier: 'budget' },
  { id: 'qwen/qwq-32b', name: 'QwQ 32B', provider: 'Qwen', inputPrice: 0.20, outputPrice: 0.60, context: '128K', tier: 'budget', tag: 'reasoning' },

  // ── Perplexity ────────────────────────────────────────────────────
  { id: 'perplexity/sonar-pro', name: 'Sonar Pro', provider: 'Perplexity', inputPrice: 3.00, outputPrice: 15.00, context: '200K', tier: 'standard' },
  { id: 'perplexity/sonar', name: 'Sonar', provider: 'Perplexity', inputPrice: 1.00, outputPrice: 1.00, context: '128K', tier: 'budget' },

  // ── Cohere ────────────────────────────────────────────────────────
  { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere', inputPrice: 2.50, outputPrice: 10.00, context: '128K', tier: 'standard' },
  { id: 'cohere/command-r', name: 'Command R', provider: 'Cohere', inputPrice: 0.15, outputPrice: 0.60, context: '128K', tier: 'budget' },

  // ── Moonshot (Kimi) ───────────────────────────────────────────────
  { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5', provider: 'Moonshot', inputPrice: 0.45, outputPrice: 2.25, context: '256K', tier: 'standard', tag: 'new' },

  // ── MiniMax ───────────────────────────────────────────────────────
  { id: 'minimax/minimax-m2.1', name: 'MiniMax M2.1', provider: 'MiniMax', inputPrice: 0.27, outputPrice: 0.95, context: '196K', tier: 'budget', tag: 'new' },

  // ── ByteDance (Seed) ──────────────────────────────────────────────
  { id: 'bytedance-seed/seed-1.6', name: 'Seed 1.6', provider: 'ByteDance', inputPrice: 0.25, outputPrice: 2.00, context: '256K', tier: 'standard', tag: 'new' },
  { id: 'bytedance-seed/seed-1.6-flash', name: 'Seed 1.6 Flash', provider: 'ByteDance', inputPrice: 0.075, outputPrice: 0.30, context: '256K', tier: 'budget' },

  // ── Xiaomi (MiMo) ────────────────────────────────────────────────
  { id: 'xiaomi/mimo-v2-flash', name: 'MiMo V2 Flash', provider: 'Xiaomi', inputPrice: 0.09, outputPrice: 0.29, context: '256K', tier: 'budget', tag: 'new' },

  // ── Z.AI (GLM) ───────────────────────────────────────────────────
  { id: 'z-ai/glm-4.7', name: 'GLM 4.7', provider: 'Z.AI', inputPrice: 0.40, outputPrice: 1.50, context: '200K', tier: 'standard', tag: 'new' },
  { id: 'z-ai/glm-4.7-flash', name: 'GLM 4.7 Flash', provider: 'Z.AI', inputPrice: 0.06, outputPrice: 0.40, context: '200K', tier: 'budget' },

  // ── Writer ────────────────────────────────────────────────────────
  { id: 'writer/palmyra-x5', name: 'Palmyra X5', provider: 'Writer', inputPrice: 0.60, outputPrice: 6.00, context: '1M', tier: 'standard' },
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
