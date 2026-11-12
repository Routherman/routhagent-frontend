'use client'

// ============================================================================
// Un video que hay que ver ENTERO una vez.
//
// Se dispara en un momento del flujo de trabajo (la primera vez que la
// persona hace lo que el video explica), no al entrar al sistema:
//
//   {mostrar && <VideoObligatorio clave="bienvenida" alTerminar={() => setMostrar(false)} />}
//
// · No tiene botón de cerrar ni se va con Escape o clic afuera.
// · No se puede adelantar ni cambiar la velocidad (lo hace el Reproductor).
// · Al terminar, el SERVIDOR verifica que lo reproducido en esta sesión sea
//   al menos la duración del catálogo menos 3 s. Recién ahí lo anota.
// · Si ya lo vio, no muestra nada y llama a alTerminar enseguida.
// ============================================================================

import { useEffect, useRef, useState } from 'react'
import { api, ErrorApi } from '../../lib/academia/api'
import type { Medidor } from '../../lib/academia/medidor'
import type { RespuestaAbrir } from '../../lib/academia/tipos'
import Reproductor from './Reproductor'
import estilos from './academia.module.css'

export default function VideoObligatorio({ clave, alTerminar }: { clave: string; alTerminar: () => void }) {
  const [datos, setDatos] = useState<RespuestaAbrir | null>(null)
  const [llegoAlFinal, setLlegoAlFinal] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const medidor = useRef<Medidor | null>(null)
  const pedido = useRef(false)

  useEffect(() => {
    if (pedido.current) return
    pedido.current = true
    api
      .obligatorio(clave)
      .then(async (o) => {
        if (!o.pendiente) return alTerminar()
        setDatos(await api.abrirClase(o.claseId))
      })
      // Si el servicio falla, no se bloquea el trabajo de nadie.
      .catch(() => alTerminar())
  }, [clave, alTerminar])

  // Sin scroll de fondo mientras está abierto.
  useEffect(() => {
    if (!datos) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [datos])

  async function terminar() {
    if (!datos?.sesion) return
    setMensaje(null)
    try {
      const ultimo = medidor.current?.tomarTodo() ?? { segundos: 0, posicion: 0, duracion: datos.clase.duracionS }
      await api.terminarObligatorio(clave, datos.sesion.token, ultimo)
      alTerminar()
    } catch (e) {
      const faltan = e instanceof ErrorApi ? Number(e.datos.faltanS ?? 0) : 0
      setMensaje(
        faltan > 0
          ? `Todavía falta reproducir ${Math.ceil(faltan)} s. Volvé atrás y miralo de corrido.`
          : 'No se pudo registrar. Probá de nuevo.',
      )
      setLlegoAlFinal(false)
    }
  }

  if (!datos) return null

  return (
    <div className={estilos.modalFondo} role="dialog" aria-modal="true" aria-label={datos.clase.nombre}>
      <div className={estilos.modal}>
        <h2>{datos.clase.nombre}</h2>
        <p className={estilos.tenue}>Este video es obligatorio. Miralo entero para seguir.</p>
        <Reproductor
          datos={datos}
          modoObligatorio
          alMedidor={(m) => {
            medidor.current = m
          }}
          alTerminar={() => setLlegoAlFinal(true)}
        />
        <div className={estilos.filaAcciones}>
          <button type="button" className={estilos.boton} disabled={!llegoAlFinal} onClick={() => void terminar()}>
            Listo, lo vi entero
          </button>
        </div>
        {mensaje && <p className={estilos.textoError}>{mensaje}</p>}
      </div>
    </div>
  )
}
