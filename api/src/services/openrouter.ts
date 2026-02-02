import axios, { AxiosError } from 'axios';
import { config } from '../utils/config';

// Model pricing per 1M tokens (input, output)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI
  'openai/gpt-4o': { input: 2.5, output: 10 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'openai/gpt-4-turbo': { input: 10, output: 30 },
  'openai/o1-preview': { input: 15, output: 60 },
  'openai/o1-mini': { input: 3, output: 12 },
  
  // Anthropic
  'anthropic/claude-3.5-sonnet': { input: 3, output: 15 },
  'anthropic/claude-3-opus': { input: 15, output: 75 },
  'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
  
  // Google
  'google/gemini-pro-1.5': { input: 1.25, output: 5 },
  'google/gemini-flash-1.5': { input: 0.075, output: 0.3 },
  
  // DeepSeek
  'deepseek/deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek/deepseek-reasoner': { input: 0.55, output: 2.19 },
  
  // Meta Llama
  'meta-llama/llama-3.1-405b-instruct': { input: 2.7, output: 2.7 },
  'meta-llama/llama-3.1-70b-instruct': { input: 0.52, output: 0.75 },
  'meta-llama/llama-3.1-8b-instruct': { input: 0.055, output: 0.055 },
  
  // Default fallback
  'default': { input: 1, output: 3 },
};

/**
 * Get pricing for a model
 */
export function getModelPricing(model: string): { input: number; output: number } {
  return MODEL_PRICING[model] || MODEL_PRICING['default'];
}

/**
 * Estimate request cost
 */
export function estimateRequestCost(body: any): number {
  const model = body.model || 'openai/gpt-4o-mini';
  const pricing = getModelPricing(model);
  
  // Rough estimate based on message content length
  const messagesLength = JSON.stringify(body.messages || []).length;
  const estimatedInputTokens = Math.ceil(messagesLength / 4);
  const estimatedOutputTokens = body.max_tokens || 1000;
  
  const cost = (estimatedInputTokens * pricing.input + estimatedOutputTokens * pricing.output) / 1_000_000;
  return cost * 1.2; // 20% buffer for safety
}

/**
 * Calculate actual cost from response
 */
export function calculateActualCost(model: string, usage: { prompt_tokens: number; completion_tokens: number }): number {
  const pricing = getModelPricing(model);
  return (usage.prompt_tokens * pricing.input + usage.completion_tokens * pricing.output) / 1_000_000;
}

/**
 * Forward request to OpenRouter
 */
export async function forwardToOpenRouter(body: any): Promise<any> {
  try {
    const response = await axios.post(
      `${config.openrouterBaseUrl}/chat/completions`,
      body,
      {
        headers: {
          'Authorization': `Bearer ${config.openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://aifuel.fun',
          'X-Title': 'AIFuel',
        },
        timeout: 120000, // 2 minute timeout
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw {
        status: axiosError.response?.status || 500,
        message: axiosError.response?.data || 'Upstream API error',
      };
    }
    throw error;
  }
}

/**
 * Forward streaming request to OpenRouter
 */
export async function forwardStreamToOpenRouter(body: any): Promise<any> {
  const response = await axios.post(
    `${config.openrouterBaseUrl}/chat/completions`,
    { ...body, stream: true },
    {
      headers: {
        'Authorization': `Bearer ${config.openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aifuel.fun',
        'X-Title': 'AIFuel',
      },
      responseType: 'stream',
      timeout: 120000,
    }
  );
  
  return response.data;
}

/**
 * Get list of available models
 */
export async function getAvailableModels(): Promise<any[]> {
  try {
    const response = await axios.get(
      `${config.openrouterBaseUrl}/models`,
      {
        headers: {
          'Authorization': `Bearer ${config.openrouterApiKey}`,
        },
      }
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}
