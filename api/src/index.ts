import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, validateConfig } from './utils/config';

// Import routes
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import creditsRouter from './routes/credits';
import keysRouter from './routes/keys';
import proxyRouter from './routes/proxy';

// Validate config on startup
validateConfig();

// Initialize Express app
const app: Application = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://aifuel.fun',
    'https://www.aifuel.fun',
  ],
  credentials: true,
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Health check (no auth)
app.use('/health', healthRouter);

// Auth routes
app.use('/v1/auth', authRouter);

// Credits routes
app.use('/v1/credits', creditsRouter);

// API keys routes
app.use('/v1/keys', keysRouter);

// AI proxy routes (main API)
app.use('/v1', proxyRouter);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'AIFuel API',
    version: '1.0.0',
    status: 'running',
    docs: 'https://aifuel.fun/docs',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      type: 'not_found',
    },
  });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: {
      message: config.nodeEnv === 'development' ? err.message : 'Internal server error',
      type: 'server_error',
    },
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
🔥 AIFuel API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Port:        ${PORT}
  Environment: ${config.nodeEnv}
  Health:      http://localhost:${PORT}/health
  API:         http://localhost:${PORT}/v1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
