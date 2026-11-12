'use client'

import React, { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import Sidebar from '@/components/dashboard/Sidebar'
import Panel from '@/components/dashboard/Panel'
import Header from '@/components/dashboard/Header'
import { useTheme } from '@/context/ThemeContext'
import { API_URL } from '@/config/api'
import { configurarAcademia } from '../../lib/academia/api'

/**
 * Envuelve las vistas de Academia dentro del shell del Dashboard de Routh Agent
 * e inyecta la autenticación de Clerk antes de montar los componentes hijos.
 */
export default function AcademiaShell({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded: authLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const { isDark } = useTheme()

  useEffect(() => {
    configurarAcademia({
      baseUrl: `${API_URL}/academia`,
      obtenerToken: async () => {
        try {
          return await getToken()
        } catch {
          return null
        }
      },
      credenciales: 'omit',
    })
  }, [getToken])

  const listo = authLoaded && userLoaded

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div
          data-academia-theme={isDark ? 'dark' : 'light'}
          className="flex-1 overflow-y-auto px-4 md:px-8 py-4"
        >
          {!listo ? (
            <p className="text-sm opacity-60 py-8">Cargando sesión…</p>
          ) : !user ? (
            <p className="text-sm text-rose-400 py-8">Iniciá sesión para acceder a la Academia.</p>
          ) : (
            children
          )}
        </div>
      </Panel>
    </>
  )
}
