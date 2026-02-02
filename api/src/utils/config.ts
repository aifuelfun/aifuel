import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Solana
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  fuelTokenMint: process.env.FUEL_TOKEN_MINT || '',
  treasuryWallet: process.env.TREASURY_WALLET || '',
  
  // OpenRouter
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openrouterBaseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  apiKeySalt: process.env.API_KEY_SALT || 'change-me-in-production',
  
  // Credits
  dailyPoolBase: parseFloat(process.env.DAILY_POOL_BASE || '500'),
  minHoldingForApi: parseInt(process.env.MIN_HOLDING_FOR_API || '1000'),
};

// Validate required config
export function validateConfig(): void {
  const required = [
    'fuelTokenMint',
    'openrouterApiKey',
  ];
  
  const missing = required.filter(key => !config[key as keyof typeof config]);
  
  if (missing.length > 0 && config.nodeEnv === 'production') {
    throw new Error(`Missing required config: ${missing.join(', ')}`);
  }
}
