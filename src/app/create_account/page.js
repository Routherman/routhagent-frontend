'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';

export default function CreateAccountPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [mode, setMode] = useState(null); // 'register' or 'join'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Register Form State
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [direccion, setDireccion] = useState('');

    // Join Form State
    const [codigo, setCodigo] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = {
                clerkId: user.id,
                nombre,
                telefono,
                email,
                direccion,
                cuentasVinculadas: user.externalAccounts || []
            };
            const res = await fetch('http://localhost:8080/api/empresas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Ocurrió un error al registrar la empresa');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = { clerkId: user.id, codigo };
            const res = await fetch('http://localhost:8080/api/empresas/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Código inválido o error al unirse a la empresa');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return <div className="flex-1 flex items-center justify-center text-gray-500">Cargando...</div>;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto relative w-full h-full">
            {/* Header con botón de cerrar sesión */}
            <div className="absolute top-8 right-8">
                <button 
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-full text-sm font-semibold transition-colors"
                >
                    Cerrar sesión
                </button>
            </div>

            <div className="w-full max-w-xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Bienvenido a Routh</h1>
                    <p className="text-gray-500 text-base">Para continuar, necesitas estar asociado a una empresa en nuestra plataforma.</p>
                </div>

                {!mode && (
                    <div className="flex flex-col gap-4">
                        
                        <button 
                            onClick={() => setMode('register')}
                            className="w-full p-6 rounded-[24px] border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300 flex items-center gap-5 text-left group"
                        >
                            <div className="w-14 h-14 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Registrar una empresa</h3>
                                <p className="text-sm text-gray-500 mt-1">Crea un nuevo espacio de trabajo para tu equipo.</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => setMode('join')}
                            className="w-full p-6 rounded-[24px] border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300 flex items-center gap-5 text-left group"
                        >
                            <div className="w-14 h-14 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Unirme a una empresa</h3>
                                <p className="text-sm text-gray-500 mt-1">Si ya te invitaron, ingresa el código de acceso.</p>
                            </div>
                        </button>
                    </div>
                )}

                {mode === 'register' && (
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <button onClick={() => setMode(null)} className="p-2 -ml-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-900 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Registrar Empresa</h2>
                        </div>
                        {error && <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100 flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>{error}</div>}
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Nombre de la empresa</label>
                                <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium placeholder-gray-400" placeholder="Ej. Mi Empresa S.A." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Número de teléfono</label>
                                <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium placeholder-gray-400" placeholder="+54 9 11 2345 6789" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Correo electrónico</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium placeholder-gray-400" placeholder="contacto@empresa.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Dirección completa</label>
                                <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium placeholder-gray-400" placeholder="Av. Siempre Viva 742" />
                            </div>
                            <div className="pt-2">
                                <button disabled={loading} className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-md">
                                    {loading ? 'Creando...' : 'Completar registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <button onClick={() => setMode(null)} className="p-2 -ml-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-900 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Unirme a una Empresa</h2>
                        </div>
                        {error && <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100 flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>{error}</div>}
                        <form onSubmit={handleJoin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Ingresa el código proporcionado por el administrador</label>
                                <input required type="text" value={codigo} onChange={e => setCodigo(e.target.value)} className="w-full px-5 py-5 text-center uppercase tracking-[0.3em] text-2xl font-bold rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder-gray-300" placeholder="AB12CD" />
                            </div>
                            <div className="pt-4">
                                <button disabled={loading} className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-md">
                                    {loading ? 'Validando...' : 'Unirme'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
