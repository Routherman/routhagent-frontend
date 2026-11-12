'use client'

// ============================================================================
// Google Drive embebido.
//
// NO SE PUEDE MEDIR: el iframe de Drive no expone ninguna API (ni estado, ni
// posición, ni eventos). Lo único que se registra es que la clase se ABRIÓ
// (lo anota el servidor al entregar el link) y si la persona la MARCA.
// Por eso el backend no da token de sesión para estas clases y no se manda
// ningún latido: cualquier número que inventáramos sería mentira.
//
// Recomendación: pasar estos videos a YouTube (no listado) o a Bunny / Mux.
// ============================================================================

import type { FuenteVideo, PropsProveedor } from '../../lib/academia/tipos'
import estilos from './academia.module.css'

export default function ReproductorDrive({ fuente }: Pick<PropsProveedor<Extract<FuenteVideo, { proveedor: 'drive' }>>, 'fuente'>) {
  return (
    <>
      <div className={estilos.marcoVideo}>
        <iframe src={fuente.embedUrl} title="Clase" allow="autoplay; fullscreen" allowFullScreen />
      </div>
      <p className={estilos.aviso}>
        Esta clase está en Google Drive y no mide el tiempo mirado. Cuando la termines, marcala como vista.
      </p>
    </>
  )
}
