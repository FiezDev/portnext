/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['fiez.imgix.net','http.cat'],
  },
}

module.exports = nextConfig