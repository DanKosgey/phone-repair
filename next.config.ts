import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Disable the Dev Tools UI
  devIndicators: false,
  // Configure image optimization for Supabase storage
  images: {
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9002',
        pathname: '/images/**',
      },
    ],
  },
  // Enable webpack optimizations
  webpack: (config) => {
    // Reduce bundle size by excluding unused locales from moment.js if used
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    return config;
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: false, // Disable in development to avoid critters issues
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-*',
      '@heroicons/react/*'
    ]
  },
  // Fix Turbopack configuration
  turbopack: {}
}

// Bundle analyzer configuration
const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzerConfig(nextConfig)