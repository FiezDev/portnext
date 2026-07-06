/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel-native deploy (was static export): enables the image CDN,
  // AVIF/WebP negotiation, and long-lived immutable caching.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'fiez.imgix.net' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  reactCompiler: true,
};

module.exports = nextConfig;
