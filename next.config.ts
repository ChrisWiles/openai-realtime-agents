import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack optimizations (moved from experimental as Turbopack is now stable)
  turbopack: {
    // Optimize module resolution
    resolveAlias: {
      // Add any custom aliases here if needed
    },
    // Configure Turbopack-specific rules
    rules: {
      // Custom rules for specific file types can be added here
    },
  },

  // Experimental features that work well with Turbopack
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'react-markdown'],
  },

  // General optimizations that complement Turbopack
  compiler: {
    // Enable SWC minification for better performance
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    // Configure image optimization if needed
    formats: ['image/webp', 'image/avif'],
  },

  // Bundle analyzer support (optional)
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),
};

export default nextConfig;
