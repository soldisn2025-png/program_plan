/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  output: 'export',
  ...(isGithubPages && {
    basePath: '/Retirement',
    assetPrefix: '/Retirement/',
  }),
  images: { unoptimized: true },
}

module.exports = nextConfig
