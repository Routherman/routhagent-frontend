'use client'

// ============================================================================
// Las prácticas de la persona: enunciado, borrador y entrega.
//
// El trabajo se hace en la herramienta REAL del sistema (marcado como
// práctica) y acá se engancha su referencia + se explica el porqué. La fila
// nace cuando la persona guarda el primer borrador, no antes.
// ============================================================================

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, ErrorApi } from '../../lib/academia/api'
import { RUTAS, TEXTO_ESTADO_PRACTICA } from '../../lib/academia/formato'
import type { Entrega, Enunciado } from '../../lib/academia/tipos'
import estilos from './academia.module.css'

export default function Practicas() {
  const [lista, setLista] = useState<{ enunciado: Enunciado; entrega: Entrega | null }[] | null>(null)
  const [minimo, setMinimo] = useState(120)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .practicas()
      .then((r) => {
        setLista(r.practicas)
        setMinimo(r.minExplicacion)
      })
      .catch(() => setError('No se pudieron cargar las prácticas.'))
  }, [])

  const reemplazar = (n: number, entrega: Entrega) =>
    setLista((prev) => (prev ?? []).map((p) => (p.enunciado.numero === n ? { ...p, entrega } : p)))

  if (error) return <div className={estilos.raiz}><p className={estilos.textoError}>{error}</p></div>
  if (!lista) return <div className={estilos.raiz}><p className={estilos.tenue}>Cargando…</p></div>

  return (
    <div className={estilos.raiz}>
      <Link href={RUTAS.inicio} className={estilos.volver}>← Academia</Link>
      <h1>Prácticas</h1>
      <p className={estilos.tenue}>
        Cada práctica se resuelve en el sistema, en modo práctica, y se entrega con una explicación de por qué lo hiciste
        así. La corrige tu líder o un administrador.
      </p>
      {lista.map(({ enunciado, entrega }) => (
        <TarjetaPractica key={enunciado.numero} enunciado={enunciado} entrega={entrega} minimo={minimo} alCambiar={reemplazar} />
      ))}
    </div>
  )
}

function TarjetaPractica({
  enunciado,
  entrega,
  minimo,
  alCambiar,
}: {
  enunciado: Enunciado
  entrega: Entrega | null
  minimo: number
  alCambiar: (n: number, e: Entrega) => void
}) {
  const [trabajoRef, setTrabajoRef] = useState(entrega?.trabajoRef ?? '')
  const [explicacion, setExplicacion] = useState(entrega?.explicacion ?? '')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const bloqueada = entrega?.estado === 'entregado' || entrega?.estado === 'aprobado'
  const largo = explicacion.trim().length
  const puedeEntregar = !bloqueada && largo >= minimo && (!enunciado.requiereTrabajo || trabajoRef.trim().length > 0)

  async function guardar(entregar: boolean) {
    setEnviando(true)
    setMensaje(null)
    try {
      const r = entregar
        ? await api.entregar(enunciado.numero, { trabajoRef: trabajoRef.trim() || null, explicacion })
        : await api.guardarBorrador(enunciado.numero, { trabajoRef: trabajoRef.trim() || null, explicacion })
      alCambiar(enunciado.numero, r.entrega)
      setMensaje(entregar ? 'Entregada. Te avisamos cuando esté corregida.' : 'Borrador guardado.')
    } catch (e) {
      setMensaje(e instanceof ErrorApi ? e.message : 'No se pudo guardar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className={estilos.tarjeta}>
      <p className={estilos.kicker}>{enunciado.habilidad}</p>
      <h2>
        {enunciado.numero}. {enunciado.titulo}
      </h2>
      {entrega && <span className={`${estilos.etiqueta} ${estilos[`practica_${entrega.estado}`] ?? ''}`}>{TEXTO_ESTADO_PRACTICA[entrega.estado]}</span>}
      <blockquote className={estilos.pedido}>{enunciado.pedido}</blockquote>
      <p><strong>Tiene que incluir:</strong></p>
      <ul>
        {enunciado.incluye.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <p><strong>Explicá por escrito:</strong> {enunciado.explicar}</p>

      {entrega?.devolucion && (
        <div className={estilos.devolucion}>
          <strong>Devolución:</strong> {entrega.devolucion}
        </div>
      )}

      {enunciado.linkHerramienta && !bloqueada && (
        <p>
          <a href={enunciado.linkHerramienta} className={estilos.botonSecundario}>Resolverla en el sistema</a>
        </p>
      )}

      {enunciado.requiereTrabajo && (
        <label className={estilos.campo}>
          Referencia del trabajo hecho en el sistema
          <input value={trabajoRef} onChange={(e) => setTrabajoRef(e.target.value)} disabled={bloqueada} maxLength={191} />
        </label>
      )}
      <label className={estilos.campo}>
        Tu explicación
        <textarea value={explicacion} onChange={(e) => setExplicacion(e.target.value)} disabled={bloqueada} rows={6} />
        <span className={largo >= minimo ? estilos.tenue : estilos.detalle}>
          {largo} / {minimo} caracteres mínimos
        </span>
      </label>

      {!bloqueada && (
        <div className={estilos.filaAcciones}>
          <button type="button" className={estilos.botonSecundario} disabled={enviando} onClick={() => void guardar(false)}>
            Guardar borrador
          </button>
          <button type="button" className={estilos.boton} disabled={enviando || !puedeEntregar} onClick={() => void guardar(true)}>
            Entregar
          </button>
        </div>
      )}
      {mensaje && <p className={estilos.tenue}>{mensaje}</p>}
    </section>
  )
}
