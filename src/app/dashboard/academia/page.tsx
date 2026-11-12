import AcademiaShell from '@/components/academia/AcademiaShell'
import ListaCursos from '@/components/academia/ListaCursos'

export const metadata = { title: 'Academia - Routh Agent' }

export default function PaginaDashboardAcademia() {
  return (
    <AcademiaShell>
      <ListaCursos />
    </AcademiaShell>
  )
}
