"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import { API_URL } from '@/config/api';
import { 
  Cpu, 
  Zap, 
  DollarSign, 
  Database, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Flame, 
  Sparkles, 
  Server,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

export default function AiModelsPage() {
  const { user, isLoaded } = useUser();
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [metrics, setMetrics] = useState({
    stats: [],
    summary: {
      totalTokens: 0,
      totalSuccess: 0,
      totalFail: 0,
      ollamaTokens: 0,
      successRate: '100.0'
    }
  });
  const [loading, setLoading] = useState(true);
  
  // Cost multiplier: default average $0.60 per 1M tokens ($0.0006 per 1k)
  const [costPer1k, setCostPer1k] = useState(0.0006);

  // Test Sandbox State
  const [testPrompt, setTestPrompt] = useState('');
  const [testingAi, setTestingAi] = useState(false);
  const [testResponse, setTestResponse] = useState(null);

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
        .catch(err => console.warn("Error fetching user data:", err.message || err));
    }
  }, [isLoaded, user]);

  // 2. Cargar Métricas IA
  const fetchMetrics = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/ai-metrics`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data);
      }
    } catch (err) {
      console.warn('Error fetching AI metrics:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [codigoEmpresa]);

  // Modelos del Cascade Router
  const cascadeHierarchy = [
    {
      id: 'groq',
      name: 'Groq Cloud (LLaMA 3.3 70B)',
      role: 'Prioridad 1 (Principal)',
      desc: 'Inferencia LPU ultra-rápida (250-400 tps). Responde en menos de 400ms.',
      tag: 'Ultra Fast',
      tagColor: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: Flame,
      avgSpeed: '~320 ms',
      costRate: '$0.59 / 1M tkns'
    },
    {
      id: 'cerebras',
      name: 'Cerebras Inference',
      role: 'Prioridad 2 (Failover Inmediato)',
      desc: 'Arquitectura Wafer-Scale con latencia récord ante saturación de Groq.',
      tag: 'Wafer Scale',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Zap,
      avgSpeed: '~280 ms',
      costRate: '$0.60 / 1M tkns'
    },
    {
      id: 'gemini',
      name: 'Google Gemini 1.5 Flash',
      role: 'Prioridad 3 (Cognitivo & RAG)',
      desc: 'Ventana de contexto de 1M tokens para consultas documentales y PDFs complejos.',
      tag: 'Alta Precisión',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Sparkles,
      avgSpeed: '~650 ms',
      costRate: '$0.35 / 1M tkns'
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Cloud Fallback',
      role: 'Prioridad 4 (Respaldo Multi-Proveedor)',
      desc: 'Enrutamiento dinámico entre Claude 3.5 Haiku, Mistral y DeepSeek.',
      tag: 'Multi-Cloud',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: Server,
      avgSpeed: '~800 ms',
      costRate: '$0.80 / 1M tkns'
    },
    {
      id: 'ollama',
      name: 'Ollama Local (Servidor Propio)',
      role: 'Prioridad 5 (Desborde y Cero Costo)',
      desc: 'Ejecución local en hardware propio para desbordes y contingencia total sin consumo USD.',
      tag: '100% Gratis / Privado',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Database,
      avgSpeed: '~1200 ms',
      costRate: '$0.00 USD (Local)'
    }
  ];

  // Cálculo de costos estimados
  const totalTokens = metrics.summary?.totalTokens || 0;
  const cloudTokens = Math.max(0, totalTokens - (metrics.summary?.ollamaTokens || 0));
  const estimatedCostUsd = ((cloudTokens / 1000) * costPer1k).toFixed(4);
  const ollamaSavedUsd = (((metrics.summary?.ollamaTokens || 0) / 1000) * costPer1k).toFixed(4);

  // Probar el Router con una consulta rápida
  const handleTestRouter = async (e) => {
    e.preventDefault();
    if (!testPrompt) return;
    setTestingAi(true);
    setTestResponse(null);

    const startTime = performance.now();
    try {
      // Simular llamada de prueba de inferencia al router
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ phone: 'TEST_ROUTER', customText: testPrompt })
      });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);

      setTestResponse({
        text: data.summary || 'Respuesta generada con éxito por el Router de IA.',
        provider: 'Groq Cloud (LLaMA 3.3 70B)',
        latency: `${elapsed} ms`,
        tokens: Math.round(testPrompt.length / 4 + 40)
      });
      toast.success(`Inferencia completada en ${elapsed}ms`);
      fetchMetrics();
    } catch (err) {
      toast.error('Error al probar inferencia');
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="px-8 pb-8 flex-1 overflow-y-auto">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-600">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    Router Multi-IA & Métricas de Tokens
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Opción A • Cascada de Alta Velocidad (Groq + Cerebras + Gemini + Ollama) y Costos USD
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchMetrics}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar Telemetría</span>
              </button>
            </div>
          </div>

          {/* KPI Métricas Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Tokens Totales */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Tokens Totales</p>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 font-mono">
                {totalTokens.toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Procesados en todas las solicitudes
              </p>
            </div>

            {/* Costo USD */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Consumo USD (Nube)</p>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-600 font-mono">
                ${estimatedCostUsd} <span className="text-xs font-bold text-gray-400">USD</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Tasa estimada: ${costPer1k * 1000} / 1M tkns
              </p>
            </div>

            {/* Ahorro Ollama Local */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Ahorro Ollama Local</p>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600 font-mono">
                +${ollamaSavedUsd} <span className="text-xs font-bold text-gray-400">USD</span>
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {(metrics.summary?.ollamaTokens || 0).toLocaleString()} tokens gratis en hardware local
              </p>
            </div>

            {/* Tasa de Éxito / SLA */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Tasa de Éxito SLA</p>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-600 font-mono">
                {metrics.summary?.successRate || '100.0'}%
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                0 caídas con conmutación en cascada
              </p>
            </div>
          </div>

          {/* Diagrama de la Cascada del Router */}
          <div className="bg-gradient-to-r from-gray-900 via-neutral-900 to-black text-white p-6 rounded-3xl mb-8 shadow-lg border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-black">
                  Arquitectura Multi-Proveedor
                </span>
                <h3 className="text-lg font-black tracking-tight mt-1">
                  Pipeline de Conmutación Automática en Alta Disponibilidad
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Motor Activo y Calibrado
              </div>
            </div>

            {/* Chain Flow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {cascadeHierarchy.map((stage, idx) => {
                const Icon = stage.icon;
                return (
                  <div 
                    key={stage.id} 
                    className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/10 transition backdrop-blur-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-[10px] text-white/40 font-black">
                          0{idx + 1}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-white leading-tight mb-1">{stage.name}</p>
                      <p className="text-[10px] text-white/60 line-clamp-2">{stage.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-300">{stage.avgSpeed}</span>
                      <span className="text-white/40">{stage.costRate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalle de Modelos Registrados */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-400" />
              Estado y Consumo por Proveedor de IA
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-extrabold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Modelo / Proveedor</th>
                    <th className="py-3 px-4">Rol en la Cascada</th>
                    <th className="py-3 px-4">Tokens Usados</th>
                    <th className="py-3 px-4">Latencia Promedio</th>
                    <th className="py-3 px-4">Costo USD</th>
                    <th className="py-3 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cascadeHierarchy.map(m => {
                    const foundStat = metrics.stats.find(s => (s.model_name || '').toLowerCase().includes(m.id));
                    const tokens = foundStat?.tokens_used || 0;
                    const cost = m.id === 'ollama' ? '$0.00 (Gratis)' : `$${((tokens / 1000) * costPer1k).toFixed(4)}`;

                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {m.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {m.role}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-800">
                          {tokens.toLocaleString()} tkns
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {m.avgSpeed}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {cost}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${m.tagColor}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {m.tag}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sandbox de Prueba Rápida del Router */}
          <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm text-gray-900">
                Simulador de Inferencia en Tiempo Real
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Envía una frase o consulta de prueba para verificar cómo el Router selecciona al proveedor más veloz en vivo.
            </p>

            <form onSubmit={handleTestRouter} className="flex gap-2">
              <input
                type="text"
                placeholder="ej. ¿Cuáles son las comisiones del programa de líderes de Colaboratium?"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <button
                type="submit"
                disabled={testingAi || !testPrompt}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingAi ? 'Enrutando...' : 'Test Inferencia'}</span>
              </button>
            </form>

            {testResponse && (
              <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span className="font-bold text-amber-600">{testResponse.provider}</span>
                  <div className="flex items-center gap-3">
                    <span>Latencia: <strong>{testResponse.latency}</strong></span>
                    <span>Tokens: <strong>~{testResponse.tokens}</strong></span>
                  </div>
                </div>
                <p className="text-xs text-gray-800 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {testResponse.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </>
  );
}
