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
  },
  // Removido output: 'export' para permitir SSR e melhor compatibilidade com Firebase
  trailingSlash: true,
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

export default nextConfig
