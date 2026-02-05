import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { jwtAuth } from '../middleware/jwt';
import { generateApiKey, hashApiKey } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /v1/keys
 * Get user's current API key (masked)
 */
router.get('/', jwtAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const key = await prisma.apiKey.findFirst({
      where: { userId, isActive: true },
      select: {
        id: true,
        keyPrefix: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
    
    if (!key) {
      return res.json({ key: null });
    }
    
    res.json({
      key: {
        id: key.id.toString(),
        prefix: key.keyPrefix,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
      },
    });
    
  } catch (error) {
    console.error('Get key error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get API key',
        type: 'server_error',
      },
    });
  }
});

/**
 * POST /v1/keys
 * Create a new API key (invalidates any existing key)
 * This is the ONLY time the full key is returned!
 */
router.post('/', jwtAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Deactivate ALL existing keys for this user (single key policy)
    await prisma.apiKey.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    
    // Generate new key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = apiKey.substring(0, 12) + '...' + apiKey.substring(apiKey.length - 4);
    
    // Store in database
    const dbKey = await prisma.apiKey.create({
      data: {
        userId,
        keyHash,
        keyPrefix,
        name: 'Default',
      },
    });
    
    res.json({
      id: dbKey.id.toString(),
      key: apiKey, // Only returned once!
      prefix: keyPrefix,
      createdAt: dbKey.createdAt,
      message: 'Copy this key now. You won\'t be able to see it again.',
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
 * DELETE /v1/keys
 * Revoke the current API key
 */
router.delete('/', jwtAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Deactivate all keys
    const result = await prisma.apiKey.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    
    if (result.count === 0) {
      return res.status(404).json({
        error: {
          message: 'No active API key found',
          type: 'not_found',
        },
      });
    }
    
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
