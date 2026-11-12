import AcademiaShell from '@/components/academia/AcademiaShell'
import TableroEquipo from '@/components/academia/TableroEquipo'

export const metadata = { title: 'Tablero del equipo - Academia' }

export default function PaginaTableroEquipoDashboard() {
  return (
    <AcademiaShell>
      <TableroEquipo />
    </AcademiaShell>
  )
}
