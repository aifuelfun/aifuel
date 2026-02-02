import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { config } from '../utils/config';

const prisma = new PrismaClient();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        wallet: string;
      };
      apiKey?: {
        id: number;
        userId: number;
      };
    }
  }
}

/**
 * Hash an API key for storage/lookup
 */
export function hashApiKey(key: string): string {
  return crypto
    .createHmac('sha256', config.apiKeySalt)
    .update(key)
    .digest('hex');
}

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  const random = crypto.randomBytes(24).toString('base64url');
  return `fuel_sk_${random}`;
}

/**
 * Middleware to validate API key
 */
export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get API key from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Missing or invalid Authorization header',
          type: 'authentication_error',
        },
      });
    }
    
    const apiKey = authHeader.substring(7);
    
    if (!apiKey.startsWith('fuel_sk_')) {
      return res.status(401).json({
        error: {
          message: 'Invalid API key format',
          type: 'authentication_error',
        },
      });
    }
    
    // Hash and lookup
    const keyHash = hashApiKey(apiKey);
    
    const dbKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: true },
    });
    
    if (!dbKey || !dbKey.isActive) {
      return res.status(401).json({
        error: {
          message: 'Invalid or revoked API key',
          type: 'authentication_error',
        },
      });
    }
    
    // Update last used
    await prisma.apiKey.update({
      where: { id: dbKey.id },
      data: { lastUsedAt: new Date() },
    });
    
    // Attach to request
    req.user = {
      id: dbKey.user.id,
      wallet: dbKey.user.wallet,
    };
    req.apiKey = {
      id: dbKey.id,
      userId: dbKey.userId,
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      error: {
        message: 'Authentication failed',
        type: 'server_error',
      },
    });
  }
}
