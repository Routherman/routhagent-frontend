'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Crown, 
  UserCheck, 
  DollarSign, 
  Users, 
  ArrowRight, 
  ArrowDown, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  Pin,
  ExternalLink,
  Filter,
  Layers
} from 'lucide-react';

export default function CrmHierarchyTree({ 
  treeData, 
  activeBranch = 'TODOS', // 'TODOS' | 'CLIENTES' | 'INVERSORES' | 'ASESORES_LIDERES'
  onSelectBranch,
  onSelectContact
}) {
  const [collapsedLeaders, setCollapsedLeaders] = useState({});
  const [collapsedAdvisors, setCollapsedAdvisors] = useState({});
  const [hoveredNote, setHoveredNote] = useState(null);

  if (!treeData || !treeData.root) return null;

  const { root, lideres = [], asesores = [], inversores = [], clientes = [] } = treeData;

  const toggleLeader = (id) => {
    setCollapsedLeaders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAdvisor = (id) => {
    setCollapsedAdvisors(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrado de ramas según activeBranch
  const showLideresBranch = activeBranch === 'TODOS' || activeBranch === 'ASESORES_LIDERES' || activeBranch === 'INVERSORES';
  const showAsesoresBranch = activeBranch === 'TODOS' || activeBranch === 'ASESORES_LIDERES' || activeBranch === 'INVERSORES';
  const showInversoresBranch = activeBranch === 'TODOS' || activeBranch === 'INVERSORES';
  const showClientesBranch = activeBranch === 'TODOS' || activeBranch === 'CLIENTES';

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 mb-6 overflow-hidden">
      {/* Top Header of Tree */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-black text-lg text-gray-900 tracking-tight">
              Árbol de Dependencias Jerárquico
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Estructura operativa de Colaboratium: <span className="font-bold text-gray-700">colaboratium@gmail.com</span> ➔ Líderes ➔ Asesores ➔ Inversores
          </p>
        </div>

        {/* Branch Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-200/80 overflow-x-auto">
          <button
            onClick={() => onSelectBranch?.('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeBranch === 'TODOS'
                ? 'bg-white text-gray-950 shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Ver Todo el Árbol
          </button>
          <button
            onClick={() => onSelectBranch?.('ASESORES_LIDERES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeBranch === 'ASESORES_LIDERES'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Líderes y Asesores ({lideres.length + asesores.length})
          </button>
          <button
            onClick={() => onSelectBranch?.('INVERSORES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeBranch === 'INVERSORES'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Inversores ({inversores.length})
          </button>
          <button
            onClick={() => onSelectBranch?.('CLIENTES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeBranch === 'CLIENTES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Tomadores de Deuda ({clientes.length})
          </button>
        </div>
      </div>

      {/* Visual Hierarchy Diagram */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[840px] flex flex-col items-center">
          
          {/* 1. NODO RAÍZ: colaboratium@gmail.com */}
          <div className="flex flex-col items-center">
            <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-700/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 font-black">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight">{root.name || 'Colaboratium Dirección Central'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                    BCRA Nº 40.015
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70 font-mono mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="font-bold text-white/90">{root.email || 'colaboratium@gmail.com'}</span>
                  <span className="text-white/40">• Vicente López, Bs As</span>
                </div>
              </div>
            </div>

            {/* Connecting Vertical Stem */}
            <div className="w-0.5 h-7 bg-indigo-300"></div>
            <ArrowDown className="w-4 h-4 text-indigo-500 -mt-2 mb-1" />
          </div>

          {/* 2. RAMAS PRINCIPALES: LÍDERES (Comercial / Inversiones) y CLIENTES (Tomadores de Deuda) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* LÍNEA DE RED COMERCIAL E INVERSORES (Líderes -> Asesores -> Inversores) */}
            {(showLideresBranch || showAsesoresBranch || showInversoresBranch) && (
              <div className={`${showClientesBranch ? 'md:col-span-8' : 'md:col-span-12'} flex flex-col items-center`}>
                
                <div className="w-full flex items-center justify-center mb-3">
                  <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    Línea de Red de Inversiones & Asesoramiento
                  </span>
                </div>

                {/* Líderes list */}
                <div className="w-full space-y-4">
                  {lideres.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                      Sin líderes asignados en la red.
                    </div>
                  ) : (
                    lideres.map((lider) => {
                      const liderAsesores = asesores.filter(a => a.lider_id === lider.id);
                      const isCollapsed = collapsedLeaders[lider.id];

                      return (
                        <div key={lider.id} className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white p-4 shadow-xs">
                          {/* Tarjeta del Líder */}
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                                <Crown className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-extrabold text-sm text-gray-900">{lider.nombre}</h4>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                                    LÍDER
                                  </span>
                                  {lider.score !== undefined && lider.score !== null && (
                                    <span 
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border shadow-2xs ${
                                        lider.score >= 850
                                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                                          : lider.score >= 700
                                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                                          : 'bg-blue-100 text-blue-900 border-blue-300'
                                      }`}
                                      title={`Score de Gestión: ${lider.score} Pts • Rango ${lider.rango || 'Oro'}`}
                                    >
                                      <span>{lider.score >= 850 ? '💎' : lider.score >= 700 ? '🥇' : '🥈'}</span>
                                      <span className="font-mono">{lider.score} pts</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mt-0.5">
                                  <span>{lider.email}</span>
                                  <span>•</span>
                                  <span className="text-gray-700 font-bold">{lider.telefono}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
                                {liderAsesores.length} Asesor{liderAsesores.length === 1 ? '' : 'es'}
                              </span>
                              <button
                                onClick={() => toggleLeader(lider.id)}
                                className="p-1.5 rounded-xl hover:bg-amber-100/60 text-gray-500 transition"
                                title="Expandir/colapsar equipo del líder"
                              >
                                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* SUBORDINADOS DEL LÍDER: ASESORES */}
                          {!isCollapsed && showAsesoresBranch && (
                            <div className="mt-4 pt-4 border-t border-amber-200/60 pl-4 sm:pl-6 space-y-4">
                              {liderAsesores.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No hay asesores asignados a este líder aún.</p>
                              ) : (
                                liderAsesores.map((asesor) => {
                                  const asesorInversores = inversores.filter(i => i.asesor_id === asesor.id || i.lider_id === lider.id);
                                  const isAdvisorCollapsed = collapsedAdvisors[asesor.id];

                                  return (
                                    <div key={asesor.id} className="rounded-xl border border-blue-200 bg-white p-3.5 shadow-2xs">
                                      {/* Tarjeta del Asesor */}
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                            <UserCheck className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="text-xs text-gray-400 font-mono">➔</span>
                                              <h5 className="font-extrabold text-xs text-gray-900">{asesor.nombre}</h5>
                                              <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                                                ASESOR
                                              </span>
                                              {asesor.score !== undefined && asesor.score !== null && (
                                                <span 
                                                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-black border shadow-2xs ${
                                                    asesor.score >= 850
                                                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                                                      : asesor.score >= 700
                                                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                      : asesor.score >= 500
                                                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                                                      : 'bg-orange-100 text-orange-900 border-orange-300'
                                                  }`}
                                                  title={`Score de Rendimiento: ${asesor.score} Pts • Rango ${asesor.rango || 'Plata'}`}
                                                >
                                                  <span>{asesor.score >= 850 ? '💎' : asesor.score >= 700 ? '🥇' : asesor.score >= 500 ? '🥈' : '🥉'}</span>
                                                  <span className="font-mono">{asesor.score} pts</span>
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono mt-0.5">
                                              <span>{asesor.email}</span>
                                              <span>•</span>
                                              <span>{asesor.telefono}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                            {asesorInversores.length} Inversor{asesorInversores.length === 1 ? '' : 'es'}
                                          </span>
                                          <button
                                            onClick={() => toggleAdvisor(asesor.id)}
                                            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                                          >
                                            {isAdvisorCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                          </button>
                                        </div>
                                      </div>

                                      {/* SUBORDINADOS DEL ASESOR: INVERSORES */}
                                      {!isAdvisorCollapsed && showInversoresBranch && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 pl-4 sm:pl-6 space-y-2">
                                          {asesorInversores.length === 0 ? (
                                            <p className="text-[11px] text-gray-400 italic">Sin inversores asignados actualmente.</p>
                                          ) : (
                                            asesorInversores.map((inv) => {
                                              const isPending = (inv.estado_resolucion || '').toUpperCase() === 'PENDIENTE';

                                              return (
                                                <div 
                                                  key={inv.id}
                                                  onClick={() => onSelectContact?.(inv)}
                                                  className="relative flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-100/70 cursor-pointer transition"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                                                      <DollarSign className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                      <div className="flex items-center gap-1.5">
                                                        <span className="font-extrabold text-xs text-gray-900">{inv.nombre}</span>
                                                        <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-emerald-200 text-emerald-900 uppercase">
                                                          INVERSOR
                                                        </span>
                                                      </div>
                                                      <span className="text-[10px] text-gray-500 font-mono">{inv.telefono}</span>
                                                    </div>
                                                  </div>

                                                  {/* Badge de Estado: Resuelto / Pendiente con Nota Flotante */}
                                                  <div className="flex items-center gap-1.5">
                                                    {isPending ? (
                                                      <div 
                                                        className="relative"
                                                        onMouseEnter={() => setHoveredNote(inv.id)}
                                                        onMouseLeave={() => setHoveredNote(null)}
                                                      >
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold shadow-2xs">
                                                          <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
                                                          <span>Pendiente</span>
                                                        </span>

                                                        {/* NOTA FLOTANTE */}
                                                        {hoveredNote === inv.id && (
                                                          <div className="absolute right-0 bottom-full mb-2 z-50 w-72 p-3 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700 text-xs">
                                                            <div className="flex items-center gap-1 text-amber-300 font-bold mb-1 border-b border-gray-700 pb-1 text-[11px]">
                                                              <Pin className="w-3 h-3" /> Explicación de qué falta:
                                                            </div>
                                                            <p className="text-[11px] text-gray-200 leading-relaxed font-medium">
                                                              {inv.nota_pendiente || 'Sin detalle especificado.'}
                                                            </p>
                                                          </div>
                                                        )}
                                                      </div>
                                                    ) : (
                                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700">
                                                        <CheckCircle2 className="w-3 h-3" /> Resuelto
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* LÍNEA DE CLIENTES (Tomadores de Deuda) */}
            {showClientesBranch && (
              <div className={`${(showLideresBranch || showAsesoresBranch || showInversoresBranch) ? 'md:col-span-4' : 'md:col-span-12'} flex flex-col items-center`}>
                <div className="w-full flex items-center justify-center mb-3">
                  <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Clientes (Tomadores de Deuda)
                  </span>
                </div>

                <div className="w-full space-y-2.5">
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-900/80 leading-relaxed font-medium">
                    ℹ️ <span className="font-bold">Aviso Operativo:</span> Los tomadores de crédito no se comunican activamente por este bot en la fase actual.
                  </div>

                  {clientes.map((cli) => (
                    <div 
                      key={cli.id}
                      onClick={() => onSelectContact?.(cli)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200/90 shadow-2xs hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-black text-xs">
                          {cli.nombre ? cli.nombre[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-xs text-gray-900">{cli.nombre}</h5>
                          <p className="text-[10px] text-gray-400 font-mono">{cli.telefono}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                        {cli.rol_asignado || 'CLIENTE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
