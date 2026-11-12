'use client'

// La portada de la academia: cursos → módulos → clases, con el avance propio.

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { api, ErrorApi } from '../../lib/academia/api'
import { RUTAS, TEXTO_ESTADO_CLASE, duracionCorta, reloj } from '../../lib/academia/formato'
import type { Clase, Curso, Logro, Yo } from '../../lib/academia/tipos'
import AdminCatalogo from './AdminCatalogo'
import estilos from './academia.module.css'

export default function ListaCursos() {
  const [cursos, setCursos] = useState<Curso[] | null>(null)
  const [yo, setYo] = useState<Yo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logro, setLogro] = useState<Logro | null>(null)
  const [mostrarAdmin, setMostrarAdmin] = useState(false)

  const cargar = useCallback(() => {
    Promise.all([api.cursos(), api.yo()])
      .then(([c, y]) => {
        setCursos(c.cursos)
        setYo(y)
      })
      .catch((e) => setError(e instanceof ErrorApi && e.status === 401 ? 'Iniciá sesión para ver la academia.' : 'No se pudo cargar la academia.'))
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function marcar(curso: Curso, clase: Clase) {
    const nueva = !clase.progreso.marcada
    try {
      const r = await api.marcar(clase.id, nueva)
      setCursos((prev) =>
        (prev ?? []).map((c) =>
          c.id !== curso.id
            ? c
            : {
                ...c,
                resumen: r.resumen,
                modulos: c.modulos.map((m) => ({
                  ...m,
                  clases: m.clases.map((cl) => (cl.id === clase.id ? { ...cl, progreso: { ...cl.progreso, marcada: nueva } } : cl)),
                })),
              },
        ),
      )
      if (r.logro) setLogro(r.logro)
    } catch {
      setError('No se pudo guardar la marca. Probá de nuevo.')
    }
  }

  if (error) return <div className={estilos.raiz}><p className={estilos.textoError}>{error}</p></div>
  if (!cursos) return <div className={estilos.raiz}><p className={estilos.tenue}>Cargando…</p></div>

  return (
    <div className={estilos.raiz}>
      <header className={estilos.encabezado}>
        <h1>Academia</h1>
        <nav className={estilos.acciones}>
          <Link href={RUTAS.practicas} className={estilos.botonSecundario}>Prácticas</Link>
          {yo?.tieneTablero && <Link href={RUTAS.equipo} className={estilos.botonSecundario}>Tablero del equipo</Link>}
          {yo?.rol === 'admin' && (
            <button type="button" className={estilos.botonSecundario} onClick={() => setMostrarAdmin((v) => !v)}>
              {mostrarAdmin ? 'Ocultar editor' : 'Administrar cursos'}
            </button>
          )}
        </nav>
      </header>

      {mostrarAdmin && yo?.rol === 'admin' && <AdminCatalogo alActualizar={cargar} />}

      {logro && (
        <div className={estilos.logro} role="status">
          <strong>¡{logro.nombre}!</strong> {logro.detalle}.
          <button type="button" className={estilos.botonTexto} onClick={() => setLogro(null)}>Cerrar</button>
        </div>
      )}

      {cursos.length === 0 && <p className={estilos.tenue}>Todavía no hay cursos publicados.</p>}

      {cursos.map((curso) => (
        <section key={curso.id} className={estilos.tarjeta}>
          <div className={estilos.cursoCabecera}>
            {curso.portadaUrl && <img src={curso.portadaUrl} alt="" className={estilos.portada} />}
            <div>
              <h2>{curso.nombre}</h2>
              {curso.descripcion && <p className={estilos.tenue}>{curso.descripcion}</p>}
              <p className={estilos.resumen}>
                {curso.resumen.marcadas} de {curso.resumen.total} clases marcadas
                {curso.resumen.segundosMirados > 0 && <> · {duracionCorta(curso.resumen.segundosMirados)} mirados</>}
                {curso.resumen.logro && <> · <strong>{curso.resumen.logro.nombre}</strong></>}
              </p>
              {curso.resumen.proximo && (
                <p className={estilos.tenue}>
                  Te {curso.resumen.proximo.faltan === 1 ? 'falta 1 clase' : `faltan ${curso.resumen.proximo.faltan} clases`} para “
                  {curso.resumen.proximo.logro.nombre}”.
                </p>
              )}
              <div className={estilos.barra}>
                <div style={{ width: `${curso.resumen.total ? (curso.resumen.marcadas / curso.resumen.total) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {curso.modulos.map((m) => (
            <div key={m.id} className={estilos.modulo}>
              <h3>{m.nombre}</h3>
              <ul className={estilos.listaClases}>
                {m.clases.map((cl) => (
                  <li key={cl.id}>
                    <label className={estilos.check} title="Marcar como vista">
                      <input type="checkbox" checked={cl.progreso.marcada} onChange={() => void marcar(curso, cl)} />
                    </label>
                    <Link href={RUTAS.clase(cl.id)} className={estilos.nombreClase}>{cl.nombre}</Link>
                    <span className={estilos.tenue}>{cl.duracionS ? reloj(cl.duracionS) : ''}</span>
                    <span className={`${estilos.etiqueta} ${estilos[`estado_${cl.progreso.estado}`] ?? ''}`}>
                      {TEXTO_ESTADO_CLASE[cl.progreso.estado]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
