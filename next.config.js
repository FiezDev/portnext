/** @type {import('next').NextConfig} */

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|pdf)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  distDir: 'nextjs',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    deviceSizes: [400, 539, 640, 768, 1024, 1280, 1536],
    loader: 'imgix',
    path: 'https://fiez.imgix.net/',
    domains: ['http.cat', 'dummyimage.com'],
  },
};

module.exports = nextConfig;
