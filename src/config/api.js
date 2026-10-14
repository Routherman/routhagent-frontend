const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

// En el navegador en producción (ej. Vercel), usamos rutas relativas para aprovechar
// los rewrites de Next.js. De esta forma, el navegador NO realiza peticiones Cross-Origin
// y se eliminan al 100% los bloqueos de CORS y advertencias de Ngrok.
const isVercelBrowser = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

export const BASE_URL = isVercelBrowser ? '' : (rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl);
export const API_URL = isVercelBrowser ? '/api' : (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`);
