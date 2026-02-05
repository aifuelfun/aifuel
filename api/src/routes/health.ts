import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /health
 * Basic health check
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.2',
  });
});

/**
 * GET /health/db
 * Database connectivity check
 */
router.get('/db', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const userCount = await prisma.user.count();
    res.json({
      status: 'ok',
      database: 'connected',
      userCount,
      result,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /health/detailed
 * Detailed health check with system info
 */
router.get('/detailed', (_req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    },
    node: process.version,
  });
});

export default router;
