const defaultBackend = 'https://descending-mailto-children-sunrise.trycloudflare.com';
let rawUrl = (process.env.NEXT_PUBLIC_API_URL || defaultBackend).trim().replace(/\/+$/, '');
if (rawUrl.includes('ngrok')) {
  rawUrl = defaultBackend;
}

export const BASE_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl;
export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
