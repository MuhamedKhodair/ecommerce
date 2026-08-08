/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://79.76.98.10:5000/api/:path*' },
      { source: '/uploads/:file', destination: 'http://79.76.98.10:5000/uploads/:file' },
    ]
  },
}

module.exports = nextConfig
