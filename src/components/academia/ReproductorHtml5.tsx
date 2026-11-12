'use client'

// ============================================================================
// <video> HTML5, para dos casos:
//   · mux     → HLS (stream.mux.com/<id>.m3u8, firmado si hay signing key)
//   · directo → un archivo .mp4/.webm, o un .m3u8 propio
//
// HLS: Safari lo reproduce solo; el resto necesita hls.js. La librería se
// carga recién al abrir una clase (~200 kB que no tienen por qué pesar en el
// resto del sistema).
// ============================================================================

import { useEffect, useRef, useState } from 'react'
import type { FuenteVideo, PropsProveedor } from '../../lib/academia/tipos'
import estilos from './academia.module.css'

type FuenteHtml5 = Extract<FuenteVideo, { proveedor: 'mux' | 'directo' }>

export default function ReproductorHtml5({ fuente, inicioS, alEstado, alListo, alTerminar }: PropsProveedor<FuenteHtml5>) {
  const video = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [versionVieja, setVersionVieja] = useState(false)
  const cb = useRef({ alEstado, alListo, alTerminar })

  useEffect(() => {
    cb.current = { alEstado, alListo, alTerminar }
  }, [alEstado, alListo, alTerminar])

  // Cargar la fuente.
  useEffect(() => {
    const el = video.current
    if (!el) return
    let vivo = true
    // Se guarda para soltar los buffers al salir: sin esto la pestaña sigue
    // descargando el video después de cerrar la clase.
    let hls: { destroy: () => void } | null = null

    ;(async () => {
      if (!fuente.esHls) {
        el.src = fuente.src
        return
      }
      // hls.js PRIMERO y el soporte nativo después, no al revés: Chrome
      // contesta "maybe" a canPlayType('application/vnd.apple.mpegurl') y
      // después no reproduce nada. El nativo queda para Safari / iOS.
      //
      // hls.js viene en un pedazo aparte del bundle: si se publicó una versión
      // nueva con la página abierta, ese pedazo ya no existe y el import falla.
      // Eso no es "la clase no anda": es "recargá".
      const Hls = await import('hls.js').then((m) => m.default).catch(() => null)
      if (!vivo) return
      if (Hls?.isSupported()) {
        const instancia = new Hls()
        instancia.loadSource(fuente.src)
        instancia.attachMedia(el)
        hls = instancia
      } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
        el.src = fuente.src
      } else if (!Hls) {
        setVersionVieja(true)
      } else {
        setError('Este navegador no puede reproducir la clase')
      }
    })().catch(() => vivo && setError('No se pudo abrir la clase'))

    return () => {
      vivo = false
      hls?.destroy()
    }
  }, [fuente.src, fuente.esHls])

  // Eventos de reproducción.
  useEffect(() => {
    const el = video.current
    if (!el) return
    const estado = () => cb.current.alEstado(!el.paused && !el.ended)
    const fin = () => {
      estado()
      cb.current.alTerminar?.()
    }
    const listo = () => {
      if (inicioS && inicioS > 0 && el.currentTime < 1) el.currentTime = inicioS
    }
    el.addEventListener('play', estado)
    el.addEventListener('playing', estado)
    el.addEventListener('pause', estado)
    el.addEventListener('ended', fin)
    el.addEventListener('loadedmetadata', listo)
    cb.current.alListo({
      posicion: () => el.currentTime || 0,
      // Con HLS, `duration` es NaN hasta que carga el manifiesto y a veces
      // Infinity: eso es "no sé", y el medidor usa la del catálogo.
      duracion: () => (Number.isFinite(el.duration) && el.duration > 0 ? el.duration : null),
      irA: (s) => {
        el.currentTime = s
      },
      velocidadNormal: () => {
        if (el.playbackRate !== 1) el.playbackRate = 1
      },
    })
    return () => {
      el.removeEventListener('play', estado)
      el.removeEventListener('playing', estado)
      el.removeEventListener('pause', estado)
      el.removeEventListener('ended', fin)
      el.removeEventListener('loadedmetadata', listo)
      cb.current.alEstado(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={estilos.marcoVideo}>
      {/* Sin proporción forzada en el <video>: hay clases filmadas en vertical
          y un marco 16:9 les deja media pantalla en negro. */}
      <video ref={video} controls playsInline preload="metadata" className={estilos.video} />
      {versionVieja && (
        <div className={estilos.superpuesto}>
          <p>El sistema se actualizó. Recargá la página para ver la clase.</p>
          <button type="button" className={estilos.boton} onClick={() => window.location.reload()}>
            Recargar
          </button>
        </div>
      )}
      {error && (
        <div className={estilos.superpuesto}>
          <p className={estilos.textoError}>{error}</p>
        </div>
      )}
    </div>
  )
}
