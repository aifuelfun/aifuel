'use client'

import { useState } from 'react'
import { Copy, Check, Book, Code, Zap, Terminal, MessageSquare } from 'lucide-react'
import { MODELS } from '@/lib/constants'

export default function DocsPage() {
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
          <h1 className="text-4xl font-bold text-gray-900">Documentation</h1>
        </div>
        <p className="text-xl text-gray-600">
          Everything you need to integrate AIFuel into your applications.
        </p>
      </div>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Quick Start
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">1. Get your API Key</h3>
            <p className="text-gray-600 mb-4">
              Connect your wallet at <a href="/dashboard" className="text-primary hover:underline">dashboard</a> and create an API key.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">2. Install the SDK</h3>
            <p className="text-gray-600 mb-4">
              Use the official OpenAI SDK - our API is fully compatible.
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
            <h3 className="font-semibold text-gray-900 mb-2">3. Make your first request</h3>
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
          API Reference
        </h2>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Base URL</h3>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm mt-2 inline-block">
              https://api.aifuel.fun/v1
            </code>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Authentication</h3>
            <p className="text-gray-600 mb-4">
              Include your API key in the Authorization header:
            </p>
            <CodeBlock
              id="auth"
              language="http"
              code={`Authorization: Bearer fuel_sk_your_key_here`}
            />
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Endpoints</h3>
            <div className="space-y-4">
              {[
                { method: 'POST', path: '/v1/chat/completions', desc: 'Chat completions (GPT-4, Claude, etc.)' },
                { method: 'POST', path: '/v1/completions', desc: 'Text completions' },
                { method: 'POST', path: '/v1/embeddings', desc: 'Text embeddings' },
                { method: 'GET', path: '/v1/models', desc: 'List available models' },
                { method: 'GET', path: '/v1/credits', desc: 'Check your credit balance' },
              ].map((endpoint, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                  <span className="text-sm text-gray-500">{endpoint.desc}</span>
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
          Available Models
        </h2>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Model ID</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Provider</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {MODELS.map((model, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="text-sm">{model.id}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{model.provider}</td>
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
          <div className="p-4 bg-gray-50 text-sm text-gray-500 text-center">
            + 190 more models available via OpenRouter
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          Code Examples
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
        </div>
      </section>

      {/* Credits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Credit System</h2>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">How Credits Work</h3>
          <p className="text-gray-600 mb-4">
            Your daily credit is calculated based on your $FUEL token holdings:
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
            <code className="text-primary">
              Daily Credit = (Your Balance / Circulating Supply) × Daily Pool × Multiplier
            </code>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>• Credits refresh daily at midnight UTC</li>
            <li>• Diamond hands (never sold) get 100% multiplier</li>
            <li>• Former sellers capped at 80% multiplier</li>
            <li>• Check your credit balance at GET /v1/credits</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
