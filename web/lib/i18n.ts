export const translations = {
  en: {
    // Navbar
    features: 'Features',
    pricing: 'Pricing',
    docs: 'Docs',
    dashboard: 'Dashboard',
    
    // Hero
    nowOnSolana: 'Now on Solana',
    fuelYourAI: 'Fuel Your AI',
    heroDesc: 'Hold $FUEL tokens, get free access to 200+ AI models. No subscriptions. No credit cards.',
    buyFuel: 'Buy $FUEL',
    goToDashboard: 'Go to Dashboard',
    poolOpenAt: 'Pool Open At',
    
    // Stats
    aiModels: 'AI Models',
    monthlyFee: 'Monthly Fee',
    apiAccess: 'API Access',
    
    // Features
    whyAIFuel: 'Why AIFuel?',
    whyAIFuelDesc: 'A new paradigm for AI access. Hold tokens, use AI forever.',
    feature1Title: '200+ AI Models',
    feature1Desc: 'Access GPT-4o, Claude, Gemini, DeepSeek and more through a single API endpoint.',
    feature2Title: "Hold, Don't Pay",
    feature2Desc: 'Your tokens stay in your wallet. No subscriptions, no monthly fees, no credit cards.',
    feature3Title: 'Transparent Credits',
    feature3Desc: 'Daily credits based on your holdings. Formula is public, treasury is on-chain.',
    
    // How It Works
    howItWorks: 'How It Works',
    threeSteps: 'Three simple steps to free AI',
    step1Title: 'Buy $FUEL',
    step1Desc: 'Get $FUEL tokens on Raydium or Jupiter. Your tokens stay in your wallet.',
    step2Title: 'Connect Wallet',
    step2Desc: 'Connect your Phantom or Solflare wallet to aifuel.fun and get your API key.',
    step3Title: 'Use AI Free',
    step3Desc: 'Call our API like OpenAI. Daily credits based on your token holdings.',
    
    // Models
    modelsTitle: '200+ AI Models',
    modelsDesc: 'All the models you need, one API endpoint',
    moreModels: '+ 190 more models via OpenRouter',
    
    // Pricing
    simpleCreditSystem: 'Simple Credit System',
    moreTokensMoreCredits: 'More tokens = More daily credits',
    starter: 'Starter',
    builder: 'Builder',
    pro: 'Pro',
    popular: 'POPULAR',
    perDay: '/day',
    allModels: 'All 200+ models',
    dailyRefresh: 'Daily credit refresh',
    sdkCompatible: 'OpenAI SDK compatible',
    formula: 'Formula: Daily Credit = (Your Balance / Circulating Supply) × Daily Pool',
    
    // CTA
    readyToFuel: 'Ready to Fuel Your AI?',
    joinFuture: 'Join the future of AI access. No subscriptions, just tokens.',
    
    // Footer
    footerDesc: 'Hold $FUEL tokens to get free AI API credits. Access 200+ models including GPT-4, Claude, and more.',
    product: 'Product',
    documentation: 'Documentation',
    resources: 'Resources',
    allRightsReserved: 'All rights reserved.',
  },
  zh: {
    // Navbar
    features: '特性',
    pricing: '价格',
    docs: '文档',
    dashboard: '控制台',
    
    // Hero
    nowOnSolana: '现已上线 Solana',
    fuelYourAI: '为你的 AI 加油',
    heroDesc: '持有 $FUEL 代币，免费使用 200+ AI 模型。无需订阅，无需信用卡。',
    buyFuel: '购买 $FUEL',
    goToDashboard: '进入控制台',
    poolOpenAt: '池子开放时间',
    
    // Stats
    aiModels: 'AI 模型',
    monthlyFee: '月费',
    apiAccess: 'API 访问',
    
    // Features
    whyAIFuel: '为什么选择 AIFuel？',
    whyAIFuelDesc: 'AI 访问的新范式。持有代币，永久使用 AI。',
    feature1Title: '200+ AI 模型',
    feature1Desc: '通过单一 API 端点访问 GPT-4o、Claude、Gemini、DeepSeek 等。',
    feature2Title: '持有即用，无需付费',
    feature2Desc: '代币留在你的钱包里。无需订阅、无月费、无信用卡。',
    feature3Title: '透明额度',
    feature3Desc: '每日额度基于持仓量。公式公开，国库链上可查。',
    
    // How It Works
    howItWorks: '如何使用',
    threeSteps: '三步免费使用 AI',
    step1Title: '购买 $FUEL',
    step1Desc: '在 Raydium 或 Jupiter 上获取 $FUEL 代币。代币留在你的钱包。',
    step2Title: '连接钱包',
    step2Desc: '将 Phantom 或 Solflare 钱包连接到 aifuel.fun，获取 API 密钥。',
    step3Title: '免费使用 AI',
    step3Desc: '像调用 OpenAI 一样调用我们的 API。每日额度基于持仓量。',
    
    // Models
    modelsTitle: '200+ AI 模型',
    modelsDesc: '你需要的所有模型，一个 API 端点',
    moreModels: '+ 190 更多模型通过 OpenRouter',
    
    // Pricing
    simpleCreditSystem: '简单的额度系统',
    moreTokensMoreCredits: '持有越多 = 每日额度越多',
    starter: '入门',
    builder: '开发者',
    pro: '专业版',
    popular: '热门',
    perDay: '/天',
    allModels: '全部 200+ 模型',
    dailyRefresh: '每日额度刷新',
    sdkCompatible: 'OpenAI SDK 兼容',
    formula: '公式：每日额度 = (你的余额 / 流通量) × 每日池',
    
    // CTA
    readyToFuel: '准备好为你的 AI 加油了吗？',
    joinFuture: '加入 AI 访问的未来。无需订阅，只需代币。',
    
    // Footer
    footerDesc: '持有 $FUEL 代币获取免费 AI API 额度。访问 200+ 模型，包括 GPT-4、Claude 等。',
    product: '产品',
    documentation: '文档',
    resources: '资源',
    allRightsReserved: '保留所有权利。',
  },
}

export type Locale = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
