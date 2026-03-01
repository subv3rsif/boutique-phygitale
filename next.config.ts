import type { NextConfig } from "next";

/**
 * Next.js 16 Configuration - Performance Optimized
 * Boutique Phygitale 1885
 *
 * Next.js 16 uses Turbopack by default (faster builds)
 * SWC minification is enabled by default
 */

const nextConfig: NextConfig = {
  // ──────────────────────────────────────────────────────────
  // Compiler Optimizations
  // ──────────────────────────────────────────────────────────

  // Remove console.log in production (keep errors/warnings)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn', 'info'],
          }
        : false,
  },

  // ──────────────────────────────────────────────────────────
  // Experimental Features
  // ──────────────────────────────────────────────────────────

  experimental: {
    // Optimize package imports (tree-shaking)
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'framer-motion',
    ],
  },

  // ──────────────────────────────────────────────────────────
  // Turbopack Configuration (Next.js 16)
  // ──────────────────────────────────────────────────────────

  turbopack: {
    // Enable Turbopack explicitly to silence warning
    // Turbopack is faster than Webpack (10x in dev mode)
  },

  // ──────────────────────────────────────────────────────────
  // Image Optimization
  // ──────────────────────────────────────────────────────────

  images: {
    formats: ['image/avif', 'image/webp'], // AVIF first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache optimized images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // Headers (Security + Performance)
  // ──────────────────────────────────────────────────────────

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache Next.js static files
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/:all*.(jpg|jpeg|png|webp|avif|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ──────────────────────────────────────────────────────────
  // Misc
  // ──────────────────────────────────────────────────────────

  // Strict mode for better error detection
  reactStrictMode: true,

  // Remove X-Powered-By header
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // No trailing slashes
  trailingSlash: false,
};

export default nextConfig;
