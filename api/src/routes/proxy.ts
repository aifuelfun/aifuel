import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { apiKeyAuth } from '../middleware/auth';
import { apiRateLimit } from '../middleware/rateLimit';
import { getCreditInfo, deductCredit } from '../services/credits';
import { 
  forwardToOpenRouter, 
  forwardStreamToOpenRouter,
  estimateRequestCost, 
  calculateActualCost,
  getAvailableModels 
} from '../services/openrouter';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /v1/chat/completions
 * OpenAI-compatible chat completions
 */
router.post('/chat/completions', apiKeyAuth, apiRateLimit, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const wallet = req.user!.wallet;
  
  try {
    // Check credits
    const credits = await getCreditInfo(userId, wallet);
    
    if (credits.remaining <= 0) {
      return res.status(402).json({
        error: {
          message: 'Insufficient credits. Your daily credit has been exhausted.',
          type: 'insufficient_credits',
          daily: credits.daily,
          used: credits.used,
          remaining: 0,
        },
      });
    }
    
    // Estimate cost
    const estimatedCost = estimateRequestCost(req.body);
    
    if (estimatedCost > credits.remaining) {
      return res.status(402).json({
        error: {
          message: 'Insufficient credits for this request',
          type: 'insufficient_credits',
          estimated_cost: estimatedCost,
          remaining: credits.remaining,
        },
      });
    }
    
    // Handle streaming
    if (req.body.stream) {
      return handleStreamingRequest(req, res, userId);
    }
    
    // Forward to OpenRouter
    const response = await forwardToOpenRouter(req.body);
    
    // Calculate actual cost — use OpenRouter's real cost when available
    const actualCost = calculateActualCost(
      response.model,
      response.usage || { prompt_tokens: 0, completion_tokens: 0, cost: 0 }
    );
    
    // Deduct credit
    await deductCredit(userId, actualCost);
    
    // Log usage
    await prisma.usageLog.create({
      data: {
        userId,
        model: response.model,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        costUsd: actualCost,
      },
    });
    
    // Return response
    res.json(response);
    
  } catch (error: any) {
    console.error('Chat completion error:', error);
    
    if (error.status) {
      return res.status(error.status).json({
        error: {
          message: error.message || 'Upstream API error',
          type: 'api_error',
        },
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Failed to process request',
        type: 'server_error',
      },
    });
  }
});

/**
 * Handle streaming request
 */
async function handleStreamingRequest(req: Request, res: Response, userId: number) {
  try {
    const stream = await forwardStreamToOpenRouter(req.body);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let realCost = 0;
    let model = req.body.model;
    let buffer = '';
    
    stream.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      res.write(text);
      buffer += text;
      
      // Try to parse usage from SSE data lines
      if (text.includes('"usage"')) {
        try {
          // Extract all SSE data lines from buffer
          const lines = buffer.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const json = JSON.parse(line.slice(6));
                if (json.usage) {
                  totalInputTokens = json.usage.prompt_tokens || 0;
                  totalOutputTokens = json.usage.completion_tokens || 0;
                  realCost = json.usage.cost || 0;
                  console.log(`[stream] Parsed usage: input=${totalInputTokens}, output=${totalOutputTokens}, cost=$${realCost}`);
                }
              } catch {}
            }
          }
        } catch {}
      }
    });
    
    stream.on('end', async () => {
      res.end();
      
      // Deduct credit after stream ends — use OpenRouter's real cost
      const actualCost = calculateActualCost(model, {
        prompt_tokens: totalInputTokens,
        completion_tokens: totalOutputTokens,
        cost: realCost,
      });
      
      await deductCredit(userId, actualCost);
      
      // Log usage
      await prisma.usageLog.create({
        data: {
          userId,
          model,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          costUsd: actualCost,
        },
      });
    });
    
    stream.on('error', (error: Error) => {
      console.error('Stream error:', error);
      res.end();
    });
    
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({
      error: {
        message: 'Streaming failed',
        type: 'server_error',
      },
    });
  }
}

/**
 * POST /v1/completions
 * OpenAI-compatible text completions (legacy)
 */
router.post('/completions', apiKeyAuth, apiRateLimit, async (_req: Request, res: Response) => {
  // Legacy completions endpoint - redirect to chat
  res.status(400).json({
    error: {
      message: 'Please use /v1/chat/completions instead',
      type: 'deprecated',
    },
  });
});

/**
 * GET /v1/models
 * List available models
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = await getAvailableModels();
    
    res.json({
      object: 'list',
      data: models,
    });
    
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get models',
        type: 'server_error',
      },
    });
  }
});

export default router;
