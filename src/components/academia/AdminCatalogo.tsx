'use client'

import { useEffect, useState } from 'react'
import { api, ErrorApi } from '../../lib/academia/api'
import type { Proveedor } from '../../lib/academia/tipos'
import estilos from './academia.module.css'

interface AdminCurso {
  id: number
  slug: string
  nombre: string
  descripcion: string | null
  portadaUrl: string | null
  estado: 'borrador' | 'publicado'
  orden: number
}

interface AdminModulo {
  id: number
  cursoId: number
  nombre: string
  orden: number
}

interface AdminClase {
  id: number
  moduloId: number
  nombre: string
  descripcion: string | null
  proveedor: Proveedor
  videoRef: string
  duracionS: number | null
  orden: number
  obligatoriaClave: string | null
}

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export default function AdminCatalogo({ alActualizar }: { alActualizar: () => void }) {
  const [cursos, setCursos] = useState<AdminCurso[]>([])
  const [modulos, setModulos] = useState<AdminModulo[]>([])
  const [clases, setClases] = useState<AdminClase[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [cursoNombre, setCursoNombre] = useState('')
  const [cursoSlug, setCursoSlug] = useState('')
  const [cursoDesc, setCursoDesc] = useState('')
  const [cursoEstado, setCursoEstado] = useState<'publicado' | 'borrador'>('publicado')

  const [moduloCursoId, setModuloCursoId] = useState<string>('')
  const [moduloNombre, setModuloNombre] = useState('')

  const [claseModuloId, setClaseModuloId] = useState<string>('')
  const [claseNombre, setClaseNombre] = useState('')
  const [claseProveedor, setClaseProveedor] = useState<Proveedor>('youtube')
  const [claseVideoRef, setClaseVideoRef] = useState('')
  const [claseDuracionS, setClaseDuracionS] = useState('')
  const [claseObligatoria, setClaseObligatoria] = useState('')
  const [claseDesc, setClaseDesc] = useState('')

  const [editClaseId, setEditClaseId] = useState<number | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editProveedor, setEditProveedor] = useState<Proveedor>('youtube')
  const [editVideoRef, setEditVideoRef] = useState('')
  const [editDuracionS, setEditDuracionS] = useState('')
  const [editObligatoria, setEditObligatoria] = useState('')
  const [editDesc, setEditDesc] = useState('')

  async function refrescarCatalogoAdmin() {
    setCargando(true)
    setError(null)
    try {
      const r = await api.admin.catalogo()
      setCursos(r.cursos)
      setModulos(r.modulos)
      setClases(r.clases)
      if (!moduloCursoId && r.cursos[0]) setModuloCursoId(String(r.cursos[0].id))
      if (!claseModuloId && r.modulos[0]) setClaseModuloId(String(r.modulos[0].id))
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudo cargar el editor de catálogo.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true
    api.admin
      .catalogo()
      .then((r) => {
        if (!activo) return
        setCursos(r.cursos)
        setModulos(r.modulos)
        setClases(r.clases)
        if (r.cursos[0]) setModuloCursoId((prev) => prev || String(r.cursos[0].id))
        if (r.modulos[0]) setClaseModuloId((prev) => prev || String(r.modulos[0].id))
      })
      .catch((e) => {
        if (!activo) return
        setError(e instanceof ErrorApi ? e.message : 'No se pudo cargar el editor de catálogo.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  async function crearCurso(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMensaje(null)
    try {
      const slug = (cursoSlug.trim() || slugify(cursoNombre))
      await api.admin.crearCurso({
        nombre: cursoNombre.trim(),
        slug,
        descripcion: cursoDesc.trim() || null,
        estado: cursoEstado,
        orden: cursos.length + 1,
      })
      setCursoNombre('')
      setCursoSlug('')
      setCursoDesc('')
      setMensaje('Curso creado correctamente.')
      await refrescarCatalogoAdmin()
      alActualizar()
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo crear el curso.')
    }
  }

  async function alternarEstadoCurso(curso: AdminCurso) {
    setError(null)
    setMensaje(null)
    const nuevo = curso.estado === 'publicado' ? 'borrador' : 'publicado'
    try {
      await api.admin.cambiarEstadoCurso(curso.id, nuevo)
      setMensaje(`Curso "${curso.nombre}" cambiado a ${nuevo}.`)
      await refrescarCatalogoAdmin()
      alActualizar()
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo actualizar el estado.')
    }
  }

  async function crearModulo(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMensaje(null)
    try {
      const cursoId = Number(moduloCursoId)
      await api.admin.crearModulo({
        cursoId,
        nombre: moduloNombre.trim(),
        orden: modulos.filter((m) => m.cursoId === cursoId).length + 1,
      })
      setModuloNombre('')
      setMensaje('Módulo creado.')
      await refrescarCatalogoAdmin()
      alActualizar()
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo crear el módulo.')
    }
  }

  async function crearClase(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMensaje(null)
    try {
      const moduloId = Number(claseModuloId)
      const dur = claseDuracionS.trim() ? Number(claseDuracionS) : null
      await api.admin.crearClase({
        moduloId,
        nombre: claseNombre.trim(),
        descripcion: claseDesc.trim() || null,
        proveedor: claseProveedor,
        videoRef: claseVideoRef.trim(),
        duracionS: dur,
        orden: clases.filter((c) => c.moduloId === moduloId).length + 1,
        obligatoriaClave: claseObligatoria.trim() || null,
      })
      setClaseNombre('')
      setClaseVideoRef('')
      setClaseDuracionS('')
      setClaseObligatoria('')
      setClaseDesc('')
      setMensaje('Clase agregada al módulo.')
      await refrescarCatalogoAdmin()
      alActualizar()
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo agregar la clase.')
    }
  }

  async function borrarClase(id: number) {
    setError(null)
    setMensaje(null)
    try {
      await api.admin.eliminarClase(id)
      setMensaje('Clase eliminada.')
      await refrescarCatalogoAdmin()
      alActualizar()
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo eliminar la clase.')
    }
  }

  function abrirEdicionClase(cl: AdminClase) {
    setEditClaseId(cl.id)
    setEditNombre(cl.nombre)
    setEditProveedor(cl.proveedor)
    setEditVideoRef(cl.videoRef)
    setEditDuracionS(cl.duracionS ? String(cl.duracionS) : '')
    setEditObligatoria(cl.obligatoriaClave || '')
    setEditDesc(cl.descripcion || '')
    setError(null)
    setMensaje(null)
  }

  async function guardarEdicionClase(e: React.FormEvent) {
    e.preventDefault()
    if (!editClaseId) return
    setError(null)
    setMensaje(null)
    try {
      await api.admin.actualizarClase(editClaseId, {
        nombre: editNombre.trim(),
        proveedor: editProveedor,
        videoRef: editVideoRef.trim(),
        duracionS: editDuracionS.trim() ? Number(editDuracionS) : null,
        obligatoriaClave: editObligatoria.trim() || null,
        descripcion: editDesc.trim() || null,
      })
      setEditClaseId(null)
      setMensaje('Clase actualizada correctamente.')
      await refrescarCatalogoAdmin()
      alActualizar()
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo actualizar la clase.')
    }
  }

  async function sincronizarEquipo() {
    setError(null)
    setMensaje(null)
    try {
      const r = await api.admin.sincronizarEquipo()
      setMensaje(`Sincronizado: ${r.equiposCount} equipos y ${r.personasCount} usuarios cargados en el tablero.`)
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo sincronizar el equipo.')
    }
  }

  return (
    <section className={estilos.tarjeta}>
      <div className={estilos.encabezado}>
        <div>
          <p className={estilos.kicker}>Administración de Academia</p>
          <h2>Editor de cursos, módulos y clases</h2>
        </div>
        <button type="button" className={estilos.botonSecundario} onClick={() => void sincronizarEquipo()}>
          Sincronizar usuarios del sistema
        </button>
      </div>

      {error && <p className={estilos.textoError}>{error}</p>}
      {mensaje && <div className={estilos.aviso}>{mensaje}</div>}
      {cargando && <p className={estilos.tenue}>Cargando estructura…</p>}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 12 }}>
        <form onSubmit={(e) => void crearCurso(e)} className={estilos.tarjeta} style={{ margin: 0 }}>
          <h3>1. Nuevo curso</h3>
          <label className={estilos.campo}>
            Nombre
            <input
              required
              value={cursoNombre}
              onChange={(e) => {
                setCursoNombre(e.target.value)
                if (!cursoSlug) setCursoSlug(slugify(e.target.value))
              }}
              placeholder="Ej: Inducción Asesores Colaboratium"
            />
          </label>
          <label className={estilos.campo}>
            Slug (URL corta)
            <input
              required
              value={cursoSlug}
              onChange={(e) => setCursoSlug(e.target.value)}
              placeholder="induccion-asesores"
              pattern="[a-z0-9-]+"
            />
          </label>
          <label className={estilos.campo}>
            Descripción (opcional)
            <textarea rows={2} value={cursoDesc} onChange={(e) => setCursoDesc(e.target.value)} />
          </label>
          <label className={estilos.campo}>
            Estado inicial
            <select value={cursoEstado} onChange={(e) => setCursoEstado(e.target.value as 'publicado' | 'borrador')}>
              <option value="publicado">Publicado (visible para todos)</option>
              <option value="borrador">Borrador (solo admin)</option>
            </select>
          </label>
          <button type="submit" className={estilos.boton}>Crear curso</button>
        </form>

        <form onSubmit={(e) => void crearModulo(e)} className={estilos.tarjeta} style={{ margin: 0 }}>
          <h3>2. Nuevo módulo</h3>
          <label className={estilos.campo}>
            Curso
            <select required value={moduloCursoId} onChange={(e) => setModuloCursoId(e.target.value)}>
              <option value="">Elegí un curso…</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.estado})
                </option>
              ))}
            </select>
          </label>
          <label className={estilos.campo}>
            Nombre del módulo
            <input
              required
              value={moduloNombre}
              onChange={(e) => setModuloNombre(e.target.value)}
              placeholder="Ej: Módulo 1 · Operatoria No Custodial"
            />
          </label>
          <button type="submit" className={estilos.boton} disabled={!moduloCursoId}>
            Agregar módulo
          </button>
        </form>

        <form onSubmit={(e) => void crearClase(e)} className={estilos.tarjeta} style={{ margin: 0 }}>
          <h3>3. Nueva clase (video)</h3>
          <label className={estilos.campo}>
            Módulo
            <select required value={claseModuloId} onChange={(e) => setClaseModuloId(e.target.value)}>
              <option value="">Elegí un módulo…</option>
              {modulos.map((m) => {
                const c = cursos.find((x) => x.id === m.cursoId)
                return (
                  <option key={m.id} value={m.id}>
                    {c ? `${c.nombre} → ` : ''}{m.nombre}
                  </option>
                )
              })}
            </select>
          </label>
          <label className={estilos.campo}>
            Título de la clase
            <input required value={claseNombre} onChange={(e) => setClaseNombre(e.target.value)} placeholder="Ej: Cómo funciona el calce en BIND" />
          </label>
          <label className={estilos.campo}>
            Proveedor
            <select value={claseProveedor} onChange={(e) => setClaseProveedor(e.target.value as Proveedor)}>
              <option value="youtube">YouTube (no listado o link/ID)</option>
              <option value="bunny">Bunny Stream (GUID de video)</option>
              <option value="mux">Mux (Playback ID)</option>
              <option value="directo">MP4 / HLS directo (URL HTTPS)</option>
              <option value="drive">Google Drive (link o ID, sin medición)</option>
            </select>
          </label>
          <label className={estilos.campo}>
            Link o ID del video
            <input
              required
              value={claseVideoRef}
              onChange={(e) => setClaseVideoRef(e.target.value)}
              placeholder={claseProveedor === 'youtube' ? 'https://youtu.be/...' : 'ID o URL del video'}
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label className={estilos.campo}>
              Duración (seg)
              <input
                type="number"
                min={1}
                value={claseDuracionS}
                onChange={(e) => setClaseDuracionS(e.target.value)}
                placeholder="Ej: 420"
              />
            </label>
            <label className={estilos.campo}>
              Clave obligatoria (opc.)
              <input
                value={claseObligatoria}
                onChange={(e) => setClaseObligatoria(e.target.value)}
                placeholder="Ej: bienvenida"
              />
            </label>
          </div>
          <label className={estilos.campo}>
            Notas / Descripción (opc.)
            <textarea rows={2} value={claseDesc} onChange={(e) => setClaseDesc(e.target.value)} />
          </label>
          <button type="submit" className={estilos.boton} disabled={!claseModuloId}>
            Agregar clase
          </button>
        </form>
      </div>

      {cursos.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <h3>Estructura cargada</h3>
          {cursos.map((curso) => (
            <div key={curso.id} style={{ padding: '10px 0', borderTop: '1px solid var(--ac-borde)' }}>
              <div className={estilos.encabezado}>
                <div>
                  <strong>{curso.nombre}</strong>{' '}
                  <span className={estilos.etiqueta}>{curso.estado}</span>{' '}
                  <span className={estilos.detalle}>/{curso.slug}</span>
                </div>
                <button type="button" className={estilos.botonSecundario} onClick={() => void alternarEstadoCurso(curso)}>
                  {curso.estado === 'publicado' ? 'Pasar a borrador' : 'Publicar curso'}
                </button>
              </div>
              {modulos
                .filter((m) => m.cursoId === curso.id)
                .map((m) => (
                  <div key={m.id} style={{ marginLeft: 14, marginTop: 8 }}>
                    <div className={estilos.tenue} style={{ fontSize: '0.85rem' }}>
                      <strong>{m.nombre}</strong>
                    </div>
                    <ul className={estilos.listaClases}>
                      {clases
                        .filter((cl) => cl.moduloId === m.id)
                        .map((cl) => (
                          <li key={cl.id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <span className={estilos.etiqueta}>{cl.proveedor}</span>
                              <span>
                                {cl.nombre}
                                {cl.obligatoriaClave ? ` (obligatoria: ${cl.obligatoriaClave})` : ''}
                              </span>
                              <span className={estilos.tenue}>{cl.duracionS ? `${cl.duracionS}s` : 'sin duración'}</span>
                              <button type="button" className={estilos.botonTexto} onClick={() => abrirEdicionClase(cl)}>
                                Editar
                              </button>
                              <button type="button" className={estilos.botonTexto} onClick={() => void borrarClase(cl.id)}>
                                Eliminar
                              </button>
                            </div>
                            {editClaseId === cl.id && (
                              <form onSubmit={(e) => void guardarEdicionClase(e)} className={estilos.tarjeta} style={{ margin: '4px 0', padding: 12 }}>
                                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                                  <label className={estilos.campo}>
                                    Título
                                    <input required value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                                  </label>
                                  <label className={estilos.campo}>
                                    Proveedor
                                    <select value={editProveedor} onChange={(e) => setEditProveedor(e.target.value as Proveedor)}>
                                      <option value="youtube">YouTube</option>
                                      <option value="bunny">Bunny Stream</option>
                                      <option value="mux">Mux</option>
                                      <option value="directo">MP4 / HLS directo</option>
                                      <option value="drive">Google Drive</option>
                                    </select>
                                  </label>
                                  <label className={estilos.campo}>
                                    Video Ref (URL o ID)
                                    <input required value={editVideoRef} onChange={(e) => setEditVideoRef(e.target.value)} />
                                  </label>
                                  <label className={estilos.campo}>
                                    Duración (seg)
                                    <input type="number" min={1} value={editDuracionS} onChange={(e) => setEditDuracionS(e.target.value)} />
                                  </label>
                                  <label className={estilos.campo}>
                                    Clave obligatoria
                                    <input value={editObligatoria} onChange={(e) => setEditObligatoria(e.target.value)} />
                                  </label>
                                </div>
                                <label className={estilos.campo}>
                                  Descripción
                                  <textarea rows={2} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                                </label>
                                <div className={estilos.acciones}>
                                  <button type="submit" className={estilos.boton}>Guardar</button>
                                  <button type="button" className={estilos.botonSecundario} onClick={() => setEditClaseId(null)}>Cancelar</button>
                                </div>
                              </form>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
