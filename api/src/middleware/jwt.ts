import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';

const prisma = new PrismaClient();

// JWT payload type
interface JwtPayload {
  userId: number;
  wallet: string;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateJwt(userId: number, wallet: string): string {
  const payload: JwtPayload = { userId, wallet };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

/**
 * Verify and decode JWT token
 */
export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Middleware to validate JWT token (for dashboard access)
 */
export async function jwtAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Missing or invalid Authorization header',
          type: 'authentication_error',
        },
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verify JWT
    const payload = verifyJwt(token);
    
    if (!payload) {
      return res.status(401).json({
        error: {
          message: 'Invalid or expired token',
          type: 'authentication_error',
        },
      });
    }
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          type: 'authentication_error',
        },
      });
    }
    
    // Attach to request
    req.user = {
      id: user.id,
      wallet: user.wallet,
    };
    
    next();
  } catch (error) {
    console.error('JWT auth error:', error);
    return res.status(500).json({
      error: {
        message: 'Authentication failed',
        type: 'server_error',
      },
    });
  }
}
