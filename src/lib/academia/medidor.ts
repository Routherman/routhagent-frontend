// ============================================================================
// El medidor de tiempo mirado, del lado del navegador.
//
// Lógica pura (sin React ni DOM): se le avisa cuándo el video se reproduce y
// cuándo la pestaña está visible, y él acumula y manda latidos. Así se puede
// testear con un reloj falso.
//
// Reglas:
//   · Solo suma mientras el video SE REPRODUCE y la pestaña está VISIBLE.
//     Dejar la clase corriendo en otra pestaña no suma: si no, el número
//     diría cuánto tiempo estuvo abierto el navegador, no cuánto se capacitó
//     alguien.
//   · Manda el INCREMENTO, no el total: recargar la página no duplica nada.
//   · Manda segundos enteros y se guarda la fracción para el próximo latido:
//     redondear en cada latido perdía (o inventaba) medio segundo cada vez.
//   · Si el incremento es menor a 3 s, no se manda (salvo el último).
//   · Si un latido falla, lo no enviado vuelve al acumulador (con tope): el
//     servidor lo acepta igual, porque mide el tiempo transcurrido desde el
//     último latido que SÍ llegó.
//   · Si el aviso falla, se ignora: que no se registre el progreso no puede
//     romperle la clase a nadie.
// ============================================================================

import type { Latido } from './tipos'

export interface OpcionesMedidor {
  leerPosicion: () => number
  leerDuracion: () => number | null
  /** Devuelve true si el servidor lo recibió. En el envío final (beacon) no se sabe: true. */
  enviar: (latido: Latido, final: boolean) => Promise<boolean>
  /** Duración del catálogo, para cuando el reproductor todavía no la sabe. */
  duracionCatalogoS?: number | null
  minimoS?: number
  /** Lo máximo que se guarda sin enviar (por latidos fallidos). */
  topePendienteS?: number
  ahora?: () => number
}

export class Medidor {
  private reproduciendo = false
  private visible = true
  private ultimo: number
  private acumulado = 0
  private readonly ahora: () => number

  constructor(private readonly op: OpcionesMedidor) {
    this.ahora = op.ahora ?? (() => Date.now())
    this.ultimo = this.ahora()
  }

  private get mirando() {
    return this.reproduciendo && this.visible
  }

  /** Suma lo que pasó desde el último tick, si se estaba mirando. */
  tick() {
    const t = this.ahora()
    if (this.mirando) this.acumulado += Math.max(0, (t - this.ultimo) / 1000)
    this.ultimo = t
  }

  // Cada cambio de estado cierra el tramo anterior con el estado VIEJO.
  setReproduciendo(v: boolean) {
    this.tick()
    this.reproduciendo = v
  }

  setVisible(v: boolean) {
    this.tick()
    this.visible = v
  }

  /** Segundos acumulados todavía sin enviar. */
  pendienteS(): number {
    this.tick()
    return this.acumulado
  }

  private armar(segundos: number): Latido {
    const informada = this.op.leerDuracion()
    const duracion =
      informada != null && Number.isFinite(informada) && informada > 0
        ? Math.round(informada)
        : this.op.duracionCatalogoS && this.op.duracionCatalogoS > 0
          ? Math.round(this.op.duracionCatalogoS)
          : null
    const pos = this.op.leerPosicion()
    return { segundos, posicion: Number.isFinite(pos) && pos > 0 ? Math.floor(pos) : 0, duracion }
  }

  /** Saca todo lo acumulado como un latido (para mandarlo junto con otra cosa). */
  tomarTodo(): Latido {
    this.tick()
    const segundos = Math.floor(this.acumulado)
    this.acumulado -= segundos
    return this.armar(segundos)
  }

  async avisar(final = false): Promise<void> {
    this.tick()
    const segundos = Math.floor(this.acumulado)
    if (segundos <= 0) return
    if (segundos < (this.op.minimoS ?? 3) && !final) return
    this.acumulado -= segundos
    let ok = false
    try {
      ok = await this.op.enviar(this.armar(segundos), final)
    } catch {
      ok = false
    }
    if (!ok && !final) {
      this.acumulado = Math.min(this.op.topePendienteS ?? 120, this.acumulado + segundos)
    }
  }
}
