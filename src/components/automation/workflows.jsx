'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Workflow, Play, CheckCircle2, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function Workflows() {
  const { user, isLoaded } = useUser();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const fetchFlowsData = async () => {
      try {
        const resUser = await fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const dataUser = await resUser.json();
        
        if (dataUser && dataUser.codigo_empresa) {
          setCodigoEmpresa(dataUser.codigo_empresa);
          const res = await fetch(`${API_URL}/empresas/${dataUser.codigo_empresa}/flujos`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
          const dataFlows = await res.json();
          setFlows(Array.isArray(dataFlows) ? dataFlows : []);
        }
      } catch (err) {
        console.error("Error cargando flujos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlowsData();
  }, [isLoaded, user]);

  const toggleFlow = async (flow) => {
    if (!codigoEmpresa) return;
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
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20 text-gray-400">Cargando flujos conversacionales...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto mt-4 pb-12">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Workflow className="w-32 h-32" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-lime-50 rounded-2xl flex items-center justify-center text-lime-600">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Flujos Conversacionales</h2>
              <p className="text-gray-500 text-sm">
                Automatizaciones guiadas activadas por palabras clave o enrutadas por la IA local.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/flows"
            className="self-start md:self-auto bg-gray-900 hover:bg-black text-[#c6f432] px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <span>Ver Lienzo Completo</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {flows.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
            <Workflow className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay flujos configurados aún.</p>
            <Link
              href="/dashboard/flows"
              className="inline-block mt-4 bg-black text-[#c6f432] px-6 py-2.5 rounded-full font-bold text-sm"
            >
              Crear Nuevo Flujo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {flows.map((flow) => {
              let parsedData = flow.data_json;
              if (typeof parsedData === 'string') {
                try { parsedData = JSON.parse(parsedData); } catch(e) {}
              }
              const nodesCount = parsedData?.nodes?.length || 0;

              return (
                <div
                  key={flow.id}
                  className="bg-gray-50 hover:bg-white rounded-3xl p-6 border border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                        flow.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${flow.activo ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {flow.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        onClick={() => toggleFlow(flow)}
                        title={flow.activo ? 'Pausar flujo' : 'Activar flujo'}
                        className="text-xs font-medium text-gray-400 hover:text-gray-700 underline"
                      >
                        {flow.activo ? 'Pausar' : 'Activar'}
                      </button>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {flow.nombre}
                    </h3>

                    <div className="space-y-2 mt-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Disparador:</span>
                        <code className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-md border border-amber-200">
                          {flow.trigger_keyword}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Nodos en diagrama: <strong className="text-gray-700">{nodesCount}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/dashboard/flows/${flow.id}`}
                      className="w-full bg-white hover:bg-gray-900 text-gray-800 hover:text-white border border-gray-200 hover:border-transparent py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <span>Abrir Editor Visual</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
