'use client'

import { useParams } from 'next/navigation'
import AcademiaShell from '@/components/academia/AcademiaShell'
import PaginaClase from '@/components/academia/PaginaClase'

export default function PaginaDeClaseDashboard() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)

  return (
    <AcademiaShell>
      {!Number.isInteger(id) || id <= 0 ? (
        <p className="text-sm text-rose-400">Clase inválida.</p>
      ) : (
        <PaginaClase claseId={id} />
      )}
    </AcademiaShell>
  )
}
