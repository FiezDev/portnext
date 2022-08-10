/** @type {import('next').NextConfig} */

const nextConfig = {
  distDir: "nextjs",
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['fiez.imgix.net','http.cat','dummyimage.com'],
  },
}

module.exports = nextConfig