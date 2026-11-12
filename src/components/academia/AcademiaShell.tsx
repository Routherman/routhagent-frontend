'use client'

import React, { useEffect, useState } from 'react'
import { SignIn, SignInButton, useAuth, useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Panel from '@/components/dashboard/Panel'
import Header from '@/components/dashboard/Header'
import { useTheme } from '@/context/ThemeContext'
import { API_URL } from '@/config/api'
import { configurarAcademia } from '../../lib/academia/api'

/**
 * Envuelve las vistas de Academia dentro del shell del Dashboard de Routh Agent,
 * sincroniza el usuario autenticado e inyecta el token de Clerk antes de montar
 * los componentes hijos. Si no hay sesión activa, ofrece inicio de sesión directo.
 */
export default function AcademiaShell({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded: authLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const { isDark } = useTheme()
  const pathname = usePathname()

  const [syncedUserId, setSyncedUserId] = useState<string | null>(null)

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

    if (!authLoaded || !userLoaded || !user) return

    let cancelado = false
    const syncBeforeMount = async () => {
      try {
        await fetch(`${API_URL}/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            token: user.id,
          }),
        })
      } catch {
        // Si falla la red, permitir que los hijos muestren el error correspondiente.
      } finally {
        if (!cancelado) setSyncedUserId(user.id)
      }
    }

    syncBeforeMount()
    return () => {
      cancelado = true
    }
  }, [authLoaded, userLoaded, user, getToken])

  const listo = authLoaded && userLoaded
  const sesionLista = Boolean(listo && user && syncedUserId === user.id)
  const redirectTarget = pathname || '/dashboard/academia'

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
            <div className="max-w-lg mx-auto my-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 shadow-sm flex flex-col items-center text-center gap-5">
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Iniciá sesión para acceder a la Academia
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Necesitás ingresar con tu cuenta de Routh Agent para registrar tu avance, tiempo de visualización y entregas prácticas.
                </p>
              </div>
              <SignIn routing="hash" fallbackRedirectUrl={redirectTarget} />
              <SignInButton mode="modal" fallbackRedirectUrl={redirectTarget}>
                <button
                  type="button"
                  className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  ¿Preferís abrir el acceso en ventana emergente? Clic acá
                </button>
              </SignInButton>
            </div>
          ) : !sesionLista ? (
            <p className="text-sm opacity-60 py-8">Sincronizando cuenta en la Academia…</p>
          ) : (
            children
          )}
        </div>
      </Panel>
    </>
  )
}
