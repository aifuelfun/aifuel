/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable SWC minification (faster than Terser)
  swcMinify: true,
  // Compress responses
  compress: true,
  // Image optimization
  images: {
    domains: ['api.aifuel.fun'],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Enable experimental optimizations
  experimental: {
    optimizeCss: true,
  },
  // Handle Solana wallet adapter
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig
