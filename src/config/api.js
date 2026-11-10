const defaultBackend = 'https://webcams-upload-occupation-beginner.trycloudflare.com';
let rawUrl = (process.env.NEXT_PUBLIC_API_URL || defaultBackend).trim().replace(/\/+$/, '');

// Si estamos navegando en localhost, usar http://localhost:8080 directamente para máxima velocidad y evitar depender del túnel
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  if (!rawUrl.includes('localhost') && !rawUrl.includes('127.0.0.1')) {
    rawUrl = 'http://localhost:8080';
  }
}

if (rawUrl.includes('ngrok')) {
  rawUrl = defaultBackend;
}

export const BASE_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl;
export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
