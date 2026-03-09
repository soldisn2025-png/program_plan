/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['plaid'],
  },
}

module.exports = nextConfig
