/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel-native deploy (was static export): enables the image CDN,
  // AVIF/WebP negotiation, and long-lived immutable caching.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'fiez.imgix.net' },
      // firebasestorage entry removed: unused, and the host is multi-tenant —
      // an unscoped pattern lets anyone proxy arbitrary buckets through our
      // image optimizer (review finding).
    ],
  },
  reactCompiler: true,
};

module.exports = nextConfig;
