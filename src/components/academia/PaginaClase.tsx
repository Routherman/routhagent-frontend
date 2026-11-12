'use client'

// La página de una clase: abre la sesión (eso registra "abierta"), muestra el
// reproductor con seguimiento y deja marcarla como vista.

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { api, ErrorApi } from '../../lib/academia/api'
import { RUTAS, reloj } from '../../lib/academia/formato'
import type { Logro, RespuestaAbrir } from '../../lib/academia/tipos'
import Reproductor from './Reproductor'
import estilos from './academia.module.css'

export default function PaginaClase({ claseId }: { claseId: number }) {
  const [datos, setDatos] = useState<RespuestaAbrir | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [marcada, setMarcada] = useState(false)
  const [logro, setLogro] = useState<Logro | null>(null)
  // En desarrollo, React (StrictMode) monta dos veces: sin esta guarda cada
  // visita contaría dos aperturas y abriría dos sesiones.
  const pedida = useRef<number | null>(null)

  useEffect(() => {
    if (pedida.current === claseId) return
    pedida.current = claseId
    api
      .abrirClase(claseId)
      .then((d) => {
        setDatos(d)
        setMarcada(d.progreso.marcada)
      })
      .catch((e) => {
        if (e instanceof ErrorApi && e.status === 401) setError('Iniciá sesión para ver la clase.')
        else if (e instanceof ErrorApi && e.status === 404) setError('Esta clase no existe o no está publicada.')
        else setError(e instanceof ErrorApi ? e.message : 'No se pudo abrir la clase.')
      })
  }, [claseId])

  async function alternarMarca() {
    try {
      const r = await api.marcar(claseId, !marcada)
      setMarcada(r.marcada)
      if (r.logro) setLogro(r.logro)
    } catch {
      setError('No se pudo guardar la marca.')
    }
  }

  return (
    <div className={estilos.raiz}>
      <Link href={RUTAS.inicio} className={estilos.volver}>← Academia</Link>
      {error && <p className={estilos.textoError}>{error}</p>}
      {!datos && !error && <p className={estilos.tenue}>Abriendo la clase…</p>}
      {datos && (
        <>
          <p className={estilos.tenue}>{datos.clase.curso.nombre}</p>
          <h1>{datos.clase.nombre}</h1>
          <Reproductor datos={datos} />
          <div className={estilos.filaAcciones}>
            <button type="button" className={marcada ? estilos.botonSecundario : estilos.boton} onClick={() => void alternarMarca()}>
              {marcada ? '✓ Marcada como vista' : 'Marcar como vista'}
            </button>
            {datos.clase.duracionS && <span className={estilos.tenue}>Dura {reloj(datos.clase.duracionS)}</span>}
            {datos.fuente.medible && datos.progreso.ultimaPosicion > 0 && (
              <span className={estilos.tenue}>Retoma en {reloj(datos.progreso.ultimaPosicion)}</span>
            )}
          </div>
          {logro && (
            <div className={estilos.logro} role="status">
              <strong>¡{logro.nombre}!</strong> {logro.detalle}.
            </div>
          )}
          {datos.clase.descripcion && <p className={estilos.descripcion}>{datos.clase.descripcion}</p>}
        </>
      )}
    </div>
  )
}
