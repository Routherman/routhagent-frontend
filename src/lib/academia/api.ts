// ============================================================================
// Cliente del backend de la academia.
//
// El backend corre en otro puerto (Express, 8080) que el front (Next, 3000).
// Todo es configurable por variables de entorno o llamando a
// configurarAcademia() una vez al arrancar la app:
//
//   NEXT_PUBLIC_ACADEMIA_API_URL      http://localhost:8080/api/academia
//   NEXT_PUBLIC_ACADEMIA_TOKEN_KEY    clave de localStorage donde vive el JWT (default "token")
//   NEXT_PUBLIC_ACADEMIA_AUTH_HEADER  header del JWT (default "Authorization")
//   NEXT_PUBLIC_ACADEMIA_CREDENTIALS  "include" si la sesión va por cookie, "omit" si no
//
// Si el JWT NO vive en localStorage (cookie httpOnly, contexto de React,
// etc.), pasá tu propio `obtenerToken` con configurarAcademia().
// ============================================================================

import { API_URL } from '@/config/api'
import type {
  Curso,
  Entrega,
  EntregaACorregir,
  Enunciado,
  Latido,
  Proveedor,
  RespuestaAbrir,
  RespuestaMarca,
  Tablero,
  Yo,
} from './tipos'

export interface ConfigApi {
  baseUrl: string
  /** Devuelve el JWT (sin el prefijo) o null si la sesión va por cookie. */
  obtenerToken: () => string | null | Promise<string | null>
  encabezado: string
  prefijo: string
  credenciales: RequestCredentials
}

let config: ConfigApi = {
  baseUrl: (process.env.NEXT_PUBLIC_ACADEMIA_API_URL ?? `${API_URL}/academia`).replace(/\/$/, ''),
  obtenerToken: async () => {
    try {
      const clerkSession = (window as unknown as { Clerk?: { session?: { getToken?: () => Promise<string | null> } } }).Clerk?.session
      if (clerkSession && typeof clerkSession.getToken === 'function') {
        const clerkToken = await clerkSession.getToken()
        if (clerkToken) return clerkToken
      }
      return window.localStorage.getItem(process.env.NEXT_PUBLIC_ACADEMIA_TOKEN_KEY ?? 'token')
    } catch {
      return null
    }
  },
  encabezado: process.env.NEXT_PUBLIC_ACADEMIA_AUTH_HEADER ?? 'Authorization',
  prefijo: (process.env.NEXT_PUBLIC_ACADEMIA_AUTH_HEADER ?? 'Authorization') === 'Authorization' ? 'Bearer ' : '',
  credenciales: (process.env.NEXT_PUBLIC_ACADEMIA_CREDENTIALS as RequestCredentials | undefined) ?? 'omit',
}

export function configurarAcademia(parcial: Partial<ConfigApi>) {
  config = { ...config, ...parcial }
}

export class ErrorApi extends Error {
  constructor(
    readonly status: number,
    mensaje: string,
    readonly datos: Record<string, unknown> = {},
  ) {
    super(mensaje)
  }
}

async function pedir<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('ngrok-skip-browser-warning', 'true')
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = await config.obtenerToken()
  if (token) headers.set(config.encabezado, `${config.prefijo}${token}`)
  const r = await fetch(`${config.baseUrl}${ruta}`, {
    ...init,
    headers,
    credentials: config.credenciales,
    // El video viene con URL firmada: nada de esto se cachea.
    cache: 'no-store',
  })
  const datos = (await r.json().catch(() => ({}))) as Record<string, unknown>
  if (!r.ok) throw new ErrorApi(r.status, String(datos.error ?? 'Algo falló'), datos)
  return datos as T
}

const json = (cuerpo: unknown) => JSON.stringify(cuerpo)

export const api = {
  yo: () => pedir<Yo>('/yo'),

  cursos: () => pedir<{ cursos: Curso[] }>('/cursos'),

  abrirClase: (id: number) => pedir<RespuestaAbrir>(`/clases/${id}/abrir`, { method: 'POST' }),

  marcar: (id: number, marcada: boolean) =>
    pedir<RespuestaMarca>(`/clases/${id}/marca`, { method: 'POST', body: json({ marcada }) }),

  /**
   * El latido. Va como text/plain y SIN el JWT: se autentica con el token de
   * la sesión de reproducción. Así no hay preflight de CORS y funciona con
   * sendBeacon al cerrar la pestaña (sendBeacon no puede mandar headers).
   */
  async latido(token: string, l: Latido, final = false): Promise<boolean> {
    const cuerpo = json({ token, ...l })
    const url = `${config.baseUrl}/latido`
    if (final && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      // Un fetch normal se cancela cuando la pestaña se cierra, y ese último
      // tramo suele ser el más largo.
      return navigator.sendBeacon(url, cuerpo)
    }
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: cuerpo,
      keepalive: true,
      credentials: 'omit',
    })
    return r.ok
  },

  obligatorio: (clave: string) =>
    pedir<{ pendiente: boolean; claseId: number; nombre: string; duracionS: number }>(
      `/obligatorios/${encodeURIComponent(clave)}`,
    ),

  terminarObligatorio: (clave: string, token: string, l: Latido) =>
    pedir<{ ok: true }>(`/obligatorios/${encodeURIComponent(clave)}/terminar`, {
      method: 'POST',
      body: json({ token, ...l }),
    }),

  practicas: () =>
    pedir<{ minExplicacion: number; practicas: { enunciado: Enunciado; entrega: Entrega | null }[] }>('/practicas'),

  guardarBorrador: (n: number, datos: { trabajoRef?: string | null; explicacion?: string }) =>
    pedir<{ entrega: Entrega }>(`/practicas/${n}`, { method: 'PUT', body: json(datos) }),

  entregar: (n: number, datos: { trabajoRef?: string | null; explicacion: string }) =>
    pedir<{ entrega: Entrega }>(`/practicas/${n}/entregar`, { method: 'POST', body: json(datos) }),

  entregasACorregir: () => pedir<{ entregas: EntregaACorregir[] }>('/practicas/corregir'),

  corregir: (datos: { usuarioId: string; ejercicio: number; resultado: 'aprobado' | 'rehacer'; devolucion?: string }) =>
    pedir<{ entrega: Entrega }>('/practicas/corregir', { method: 'POST', body: json(datos) }),

  tablero: (incluirNoSeguidos = false) => pedir<Tablero>(`/tablero${incluirNoSeguidos ? '?todos=1' : ''}`),

  admin: {
    catalogo: () =>
      pedir<{
        cursos: { id: number; slug: string; nombre: string; descripcion: string | null; portadaUrl: string | null; estado: 'borrador' | 'publicado'; orden: number }[]
        modulos: { id: number; cursoId: number; nombre: string; orden: number }[]
        clases: { id: number; moduloId: number; nombre: string; descripcion: string | null; proveedor: Proveedor; videoRef: string; duracionS: number | null; orden: number; obligatoriaClave: string | null }[]
      }>('/admin/catalogo'),
    crearCurso: (datos: { slug: string; nombre: string; descripcion?: string | null; estado?: 'borrador' | 'publicado'; orden?: number }) =>
      pedir('/admin/cursos', { method: 'POST', body: json(datos) }),
    cambiarEstadoCurso: (id: number, estado: 'borrador' | 'publicado') =>
      pedir(`/admin/cursos/${id}`, { method: 'PATCH', body: json({ estado }) }),
    crearModulo: (datos: { cursoId: number; nombre: string; orden?: number }) =>
      pedir('/admin/modulos', { method: 'POST', body: json(datos) }),
    crearClase: (datos: {
      moduloId: number
      nombre: string
      descripcion?: string | null
      proveedor: Proveedor
      videoRef: string
      duracionS?: number | null
      orden?: number
      obligatoriaClave?: string | null
    }) => pedir('/admin/clases', { method: 'POST', body: json(datos) }),
    eliminarClase: (id: number) => pedir(`/admin/clases/${id}`, { method: 'DELETE' }),
    sincronizarEquipo: () => pedir<{ ok: true; equiposCount: number; personasCount: number }>('/admin/sincronizar-equipo', { method: 'POST' }),
  },
}
