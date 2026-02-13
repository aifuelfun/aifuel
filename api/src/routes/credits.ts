import { Router, Request, Response } from 'express';
import { jwtAuth } from '../middleware/jwt';
import { getCreditInfo } from '../services/credits';

const router = Router();

/**
 * GET /v1/credits
 * Get current credit balance and usage (for dashboard)
 */
router.get('/', jwtAuth, async (req: Request, res: Response) => {
  try {
    // Disable caching for credits endpoint
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    const userId = req.user!.id;
    const wallet = req.user!.wallet;
    
    const credits = await getCreditInfo(userId, wallet);
    
    res.json({
      balance: credits.balance,
      daily: credits.daily,
      used: credits.used,
      remaining: credits.remaining,
      multiplier: credits.multiplier,
      isDiamondHands: credits.multiplier >= 1.0,
      resetsAt: getNextMidnightUTC(),
    });
    
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get credit info',
        type: 'server_error',
      },
    });
  }
});

/**
 * Get next midnight UTC timestamp
 */
function getNextMidnightUTC(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

export default router;
