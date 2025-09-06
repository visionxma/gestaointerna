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
  env: {
    CUSTOM_KEY: 'my-value',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Configurações para build estático
  output: 'export',
  distDir: 'out',
  // Remover configurações que causam problemas no build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig