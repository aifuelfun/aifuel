'use client'

import { useState } from 'react'
import { Copy, Check, Book, Code, Zap, Terminal, MessageSquare } from 'lucide-react'
import { MODELS } from '@/lib/constants'
import { useLocale } from '@/lib/LocaleContext'

const texts = {
  en: {
    title: 'Documentation',
    subtitle: 'Everything you need to integrate AIFuel into your applications.',
    quickStart: 'Quick Start',
    step1Title: '1. Get your API Key',
    step1Desc: 'Connect your wallet at',
    step1Link: 'dashboard',
    step1Desc2: 'and create an API key.',
    step2Title: '2. Install the SDK',
    step2Desc: 'Use the official OpenAI SDK - our API is fully compatible.',
    step3Title: '3. Make your first request',
    apiReference: 'API Reference',
    baseUrl: 'Base URL',
    authentication: 'Authentication',
    authDesc: 'Include your API key in the Authorization header:',
    endpoints: 'Endpoints',
    endpoint1: 'Chat completions (GPT-4, Claude, etc.)',
    endpoint2: 'Text completions',
    endpoint3: 'Text embeddings',
    endpoint4: 'List available models',
    endpoint5: 'Check your credit balance',
    availableModels: 'Available Models',
    modelId: 'Model ID',
    provider: 'Provider',
    tier: 'Tier',
    moreModels: '+ 190 more models available via OpenRouter',
    codeExamples: 'Code Examples',
    creditSystem: 'Credit System',
    howCreditsWork: 'How Credits Work',
    creditsDesc: 'Your daily credit is calculated based on your $FUEL token holdings:',
    creditFormula: 'Daily Credit = (Your Balance / Circulating Supply) × Daily Pool × Multiplier',
    credit1: 'Credits calculated in real-time based on current balance',
    credit2: 'Diamond hands (never transferred out) get 100% multiplier',
    credit3: 'Wallets that ever transferred out capped at 80% multiplier',
    credit4: 'Check your credit balance at GET /v1/credits',
  },
  zh: {
    title: '文档',
    subtitle: '将 AIFuel 集成到你的应用所需的一切。',
    quickStart: '快速开始',
    step1Title: '1. 获取 API 密钥',
    step1Desc: '在',
    step1Link: '控制台',
    step1Desc2: '连接钱包并创建 API 密钥。',
    step2Title: '2. 安装 SDK',
    step2Desc: '使用官方 OpenAI SDK - 我们的 API 完全兼容。',
    step3Title: '3. 发起第一个请求',
    apiReference: 'API 参考',
    baseUrl: '基础 URL',
    authentication: '认证',
    authDesc: '在 Authorization 头中包含你的 API 密钥：',
    endpoints: '端点',
    endpoint1: '对话补全 (GPT-4, Claude 等)',
    endpoint2: '文本补全',
    endpoint3: '文本嵌入',
    endpoint4: '列出可用模型',
    endpoint5: '查询额度余额',
    availableModels: '可用模型',
    modelId: '模型 ID',
    provider: '提供商',
    tier: '等级',
    moreModels: '+ 190 个更多模型通过 OpenRouter 提供',
    codeExamples: '代码示例',
    creditSystem: '额度系统',
    howCreditsWork: '额度如何计算',
    creditsDesc: '你的每日额度基于持有的 $FUEL 代币计算：',
    creditFormula: '每日额度 = (你的余额 / 流通量) × 每日池 × 倍数',
    credit1: '额度基于当前余额实时计算',
    credit2: '钻石手（从未转出）获得 100% 倍数',
    credit3: '曾经转出过的钱包最高 80% 倍数',
    credit4: '通过 GET /v1/credits 查询额度余额',
  }
}

export default function DocsPage() {
  const { locale } = useLocale()
  const t = texts[locale] || texts.en
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative bg-dark rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-dark-light border-b border-gray-800">
        <span className="text-xs text-gray-400">{language}</span>
        <button
          onClick={() => copyCode(code, id)}
          className="p-1 text-gray-400 hover:text-white transition"
        >
          {copiedCode === id ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-gray-300">{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Book className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
        </div>
        <p className="text-xl text-text-dim">
          {t.subtitle}
        </p>
      </div>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          {t.quickStart}
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{t.step1Title}</h3>
            <p className="text-text-dim mb-4">
              {t.step1Desc} <a href="/dashboard" className="text-primary hover:underline">{t.step1Link}</a> {t.step1Desc2}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{t.step2Title}</h3>
            <p className="text-text-dim mb-4">
              {t.step2Desc}
            </p>
            <CodeBlock
              id="install"
              language="bash"
              code={`# Python
pip install openai

# Node.js
npm install openai`}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{t.step3Title}</h3>
            <CodeBlock
              id="first-request"
              language="python"
              code={`from openai import OpenAI

client = OpenAI(
    api_key="fuel_sk_your_key_here",
    base_url="https://api.aifuel.fun/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Hello, AIFuel!"}
    ]
)

print(response.choices[0].message.content)`}
            />
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          {t.apiReference}
        </h2>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{t.baseUrl}</h3>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm mt-2 inline-block">
              https://api.aifuel.fun/v1
            </code>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">{t.authentication}</h3>
            <p className="text-text-dim mb-4">
              {t.authDesc}
            </p>
            <CodeBlock
              id="auth"
              language="http"
              code={`Authorization: Bearer fuel_sk_your_key_here`}
            />
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t.endpoints}</h3>
            <div className="space-y-4">
              {[
                { method: 'POST', path: '/v1/chat/completions', desc: t.endpoint1 },
                { method: 'POST', path: '/v1/completions', desc: t.endpoint2 },
                { method: 'POST', path: '/v1/embeddings', desc: t.endpoint3 },
                { method: 'GET', path: '/v1/models', desc: t.endpoint4 },
                { method: 'GET', path: '/v1/credits', desc: t.endpoint5 },
              ].map((endpoint, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                  <span className="text-sm text-text-muted">{endpoint.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Models */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          {t.availableModels}
        </h2>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">{t.modelId}</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">{t.provider}</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">{t.tier}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {MODELS.map((model, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="text-sm">{model.id}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-dim">{model.provider}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      model.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                      model.tier === 'standard' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {model.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 text-sm text-text-muted text-center">
            <a href="/models" className="hover:text-primary transition underline">
              {t.moreModels}
            </a>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          {t.codeExamples}
        </h2>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Python</h3>
            <CodeBlock
              id="python-example"
              language="python"
              code={`from openai import OpenAI

client = OpenAI(
    api_key="fuel_sk_xxx",
    base_url="https://api.aifuel.fun/v1"
)

# Chat completion
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing in simple terms."}
    ],
    temperature=0.7,
    max_tokens=500
)

print(response.choices[0].message.content)

# Streaming
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a short poem"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Node.js / TypeScript</h3>
            <CodeBlock
              id="nodejs-example"
              language="typescript"
              code={`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'fuel_sk_xxx',
  baseURL: 'https://api.aifuel.fun/v1',
});

async function main() {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'Hello, AIFuel!' }
    ],
  });

  console.log(response.choices[0].message.content);
}

main();`}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">cURL</h3>
            <CodeBlock
              id="curl-example"
              language="bash"
              code={`curl https://api.aifuel.fun/v1/chat/completions \\
  -H "Authorization: Bearer fuel_sk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`}
            />
          </div>

          {/* Switch Models */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🔄 Switch Models (Claude, DeepSeek, Gemini)</h3>
            <CodeBlock
              id="switch-model"
              language="python"
              code={`# Use Claude 3.5 Sonnet
response = client.chat.completions.create(
    model="anthropic/claude-3.5-sonnet",
    messages=[{"role": "user", "content": "Explain Solana"}]
)

# Use DeepSeek R1 (reasoning)
response = client.chat.completions.create(
    model="deepseek/deepseek-r1",
    messages=[{"role": "user", "content": "Solve: x^2 + 5x + 6 = 0"}]
)

# Use Gemini 2.0 Flash
response = client.chat.completions.create(
    model="google/gemini-2.0-flash-001",
    messages=[{"role": "user", "content": "Write a haiku about coding"}]
)`}
            />
          </div>

          {/* Vision */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🖼️ Vision (Image Analysis)</h3>
            <CodeBlock
              id="vision-example"
              language="python"
              code={`# Analyze an image with GPT-4o Vision
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)`}
            />
          </div>

          {/* Streaming */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">⚡ Streaming Response</h3>
            <CodeBlock
              id="streaming-example"
              language="typescript"
              code={`// Node.js streaming example
const stream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}`}
            />
          </div>
        </div>
      </section>

      {/* Credits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.creditSystem}</h2>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t.howCreditsWork}</h3>
          <p className="text-text-dim mb-4">
            {t.creditsDesc}
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
            <code className="text-primary">
              {t.creditFormula}
            </code>
          </div>
          <ul className="space-y-2 text-text-dim">
            <li>• {t.credit1}</li>
            <li>• {t.credit2}</li>
            <li>• {t.credit3}</li>
            <li>• {t.credit4}</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
