import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { getTokenBalance, getCirculatingSupply } from './solana';
import { config } from '../utils/config';

const prisma = new PrismaClient();

// Redis with error handling
let redis: Redis | null = null;
try {
  redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    lazyConnect: true,
  });
  redis.on('error', (err) => {
    console.error('[redis] Connection error:', err.message);
  });
} catch (e) {
  console.error('[redis] Failed to initialize:', e);
}

// Safe redis get/set
async function redisGet(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

async function redisSetex(key: string, seconds: number, value: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, seconds, value);
  } catch {
    // ignore
  }
}

/**
 * Get dynamic daily pool based on treasury balance
 */
async function getDailyPool(): Promise<number> {
  const cached = await redisGet('daily_pool');
  if (cached) return parseFloat(cached);
  
  // In production, query actual treasury balance
  // For now, use base config
  const pool = config.dailyPoolBase;
  
  await redisSetex('daily_pool', 3600, pool.toString());
  return pool;
}

/**
 * Get holding multiplier (diamond hands mechanism)
 * Diamond hands (never sold) = 100% immediately
 * Non-diamond hands = 80% max
 */
async function getHoldingMultiplier(userId: number): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return 0;
  
  // Check if ever sold
  if (user.lastSoldAt) {
    // Check cooldown (30 min after sell)
    const hoursSinceSold = (Date.now() - user.lastSoldAt.getTime()) / 3600000;
    if (hoursSinceSold < 0.5) return 0;
    
    // Non-diamond hands get 80% max
    return 0.8;
  }
  
  // Diamond hands: 100% immediately (no warmup needed)
  return 1.0;
}

/**
 * Calculate daily credit for a user
 */
export async function calculateDailyCredit(userId: number, wallet: string): Promise<{
  daily: number;
  multiplier: number;
  balance: number;
}> {
  // Get token balance
  const balance = await getTokenBalance(wallet);
  
  if (balance < config.minHoldingForApi) {
    return { daily: 0, multiplier: 0, balance };
  }
  
  // Get circulating supply
  const cacheKey = `circulating_supply`;
  let circulating = parseFloat(await redisGet(cacheKey) || '0');
  if (!circulating) {
    circulating = await getCirculatingSupply();
    await redisSetex(cacheKey, 3600, circulating.toString());
  }
  
  // Get daily pool
  const dailyPool = await getDailyPool();
  
  // Get holding multiplier
  const multiplier = await getHoldingMultiplier(userId);
  
  // Calculate credit
  const baseCredit = (balance / circulating) * dailyPool;
  const daily = baseCredit * multiplier;
  
  return { daily, multiplier, balance };
}

/**
 * Get user's credit usage for today
 */
export async function getTodayUsage(userId: number): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const snapshot = await prisma.dailySnapshot.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });
  
  return snapshot ? parseFloat(snapshot.creditUsed.toString()) : 0;
}

/**
 * Deduct credit from user's daily allowance
 */
export async function deductCredit(userId: number, amount: number): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Upsert daily snapshot
  await prisma.dailySnapshot.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      creditUsed: {
        increment: amount,
      },
    },
    create: {
      userId,
      date: today,
      balance: BigInt(0), // Will be updated by daily job
      creditAllocated: 0,
      creditUsed: amount,
    },
  });
  
  return true;
}

/**
 * Get full credit info for a user
 */
export async function getCreditInfo(userId: number, wallet: string) {
  console.log(`[credits] getCreditInfo for userId=${userId}, wallet=${wallet}`);
  
  const { daily, multiplier, balance } = await calculateDailyCredit(userId, wallet);
  const used = await getTodayUsage(userId);
  const remaining = Math.max(0, daily - used);
  
  console.log(`[credits] result: balance=${balance}, daily=${daily}, multiplier=${multiplier}, used=${used}, remaining=${remaining}`);
  
  return {
    balance,
    daily,
    used,
    remaining,
    multiplier,
  };
}
