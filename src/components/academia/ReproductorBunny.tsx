'use client'

// ============================================================================
// Bunny Stream con su iframe de embed + player.js (el estándar que Bunny
// expone en el embed). Eventos: play, pause, ended, timeupdate.
//
// La URL del embed viene firmada del backend (token + expires), así que no
// se puede reusar fuera del sistema después de que vence.
//
// Para videos obligatorios: player.js no expone la velocidad. Desactivá el
// control de velocidad en la configuración del reproductor de la librería.
// ============================================================================

import { useEffect, useRef } from 'react'
import type { FuenteVideo, PropsProveedor } from '../../lib/academia/tipos'
import estilos from './academia.module.css'

const PLAYERJS_URL = 'https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js'

interface PlayerJs {
  on(evento: string, cb: (datos?: { seconds?: number; duration?: number }) => void): void
  getDuration(cb: (d: number) => void): void
  setCurrentTime(s: number): void
}
declare global {
  interface Window {
    playerjs?: { Player: new (iframe: HTMLIFrameElement) => PlayerJs }
  }
}

let cargando: Promise<NonNullable<Window['playerjs']>> | null = null
function cargarPlayerJs() {
  if (window.playerjs) return Promise.resolve(window.playerjs)
  if (!cargando) {
    cargando = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = PLAYERJS_URL
      s.async = true
      s.onload = () => (window.playerjs ? resolve(window.playerjs) : reject(new Error('player.js sin cargar')))
      s.onerror = () => {
        cargando = null
        reject(new Error('No cargó player.js'))
      }
      document.head.appendChild(s)
    })
  }
  return cargando
}

export default function ReproductorBunny({
  fuente,
  inicioS,
  alEstado,
  alListo,
  alTerminar,
}: PropsProveedor<Extract<FuenteVideo, { proveedor: 'bunny' }>>) {
  const iframe = useRef<HTMLIFrameElement>(null)
  const cb = useRef({ alEstado, alListo, alTerminar })

  useEffect(() => {
    cb.current = { alEstado, alListo, alTerminar }
  }, [alEstado, alListo, alTerminar])

  useEffect(() => {
    let vivo = true
    // player.js manda la posición por evento y la consulta es asíncrona: se
    // guarda la última que llegó para poder leerla al instante en el latido.
    let posicion = 0
    let duracion: number | null = null

    cargarPlayerJs()
      .then((pjs) => {
        if (!vivo || !iframe.current) return
        const player = new pjs.Player(iframe.current)
        player.on('ready', () => {
          if (!vivo) return
          player.getDuration((d) => {
            if (Number.isFinite(d) && d > 0) duracion = d
          })
          if (inicioS && inicioS > 0) player.setCurrentTime(inicioS)
          player.on('play', () => cb.current.alEstado(true))
          player.on('pause', () => cb.current.alEstado(false))
          player.on('ended', () => {
            cb.current.alEstado(false)
            cb.current.alTerminar?.()
          })
          player.on('timeupdate', (d) => {
            if (typeof d?.seconds === 'number') posicion = d.seconds
            if (typeof d?.duration === 'number' && Number.isFinite(d.duration) && d.duration > 0) duracion = d.duration
          })
          cb.current.alListo({
            posicion: () => posicion,
            duracion: () => duracion,
            irA: (s) => player.setCurrentTime(s),
            velocidadNormal: () => undefined,
          })
        })
      })
      .catch(() => undefined)

    return () => {
      vivo = false
      cb.current.alEstado(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuente.embedUrl])

  return (
    <div className={estilos.marcoVideo}>
      <iframe
        ref={iframe}
        src={fuente.embedUrl}
        title="Clase"
        loading="eager"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  )
}
