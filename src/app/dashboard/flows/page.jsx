"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from '@/components/dashboard/Sidebar';
import Panel from '@/components/dashboard/Panel';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';
import { Workflow, Plus, Trash2, Zap, Play, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function FlowsPage() {
  const { user, isLoaded } = useUser();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codigoEmpresa, setCodigoEmpresa] = useState('KRZMJI');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowTrigger, setNewFlowTrigger] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(userData => {
        const cod = userData.codigo_empresa || 'KRZMJI';
        setCodigoEmpresa(cod);
        fetchFlows(cod);
      })
      .catch(() => {
        fetchFlows('KRZMJI');
      });
  }, [isLoaded, user]);

  const fetchFlows = async (codigo) => {
    try {
      const res = await fetch(`${API_URL}/empresas/${codigo}/flujos`, { 
        headers: { 'ngrok-skip-browser-warning': 'true' } 
      });
      const data = await res.json();
      setFlows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setNewFlowName('');
    setNewFlowTrigger('');
    setIsModalOpen(true);
  };

  const submitNewFlow = async () => {
    if (!codigoEmpresa || !newFlowName.trim()) return;
    setIsCreating(true);
    const name = newFlowName.trim();
    const trigger = newFlowTrigger.trim() || 'default';
    
    try {
      const initialData = {
        name,
        nodes: [{
          id: 'node_trigger',
          type: 'webhook',
          name: 'Punto de Inicio',
          position: { x: 50, y: 200 },
          data: {}
        }],
        edges: []
      };

      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/flujos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, trigger_keyword: trigger, data_json: initialData })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchFlows(codigoEmpresa);
      }
    } catch (err) {
      console.error(err);
      alert('Error creando flujo');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleFlow = async (flow) => {
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/flujos/${flow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_json: flow.data_json,
          activo: !flow.activo,
          trigger_keyword: flow.trigger_keyword
        })
      });
      if (res.ok) {
        setFlows(flows.map(f => f.id === flow.id ? { ...f, activo: !f.activo } : f));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const deleteFlow = async (id) => {
    if(!confirm("¿Seguro que deseas eliminar este flujo?")) return;
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/flujos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFlows(flows.filter(f => f.id !== id));
      }
    } catch(err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <Panel>
          <Header />
          <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-950 text-white">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-mono text-sm tracking-widest text-slate-400">Cargando flujos...</p>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="flex flex-col h-full w-full p-8 overflow-y-auto bg-[#070b14] text-white">
          
          {/* Header Superior */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  Pipelines & Nodos
                </span>
                <span className="text-[10px] font-bold text-slate-400">Motor SaaSIA</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
                Flujos Conversacionales
              </h2>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Diseña diagramas nodales interactivos y automatiza la atención con el Copiloto IA.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={openCreateModal}
                className="bg-gradient-to-r from-[#c6f432] to-emerald-400 hover:brightness-110 text-slate-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(198,244,50,0.3)] transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Plus size={16} />
                Nuevo Flujo Nodal
              </button>
            </div>
          </div>

          {/* Listado de Flujos */}
          {flows.length === 0 ? (
            <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-16 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-20 h-20 bg-sky-500/10 border border-sky-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-sky-400">
                <Workflow size={36} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Aún no tienes flujos creados</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                Crea flujos visuales paso a paso para guiar las conversaciones de tus prospectos e inversores.
              </p>
              <button 
                onClick={openCreateModal}
                className="bg-[#c6f432] text-slate-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
              >
                Crear Mi Primer Flujo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flows.map(flow => {
                let nodeCount = 0;
                try {
                  const parsed = typeof flow.data_json === 'string' ? JSON.parse(flow.data_json) : flow.data_json;
                  nodeCount = parsed?.nodes?.length || 0;
                } catch(e) {}

                return (
                  <div 
                    key={flow.id} 
                    className="bg-slate-900/80 border border-white/10 hover:border-sky-500/40 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between transition-all hover:-translate-y-1 group"
                  >
                    <div>
                      {/* Estado y Acciones */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                            flow.activo 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {flow.activo ? '● ACTIVO' : 'PAUSADO'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                            {nodeCount} nodos
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteFlow(flow.id)} 
                          className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all opacity-60 group-hover:opacity-100"
                          title="Eliminar Flujo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Nombre del Flujo */}
                      <h3 className="text-lg font-black text-white mb-2 line-clamp-1 group-hover:text-sky-300 transition-colors" title={flow.nombre}>
                        {flow.nombre}
                      </h3>

                      {/* Palabras Clave */}
                      <div className="bg-black/30 rounded-2xl p-3 border border-white/5 mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Triggers de activación:
                        </p>
                        <p className="text-xs text-slate-300 font-mono line-clamp-2">
                          {flow.trigger_keyword || 'default'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Botones de Acción */}
                    <div className="flex gap-2.5 pt-4 border-t border-white/10 mt-auto">
                      <Link 
                        href={`/dashboard/flows/${flow.id}`}
                        className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white text-center py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap size={14} />
                        Abrir Editor Nodal
                      </Link>
                      <button 
                        onClick={() => toggleFlow(flow)}
                        className={`px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors border ${
                          flow.activo 
                            ? 'border-white/10 text-slate-300 hover:bg-white/10' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        }`}
                      >
                        {flow.activo ? 'Pausar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Panel>

      {/* MODAL CREAR NUEVO FLUJO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-white/15 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-[#c6f432]" />
              <h3 className="text-xl font-black uppercase tracking-tight">Nuevo Flujo Conversacional</h3>
            </div>
            <p className="text-slate-400 text-xs mb-6">
              Define el nombre y las palabras clave que activarán este flujo automáticamente en WhatsApp.
            </p>

            <div className="space-y-4 mb-8 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Nombre del flujo
                </label>
                <input 
                  type="text" 
                  value={newFlowName}
                  onChange={e => setNewFlowName(e.target.value)}
                  placeholder="Ej. Flujo de Calificación Inversores" 
                  className="w-full bg-slate-950 border border-white/15 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-sky-500 transition-all font-semibold"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Palabras clave de activación (separadas por coma)
                </label>
                <input 
                  type="text" 
                  value={newFlowTrigger}
                  onChange={e => setNewFlowTrigger(e.target.value)}
                  placeholder="Ej. invertir, inversion, tasas, 1" 
                  className="w-full bg-slate-950 border border-white/15 rounded-2xl px-4 py-3 text-white text-xs font-mono outline-none focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors border border-white/5"
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button 
                onClick={submitNewFlow}
                className="flex-1 px-4 py-3 bg-[#c6f432] hover:brightness-110 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-transform disabled:opacity-50"
                disabled={!newFlowName.trim() || isCreating}
              >
                {isCreating ? 'Creando...' : 'Crear Flujo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
