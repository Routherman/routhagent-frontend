const defaultBackend = 'https://carditic-laci-unmerrily.ngrok-free.dev';
const rawUrl = (process.env.NEXT_PUBLIC_API_URL || defaultBackend).trim().replace(/\/+$/, '');

export const BASE_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl;
export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
