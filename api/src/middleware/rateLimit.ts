import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { config } from '../utils/config';

const redis = new Redis(config.redisUrl);

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix: string;     // Redis key prefix
}

/**
 * Create rate limiter middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix } = options;
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use API key user ID or IP as identifier
      const identifier = req.user?.id?.toString() || req.ip || 'unknown';
      const key = `${keyPrefix}:${identifier}`;
      
      // Get current count
      const current = await redis.get(key);
      const count = current ? parseInt(current) : 0;
      
      if (count >= maxRequests) {
        const ttl = await redis.ttl(key);
        
        return res.status(429).json({
          error: {
            message: 'Rate limit exceeded',
            type: 'rate_limit_error',
            retry_after: ttl,
          },
        });
      }
      
      // Increment counter
      const multi = redis.multi();
      multi.incr(key);
      
      if (count === 0) {
        multi.pexpire(key, windowMs);
      }
      
      await multi.exec();
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - count - 1);
      
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // On error, allow the request to proceed
      next();
    }
  };
}

// Pre-configured rate limiters
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 100,      // 100 requests per minute
  keyPrefix: 'rl:api',
});

export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 10,       // 10 auth attempts per minute
  keyPrefix: 'rl:auth',
});
