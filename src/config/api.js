const defaultBackend = 'https://clients-altered-coast-factor.trycloudflare.com';
let rawUrl = (process.env.NEXT_PUBLIC_API_URL || defaultBackend).trim().replace(/\/+$/, '');

// Si estamos navegando en localhost, usar http://localhost:8080 directamente para máxima velocidad y evitar depender del túnel
if (typeof window !== 'undefined') {
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalHost) {
    if (!rawUrl.includes('localhost') && !rawUrl.includes('127.0.0.1')) {
      rawUrl = 'http://localhost:8080';
    }
  } else if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
    rawUrl = defaultBackend;
  }
}

// Si la URL apunta a ngrok o a cualquier túnel de trycloudflare que no sea el túnel activo actual, usar defaultBackend
if (rawUrl.includes('ngrok') || (rawUrl.includes('trycloudflare.com') && !rawUrl.includes('clients-altered-coast-factor'))) {
  rawUrl = defaultBackend;
}

export const BASE_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl;
export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
