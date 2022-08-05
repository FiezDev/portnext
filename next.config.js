/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['fiez.imgix.net'],
  },
}

module.exports = nextConfig