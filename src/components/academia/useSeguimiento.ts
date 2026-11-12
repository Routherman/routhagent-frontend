'use client'

// ============================================================================
// Engancha el Medidor (lib/medidor.ts) al navegador:
//   · visibilitychange → la pestaña oculta no suma
//   · cada 20 s        → latido con el incremento
//   · pagehide         → último tramo con sendBeacon
//   · al desmontar     → último tramo también (cambio de página dentro de Next)
// ============================================================================

import { useCallback, useEffect, useRef } from 'react'
import { api } from '../../lib/academia/api'
import { Medidor } from '../../lib/academia/medidor'
import type { ControlReproductor } from '../../lib/academia/tipos'

export function useSeguimiento(opciones: {
  /** Token de la sesión de reproducción. null = clase no medible: no hace nada. */
  token: string | null
  intervaloS: number
  duracionCatalogoS: number | null
}) {
  const control = useRef<ControlReproductor | null>(null)
  const medidor = useRef<Medidor | null>(null)
  // El último estado que informó el reproductor, por si llegó antes de que
  // existiera el medidor (los efectos de los hijos corren antes que los del padre).
  const reproduciendo = useRef(false)
  const { token, intervaloS, duracionCatalogoS } = opciones

  useEffect(() => {
    if (!token) return
    const m = new Medidor({
      leerPosicion: () => control.current?.posicion() ?? 0,
      leerDuracion: () => control.current?.duracion() ?? null,
      duracionCatalogoS,
      enviar: (latido, final) => api.latido(token, latido, final),
    })
    medidor.current = m
    m.setVisible(document.visibilityState === 'visible')
    m.setReproduciendo(reproduciendo.current)

    const alCambiarVisibilidad = () => {
      const visible = document.visibilityState === 'visible'
      m.setVisible(visible)
      // Al ocultarse la pestaña se manda lo acumulado: en móviles, "oculta"
      // suele ser lo último que pasa antes de que el sistema mate la página.
      if (!visible) void m.avisar(true)
    }
    const alSalir = () => void m.avisar(true)
    const id = window.setInterval(() => void m.avisar(), intervaloS * 1000)

    document.addEventListener('visibilitychange', alCambiarVisibilidad)
    window.addEventListener('pagehide', alSalir)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
      window.removeEventListener('pagehide', alSalir)
      void m.avisar(true)
      medidor.current = null
    }
  }, [token, intervaloS, duracionCatalogoS])

  const alEstado = useCallback((v: boolean) => {
    reproduciendo.current = v
    medidor.current?.setReproduciendo(v)
  }, [])

  const alListo = useCallback((c: ControlReproductor) => {
    control.current = c
  }, [])

  return { alEstado, alListo, control, medidor }
}
