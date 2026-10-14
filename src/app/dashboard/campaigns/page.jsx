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

  // 2. Cargar campañas
  useEffect(() => {
    if (!codigoEmpresa) return;

    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/campanas`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, [codigoEmpresa]);

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="flex flex-col h-full w-full bg-white rounded-[32px] p-8 shadow-sm overflow-hidden">
          <h1 className="text-2xl font-bold mb-6">Campañas Masivas</h1>
          
          <div className="flex-1 overflow-auto pr-2">
            {loading ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <p>No has enviado ninguna campaña masiva todavía.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="py-4 font-medium">Nombre de Campaña</th>
                    <th className="py-4 font-medium">Estado</th>
                    <th className="py-4 font-medium text-center">Progreso (Enviados/Total)</th>
                    <th className="py-4 font-medium text-center">Llegaron</th>
                    <th className="py-4 font-medium text-center">Respondieron</th>
                    <th className="py-4 font-medium text-center">No Respondieron</th>
                    <th className="py-4 font-medium text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campana) => {
                    const noRespondieron = campana.enviados - (campana.respondidos || 0);
                    
                    return (
                      <tr key={campana.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="font-semibold text-gray-800">{campana.nombre}</div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campana.estado === 'completada' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {campana.estado === 'completada' ? 'Completada' : 'En Progreso'}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-gray-600">{campana.enviados} / {campana.total_contactos}</span>
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-black transition-all duration-500" 
                                style={{ width: `${Math.min(100, (campana.enviados / (campana.total_contactos || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-gray-700">{campana.entregados || 0}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-green-600 font-medium">{campana.respondidos || 0}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-gray-500">{Math.max(0, noRespondieron)}</span>
                        </td>
                        <td className="py-4 text-right text-sm text-gray-500">
                          {new Date(campana.creado_en).toLocaleDateString()}
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
