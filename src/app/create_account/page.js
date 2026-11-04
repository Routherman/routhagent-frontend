'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { API_URL } from '@/config/api';
import { 
  Building2, 
  UserCheck, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  Clock,
  Mail,
  Phone,
  Building
} from 'lucide-react';

export default function CreateAccountPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    // Modes: null | 'colaboratium_asesor' | 'request_company' | 'join_code' | 'request_submitted'
    const [mode, setMode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submittedTicketId, setSubmittedTicketId] = useState(null);

    // Asesor Colaboratium Form State
    const [asesorTelefono, setAsesorTelefono] = useState('');

    // Nueva Empresa / Individuo Form State
    const [tipoEntidad, setTipoEntidad] = useState('empresa'); // 'empresa' | 'individuo'
    const [empresaNombre, setEmpresaNombre] = useState('');
    const [empresaCuit, setEmpresaCuit] = useState('');
    const [empresaTelefono, setEmpresaTelefono] = useState('');
    const [empresaEmail, setEmpresaEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');
    const [empresaRubro, setEmpresaRubro] = useState('');
    const [empresaDireccion, setEmpresaDireccion] = useState('');
    const [empresaDetalles, setEmpresaDetalles] = useState('');

    // Join with Code State
    const [codigoManual, setCodigoManual] = useState('');

    // 1. Ingresar como Asesor a Colaboratium (Código KRZMJI hardcodeado)
    const handleJoinColaboratium = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = { 
                clerkId: user.id, 
                codigo: 'KRZMJI',
                telefono: asesorTelefono || undefined
            };
            const res = await fetch(`${API_URL}/empresas/join`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Ocurrió un error al vincular la cuenta a Colaboratium');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Solicitar Alta de Nueva Empresa / Individuo (Envía email a colaboratium@gmail.com y abre ticket urgente)
    const handleRequestAccess = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = {
                tipo: tipoEntidad,
                nombre: empresaNombre,
                email: empresaEmail || user?.primaryEmailAddress?.emailAddress,
                telefono: empresaTelefono,
                cuit: empresaCuit,
                rubro: empresaRubro,
                direccion: empresaDireccion,
                detalles: empresaDetalles,
                clerkId: user.id
            };
            const res = await fetch(`${API_URL}/onboarding/request-access`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSubmittedTicketId(data.ticketId);
                setMode('request_submitted');
            } else {
                setError(data.error || 'Ocurrió un error al enviar la solicitud');
            }
        } catch (err) {
            setError('Error de conexión al enviar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Unirse con código manual
    const handleJoinManual = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const cleanCode = (codigoManual || '').trim().toUpperCase();
            const payload = { clerkId: user.id, codigo: cleanCode };
            const res = await fetch(`${API_URL}/empresas/join`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
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

    if (!isLoaded) {
        return (
            <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-950 text-white font-sans">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-gray-950 via-[#0a0d18] to-gray-950 text-white font-sans overflow-y-auto relative w-full">
            {/* Header con botón de cerrar sesión */}
            <div className="absolute top-6 right-6">
                <button 
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white rounded-full text-xs font-bold transition-all border border-white/10"
                >
                    Cerrar sesión ({user?.primaryEmailAddress?.emailAddress})
                </button>
            </div>

            <div className="w-full max-w-xl my-8">
                {/* Header Bienvenida */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-3">
                        <Sparkles className="w-3.5 h-3.5" /> Ecosistema Routh • Colaboratium
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        Configuración de Acceso
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                        Para ingresar a la plataforma necesitas estar vinculado a una empresa o registrar una nueva solicitud.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {error}
                    </div>
                )}

                {/* MENÚ PRINCIPAL DE OPCIONES */}
                {!mode && (
                    <div className="flex flex-col gap-4">
                        {/* OPCIÓN 1: ASESOR COLABORATIUM (Automático con KRZMJI) */}
                        <button 
                            onClick={() => setMode('colaboratium_asesor')}
                            className="w-full p-6 rounded-[28px] border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-gray-900/60 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex items-center gap-5 text-left group"
                        >
                            <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0">
                                <UserCheck className="w-7 h-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-extrabold text-white text-base sm:text-lg">Ingresar como Asesor a Colaboratium</h3>
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        Acceso Inmediato
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Únete automáticamente al equipo oficial de Colaboratium con el código <span className="font-mono text-indigo-300 font-bold">KRZMJI</span> y rol de Asesor.
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                        </button>

                        {/* OPCIÓN 2: REGISTRAR NUEVA EMPRESA / INDIVIDUO (Requiere validación Master) */}
                        <button 
                            onClick={() => setMode('request_company')}
                            className="w-full p-6 rounded-[28px] border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] hover:shadow-xl transition-all duration-300 flex items-center gap-5 text-left group"
                        >
                            <div className="w-14 h-14 bg-white/10 border border-white/10 text-white rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-black transition-all shadow-sm shrink-0">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-extrabold text-white text-base sm:text-lg">Registrar Nueva Empresa o Individuo</h3>
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Validación Master
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Solicita credenciales de alta. Se enviará un correo a <span className="text-gray-300 font-mono">colaboratium@gmail.com</span> y se abrirá un ticket urgente.
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                        </button>

                        {/* OPCIÓN 3: UNIRME CON CÓDIGO MANUAL */}
                        <button 
                            onClick={() => setMode('join_code')}
                            className="w-full p-4 rounded-2xl border border-white/10 bg-transparent hover:bg-white/[0.04] text-gray-400 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
                        >
                            <KeyRound className="w-4 h-4 text-gray-400" />
                            ¿Ya tienes un código de acceso de otra empresa? Ingresar aquí
                        </button>
                    </div>
                )}

                {/* FORMULARIO 1: CONFIRMACIÓN ASESOR COLABORATIUM */}
                {mode === 'colaboratium_asesor' && (
                    <div className="bg-gray-900/90 border border-indigo-500/30 rounded-[32px] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <button 
                                onClick={() => setMode(null)} 
                                className="p-2 -ml-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
                            >
                                ← Volver
                            </button>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">Ingreso Asesor Colaboratium</h2>
                                <p className="text-xs text-gray-400">Código de Empresa asignado: <span className="font-mono text-indigo-300 font-bold">KRZMJI</span></p>
                            </div>
                        </div>

                        <form onSubmit={handleJoinColaboratium} className="space-y-4">
                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                                <p className="font-bold flex items-center gap-1.5 mb-1 text-white">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Acceso Inmediato Autorizado
                                </p>
                                Al confirmar, tu usuario (<span className="font-semibold text-white">{user?.fullName || user?.firstName}</span>, {user?.primaryEmailAddress?.emailAddress}) recibirá automáticamente el rol de **Asesor** en la consola Colaboratium.
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                                    Teléfono de contacto WhatsApp (Opcional)
                                </label>
                                <input 
                                    type="text" 
                                    value={asesorTelefono} 
                                    onChange={e => setAsesorTelefono(e.target.value)} 
                                    placeholder="+54 9 11 2345 6789" 
                                    className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/[0.06] text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-xs placeholder-gray-500"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Asignando rol y accediendo...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Entrar al CRM de Colaboratium</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* FORMULARIO 2: SOLICITUD DE ACCESO NUEVA EMPRESA / INDIVIDUO */}
                {mode === 'request_company' && (
                    <div className="bg-gray-900/90 border border-white/15 rounded-[32px] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <button 
                                onClick={() => setMode(null)} 
                                className="p-2 -ml-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
                            >
                                ← Volver
                            </button>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">Solicitud de Credenciales de Acceso</h2>
                                <p className="text-xs text-gray-400">Se abrirá un ticket urgente para los administradores Master</p>
                            </div>
                        </div>

                        <form onSubmit={handleRequestAccess} className="space-y-4">
                            {/* Selector Tipo: Empresa vs Individuo */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-2">Tipo de solicitante</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTipoEntidad('empresa')}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                                            tipoEntidad === 'empresa'
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        🏢 Empresa / Compañía
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTipoEntidad('individuo')}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                                            tipoEntidad === 'individuo'
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        👤 Individuo / Profesional
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                                    {tipoEntidad === 'empresa' ? 'Razón Social / Nombre de la Empresa' : 'Nombre Completo del Solicitante'} *
                                </label>
                                <input 
                                    required 
                                    type="text" 
                                    value={empresaNombre} 
                                    onChange={e => setEmpresaNombre(e.target.value)} 
                                    placeholder={tipoEntidad === 'empresa' ? "Ej: Inversiones Globales S.A." : "Ej: Martín Gómez"} 
                                    className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/[0.06] text-white focus:ring-2 focus:ring-amber-500 outline-none font-medium text-xs placeholder-gray-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                                        CUIT / DNI
                                    </label>
                                    <input 
                                        type="text" 
                                        value={empresaCuit} 
                                        onChange={e => setEmpresaCuit(e.target.value)} 
                                        placeholder="20-12345678-9" 
                                        className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/[0.06] text-white focus:ring-2 focus:ring-amber-500 outline-none font-medium text-xs placeholder-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                                        Teléfono de Contacto *
                                    </label>
                                    <input 
                                        required
                                        type="text" 
                                        value={empresaTelefono} 
                                        onChange={e => setEmpresaTelefono(e.target.value)} 
                                        placeholder="+54 9 11 2345 6789" 
                                        className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/[0.06] text-white focus:ring-2 focus:ring-amber-500 outline-none font-medium text-xs placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                                        Correo Electrónico Oficial *
                                    </label>
                                    <input 
                                        required
                                        type="email" 
                                        value={empresaEmail} 
                                        onChange={e => setEmpresaEmail(e.target.value)} 
                                        placeholder="contacto@empresa.com" 
                                        className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/[0.06] text-white focus:ring-2 focus:ring-amber-500 outline-none font-medium text-xs placeholder-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                                        Rubro o Actividad
                                    </label>
                                    <input 
                                        type="text" 
                                        value={empresaRubro} 
                                        onChange={e => setEmpresaRubro(e.target.value)} 
                                        placeholder="Finanzas, Inmobiliario, etc." 
                                        className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/[0.06] text-white focus:ring-2 focus:ring-amber-500 outline-none font-medium text-xs placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                                    Detalle o Necesidad de Acceso
                                </label>
                                <textarea 
                                    rows={2}
                                    value={empresaDetalles} 
                                    onChange={e => setEmpresaDetalles(e.target.value)} 
                                    placeholder="Indica qué módulos o herramientas precisas habilitar para tu equipo..." 
                                    className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/[0.06] text-white focus:ring-2 focus:ring-amber-500 outline-none font-medium text-xs placeholder-gray-500 resize-none"
                                />
                            </div>

                            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-[11px] text-gray-300 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Al enviar, se emitirá una notificación a <strong className="text-white">colaboratium@gmail.com</strong> para asignarte credenciales.</span>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                                        <span>Enviando solicitud y creando ticket...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Enviar Solicitud a Colaboratium</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* CONFIRMACIÓN DE SOLICITUD ENVIADA */}
                {mode === 'request_submitted' && (
                    <div className="bg-gray-900/95 border border-emerald-500/40 rounded-[32px] p-8 shadow-2xl text-center backdrop-blur-xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                            ¡Solicitud Enviada con Éxito!
                        </h2>
                        <p className="text-sm text-gray-300 mb-4 max-w-md mx-auto">
                            Se ha generado el ticket urgente <strong className="text-emerald-400 font-mono">#{submittedTicketId}</strong> en el CRM de Colaboratium y se ha notificado a <strong className="text-white">colaboratium@gmail.com</strong>.
                        </p>
                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-gray-400 text-left space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-white font-bold">
                                <Clock className="w-4 h-4 text-amber-400" /> Próximo paso:
                            </div>
                            <p>El administrador Master creará tu espacio de trabajo y te asignará el rol correspondiente. Apenas se apruebe tu cuenta, podrás ingresar automáticamente.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => setMode('colaboratium_asesor')}
                                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                            >
                                Entrar como Asesor de Colaboratium
                            </button>
                            <button
                                onClick={() => signOut({ redirectUrl: '/' })}
                                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white font-bold text-xs transition border border-white/10"
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                )}

                {/* FORMULARIO 3: UNIRME CON CÓDIGO MANUAL */}
                {mode === 'join_code' && (
                    <div className="bg-gray-900/90 border border-white/15 rounded-[32px] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <button 
                                onClick={() => setMode(null)} 
                                className="p-2 -ml-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
                            >
                                ← Volver
                            </button>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">Ingresar Código de Empresa</h2>
                                <p className="text-xs text-gray-400">Si tu administrador te otorgó un código alfanumérico</p>
                            </div>
                        </div>

                        <form onSubmit={handleJoinManual} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-2 text-center">
                                    Ingresa el código proporcionado
                                </label>
                                <input 
                                    required 
                                    type="text" 
                                    value={codigoManual} 
                                    onChange={e => setCodigoManual(e.target.value)} 
                                    className="w-full px-5 py-5 text-center uppercase tracking-[0.3em] text-2xl font-black rounded-2xl border border-white/15 bg-white/[0.06] text-white focus:ring-2 focus:ring-indigo-500 outline-none transition placeholder-gray-600 font-mono" 
                                    placeholder="AB12CD" 
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={loading || !codigoManual.trim()} 
                                className="w-full py-4 rounded-2xl bg-white text-black font-extrabold text-sm hover:bg-gray-200 transition shadow-lg disabled:opacity-40"
                            >
                                {loading ? 'Validando...' : 'Unirme a la Empresa'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
