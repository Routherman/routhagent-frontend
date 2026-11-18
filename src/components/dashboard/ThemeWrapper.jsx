"use client";
import React, { useEffect } from 'react';
import { useUser, SignIn } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import FloatingCopilot from './FloatingCopilot';

export default function ThemeWrapper({ children }) {
    const { themeData, isDark } = useTheme();
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const isLightBg = isDark === false;

    useEffect(() => {
        if (isLoaded && !user) {
            router.replace(`/sign-in?redirect_url=${encodeURIComponent(pathname || '/dashboard')}`);
        }
    }, [isLoaded, user, router, pathname]);

    if (!isLoaded) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#060911] text-slate-300 gap-3 font-sans">
                <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                <p className="text-sm font-medium opacity-80">Verificando sesión de seguridad…</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#060911] text-white p-4 font-sans gap-4">
                <div className="text-center space-y-1 mb-2">
                    <h1 className="text-xl font-bold">Acceso Restringido — Colaboratium CRM</h1>
                    <p className="text-xs text-slate-400">Iniciá sesión con tu cuenta autorizada para ingresar al panel.</p>
                </div>
                <SignIn routing="hash" fallbackRedirectUrl={pathname || '/dashboard'} />
            </div>
        );
    }

    return (
        <div
            className={`h-[100dvh] max-h-[100dvh] w-full flex p-1 md:p-3 font-sans overflow-hidden transition-colors duration-300 ease-in-out relative ${isDark ? 'dark bg-[#060911]' : 'bg-[#F1F5F9]'}`}
            style={{
                backgroundColor: themeData?.hex || (isDark ? '#060911' : '#F1F5F9'),
                color: isLightBg ? '#0f172a' : '#f8fafc'
            }}
        >
            {/* The CSS classes ensure child components easily inherit text and dark styles */}
            <div className={`flex w-full h-full min-h-0 overflow-hidden ${isLightBg ? 'theme-light' : 'theme-dark dark'}`}>
                {children}
            </div>

            {/* Copiloto Flotante Inteligente presente en todas las secciones */}
            <FloatingCopilot />
        </div>
    );
}
