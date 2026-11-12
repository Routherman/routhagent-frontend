'use client'

// ============================================================================
// El reproductor de una clase: elige el proveedor y le engancha el
// seguimiento. Los componentes de cada proveedor solo saben reproducir y
// avisar "estoy andando / pausé / terminé"; medir es cosa de este.
//
// En modo obligatorio, además:
//   · no se puede adelantar: si se salta más allá de lo ya visto, vuelve.
//     Para atrás sí, para repasar.
//   · velocidad fija en 1x: a 2x "se ve entero" en la mitad del tiempo.
// ============================================================================

import { useCallback, useEffect, useRef } from 'react'
import type { Medidor } from '../../lib/academia/medidor'
import type { RespuestaAbrir } from '../../lib/academia/tipos'
import ReproductorBunny from './ReproductorBunny'
import ReproductorDrive from './ReproductorDrive'
import ReproductorHtml5 from './ReproductorHtml5'
import ReproductorYouTube from './ReproductorYouTube'
import { useSeguimiento } from './useSeguimiento'

export default function Reproductor({
  datos,
  modoObligatorio = false,
  alTerminar,
  alMedidor,
}: {
  datos: RespuestaAbrir
  modoObligatorio?: boolean
  alTerminar?: () => void
  /** Para quien necesite el medidor (el modal obligatorio manda el último tramo con "terminé"). */
  alMedidor?: (m: Medidor | null) => void
}) {
  const { alEstado, alListo, control, medidor } = useSeguimiento({
    token: datos.sesion?.token ?? null,
    intervaloS: datos.sesion?.intervaloS ?? 20,
    duracionCatalogoS: datos.clase.duracionS,
  })

  useEffect(() => {
    alMedidor?.(medidor.current)
  })

  // Guardia del obligatorio.
  const maxVisto = useRef(0)
  useEffect(() => {
    if (!modoObligatorio) return
    const id = window.setInterval(() => {
      const c = control.current
      if (!c) return
      c.velocidadNormal()
      const pos = c.posicion()
      // 2 s de tolerancia: entre dos chequeos avanza ~0,5 s, y el reproductor
      // a veces informa saltitos al bufferear.
      if (pos > maxVisto.current + 2) c.irA(maxVisto.current)
      else maxVisto.current = Math.max(maxVisto.current, pos)
    }, 500)
    return () => window.clearInterval(id)
  }, [modoObligatorio, control])

  const terminar = useCallback(() => alTerminar?.(), [alTerminar])
  const inicioS = modoObligatorio ? 0 : datos.progreso.ultimaPosicion

  const f = datos.fuente
  switch (f.proveedor) {
    case 'youtube':
      return <ReproductorYouTube fuente={f} inicioS={inicioS} alEstado={alEstado} alListo={alListo} alTerminar={terminar} />
    case 'bunny':
      return <ReproductorBunny fuente={f} inicioS={inicioS} alEstado={alEstado} alListo={alListo} alTerminar={terminar} />
    case 'mux':
    case 'directo':
      return <ReproductorHtml5 fuente={f} inicioS={inicioS} alEstado={alEstado} alListo={alListo} alTerminar={terminar} />
    case 'drive':
      return <ReproductorDrive fuente={f} />
  }
}
