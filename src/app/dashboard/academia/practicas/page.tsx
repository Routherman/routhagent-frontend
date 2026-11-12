import AcademiaShell from '@/components/academia/AcademiaShell'
import Practicas from '@/components/academia/Practicas'

export const metadata = { title: 'Prácticas - Academia' }

export default function PaginaPracticasDashboard() {
  return (
    <AcademiaShell>
      <Practicas />
    </AcademiaShell>
  )
}
