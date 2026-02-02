import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { authRateLimit } from '../middleware/rateLimit';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /v1/auth/connect
 * Connect wallet and create/get user
 */
router.post('/connect', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { wallet, signature, message } = req.body;
    
    // Validate inputs
    if (!wallet || !signature || !message) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: wallet, signature, message',
          type: 'validation_error',
        },
      });
    }
    
    // Validate wallet address
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(wallet);
    } catch {
      return res.status(400).json({
        error: {
          message: 'Invalid wallet address',
          type: 'validation_error',
        },
      });
    }
    
    // Verify signature
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      
      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      );
      
      if (!isValid) {
        return res.status(401).json({
          error: {
            message: 'Invalid signature',
            type: 'authentication_error',
          },
        });
      }
    } catch {
      return res.status(401).json({
        error: {
          message: 'Signature verification failed',
          type: 'authentication_error',
        },
      });
    }
    
    // Create or get user
    let user = await prisma.user.findUnique({
      where: { wallet },
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          wallet,
          firstSeenAt: new Date(),
          isDiamondHands: true,
        },
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        wallet: user.wallet,
        createdAt: user.createdAt,
        isDiamondHands: user.isDiamondHands,
      },
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      error: {
        message: 'Authentication failed',
        type: 'server_error',
      },
    });
  }
});

/**
 * POST /v1/auth/nonce
 * Get a nonce/message to sign
 */
router.post('/nonce', authRateLimit, async (req: Request, res: Response) => {
  const { wallet } = req.body;
  
  if (!wallet) {
    return res.status(400).json({
      error: {
        message: 'Missing wallet address',
        type: 'validation_error',
      },
    });
  }
  
  // Generate sign message
  const timestamp = Date.now();
  const message = `Sign this message to connect to AIFuel.\n\nWallet: ${wallet}\nTimestamp: ${timestamp}`;
  
  res.json({
    message,
    timestamp,
  });
});

export default router;
