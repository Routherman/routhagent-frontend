"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from '@/components/dashboard/Sidebar';
import Panel from '@/components/dashboard/Panel';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:8080/api';

export default function FlowsPage() {
  const { user, isLoaded } = useUser();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);

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
        setCodigoEmpresa(userData.codigo_empresa);
        if (userData.codigo_empresa) {
          fetchFlows(userData.codigo_empresa);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [isLoaded, user]);

  const fetchFlows = async (codigo) => {
    try {
      const res = await fetch(`${API_URL}/empresas/${codigo}/flujos`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
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
          position: { x: 50, y: 200 }
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
    if(!confirm("¿Seguro que quieres eliminar este flujo?")) return;
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
          <div className="flex items-center justify-center h-full">Cargando flujos...</div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="flex flex-col h-full w-full p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">Flujos Conversacionales</h2>
              <p className="text-black">Diseña diagramas para automatizar la atención paso a paso.</p>
            </div>
            <button 
              onClick={openCreateModal}
              className="bg-black text-[#c6f432] px-6 py-3 rounded-full font-semibold shadow-sm hover:scale-105 transition-transform"
            >
              + Nuevo Flujo
            </button>
          </div>

          {flows.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-black">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Aún no tienes flujos</h3>
              <p className="text-black mb-6">Crea flujos visuales para atender a tus clientes de manera guiada.</p>
              <button 
                onClick={openCreateModal}
                className="bg-black text-[#c6f432] px-6 py-3 rounded-full font-semibold shadow-sm hover:scale-105 transition-transform"
              >
                Comenzar ahora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flows.map(flow => (
                <div key={flow.id} className="bg-white rounded-[32px] p-6 shadow-sm flex flex-col justify-between border border-gray-100 hover:border-gray-200 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-3 py-1 text-xs font-bold rounded-full ${flow.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {flow.activo ? 'Activo' : 'Inactivo'}
                      </div>
                      <button onClick={() => deleteFlow(flow.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-1 line-clamp-1" title={flow.nombre}>{flow.nombre}</h3>
                    <p className="text-sm text-black mb-4">Palabra clave: <span className="font-semibold text-black">{flow.trigger_keyword}</span></p>
                  </div>
                  
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <Link 
                      href={`/dashboard/flows/${flow.id}`}
                      className="flex-1 bg-black text-white text-center py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
                    >
                      Editar Flujo
                    </Link>
                    <button 
                      onClick={() => toggleFlow(flow)}
                      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors border ${flow.activo ? 'border-gray-200 text-black hover:bg-gray-50' : 'bg-[#c6f432] text-black hover:bg-[#b0d92b] border-transparent'}`}
                    >
                      {flow.activo ? 'Pausar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Modal for creating a new flow */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nuevo Flujo</h3>
            <p className="text-gray-500 text-sm mb-6">Completa los datos para crear tu nuevo flujo conversacional.</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del flujo</label>
                <input 
                  type="text" 
                  value={newFlowName}
                  onChange={e => setNewFlowName(e.target.value)}
                  placeholder="Ej. Venta de Perros" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Palabra clave de activación</label>
                <p className="text-xs text-gray-400 mb-2">Si el cliente escribe esto, el flujo iniciará automáticamente. Deja vacío para "default".</p>
                <input 
                  type="text" 
                  value={newFlowTrigger}
                  onChange={e => setNewFlowTrigger(e.target.value)}
                  placeholder="Ej. default, comprar, info" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button 
                onClick={submitNewFlow}
                className="flex-1 px-4 py-3 bg-black hover:bg-gray-800 text-[#c6f432] rounded-xl font-semibold shadow-sm transition-colors disabled:opacity-50"
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
