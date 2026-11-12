import AcademiaShell from '@/components/academia/AcademiaShell'
import CorregirPracticas from '@/components/academia/CorregirPracticas'

export const metadata = { title: 'Corregir prácticas - Academia' }

export default function PaginaCorregirPracticasDashboard() {
  return (
    <AcademiaShell>
      <CorregirPracticas />
    </AcademiaShell>
  )
}
