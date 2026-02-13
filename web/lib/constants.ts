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

// ─── AIFuel Curated Model List (109 Models) ─────────────────────────
// Sourced from OpenRouter & Tavily (2026-02-10)
// Includes Future/Preview models for AIFuel "Future Access" feature
export const MODELS: Model[] = [

  // ── OpenAI (GPT-5 & o3 Series) ─────────────────────────────────────
  // GPT-5.2 Series (Latest)
  { id: 'openai/gpt-5.2-pro', name: 'GPT-5.2 Pro', provider: 'OpenAI', inputPrice: 21.00, outputPrice: 168.00, context: '400K', tier: 'premium', tag: 'new' },
  { id: 'openai/gpt-5.2-codex', name: 'GPT-5.2 Codex', provider: 'OpenAI', inputPrice: 1.75, outputPrice: 14.00, context: '400K', tier: 'premium', tag: 'new' },
  { id: 'openai/gpt-5.2-chat', name: 'GPT-5.2 Chat', provider: 'OpenAI', inputPrice: 1.75, outputPrice: 14.00, context: '128K', tier: 'premium' },
  { id: 'openai/gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI', inputPrice: 1.75, outputPrice: 14.00, context: '400K', tier: 'premium' },
  // GPT-5.1 Series
  { id: 'openai/gpt-5.1-codex-max', name: 'GPT-5.1 Codex Max', provider: 'OpenAI', inputPrice: 1.25, outputPrice: 10.00, context: '400K', tier: 'premium' },
  { id: 'openai/gpt-5.1-codex', name: 'GPT-5.1 Codex', provider: 'OpenAI', inputPrice: 1.25, outputPrice: 10.00, context: '400K', tier: 'premium' },
  { id: 'openai/gpt-5.1-chat', name: 'GPT-5.1 Chat', provider: 'OpenAI', inputPrice: 1.25, outputPrice: 10.00, context: '128K', tier: 'premium' },
  { id: 'openai/gpt-5.1', name: 'GPT-5.1', provider: 'OpenAI', inputPrice: 1.25, outputPrice: 10.00, context: '400K', tier: 'premium' },
  // GPT-5 Base Series
  { id: 'openai/gpt-5-pro', name: 'GPT-5 Pro', provider: 'OpenAI', inputPrice: 15.00, outputPrice: 120.00, context: '400K', tier: 'premium', tag: 'hot' },
  { id: 'openai/gpt-5-image', name: 'GPT-5 Image', provider: 'OpenAI', inputPrice: 10.00, outputPrice: 10.00, context: '400K', tier: 'premium' },
  { id: 'openai/gpt-5-codex', name: 'GPT-5 Codex', provider: 'OpenAI', inputPrice: 1.25, outputPrice: 10.00, context: '400K', tier: 'premium' },
  { id: 'openai/gpt-5-chat', name: 'GPT-5 Chat', provider: 'OpenAI', inputPrice: 1.25, outputPrice: 10.00, context: '128K', tier: 'premium' },
  { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI', inputPrice: 1.25, outputPrice: 10.00, context: '400K', tier: 'premium', tag: 'hot' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', inputPrice: 0.25, outputPrice: 2.00, context: '400K', tier: 'standard' },
  { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI', inputPrice: 0.05, outputPrice: 0.40, context: '400K', tier: 'budget' },
  // o3 Series (Reasoning)
  { id: 'openai/o3-pro', name: 'o3 Pro', provider: 'OpenAI', inputPrice: 20.00, outputPrice: 80.00, context: '200K', tier: 'premium', tag: 'reasoning' },
  { id: 'openai/o3-deep-research', name: 'o3 Deep Research', provider: 'OpenAI', inputPrice: 10.00, outputPrice: 40.00, context: '200K', tier: 'premium', tag: 'reasoning' },
  { id: 'openai/o3', name: 'o3', provider: 'OpenAI', inputPrice: 2.00, outputPrice: 8.00, context: '200K', tier: 'premium', tag: 'reasoning' },
  { id: 'openai/o3-mini-high', name: 'o3-mini High', provider: 'OpenAI', inputPrice: 1.10, outputPrice: 4.40, context: '200K', tier: 'standard', tag: 'reasoning' },
  { id: 'openai/o3-mini', name: 'o3-mini', provider: 'OpenAI', inputPrice: 1.10, outputPrice: 4.40, context: '200K', tier: 'standard', tag: 'hot' },
  { id: 'openai/o1-pro', name: 'o1 Pro', provider: 'OpenAI', inputPrice: 150.00, outputPrice: 600.00, context: '200K', tier: 'premium' },
  { id: 'openai/o1', name: 'o1', provider: 'OpenAI', inputPrice: 15.00, outputPrice: 60.00, context: '128K', tier: 'premium' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (2025)', provider: 'OpenAI', inputPrice: 2.50, outputPrice: 10.00, context: '128K', tier: 'premium', tag: 'hot' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', inputPrice: 0.15, outputPrice: 0.60, context: '128K', tier: 'budget', tag: 'hot' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', inputPrice: 10.00, outputPrice: 30.00, context: '128K', tier: 'premium' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', inputPrice: 0.50, outputPrice: 1.50, context: '16K', tier: 'budget' },

  // ── Anthropic (Claude Family) ─────────────────────────────────────
  { id: 'anthropic/claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'Anthropic', inputPrice: 5.00, outputPrice: 25.00, context: '1M', tier: 'premium', tag: 'new' },
  { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', inputPrice: 5.00, outputPrice: 25.00, context: '200K', tier: 'premium', tag: 'new' },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', inputPrice: 3.00, outputPrice: 15.00, context: '1M', tier: 'premium', tag: 'hot' },
  { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', inputPrice: 3.00, outputPrice: 15.00, context: '200K', tier: 'premium' },
  { id: 'anthropic/claude-3.7-sonnet:thinking', name: 'Claude 3.7 (Thinking)', provider: 'Anthropic', inputPrice: 3.00, outputPrice: 15.00, context: '200K', tier: 'premium', tag: 'reasoning' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPrice: 3.00, outputPrice: 15.00, context: '200K', tier: 'standard', tag: 'hot' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', inputPrice: 0.25, outputPrice: 1.25, context: '200K', tier: 'budget' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', inputPrice: 15.00, outputPrice: 75.00, context: '200K', tier: 'premium' },

  // ── Google (Gemini) ───────────────────────────────────────────────
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', provider: 'Google', inputPrice: 2.00, outputPrice: 12.00, context: '1M', tier: 'premium', tag: 'new' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', provider: 'Google', inputPrice: 0.50, outputPrice: 3.00, context: '1M', tier: 'standard' },
  { id: 'google/gemini-2.0-flash-thinking-exp', name: 'Gemini 2.0 Thinking', provider: 'Google', inputPrice: 0.00, outputPrice: 0.00, context: '1M', tier: 'budget', tag: 'reasoning' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', provider: 'Google', inputPrice: 3.50, outputPrice: 10.50, context: '2M', tier: 'standard' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash', provider: 'Google', inputPrice: 0.075, outputPrice: 0.30, context: '1M', tier: 'budget', tag: 'hot' },

  // ── xAI (Grok) ────────────────────────────────────────────────────
  { id: 'x-ai/grok-4', name: 'Grok 4', provider: 'xAI', inputPrice: 3.00, outputPrice: 15.00, context: '256K', tier: 'premium', tag: 'new' },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', provider: 'xAI', inputPrice: 0.20, outputPrice: 0.50, context: '2M', tier: 'standard' },
  { id: 'x-ai/grok-3', name: 'Grok 3', provider: 'xAI', inputPrice: 3.00, outputPrice: 15.00, context: '128K', tier: 'premium' },
  { id: 'x-ai/grok-2', name: 'Grok 2', provider: 'xAI', inputPrice: 5.00, outputPrice: 10.00, context: '128K', tier: 'standard' },
  { id: 'x-ai/grok-2-mini', name: 'Grok 2 Mini', provider: 'xAI', inputPrice: 2.00, outputPrice: 5.00, context: '128K', tier: 'budget' },

  // ── DeepSeek (The Disruptor) ──────────────────────────────────────
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', inputPrice: 0.55, outputPrice: 2.19, context: '64K', tier: 'budget', tag: 'reasoning' },
  { id: 'deepseek/deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 (Llama 70B)', provider: 'DeepSeek', inputPrice: 0.23, outputPrice: 0.40, context: '128K', tier: 'budget', tag: 'hot' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', inputPrice: 0.14, outputPrice: 0.28, context: '64K', tier: 'budget', tag: 'hot' },
  { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder V2', provider: 'DeepSeek', inputPrice: 0.14, outputPrice: 0.28, context: '128K', tier: 'budget' },

  // ── Meta (Llama 4 & 3+) ───────────────────────────────────────────────
  // ── Qwen (Alibaba) ────────────────────────────────────────────────
  // Qwen3 Series (Latest)
  { id: 'qwen/qwen3-max', name: 'Qwen3 Max', provider: 'Qwen', inputPrice: 1.20, outputPrice: 6.00, context: '262K', tier: 'standard', tag: 'new' },
  { id: 'qwen/qwen3-max-thinking', name: 'Qwen3 Max Thinking', provider: 'Qwen', inputPrice: 1.20, outputPrice: 6.00, context: '262K', tier: 'standard', tag: 'reasoning' },
  { id: 'qwen/qwen3-coder', name: 'Qwen3 Coder 480B', provider: 'Qwen', inputPrice: 0.22, outputPrice: 1.00, context: '262K', tier: 'standard', tag: 'new' },
  { id: 'qwen/qwen3-coder-plus', name: 'Qwen3 Coder Plus', provider: 'Qwen', inputPrice: 1.00, outputPrice: 5.00, context: '1M', tier: 'standard' },
  { id: 'qwen/qwen3-coder-flash', name: 'Qwen3 Coder Flash', provider: 'Qwen', inputPrice: 0.30, outputPrice: 1.50, context: '1M', tier: 'budget' },
  { id: 'qwen/qwen3-235b-a22b', name: 'Qwen3 235B', provider: 'Qwen', inputPrice: 0.22, outputPrice: 0.88, context: '131K', tier: 'budget' },
  { id: 'qwen/qwen3-32b', name: 'Qwen3 32B', provider: 'Qwen', inputPrice: 0.08, outputPrice: 0.24, context: '41K', tier: 'budget' },
  { id: 'qwen/qwen3-8b', name: 'Qwen3 8B', provider: 'Qwen', inputPrice: 0.05, outputPrice: 0.40, context: '32K', tier: 'budget' },
  // Qwen2.5 Series
  { id: 'qwen/qwen-max', name: 'Qwen Max', provider: 'Qwen', inputPrice: 1.60, outputPrice: 6.40, context: '32K', tier: 'standard' },
  { id: 'qwen/qwen-plus', name: 'Qwen Plus', provider: 'Qwen', inputPrice: 0.40, outputPrice: 1.20, context: '1M', tier: 'budget' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Qwen', inputPrice: 0.12, outputPrice: 0.39, context: '32K', tier: 'budget', tag: 'hot' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B', provider: 'Qwen', inputPrice: 0.03, outputPrice: 0.11, context: '32K', tier: 'budget' },
  { id: 'qwen/qwq-32b', name: 'QwQ 32B (Reasoning)', provider: 'Qwen', inputPrice: 0.15, outputPrice: 0.40, context: '32K', tier: 'budget', tag: 'reasoning' },
  { id: 'qwen/qwen-vl-plus', name: 'Qwen VL Plus', provider: 'Qwen', inputPrice: 0.21, outputPrice: 0.63, context: '131K', tier: 'budget' },

  // ── Mistral (Europe's Finest) ─────────────────────────────────────
  // ── Perplexity (Online Models) ────────────────────────────────────
  // ── Cohere (RAG Specialists) ──────────────────────────────────────
  // ── Microsoft & Phi ───────────────────────────────────────────────
  // ── 01.AI (China) ─────────────────────────────────────────────────
  // ── AI21 (Jamba) ──────────────────────────────────────────────────
  // ── Amazon (Nova) ─────────────────────────────────────────────────
  // ── Databricks (DBRX) ────────��────────────────────────────────────
  // ── Nvidia (Nemotron) ─────────────────────────────────────────────
  // ── Liquid (LFM) ──────────────────────────────────────────────────

  // ── Gryphe (Roleplay) ─────────────────────────────────────────────
  // ── Pygmalion (Roleplay) ──────────────────────────────────────────
  // ── Nous Research (Hermes) ────────────────────────────────────────
  // ── Cognitive Computations (Dolphin) ──────────────────────────────
  // ── Moonshot (Kimi) ───────────────────────────────────────────────
  { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5', provider: 'Moonshot', inputPrice: 0.45, outputPrice: 2.25, context: '256K', tier: 'premium', tag: 'new' },
  { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'Moonshot', inputPrice: 0.40, outputPrice: 2.00, context: '256K', tier: 'standard' },
  { id: 'moonshotai/kimi-k2', name: 'Kimi K2', provider: 'Moonshot', inputPrice: 0.50, outputPrice: 2.50, context: '128K', tier: 'standard' },

  // ── MiniMax ───────────────────────────────────────────────────────
  { id: 'minimax/minimax-m2.5', name: 'MiniMax M2.5', provider: 'MiniMax', inputPrice: 0.30, outputPrice: 1.10, context: '1M', tier: 'premium', tag: 'new' },
  { id: 'minimax/minimax-m2-her', name: 'MiniMax M2-her', provider: 'MiniMax', inputPrice: 0.30, outputPrice: 1.20, context: '66K', tier: 'standard' },
  { id: 'minimax/minimax-m1', name: 'MiniMax M1', provider: 'MiniMax', inputPrice: 0.40, outputPrice: 2.20, context: '1M', tier: 'standard' },

  // ── ByteDance (DeepSeek/Doubao Competitors) ───────────────────────
  // ── Xiaomi ────────────────────────────────────────────────────────
  // ── Z.AI (GLM Series) ─────────────────────────────────────────────
  { id: 'z-ai/glm-5', name: 'GLM-5', provider: 'Z.AI', inputPrice: 1.00, outputPrice: 3.20, context: '203K', tier: 'premium', tag: 'new' },
  { id: 'z-ai/glm-4.7-flash', name: 'GLM 4.7 Flash', provider: 'Z.AI', inputPrice: 0.06, outputPrice: 0.40, context: '203K', tier: 'budget', tag: 'hot' },
  { id: 'z-ai/glm-4.7', name: 'GLM 4.7', provider: 'Z.AI', inputPrice: 0.40, outputPrice: 1.50, context: '203K', tier: 'standard' },
  
  // ── Writer ────────────────────────────────────────────────────────
  // ── Inflection (Pi) ───────────────────────────────────────────────
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
    description: 'Access GPT-5 Pro, Claude Opus 4.6, Grok 4, Gemini 3 Pro and more through a single API.',
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
  telegram: 'https://t.me/+uIe6a-S5vntiZTMx',
  github: 'https://github.com/aifuelfun/aifuel',
  docs: 'https://docs.aifuel.fun',
} as const
