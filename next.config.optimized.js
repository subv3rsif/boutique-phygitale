/**
 * Next.js Configuration - Performance Optimized
 * Boutique Phygitale 1885
 *
 * Features:
 * - SWC minification (faster than Terser)
 * - Modern browser targeting (smaller polyfills)
 * - Production optimizations (remove console.log)
 * - Performance budgets
 * - Bundle analyzer (when ANALYZE=true)
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ──────────────────────────────────────────────────────────
  // Compiler Optimizations
  // ──────────────────────────────────────────────────────────

  // Use SWC for minification (3x faster than Terser)
  swcMinify: true,

  // Remove console.log in production (keep errors/warnings)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn', 'info'], // Keep important logs
          }
        : false,
  },

  // ──────────────────────────────────────────────────────────
  // Experimental Features
  // ──────────────────────────────────────────────────────────

  experimental: {
    // Use browserslist for SWC transpilation
    // Reduces polyfill size by targeting modern browsers
    browsersListForSwc: true,

    // Optimize package imports (tree-shaking)
    optimizePackageImports: [
      'lucide-react', // Only bundle used icons
      'framer-motion', // Only bundle used components
      '@radix-ui/react-icons',
    ],
  },

  // ──────────────────────────────────────────────────────────
  // Image Optimization
  // ──────────────────────────────────────────────────────────

  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon/thumbnail sizes

    // Vercel Image Optimization (automatic)
    // loader: 'default',

    // Optional: Custom CDN loader
    // loader: 'cloudinary',
    // path: 'https://res.cloudinary.com/demo/image/fetch/',

    // Cache optimized images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60,

    // Allow images from these domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/**',
      },
      // Add your CDN domains here
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
          // Performance hints
          {
            key: 'X-UA-Compatible',
            value: 'IE=edge',
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
  // Webpack Configuration
  // ──────────────────────────────────────────────────────────

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // ── Performance Budgets (Production only) ────────────────

    if (!dev && !isServer) {
      config.performance = {
        maxAssetSize: 250000, // 250KB per file
        maxEntrypointSize: 400000, // 400KB total entrypoint
        hints: process.env.NODE_ENV === 'production' ? 'error' : 'warning',
      };

      // ── Optimize Bundle Splitting ─────────────────────────

      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Separate vendor code
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get package name
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )?.[1];

              // Group by package
              return packageName
                ? `npm.${packageName.replace('@', '')}`
                : 'vendor';
            },
            priority: 10,
          },

          // Separate React/React-DOM
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 20,
          },

          // Separate Framer Motion (heavy)
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'async', // Load async only
            priority: 15,
          },

          // Common chunks (used in 2+ pages)
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // ── Bundle Analyzer (when ANALYZE=true) ──────────────────

    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
          reportFilename: isServer
            ? '../analyze/server.html'
            : '../analyze/client.html',
        })
      );
    }

    return config;
  },

  // ──────────────────────────────────────────────────────────
  // Output (Standalone for Docker)
  // ──────────────────────────────────────────────────────────

  // Uncomment for Docker deployments
  // output: 'standalone',

  // ──────────────────────────────────────────────────────────
  // Redirects / Rewrites (if needed)
  // ──────────────────────────────────────────────────────────

  async redirects() {
    return [
      // Example: Redirect old URLs
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  async rewrites() {
    return [
      // Example: Proxy to external API
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://external-api.com/:path*',
      // },
    ];
  },

  // ──────────────────────────────────────────────────────────
  // Environment Variables
  // ──────────────────────────────────────────────────────────

  // Make these env vars available to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // ──────────────────────────────────────────────────────────
  // Misc
  // ──────────────────────────────────────────────────────────

  // Strict mode for better error detection
  reactStrictMode: true,

  // Powered by header
  poweredByHeader: false, // Remove X-Powered-By header

  // Compression (Vercel handles this automatically)
  compress: true,

  // Trailing slashes
  trailingSlash: false,
};

// ──────────────────────────────────────────────────────────────
// Bundle Analyzer Wrapper (Optional)
// ──────────────────────────────────────────────────────────────

// Uncomment to always have bundle analyzer available
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });
// module.exports = withBundleAnalyzer(nextConfig);

module.exports = nextConfig;
