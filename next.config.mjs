const defaultBackend = 'https://descending-mailto-children-sunrise.trycloudflare.com';
let BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || defaultBackend).trim().replace(/\/+$/, '');
if (BACKEND_URL.includes('ngrok')) {
  BACKEND_URL = defaultBackend;
}

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
