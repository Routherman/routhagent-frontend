const defaultBackend = 'https://carditic-laci-unmerrily.ngrok-free.dev';
const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || defaultBackend).trim().replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${BACKEND_URL}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
