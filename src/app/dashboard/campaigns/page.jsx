"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import { API_URL } from '@/config/api';

export default function CampaignsPage() {
  const { user, isLoaded } = useUser();
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Obtener código de empresa
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => {
          if (data.codigo_empresa) {
            setCodigoEmpresa(data.codigo_empresa);
          }
        })
        .catch(err => console.error("Error fetching user data:", err));
    }
  }, [isLoaded, user]);

  // 2. Cargar campañas con polling dinámico
  useEffect(() => {
    if (!codigoEmpresa) return;

    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/campanas`, { 
          headers: { 'ngrok-skip-browser-warning': 'true' } 
        });
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    
    // Si hay alguna campaña en progreso, consultar cada 3 segundos para ver el avance en vivo
    const hasActive = campaigns.some(c => c.estado === 'en_progreso');
    const intervalTime = hasActive ? 3000 : 8000;

    const interval = setInterval(fetchCampaigns, intervalTime);
    return () => clearInterval(interval);
  }, [codigoEmpresa, campaigns]);

  // Métricas globales acumuladas
  const totalEnviados = campaigns.reduce((acc, c) => acc + (Number(c.enviados) || 0), 0);
  const totalEntregados = campaigns.reduce((acc, c) => acc + (Number(c.entregados) || 0), 0);
  const totalRespondidos = campaigns.reduce((acc, c) => acc + (Number(c.respondidos) || 0), 0);
  const tasaRespuestaGlobal = totalEnviados > 0 ? Math.round((totalRespondidos / totalEnviados) * 100) : 0;
  const tasaEntregaGlobal = totalEnviados > 0 ? Math.round((totalEntregados / totalEnviados) * 100) : 0;

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="flex flex-col h-full w-full bg-white rounded-[32px] p-8 shadow-sm overflow-hidden">
          
          {/* Header & Badges */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campañas Masivas</h1>
              <p className="text-xs text-gray-500 mt-1">Monitoreo en tiempo real de envíos, aperturas y respuestas de WhatsApp</p>
            </div>
            
            {campaigns.some(c => c.estado === 'en_progreso') && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-700 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Enviando en segundo plano...</span>
              </div>
            )}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#f8f7f4] rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campañas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{campaigns.length}</p>
            </div>
            <div className="bg-[#f8f7f4] rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Enviados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalEnviados}</p>
            </div>
            <div className="bg-[#f8f7f4] rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasa de Entrega</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">{tasaEntregaGlobal}%</p>
                <span className="text-xs text-gray-500">({totalEntregados})</span>
              </div>
            </div>
            <div className="bg-[#f8f7f4] rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasa Respuesta</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-green-600">{tasaRespuestaGlobal}%</p>
                <span className="text-xs text-green-700 font-medium">({totalRespondidos})</span>
              </div>
            </div>
          </div>
          
          {/* Table Container */}
          <div className="flex-1 overflow-auto pr-2">
            {loading ? (
              <div className="flex h-64 w-full items-center justify-center">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <p className="font-semibold text-gray-600">No has enviado ninguna campaña masiva todavía.</p>
                <p className="text-xs text-gray-400 mt-1">Ve a la sección Mensajes y presiona en "Envío Masivo" para comenzar.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                    <th className="py-4 font-semibold">Campaña</th>
                    <th className="py-4 font-semibold">Estado</th>
                    <th className="py-4 font-semibold text-center">Progreso de Envío</th>
                    <th className="py-4 font-semibold text-center">Entregados</th>
                    <th className="py-4 font-semibold text-center">Leídos</th>
                    <th className="py-4 font-semibold text-center">Respondieron</th>
                    <th className="py-4 font-semibold text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {campaigns.map((campana) => {
                    const total = campana.total_contactos || 1;
                    const enviados = Number(campana.enviados) || 0;
                    const percent = Math.min(100, Math.round((enviados / total) * 100));
                    const isProgress = campana.estado === 'en_progreso';
                    const tasaRespuesta = enviados > 0 ? Math.round(((campana.respondidos || 0) / enviados) * 100) : 0;

                    return (
                      <tr key={campana.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-gray-900">{campana.nombre}</div>
                          <div className="text-xs text-gray-400 font-mono">ID: #{campana.id}</div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isProgress 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {isProgress && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>}
                            {isProgress ? 'Enviando...' : 'Completada'}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5 max-w-[180px] mx-auto">
                            <div className="flex justify-between w-full text-xs font-medium text-gray-600">
                              <span>{enviados} de {campana.total_contactos}</span>
                              <span className="font-bold">{percent}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-700 rounded-full ${isProgress ? 'bg-black animate-pulse' : 'bg-[#c6f432]'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className="font-semibold text-gray-800">{campana.entregados || 0}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="font-semibold text-blue-600">{campana.leidos || 0}</span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-green-600 font-bold">{campana.respondidos || 0}</span>
                            <span className="text-[10px] text-gray-400">({tasaRespuesta}%)</span>
                          </div>
                        </td>
                        <td className="py-4 text-right text-xs text-gray-500 font-medium">
                          {new Date(campana.creado_en).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Panel>
    </>
  );
}
