"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Panel from "@/components/dashboard/Panel";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { API_URL } from '@/config/api';

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [team, setTeam] = useState([]);
    const [scores, setScores] = useState([]);
    const [scoreFilter, setScoreFilter] = useState('ALL');
    const [codigoEmpresa, setCodigoEmpresa] = useState('KRZMJI');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchData = async () => {
            try {
                // 1. Get user and enterprise code
                const userRes = await fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                const userData = await userRes.json();
                const codEmp = userData.codigo_empresa || 'KRZMJI';
                setCodigoEmpresa(codEmp);

                if (!userData.codigo_empresa && !codEmp) {
                    setError('No tienes una empresa asignada.');
                    setLoading(false);
                    return;
                }

                // 2. Get contacts
                const contactsRes = await fetch(`${API_URL}/contacts/${codEmp}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                const contactsData = await contactsRes.json();
                setContacts(Array.isArray(contactsData) ? contactsData : []);

                // 3. Get team members
                const teamRes = await fetch(`${API_URL}/empresas/${codEmp}/usuarios`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                const teamData = await teamRes.json();
                setTeam(Array.isArray(teamData) ? teamData : []);

                // 4. Get scores ranking
                try {
                    const scoresRes = await fetch(`${API_URL}/empresas/${codEmp}/scores`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                    const scoresData = await scoresRes.json();
                    if (scoresData && scoresData.scores) {
                        setScores(scoresData.scores);
                    }
                } catch (scErr) {
                    console.warn('Error cargando scores para dashboard:', scErr);
                }

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError('Error al cargar la información.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isLoaded, user]);

    const handoffChats = contacts.filter(c => c.estado_bot === 'HANDOFF');

    const filteredScores = scores.filter(s => {
        if (scoreFilter === 'ALL') return true;
        const r = (s.rol || '').toUpperCase();
        if (scoreFilter === 'ASESORES') return r === 'ASESORES';
        if (scoreFilter === 'LIDERES') return r === 'LIDERES';
        if (scoreFilter === 'TEAM') return ['TEAM', 'SOPORTE', 'CREDITOS'].includes(r);
        return true;
    });

    const getRangoBadge = (score) => {
        if (score >= 850) {
            return {
                icono: '💎',
                nombre: 'Diamante',
                color: 'from-emerald-500 to-teal-400',
                textColor: 'text-emerald-400',
                bgBadge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
                barColor: 'from-emerald-500 to-teal-400',
                meta: 'Prioridad máxima de leads calificados (+30% volumen) & Bono Comercial'
            };
        }
        if (score >= 700) {
            return {
                icono: '🥇',
                nombre: 'Oro',
                color: 'from-amber-400 to-yellow-500',
                textColor: 'text-amber-400',
                bgBadge: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
                barColor: 'from-amber-500 to-yellow-400',
                meta: 'Asignación preferencial de inversores y comisión plena'
            };
        }
        if (score >= 500) {
            return {
                icono: '🥈',
                nombre: 'Plata',
                color: 'from-blue-400 to-indigo-500',
                textColor: 'text-blue-400',
                bgBadge: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
                barColor: 'from-blue-500 to-indigo-400',
                meta: 'Nivel operativo regular. Requisitos de SLA dentro de norma'
            };
        }
        if (score >= 350) {
            return {
                icono: '🥉',
                nombre: 'Bronce',
                color: 'from-orange-400 to-amber-600',
                textColor: 'text-orange-400',
                bgBadge: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
                barColor: 'from-orange-500 to-amber-500',
                meta: 'Alerta preventiva. Requiere coaching y revisión de tiempos'
            };
        }
        return {
            icono: '⚠️',
            nombre: 'En Revisión',
            color: 'from-rose-500 to-red-600',
            textColor: 'text-rose-400',
            bgBadge: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
            barColor: 'from-rose-500 to-red-500',
            meta: 'Suspensión preventiva de nuevos leads hasta resolver auditoría'
        };
    };

    const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((acc, curr) => acc + (curr.score_actual || 0), 0) / scores.length) 
        : 720;
    const topScore = scores.length > 0 ? Math.max(...scores.map(s => s.score_actual || 0)) : 880;

    return (
        <>
            <Sidebar />
            <Panel>
                <Header />
                <div className="px-8 pb-8 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex h-full items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-black dark:border-slate-800 dark:border-t-amber-400 rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="flex h-full items-center justify-center text-red-500 py-20">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            
                            {/* Stats Card: Total Chats */}
                            <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="text-gray-500 dark:text-slate-400 font-medium text-sm mb-1">Total de Chats</h3>
                                    <div className="text-4xl font-bold text-gray-800 dark:text-white">{contacts.length}</div>
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-sm text-green-600 dark:text-emerald-400 bg-green-50 dark:bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-transparent dark:border-emerald-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                    </svg>
                                    <span>Base de clientes activa</span>
                                </div>
                            </div>

                            {/* Attention Required Card (Handoffs) */}
                            <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10 lg:col-span-2 flex flex-col hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-800 dark:text-white font-bold text-lg flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                                        Chats requieren atención ({handoffChats.length})
                                    </h3>
                                    <Link href="/dashboard/messages" className="text-sm font-medium text-blue-600 dark:text-sky-400 hover:underline">
                                        Ver bandeja →
                                    </Link>
                                </div>
                                <div className="flex-1 overflow-y-auto max-h-40 pr-2">
                                    {handoffChats.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">
                                            Todo en orden, la IA está gestionando todo.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {handoffChats.map(c => (
                                                <Link href="/dashboard/messages" key={c.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <img src={`https://ui-avatars.com/api/?name=${c.nombre || 'Desconocido'}&background=random`} alt="avatar" className="w-10 h-10 rounded-full" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{c.nombre || c.telefono}</p>
                                                            <p className="text-xs text-red-500 dark:text-red-400">Esperando agente humano</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                                                        {new Date(c.creado_en).toLocaleDateString()}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ========================================================= */}
                            {/* FLAGSHIP CARD: SISTEMA DE SCORE Y RANKING DE DESEMPEÑO   */}
                            {/* ========================================================= */}
                            <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-white/10 lg:col-span-3 hover:shadow-lg transition-all">
                                
                                {/* Header del Ranking */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                                Gamificación & SLAs 360°
                                            </span>
                                            <span className="text-xs text-slate-400">Normativa Colaboratium BCRA 40.015</span>
                                        </div>
                                        <h3 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
                                            🏆 Ranking de Desempeño y Sistema de Puntos
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
                                            Puntaje en vivo de velocidad de respuesta, resolución de tickets, cartera de inversión y acompañamiento de equipo.
                                        </p>
                                    </div>

                                    {/* Botón de descarga de PDF oficial */}
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={`${API_URL}/empresas/${codigoEmpresa}/scores/pdf-guia`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download="Reglamento_Sistema_de_Puntos_Colaboratium.pdf"
                                            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                                            title="Descargar documento normativo oficial en formato PDF"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Descargar Reglamento Score (PDF)</span>
                                        </a>

                                        <Link
                                            href="/dashboard/crm"
                                            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-slate-300 text-xs font-semibold border border-transparent dark:border-white/10 transition-colors"
                                            title="Ver detalle en CRM con jerarquías"
                                        >
                                            <span>Ver en CRM</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>

                                {/* KPIs Rápidos del Sistema */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5">
                                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                                        <p className="text-[11px] text-gray-400 dark:text-slate-400 font-medium uppercase tracking-wider">Top Score</p>
                                        <p className="text-xl font-black text-amber-500 mt-0.5">{topScore} <span className="text-xs font-normal text-gray-400">pts</span></p>
                                        <span className="text-[10px] text-emerald-500">💎 Nivel Diamante</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                                        <p className="text-[11px] text-gray-400 dark:text-slate-400 font-medium uppercase tracking-wider">Promedio General</p>
                                        <p className="text-xl font-black text-blue-500 mt-0.5">{avgScore} <span className="text-xs font-normal text-gray-400">pts</span></p>
                                        <span className="text-[10px] text-blue-400">🥇 Nivel Oro</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                                        <p className="text-[11px] text-gray-400 dark:text-slate-400 font-medium uppercase tracking-wider">Evaluados</p>
                                        <p className="text-xl font-black text-gray-800 dark:text-white mt-0.5">{scores.length}</p>
                                        <span className="text-[10px] text-gray-400">Asesores & Líderes</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                                        <p className="text-[11px] text-gray-400 dark:text-slate-400 font-medium uppercase tracking-wider">SLA Promedio</p>
                                        <p className="text-xl font-black text-emerald-500 mt-0.5">8.4 <span className="text-xs font-normal text-gray-400">min</span></p>
                                        <span className="text-[10px] text-emerald-400">⚡ Tiempo de respuesta</span>
                                    </div>
                                </div>

                                {/* Tabs de Filtros por Rol */}
                                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
                                    {[
                                        { id: 'ALL', label: 'Todos', count: scores.length },
                                        { id: 'ASESORES', label: 'Asesores', count: scores.filter(s => (s.rol || '').toUpperCase() === 'ASESORES').length },
                                        { id: 'LIDERES', label: 'Líderes', count: scores.filter(s => (s.rol || '').toUpperCase() === 'LIDERES').length },
                                        { id: 'TEAM', label: 'Team & Soporte', count: scores.filter(s => ['TEAM', 'SOPORTE', 'CREDITOS'].includes((s.rol || '').toUpperCase())).length },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setScoreFilter(tab.id)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                scoreFilter === tab.id
                                                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {tab.label} ({tab.count})
                                        </button>
                                    ))}
                                </div>

                                {/* Lista del Leaderboard */}
                                <div className="divide-y divide-gray-100 dark:divide-white/5 mt-2 max-h-96 overflow-y-auto pr-1">
                                    {filteredScores.length === 0 ? (
                                        <div className="py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                                            No hay usuarios con score en este rol.
                                        </div>
                                    ) : (
                                        filteredScores.map((item, idx) => {
                                            const badge = getRangoBadge(item.score_actual);
                                            const pos = idx + 1;
                                            const posMedal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `#${pos}`;

                                            return (
                                                <div
                                                    key={item.id || idx}
                                                    className="py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                                                >
                                                    {/* Usuario y posición */}
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                                            pos <= 3 
                                                                ? 'text-base' 
                                                                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 text-xs'
                                                        }`}>
                                                            {posMedal}
                                                        </div>

                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.nombre || 'Usuario')}&background=random`}
                                                            alt="avatar"
                                                            className="w-10 h-10 rounded-full shrink-0 border border-gray-200 dark:border-white/10"
                                                        />

                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                                    {item.nombre || 'Usuario'}
                                                                </p>
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                                                                    {item.rol || 'ASESORES'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                                                                {item.telefono || item.email || 'Sin contacto'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Métricas operativas & Barra de Score */}
                                                    <div className="flex items-center justify-between sm:justify-end gap-5">
                                                        {/* Métricas secundarias */}
                                                        <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                                                            <span title="Tiempo promedio de respuesta a leads">
                                                                ⚡ {item.tiempo_promedio_min || '8.0'}m
                                                            </span>
                                                            <span title="Leads atendidos">
                                                                🎯 {item.leads_atendidos || 0} leads
                                                            </span>
                                                            {item.volumen_cartera > 0 && (
                                                                <span className="text-emerald-500 font-medium" title="Volumen de cartera bajo gestión">
                                                                    💼 ${(Number(item.volumen_cartera) / 1000000).toFixed(1)}M
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Score y Tier Badge */}
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <div className="text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <span className="text-base font-black text-gray-900 dark:text-white">
                                                                        {item.score_actual}
                                                                    </span>
                                                                    <span className="text-[11px] font-semibold text-gray-400">/ 1000 pts</span>
                                                                </div>

                                                                {/* Barra de progreso */}
                                                                <div className="w-24 sm:w-28 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                                                                    <div
                                                                        className={`h-full rounded-full bg-gradient-to-r ${badge.barColor}`}
                                                                        style={{ width: `${Math.min(100, Math.max(5, (item.score_actual / 1000) * 100))}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Insignia de Rango */}
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${badge.bgBadge}`}
                                                                title={badge.meta}
                                                            >
                                                                <span>{badge.icono}</span>
                                                                <span className="hidden sm:inline">{badge.nombre}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Banner explicativo con acceso directo a descarga */}
                                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0">
                                            📜
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Reglamento Oficial de Puntos y SLAs</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Respuesta &lt; 5m (+20 pts) • Cierre de Inversión (+50 pts) • Demora &gt; 30m (-30 pts) • Ticket reclamo (-50 pts). Descargá el PDF de 2 páginas con la matriz completa y beneficios por rango.
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={`${API_URL}/empresas/${codigoEmpresa}/scores/pdf-guia`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download="Reglamento_Sistema_de_Puntos_Colaboratium.pdf"
                                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold whitespace-nowrap transition-colors border border-white/10 shrink-0"
                                    >
                                        Ver Matriz en PDF →
                                    </a>
                                </div>
                            </div>

                            {/* Team Card */}
                            <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10 lg:col-span-3 hover:shadow-md transition-shadow">
                                <h3 className="text-gray-800 dark:text-white font-bold text-lg mb-4">Tu Equipo</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {team.map(member => (
                                        <div key={member.id} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/10 rounded-2xl cursor-pointer hover:border-gray-300 dark:hover:border-white/30 hover:shadow-sm dark:hover:bg-white/5 transition-all group">
                                            <img src={member.image_url || `https://ui-avatars.com/api/?name=${member.first_name || 'U'}&background=random`} alt="avatar" className="w-12 h-12 rounded-full shadow-sm" />
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{member.email}</p>
                                            </div>
                                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </Panel>
        </>
    );
}