import type { EstadoClase, EstadoPractica } from './tipos'

/** Dónde viven las páginas. Si las montás en otra ruta, cambiá solo esto. */
export const RUTAS = {
  inicio: '/dashboard/academia',
  clase: (id: number) => `/dashboard/academia/clase/${id}`,
  practicas: '/dashboard/academia/practicas',
  equipo: '/dashboard/academia/equipo',
  corregir: '/dashboard/academia/equipo/practicas',
  /**
   * Link al trabajo de una práctica dentro del sistema (su herramienta real).
   * Devolver null si no hay pantalla para verlo.
   */
  trabajo: (ref: string): string | null => {
    const clean = (ref || '').trim()
    if (!clean) return null
    if (clean.toLowerCase().startsWith('ticket:')) {
      return `/dashboard/tickets?ref=${encodeURIComponent(clean)}`
    }
    return `/dashboard/crm?ref=${encodeURIComponent(clean)}`
  },
}

/** 312 → "5:12"; 3725 → "1:02:05". */
export function reloj(segundos: number | null | undefined): string {
  const s = Math.max(0, Math.floor(Number(segundos) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** 1500 → "25 min"; 5400 → "1,5 h". */
export function duracionCorta(segundos: number): string {
  if (segundos < 60) return segundos > 0 ? '< 1 min' : '0 min'
  if (segundos < 3600) return `${Math.round(segundos / 60)} min`
  return `${String(Math.round((segundos / 3600) * 10) / 10).replace('.', ',')} h`
}

export function fechaCorta(v: number | string | null | undefined): string {
  if (v == null) return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' })
}

export const TEXTO_ESTADO_CLASE: Record<EstadoClase, string> = {
  no_medible: 'No medible',
  sin_abrir: 'Sin abrir',
  en_curso: 'En curso',
  completa: 'Completa',
  salteada: 'Salteada',
  sin_duracion: 'Mirada (sin duración)',
}

export const TEXTO_ESTADO_PRACTICA: Record<EstadoPractica, string> = {
  pendiente: 'A medias',
  entregado: 'Entregada, a corregir',
  aprobado: 'Aprobada',
  rehacer: 'A rehacer',
}
