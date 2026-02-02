import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { apiKeyAuth, generateApiKey, hashApiKey } from '../middleware/auth';
import { authRateLimit } from '../middleware/rateLimit';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /v1/keys
 * Create a new API key
 */
router.post('/', apiKeyAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name } = req.body;
    
    // Check if user has too many keys
    const keyCount = await prisma.apiKey.count({
      where: { userId, isActive: true },
    });
    
    if (keyCount >= 10) {
      return res.status(400).json({
        error: {
          message: 'Maximum API keys limit reached (10)',
          type: 'validation_error',
        },
      });
    }
    
    // Generate new key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = apiKey.substring(0, 15) + '...';
    
    // Store in database
    const dbKey = await prisma.apiKey.create({
      data: {
        userId,
        keyHash,
        keyPrefix,
        name: name || 'Untitled',
      },
    });
    
    res.json({
      id: dbKey.id.toString(),
      key: apiKey, // Only returned once!
      name: dbKey.name,
      createdAt: dbKey.createdAt,
    });
    
  } catch (error) {
    console.error('Create key error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create API key',
        type: 'server_error',
      },
    });
  }
});

/**
 * GET /v1/keys
 * List user's API keys
 */
router.get('/', apiKeyAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const keys = await prisma.apiKey.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        keyPrefix: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json({
      keys: keys.map(k => ({
        id: k.id.toString(),
        prefix: k.keyPrefix,
        name: k.name,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
      })),
    });
    
  } catch (error) {
    console.error('List keys error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to list API keys',
        type: 'server_error',
      },
    });
  }
});

/**
 * DELETE /v1/keys/:id
 * Revoke an API key
 */
router.delete('/:id', apiKeyAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keyId = parseInt(req.params.id);
    
    if (isNaN(keyId)) {
      return res.status(400).json({
        error: {
          message: 'Invalid key ID',
          type: 'validation_error',
        },
      });
    }
    
    // Find and verify ownership
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });
    
    if (!key) {
      return res.status(404).json({
        error: {
          message: 'API key not found',
          type: 'not_found',
        },
      });
    }
    
    // Soft delete (deactivate)
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });
    
    res.json({
      success: true,
      message: 'API key revoked',
    });
    
  } catch (error) {
    console.error('Delete key error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to revoke API key',
        type: 'server_error',
      },
    });
  }
});

export default router;
