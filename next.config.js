/** @type {import('next').NextConfig} */

const nextConfig = {
  distDir: 'nextjs',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    deviceSizes: [400, 640, 768, 1024, 1280, 1536],
    loader: 'imgix',
    path: 'https://fiez.imgix.net/',
    domains: ['http.cat', 'dummyimage.com'],
  },
};

module.exports = nextConfig;
