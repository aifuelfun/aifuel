import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * Basic health check
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
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
