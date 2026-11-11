const defaultBackend = 'https://clients-altered-coast-factor.trycloudflare.com';
let BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || defaultBackend).trim().replace(/\/+$/, '');
const isVercelBuild = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
if (
  BACKEND_URL.includes('ngrok') ||
  (BACKEND_URL.includes('trycloudflare.com') && !BACKEND_URL.includes('clients-altered-coast-factor')) ||
  (isVercelBuild && (BACKEND_URL.includes('localhost') || BACKEND_URL.includes('127.0.0.1')))
) {
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
