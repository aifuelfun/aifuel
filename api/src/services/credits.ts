import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { getTokenBalance, getCirculatingSupply } from './solana';
import { config } from '../utils/config';

const prisma = new PrismaClient();
const redis = new Redis(config.redisUrl);

/**
 * Get dynamic daily pool based on treasury balance
 */
async function getDailyPool(): Promise<number> {
  const cached = await redis.get('daily_pool');
  if (cached) return parseFloat(cached);
  
  // In production, query actual treasury balance
  // For now, use base config
  const pool = config.dailyPoolBase;
  
  await redis.setex('daily_pool', 3600, pool.toString());
  return pool;
}

/**
 * Get holding multiplier (diamond hands mechanism)
 */
async function getHoldingMultiplier(userId: number): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return 0;
  
  // Check if ever sold (not diamond hands)
  if (user.lastSoldAt || !user.isDiamondHands) {
    // 80% for non-diamond hands
    return 0.8;
  }
  
  // Diamond hands: 100%
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
  let circulating = parseFloat(await redis.get(cacheKey) || '0');
  if (!circulating) {
    circulating = await getCirculatingSupply();
    await redis.setex(cacheKey, 3600, circulating.toString());
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
  const { daily, multiplier, balance } = await calculateDailyCredit(userId, wallet);
  const used = await getTodayUsage(userId);
  const remaining = Math.max(0, daily - used);
  
  return {
    balance,
    daily,
    used,
    remaining,
    multiplier,
  };
}
