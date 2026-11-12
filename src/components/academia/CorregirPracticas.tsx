'use client'

// Corrección de prácticas (admin: todas; líder: las de su equipo). El
// servidor vuelve a chequear el permiso en cada corrección; esta vista solo
// muestra lo que el servidor le mandó.

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, ErrorApi } from '../../lib/academia/api'
import { RUTAS, TEXTO_ESTADO_PRACTICA, fechaCorta } from '../../lib/academia/formato'
import type { EntregaACorregir } from '../../lib/academia/tipos'
import estilos from './academia.module.css'

const MIN_DEVOLUCION = 20

export default function CorregirPracticas() {
  const [entregas, setEntregas] = useState<EntregaACorregir[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .entregasACorregir()
      .then((r) => setEntregas(r.entregas))
      .catch((e) => setError(e instanceof ErrorApi && e.status === 404 ? 'No tenés acceso a esta página.' : 'No se pudo cargar.'))
  }, [])

  if (error) return <div className={estilos.raiz}><p className={estilos.textoError}>{error}</p></div>
  if (!entregas) return <div className={estilos.raiz}><p className={estilos.tenue}>Cargando…</p></div>

  const aCorregir = entregas.filter((e) => e.estado === 'entregado')
  const resto = entregas.filter((e) => e.estado !== 'entregado')

  return (
    <div className={estilos.raiz}>
      <Link href={RUTAS.equipo} className={estilos.volver}>← Tablero del equipo</Link>
      <h1>Prácticas a corregir</h1>
      {aCorregir.length === 0 && <p className={estilos.aviso}>No hay prácticas esperando corrección.</p>}
      {aCorregir.map((e) => (
        <TarjetaCorreccion
          key={`${e.usuarioId}-${e.ejercicio}`}
          entrega={e}
          alCorregir={(nueva) =>
            setEntregas((prev) =>
              (prev ?? []).map((x) => (x.usuarioId === e.usuarioId && x.ejercicio === e.ejercicio ? { ...x, ...nueva } : x)),
            )
          }
        />
      ))}
      {resto.length > 0 && (
        <>
          <h2>El resto</h2>
          <div className={estilos.tablaScroll}>
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Ejercicio</th>
                  <th>Estado</th>
                  <th>Actualizada</th>
                </tr>
              </thead>
              <tbody>
                {resto.map((e) => (
                  <tr key={`${e.usuarioId}-${e.ejercicio}`}>
                    <td>{e.nombre}</td>
                    <td>{e.titulo}</td>
                    <td>{TEXTO_ESTADO_PRACTICA[e.estado]}</td>
                    <td className={estilos.tenue}>{fechaCorta(e.actualizadoAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function TarjetaCorreccion({ entrega, alCorregir }: { entrega: EntregaACorregir; alCorregir: (e: Partial<EntregaACorregir>) => void }) {
  const [devolucion, setDevolucion] = useState('')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const link = entrega.trabajoRef ? RUTAS.trabajo(entrega.trabajoRef) : null

  async function corregir(resultado: 'aprobado' | 'rehacer') {
    setEnviando(true)
    setMensaje(null)
    try {
      const r = await api.corregir({
        usuarioId: entrega.usuarioId,
        ejercicio: entrega.ejercicio,
        resultado,
        devolucion: devolucion.trim() || undefined,
      })
      alCorregir(r.entrega)
    } catch (e) {
      setMensaje(e instanceof ErrorApi ? e.message : 'No se pudo guardar la corrección.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className={estilos.tarjeta}>
      <p className={estilos.kicker}>{entrega.nombre} · entregada el {fechaCorta(entrega.entregadoAt)}</p>
      <h2>{entrega.titulo}</h2>
      {entrega.trabajoRef && (
        <p>
          Trabajo: {link ? <a href={link}>{entrega.trabajoRef}</a> : <code>{entrega.trabajoRef}</code>}
        </p>
      )}
      <p className={estilos.explicacion}>{entrega.explicacion}</p>
      {entrega.devolucion && (
        <div className={estilos.devolucion}>
          <strong>Devolución anterior:</strong> {entrega.devolucion}
        </div>
      )}
      <label className={estilos.campo}>
        Devolución (obligatoria para mandar a rehacer)
        <textarea value={devolucion} onChange={(e) => setDevolucion(e.target.value)} rows={4} />
      </label>
      <div className={estilos.filaAcciones}>
        <button type="button" className={estilos.boton} disabled={enviando} onClick={() => void corregir('aprobado')}>
          Aprobar
        </button>
        <button
          type="button"
          className={estilos.botonSecundario}
          disabled={enviando || devolucion.trim().length < MIN_DEVOLUCION}
          onClick={() => void corregir('rehacer')}
        >
          Mandar a rehacer
        </button>
      </div>
      {mensaje && <p className={estilos.textoError}>{mensaje}</p>}
    </section>
  )
}
