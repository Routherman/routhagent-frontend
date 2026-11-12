// Las formas que devuelve el backend de la academia (backend/src/router.ts).

export type Rol = 'admin' | 'lider' | 'vendedor'
export type Proveedor = 'youtube' | 'bunny' | 'mux' | 'directo' | 'drive'
export type EstadoClase = 'no_medible' | 'sin_abrir' | 'en_curso' | 'completa' | 'salteada' | 'sin_duracion'
export type EstadoPractica = 'pendiente' | 'entregado' | 'aprobado' | 'rehacer'

export interface Yo {
  id: string
  rol: Rol
  nombre: string | null
  tieneTablero: boolean
}

export interface Logro {
  id: string
  nombre: string
  detalle: string
  desde: number
}

export interface ProgresoClase {
  marcada: boolean
  abierta: boolean
  segundosMirados: number
  ultimaPosicion: number
  completada: boolean
  estado: EstadoClase
}

export interface Clase {
  id: number
  moduloId: number
  nombre: string
  descripcion: string | null
  proveedor: Proveedor
  medible: boolean
  duracionS: number | null
  orden: number
  progreso: ProgresoClase
}

export interface ResumenCurso {
  total: number
  marcadas: number
  segundosMarcados: number
  segundosMirados: number
  logro: Logro | null
  proximo: { logro: Logro; faltan: number } | null
}

export interface Curso {
  id: number
  slug: string
  nombre: string
  descripcion: string | null
  portadaUrl: string | null
  modulos: { id: number; nombre: string; clases: Clase[] }[]
  resumen: ResumenCurso
}

export type FuenteVideo =
  | { proveedor: 'youtube'; medible: true; youtubeId: string }
  | { proveedor: 'bunny'; medible: true; embedUrl: string }
  | { proveedor: 'mux'; medible: true; src: string; esHls: true }
  | { proveedor: 'directo'; medible: true; src: string; esHls: boolean }
  | { proveedor: 'drive'; medible: false; embedUrl: string }

export interface RespuestaAbrir {
  clase: {
    id: number
    nombre: string
    descripcion: string | null
    duracionS: number | null
    curso: { id: number; slug: string; nombre: string }
    obligatoriaClave: string | null
  }
  fuente: FuenteVideo
  sesion: { token: string; intervaloS: number } | null
  progreso: ProgresoClase
}

export interface RespuestaMarca {
  marcada: boolean
  logro: Logro | null
  resumen: ResumenCurso
}

export interface Latido {
  segundos: number
  posicion: number
  duracion: number | null
}

export interface Enunciado {
  numero: number
  titulo: string
  habilidad: string
  pedido: string
  incluye: string[]
  explicar: string
  requiereTrabajo: boolean
  linkHerramienta?: string
}

export interface Entrega {
  estado: EstadoPractica
  trabajoRef: string | null
  explicacion: string
  devolucion: string | null
  revisadoAt: string | null
  entregadoAt: string | null
  actualizadoAt: string | null
}

export interface EntregaACorregir extends Entrega {
  usuarioId: string
  nombre: string
  ejercicio: number
  titulo: string
}

export interface FilaTablero {
  usuarioId: string
  nombre: string
  equipoId: string | null
  mirado: number
  miradoTexto: string | null
  completas: number
  salteadas: number
  abiertas: number
  marcadas: number
  segundosMarcados: number
  marcadoTexto: string | null
  aprobadas: number
  entregadas: number
  rehacer: number
  aMedias: number
  ultimaVezMs: number | null
  sinActividad: boolean
}

export interface Tablero {
  alcance: 'todos' | 'equipo'
  incluyeNoSeguidos: boolean
  totalPracticas: number
  practicasACorregir: number
  nadieAbrio: boolean
  nadieEntrego: boolean
  filas: FilaTablero[]
}

/** Lo que cada reproductor le expone al seguimiento. */
export interface ControlReproductor {
  /** Segundos actuales. */
  posicion(): number
  /** Duración si el reproductor ya la sabe; null si no (NaN, Infinity, 0). */
  duracion(): number | null
  irA(segundos: number): void
  /** Vuelve la velocidad a 1x (para videos obligatorios). */
  velocidadNormal(): void
}

/** Lo que reciben todos los reproductores por proveedor. */
export interface PropsProveedor<F extends FuenteVideo = FuenteVideo> {
  fuente: F
  /** Desde dónde retomar, en segundos. */
  inicioS?: number
  /** true cuando el video está reproduciéndose de verdad. */
  alEstado: (reproduciendo: boolean) => void
  alListo: (control: ControlReproductor) => void
  alTerminar?: () => void
}
