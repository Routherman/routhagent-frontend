"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useUser, SignIn, SignOutButton } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { API_URL } from '@/config/api';
import { ShieldAlert, Building2, Clock, RefreshCw, LogOut, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import FloatingCopilot from './FloatingCopilot';

export default function ThemeWrapper({ children }) {
    const { themeData, isDark } = useTheme();
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const isLightBg = isDark === false;

    const [dbUser, setDbUser] = useState(null);
    const [dbLoading, setDbLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [checkingStatus, setCheckingStatus] = useState(false);

    useEffect(() => {
        if (isLoaded && !user) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('codigoEmpresa');
            }
            router.replace(`/sign-in?redirect_url=${encodeURIComponent(pathname || '/dashboard')}`);
        }
    }, [isLoaded, user, router, pathname]);

    const fetchAndVerifyUser = useCallback(async (isSilent = false) => {
        if (!user) return;
        if (!isSilent) setCheckingStatus(true);
        try {
            let res = await fetch(`${API_URL}/users/me/${user.id}`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            let data = null;
            if (res.status === 404) {
                const syncRes = await fetch(`${API_URL}/users/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({
                        clerkId: user.id,
                        email: user.primaryEmailAddress?.emailAddress || '',
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        imageUrl: user.imageUrl || '',
                        token: user.id
                    })
                });
                if (syncRes.ok) {
                    const syncPayload = await syncRes.json();
                    data = syncPayload?.user || null;
                }
                if (!data) {
                    res = await fetch(`${API_URL}/users/me/${user.id}`, {
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    });
                    if (res.ok) data = await res.json();
                }
            } else if (res.ok) {
                data = await res.json();
            }

            if (data) {
                setDbUser(data);
                if (data.codigo_empresa && data.rol_id) {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('codigoEmpresa', data.codigo_empresa);
                    }
                } else if (typeof window !== 'undefined') {
                    localStorage.removeItem('codigoEmpresa');
                }
            }
        } catch (err) {
            console.error('Error verificando acceso de usuario:', err);
        } finally {
            setDbLoading(false);
            setCheckingStatus(false);
        }
    }, [user]);

    useEffect(() => {
        if (!isLoaded || !user) return;
        fetchAndVerifyUser(false);
    }, [isLoaded, user, fetchAndVerifyUser]);

    // Si el usuario está a la espera de aprobación de rol, consultar automáticamente cada 5 segundos
    useEffect(() => {
        if (!isLoaded || !user || dbLoading) return;
        const isApproved = Boolean(dbUser?.codigo_empresa && dbUser?.rol_id);
        if (isApproved) return;

        const timer = setInterval(() => {
            fetchAndVerifyUser(true);
        }, 5000);
        return () => clearInterval(timer);
    }, [isLoaded, user, dbLoading, dbUser?.codigo_empresa, dbUser?.rol_id, fetchAndVerifyUser]);

    const handleJoinCompany = async (e) => {
        e.preventDefault();
        const cleanCode = joinCode.trim().toUpperCase();
        if (!cleanCode) {
            setJoinError('Ingresá el ID / Código de Empresa.');
            return;
        }
        setJoining(true);
        setJoinError('');
        try {
            const res = await fetch(`${API_URL}/empresas/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    clerkId: user.id,
                    codigo: cleanCode,
                    email: user.primaryEmailAddress?.emailAddress || '',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    imageUrl: user.imageUrl || ''
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setJoinError(data.error || 'Código de empresa no válido.');
                return;
            }
            if (data.user) {
                setDbUser(data.user);
            } else {
                await fetchAndVerifyUser(false);
            }
            toast.success('Solicitud de acceso enviada al Administrador');
        } catch (err) {
            setJoinError('No se pudo conectar con el servidor. Intentá nuevamente.');
        } finally {
            setJoining(false);
        }
    };

    const handleChangeCompanyCode = async () => {
        setJoining(true);
        setJoinError('');
        try {
            const res = await fetch(`${API_URL}/empresas/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ clerkId: user.id })
            });
            const data = await res.json();
            if (data.user) {
                setDbUser(data.user);
            } else {
                setDbUser(prev => prev ? { ...prev, codigo_empresa: null, rol_id: null, rol_nombre: null } : null);
            }
            setJoinCode('');
        } catch (err) {
            console.error(err);
        } finally {
            setJoining(false);
        }
    };

    if (!isLoaded || (user && dbLoading)) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#060911] text-slate-300 gap-3 font-sans">
                <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                <p className="text-sm font-medium opacity-80">Verificando credenciales y permisos de acceso…</p>
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

    // BLOQUEO 1: El usuario inició sesión pero NO colocó un ID de Empresa válido
    if (!dbUser?.codigo_empresa) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#060911] text-white p-4 font-sans">
                <div className="w-full max-w-md bg-[#0d1424] border border-white/10 rounded-3xl p-7 shadow-2xl space-y-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
                            <KeyRound className="w-7 h-7" />
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Ingresá el ID de Empresa
                        </h1>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Hola <span className="text-white font-bold">{user.fullName || user.primaryEmailAddress?.emailAddress}</span>. Para solicitar acceso al espacio de trabajo debés ingresar el <span className="text-amber-300 font-bold">ID de Empresa</span> provisto por tu Administrador.
                        </p>
                    </div>

                    <form onSubmit={handleJoinCompany} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                Código / ID de Empresa
                            </label>
                            <div className="relative flex items-center">
                                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5" />
                                <input
                                    type="text"
                                    required
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Ej: CODIGO6"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070b14] border border-white/15 text-white font-mono font-bold text-sm tracking-widest uppercase focus:outline-none focus:border-amber-400"
                                />
                            </div>
                            {joinError && (
                                <p className="text-xs font-bold text-rose-400 mt-2">{joinError}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={joining || !joinCode.trim()}
                            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition shadow-lg cursor-pointer"
                        >
                            {joining ? 'Verificando código...' : 'Solicitar Acceso a la Empresa'}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <span className="truncate max-w-[200px]" title={user.primaryEmailAddress?.emailAddress}>
                            {user.primaryEmailAddress?.emailAddress}
                        </span>
                        <SignOutButton>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs transition cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </SignOutButton>
                    </div>
                </div>
            </div>
        );
    }

    // BLOQUEO 2: El usuario ingresó el ID de Empresa pero el Administrador AÚN NO le dio acceso / rol
    if (!dbUser?.rol_id || !dbUser?.rol_nombre) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#060911] text-white p-4 font-sans">
                <div className="w-full max-w-lg bg-[#0d1424] border border-amber-500/30 rounded-3xl p-7 shadow-2xl space-y-6">
                    <div className="flex flex-col items-center text-center space-y-2.5">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Clock className="w-8 h-8 animate-pulse" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                            ⏳ A Espera de Aprobación
                        </span>
                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Acceso Pendiente de Autorización
                        </h1>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                            Tu cuenta (<span className="text-white font-bold">{user.primaryEmailAddress?.emailAddress}</span>) solicitó unirse a la empresa <span className="font-mono font-bold text-amber-300">{dbUser.codigo_empresa}</span>, pero aún <span className="text-amber-300 font-bold">no tenés un rol asignado</span>.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#070b14] border border-white/10 space-y-2 text-xs text-slate-300">
                        <div className="flex items-start gap-2.5">
                            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                Por políticas de seguridad y confidencialidad, no se muestra ninguna información del CRM, contactos, mensajes ni calendario hasta que el Administrador apruebe tu solicitud y te asigne un rol en <span className="text-white font-bold">Equipo y Roles</span>.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                            type="button"
                            onClick={() => fetchAndVerifyUser(false)}
                            disabled={checkingStatus}
                            className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                            <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
                            <span>{checkingStatus ? 'Comprobando...' : 'Verificar Estado de Aprobación'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleChangeCompanyCode}
                            disabled={joining}
                            className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs transition cursor-pointer"
                        >
                            Cambiar ID de Empresa
                        </button>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Actualización automática cada 5 seg.
                        </span>
                        <SignOutButton>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs transition cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </SignOutButton>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`h-[100dvh] max-h-[100dvh] w-full flex p-1 pb-[58px] md:p-3 md:pb-3 font-sans overflow-hidden transition-colors duration-300 ease-in-out relative ${isDark ? 'dark bg-[#060911]' : 'bg-[#F1F5F9]'}`}
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
