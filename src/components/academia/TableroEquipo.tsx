'use client'

// ============================================================================
// Quién se está capacitando. Admin ve a todos; líder, solo a su equipo (eso
// lo filtra el SERVIDOR: esta vista recibe únicamente lo que puede ver).
//
// Las señales van juntas y separadas, a propósito:
//   · Mirado    — reproducción real (+ "N salteadas" si arrastró la barra)
//   · Clases    — abiertas (+ "N completas")
//   · Marcadas  — lo que la persona dice haber visto
//   · Prácticas — lo único donde produce algo. Es lo que ordena la tabla.
// ============================================================================

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, ErrorApi } from '../../lib/academia/api'
import { RUTAS, fechaCorta } from '../../lib/academia/formato'
import type { Tablero } from '../../lib/academia/tipos'
import estilos from './academia.module.css'

export default function TableroEquipo() {
  const [datos, setDatos] = useState<Tablero | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [todos, setTodos] = useState(false)

  useEffect(() => {
    let activo = true
    api
      .tablero(todos)
      .then((d) => {
        if (activo) setDatos(d)
      })
      .catch((e) => {
        if (!activo) return
        setError(
          e instanceof ErrorApi && e.status === 404
            ? 'No tenés acceso a esta página.'
            : e instanceof ErrorApi && e.status === 401
              ? 'Iniciá sesión.'
              : 'No se pudo cargar el tablero.',
        )
      })
    return () => {
      activo = false
    }
  }, [todos])

  if (error) return <div className={estilos.raiz}><p className={estilos.textoError}>{error}</p></div>
  if (!datos) return <div className={estilos.raiz}><p className={estilos.tenue}>Cargando…</p></div>

  return (
    <div className={estilos.raiz}>
      <Link href={RUTAS.inicio} className={estilos.volver}>← Academia</Link>
      <header className={estilos.encabezado}>
        <h1>{datos.alcance === 'todos' ? 'Capacitación de todos' : 'Capacitación de tu equipo'}</h1>
        <div className={estilos.acciones}>
          {datos.practicasACorregir > 0 && (
            <Link href={RUTAS.corregir} className={estilos.boton}>
              Corregir {datos.practicasACorregir} {datos.practicasACorregir === 1 ? 'práctica' : 'prácticas'}
            </Link>
          )}
          {datos.practicasACorregir === 0 && (
            <Link href={RUTAS.corregir} className={estilos.botonSecundario}>Prácticas del equipo</Link>
          )}
          <label className={estilos.filtro}>
            <input
              type="checkbox"
              checked={todos}
              onChange={(e) => {
                setDatos(null)
                setTodos(e.target.checked)
              }}
            />{' '}
            Incluir a quienes no están en seguimiento
          </label>
        </div>
      </header>

      {datos.filas.length === 0 && datos.alcance === 'equipo' && (
        <p className={estilos.aviso}>Todavía no tenés personas asignadas a tu equipo.</p>
      )}
      {datos.filas.length > 0 && datos.nadieEntrego && (
        <p className={estilos.aviso}>Nadie entregó una práctica todavía.</p>
      )}
      {datos.filas.length > 0 && datos.nadieAbrio && (
        <p className={estilos.aviso}>
          Todavía no hay reproducciones registradas. El registro empezó cuando se instaló la academia: lo que cada uno
          haya visto antes no quedó anotado, así que esta columna arranca en cero para todos.
        </p>
      )}

      <div className={estilos.tablaScroll}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th>Persona</th>
              <th>Prácticas</th>
              <th>Mirado</th>
              <th>Clases abiertas</th>
              <th>Marcadas</th>
              <th>Última vez</th>
            </tr>
          </thead>
          <tbody>
            {datos.filas.map((f) => {
              const empezoPracticas = f.aprobadas + f.entregadas + f.rehacer + f.aMedias > 0
              return (
                <tr key={f.usuarioId} className={f.sinActividad ? estilos.filaInactiva : undefined}>
                  <td><strong>{f.nombre}</strong></td>
                  {/* Aprobadas sobre el total y no "hizo / no hizo": mirar se
                      puede fingir dejando el video correr; un trabajo entregado
                      y corregido, no. */}
                  <td>
                    {empezoPracticas ? (
                      <>
                        <span className={f.aprobadas > 0 ? estilos.fuerte : undefined}>
                          {f.aprobadas}/{datos.totalPracticas}
                        </span>
                        {f.entregadas > 0 && <span className={estilos.detalle}> · {f.entregadas} a corregir</span>}
                        {f.rehacer > 0 && <span className={estilos.detalle}> · {f.rehacer} a rehacer</span>}
                        {f.aMedias > 0 && <span className={estilos.detalle}> · {f.aMedias} a medias</span>}
                      </>
                    ) : (
                      <span className={estilos.tenue}>sin empezar</span>
                    )}
                  </td>
                  <td>
                    {f.miradoTexto ? <span className={estilos.fuerte}>{f.miradoTexto}</span> : <span className={estilos.tenue}>—</span>}
                    {f.salteadas > 0 && (
                      <span className={estilos.alerta} title="Llegó al final del video mirando menos de la mitad: arrastró la barra.">
                        {' '}· {f.salteadas} {f.salteadas === 1 ? 'salteada' : 'salteadas'}
                      </span>
                    )}
                  </td>
                  <td>
                    {f.abiertas}
                    {f.completas > 0 && <span className={estilos.detalle}> · {f.completas} {f.completas === 1 ? 'completa' : 'completas'}</span>}
                  </td>
                  <td>
                    {f.marcadas}
                    {f.marcadoTexto && <span className={estilos.detalle}> · {f.marcadoTexto}</span>}
                  </td>
                  <td className={estilos.tenue}>{fechaCorta(f.ultimaVezMs)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className={estilos.nota}>
        Alguien con muchas marcadas y ninguna abierta no está mintiendo necesariamente: pudo haber visto los cursos antes
        de que existiera este reproductor. Por eso las señales se muestran juntas y no se suman en un solo número.
      </p>
    </div>
  )
}
