'use client'

// ============================================================================
// YouTube con la IFrame Player API: da el estado (reproduciendo / pausa /
// fin) y currentTime, que es todo lo que hace falta para medir.
//
// Ojo: un video "no listado" lo ve cualquiera que tenga el link. Sirve para
// medir, no para proteger el material. Si el material es sensible: Bunny o Mux.
// ============================================================================

import { useEffect, useRef } from 'react'
import type { FuenteVideo, PropsProveedor } from '../../lib/academia/tipos'
import estilos from './academia.module.css'

// Tipos mínimos de la API (para no depender de @types/youtube).
interface YTPlayer {
  getCurrentTime(): number
  getDuration(): number
  seekTo(segundos: number, permitirBuscar: boolean): void
  setPlaybackRate(v: number): void
  getPlaybackRate(): number
  destroy(): void
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opciones: {
      videoId: string
      width?: string
      height?: string
      playerVars?: Record<string, number | string>
      events?: {
        onReady?: (e: { target: YTPlayer }) => void
        onStateChange?: (e: { data: number; target: YTPlayer }) => void
        onPlaybackRateChange?: (e: { data: number; target: YTPlayer }) => void
      }
    },
  ) => YTPlayer
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

// Estados de YT.PlayerState.
const REPRODUCIENDO = 1
const TERMINADO = 0

let cargandoApi: Promise<YTNamespace> | null = null

/** Carga la API una sola vez por página, aunque haya varios reproductores. */
function apiYouTube(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!cargandoApi) {
    cargandoApi = new Promise((resolve, reject) => {
      const anterior = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        anterior?.()
        if (window.YT) resolve(window.YT)
      }
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      s.onerror = () => {
        cargandoApi = null
        reject(new Error('No cargó la API de YouTube'))
      }
      document.head.appendChild(s)
    })
  }
  return cargandoApi
}

export default function ReproductorYouTube({
  fuente,
  inicioS,
  alEstado,
  alListo,
  alTerminar,
}: PropsProveedor<Extract<FuenteVideo, { proveedor: 'youtube' }>>) {
  const anfitrion = useRef<HTMLDivElement>(null)
  // Los callbacks en refs: si cambian, no hay que recrear el reproductor.
  const cb = useRef({ alEstado, alListo, alTerminar })

  useEffect(() => {
    cb.current = { alEstado, alListo, alTerminar }
  }, [alEstado, alListo, alTerminar])

  useEffect(() => {
    let vivo = true
    let player: YTPlayer | null = null
    // La API reemplaza el elemento por un <iframe>. Se crea un div aparte para
    // que React no se pelee con un nodo que ya no es el suyo.
    const destino = document.createElement('div')
    anfitrion.current?.appendChild(destino)

    apiYouTube()
      .then((YT) => {
        if (!vivo) return
        player = new YT.Player(destino, {
          videoId: fuente.youtubeId,
          width: '100%',
          height: '100%',
          playerVars: { rel: 0, playsinline: 1, modestbranding: 1, start: Math.floor(inicioS ?? 0) },
          events: {
            onReady: (e) => {
              const p = e.target
              cb.current.alListo({
                posicion: () => p.getCurrentTime() || 0,
                duracion: () => {
                  const d = p.getDuration()
                  return Number.isFinite(d) && d > 0 ? d : null
                },
                irA: (s) => p.seekTo(s, true),
                velocidadNormal: () => {
                  if (p.getPlaybackRate() !== 1) p.setPlaybackRate(1)
                },
              })
            },
            onStateChange: (e) => {
              cb.current.alEstado(e.data === REPRODUCIENDO)
              if (e.data === TERMINADO) cb.current.alTerminar?.()
            },
          },
        })
      })
      .catch(() => undefined)

    return () => {
      vivo = false
      cb.current.alEstado(false)
      player?.destroy()
      destino.remove()
    }
    // inicioS solo importa al crear el reproductor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuente.youtubeId])

  return <div ref={anfitrion} className={estilos.marcoVideo} />
}
