/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['i.imgur.com'],
    formats: ['image/webp', 'image/avif'],
  },
  trailingSlash: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CUSTOM_KEY: 'my-value',
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Otimizações para mobile
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
