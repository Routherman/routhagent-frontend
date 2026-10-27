"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import Panel from '@/components/dashboard/Panel';
import Header from '@/components/dashboard/Header';
import { 
  Play, 
  MessageSquare, 
  Fingerprint, 
  MousePointer2, 
  Brain, 
  Paperclip, 
  Ticket, 
  Pause, 
  ArrowUpRight, 
  Zap, 
  Box, 
  Trash2, 
  Plus, 
  Minus, 
  RotateCcw, 
  ChevronDown, 
  Sparkles, 
  Check, 
  X, 
  ArrowLeft,
  Settings,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

const NODE_TYPES = [
  { type: 'webhook', label: 'INICIO / TRIGGER', desc: 'Disparador de entrada' },
  { type: 'message', label: 'MENSAJE SIMPLE', desc: 'Envío de texto WhatsApp' },
  { type: 'identity', label: 'PEDIR DATOS', desc: 'Captura DNI, teléfono, email' },
  { type: 'buttons', label: 'BOTONERA / MENÚ', desc: 'Opciones interactivas' },
  { type: 'rag', label: 'CONSULTA IA (RAG)', desc: 'Base de conocimiento BCRA' },
  { type: 'file_send', label: 'ENVIAR ARCHIVO', desc: 'PDF, fichas o imágenes' },
  { type: 'ticket', label: 'TICKET CRM', desc: 'Abre orden en helpdesk' },
  { type: 'approval', label: 'DERIVAR HUMANO', desc: 'Transfiere a operador' },
  { type: 'decision', label: 'CONDICIONAL', desc: 'Bifurcación por palabras clave' },
  { type: 'ai_branch', label: 'IA BRANCH', desc: 'Decisión con modelo inteligente' }
];

export default function FlowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const flowId = params?.id;

  const [codigoEmpresa, setCodigoEmpresa] = useState('KRZMJI');
  const [flowsList, setFlowsList] = useState([]);
  const [currentFlow, setCurrentFlow] = useState({ name: 'Cargando...', nodes: [], edges: [] });
  const [activeFlowRecord, setActiveFlowRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Zoom & Pan Canvas State
  const [flowScale, setFlowScale] = useState(1);
  const [flowPan, setFlowPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Interactions State
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingNode, setConnectingNode] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null); // { id, type: 'node' | 'edge' }
  const [editingNode, setEditingNode] = useState(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);

  const canvasRef = useRef(null);

  // 1. Cargar usuario y empresa
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

  // 2. Cargar todos los flujos para el selector
  const fetchFlows = async (codigo) => {
    try {
      const res = await fetch(`${API_URL}/empresas/${codigo}/flujos`, { 
        headers: { 'ngrok-skip-browser-warning': 'true' } 
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setFlowsList(list);

      // Buscar flujo activo por ID
      const target = list.find(f => f.id.toString() === flowId?.toString()) || list[0];
      if (target) {
        loadFlowData(target);
      }
    } catch (err) {
      console.error("Error cargando flujos:", err);
      toast.error("Error cargando lista de flujos");
    } finally {
      setLoading(false);
    }
  };

  const loadFlowData = (record) => {
    setActiveFlowRecord(record);
    let raw = record.data_json;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) { raw = { nodes: [], edges: [] }; }
    }
    const cleanNodes = (raw?.nodes || []).map((n, i) => ({
      ...n,
      position: n.position && typeof n.position.x === 'number' 
        ? n.position 
        : { x: 60 + i * 320, y: 180 }
    }));
    const cleanEdges = raw?.edges || [];
    const flowObj = {
      name: record.nombre || raw?.name || 'Flujo Conversacional',
      nodes: cleanNodes,
      edges: cleanEdges
    };
    setCurrentFlow(flowObj);

    // Publicar en ventana global para que FloatingCopilot tenga contexto 100% en tiempo real
    if (typeof window !== 'undefined') {
      window.__ROUTH_ACTIVE_FLOW__ = {
        flowId: record.id,
        flowName: record.nombre,
        nodes: cleanNodes,
        edges: cleanEdges
      };
    }
  };

  // 3. Suscribirse a acciones del Copiloto en vivo
  useEffect(() => {
    const handleCopilotAction = (e) => {
      const action = e.detail;
      if (!action) return;

      if (action.type === 'APPLY_FLOW_CONFIG' && action.payload) {
        const { flowId: targetId, flowName, nodes, edges, highlightNodeId } = action.payload;

        // Si el copiloto cambió de flujo, redirigir o cargar
        if (targetId && targetId.toString() !== flowId?.toString()) {
          router.push(`/dashboard/flows/${targetId}`);
          return;
        }

        if (Array.isArray(nodes)) {
          setCurrentFlow(prev => {
            const updated = {
              name: flowName || prev.name,
              nodes: nodes,
              edges: Array.isArray(edges) ? edges : prev.edges
            };
            if (typeof window !== 'undefined') {
              window.__ROUTH_ACTIVE_FLOW__ = {
                flowId: targetId || flowId,
                flowName: updated.name,
                nodes: updated.nodes,
                edges: updated.edges
              };
            }
            return updated;
          });

          if (highlightNodeId) {
            setHighlightedNodeId(highlightNodeId);
            setTimeout(() => setHighlightedNodeId(null), 4000);
          }

          toast.success("✨ Copiloto IA actualizó el flujo en tiempo real");
        }
      }
    };

    window.addEventListener('routh-copilot-action', handleCopilotAction);
    return () => window.removeEventListener('routh-copilot-action', handleCopilotAction);
  }, [flowId, router]);

  // 4. Guardar flujo en Backend
  const handleSaveFlow = async () => {
    if (!activeFlowRecord || !codigoEmpresa) return;
    setSaving(true);
    try {
      const payloadJson = {
        name: currentFlow.name,
        nodes: currentFlow.nodes,
        edges: currentFlow.edges
      };

      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/flujos/${activeFlowRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_json: payloadJson,
          activo: activeFlowRecord.activo,
          trigger_keyword: activeFlowRecord.trigger_keyword
        })
      });

      if (res.ok) {
        toast.success("✅ Flujo guardado y desplegado en el pipeline con éxito");
      } else {
        toast.error("Error guardando el flujo en el servidor");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al guardar");
    } finally {
      setSaving(false);
    }
  };

  // 5. Manejadores de Canvas: Pan & Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.001;
    setFlowScale(prev => Math.min(Math.max(0.2, prev + zoomFactor), 2.5));
  };

  const handleCanvasMouseDown = (e) => {
    // Si se hizo click en el fondo del canvas (no en un nodo)
    if (e.target.classList.contains('canvas-area') || e.target.tagName === 'svg' || e.target.classList.contains('grid-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - flowPan.x, y: e.clientY - flowPan.y });
      setSelectedElement(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setFlowPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }

    if (draggingNode) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const newX = (mouseX - flowPan.x) / flowScale - dragOffset.x;
      const newY = (mouseY - flowPan.y) / flowScale - dragOffset.y;

      setCurrentFlow(prev => {
        const nextNodes = prev.nodes.map(n => 
          n.id === draggingNode.id ? { ...n, position: { x: Math.round(newX), y: Math.round(newY) } } : n
        );
        return { ...prev, nodes: nextNodes };
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNode(null);
  };

  // 6. Conectar Nodos
  const handleNodeConnection = (nodeId, portType) => {
    if (portType === 'out') {
      setConnectingNode(nodeId);
      toast.info("Punto de salida seleccionado. Haz click en el puerto de entrada de otro nodo para conectar.", { duration: 3000 });
    } else if (connectingNode && portType === 'in' && connectingNode !== nodeId) {
      // Evitar conexiones duplicadas
      const edgeExists = currentFlow.edges.some(e => e.source === connectingNode && e.target === nodeId);
      if (!edgeExists) {
        const newEdge = { id: `e_${Date.now()}`, source: connectingNode, target: nodeId };
        setCurrentFlow(prev => ({
          ...prev,
          edges: [...prev.edges, newEdge]
        }));
        toast.success("Conexión creada");
      }
      setConnectingNode(null);
    }
  };

  // 7. Borrar nodo o conexión
  const handleDeleteNode = (nodeId) => {
    setCurrentFlow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    }));
    if (editingNode?.id === nodeId) setEditingNode(null);
    toast.info("Nodo eliminado");
  };

  const handleDeleteEdge = (edgeId) => {
    setCurrentFlow(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId)
    }));
    setSelectedElement(null);
    toast.info("Conexión eliminada");
  };

  // 8. Agregar nuevo nodo desde la botonera dock
  const handleAddNodeFromDock = (type) => {
    const typeMeta = NODE_TYPES.find(t => t.type === type) || { label: type.toUpperCase(), desc: 'Módulo' };
    
    // Posicionar en el centro visible del viewport
    const visibleCenterX = (-flowPan.x + 350) / flowScale;
    const visibleCenterY = (-flowPan.y + 250) / flowScale;

    const newNodeId = `node_${type}_${Date.now()}`;
    let defaultData = {};

    if (type === 'message') defaultData = { message: '¡Hola! Bienvenido a Colaboratium.' };
    else if (type === 'identity') defaultData = { question: '¿Cuál es tu número de DNI o documento?', variable_name: 'dni_cliente' };
    else if (type === 'buttons') defaultData = { message: 'Elige una opción:', options: ['1. Invertir', '2. Ser Asesor'] };
    else if (type === 'rag') defaultData = { prompt: 'Asesor oficial Colaboratium bajo BCRA 40.015.' };
    else if (type === 'file_send') defaultData = { file_url: 'https://colaboratium.com/docs/Brochure_Institucional.pdf' };
    else if (type === 'ticket') defaultData = { subject: 'Consulta comercial', priority: 'HIGH' };
    else if (type === 'approval') defaultData = { reason: 'Derivación a operador', target_role: 'Asesores' };

    const newNode = {
      id: newNodeId,
      type,
      name: typeMeta.label,
      description: typeMeta.desc,
      data: defaultData,
      position: { x: Math.round(visibleCenterX), y: Math.round(visibleCenterY) }
    };

    setCurrentFlow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    toast.success(`Nodo ${typeMeta.label} añadido`);
  };

  // 9. Helper de Iconos de Nodo
  const getNodeIcon = (type) => {
    switch (type) {
      case 'webhook': return <Play size={18} className="text-sky-400" />;
      case 'message': return <MessageSquare size={18} className="text-emerald-400" />;
      case 'identity': return <Fingerprint size={18} className="text-purple-400" />;
      case 'buttons': return <MousePointer2 size={18} className="text-amber-400" />;
      case 'rag': return <Brain size={18} className="text-indigo-400" />;
      case 'file_send': return <Paperclip size={18} className="text-orange-400" />;
      case 'ticket': return <Ticket size={18} className="text-pink-400" />;
      case 'approval': return <Pause size={18} className="text-red-400" />;
      case 'decision': return <ArrowUpRight size={18} className="text-violet-400" />;
      case 'ai_branch': return <Zap size={18} className="text-yellow-400" />;
      default: return <Box size={18} className="text-slate-400" />;
    }
  };

  // 10. Helper de Colores y Gradientes de Nodo
  const getNodeColor = (type) => {
    switch (type) {
      case 'webhook': return 'from-sky-500/20 to-sky-950/40 border-sky-500/40 text-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.15)]';
      case 'message': return 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.15)]';
      case 'identity': return 'from-purple-500/20 to-purple-950/40 border-purple-500/40 text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.15)]';
      case 'buttons': return 'from-amber-500/20 to-amber-950/40 border-amber-500/40 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.15)]';
      case 'rag': return 'from-indigo-500/20 to-indigo-950/40 border-indigo-500/40 text-indigo-300 shadow-[0_0_25px_rgba(99,102,241,0.15)]';
      case 'file_send': return 'from-orange-500/20 to-orange-950/40 border-orange-500/40 text-orange-300 shadow-[0_0_25px_rgba(249,115,22,0.15)]';
      case 'ticket': return 'from-pink-500/20 to-pink-950/40 border-pink-500/40 text-pink-300 shadow-[0_0_25px_rgba(236,72,153,0.15)]';
      case 'approval': return 'from-red-500/20 to-red-950/40 border-red-500/40 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.15)]';
      case 'decision': return 'from-violet-500/20 to-violet-950/40 border-violet-500/40 text-violet-300 shadow-[0_0_25px_rgba(139,92,246,0.15)]';
      case 'ai_branch': return 'from-yellow-500/20 to-yellow-950/40 border-yellow-500/40 text-yellow-300 shadow-[0_0_25px_rgba(234,179,8,0.15)]';
      default: return 'from-slate-500/20 to-slate-950/40 border-slate-500/40 text-slate-300 shadow-[0_0_25px_rgba(148,163,184,0.15)]';
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <Panel>
          <Header />
          <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4 bg-slate-950 text-white">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-mono text-sm tracking-widest text-slate-400 uppercase">Cargando Flujos Nodales...</p>
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
        
        {/* CONTENEDOR PRINCIPAL DEL EDITOR NODAL */}
        <div className="p-6 h-[calc(100vh-80px)] flex flex-col space-y-4 select-none overflow-hidden bg-[#070b14]">
          
          {/* BARRA SUPERIOR DE CONTROL & HERRAMIENTAS */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
            
            {/* Título y Navegación */}
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/flows"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center border border-white/10 transition-all hover:scale-105"
                title="Volver al Listado de Flujos"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
                  <span>Editor de Flujos Nodal</span>
                  <span className="text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest not-italic">
                    SaaSIA Engine
                  </span>
                </h2>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-slate-400">
                  <span className="font-mono text-slate-400">
                    Zoom: <strong className="text-white">{Math.round(flowScale * 100)}%</strong> | Pan: <strong className="text-white">{Math.round(flowPan.x)}, {Math.round(flowPan.y)}</strong>
                  </span>
                  <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    RUNNING: {activeFlowRecord?.nombre || currentFlow.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Controles de Zoom */}
            <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10">
              <button 
                onClick={() => setFlowScale(prev => Math.min(2.5, prev + 0.15))}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl text-white font-bold transition-colors"
                title="Aumentar Zoom"
              >
                <Plus size={16} />
              </button>
              <button 
                onClick={() => setFlowScale(prev => Math.max(0.25, prev - 0.15))}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl text-white font-bold transition-colors"
                title="Reducir Zoom"
              >
                <Minus size={16} />
              </button>
              <button 
                onClick={() => { setFlowScale(1); setFlowPan({ x: 40, y: 40 }); }}
                className="px-3 py-1.5 hover:bg-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                title="Resetear Vista"
              >
                <RotateCcw size={12} />
                RESET
              </button>
            </div>

            {/* Selector de Flujos & Acciones */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select 
                  value={activeFlowRecord?.id || ''}
                  onChange={(e) => {
                    const selected = flowsList.find(f => f.id.toString() === e.target.value);
                    if (selected) {
                      router.push(`/dashboard/flows/${selected.id}`);
                    }
                  }}
                  className="appearance-none bg-slate-950 border border-white/20 rounded-2xl px-4 py-2.5 pr-9 text-xs font-bold text-white outline-none cursor-pointer hover:border-sky-500/50 transition-all min-w-[220px] shadow-lg"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" disabled>Seleccionar Flujo</option>
                  {flowsList.map(f => (
                    <option key={f.id} value={f.id} style={{ background: '#090d16', color: 'white' }}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Botón Guardar / Desplegar Pipeline */}
              <button 
                onClick={handleSaveFlow}
                disabled={saving}
                className="bg-gradient-to-r from-[#c6f432] to-emerald-400 hover:brightness-110 text-slate-950 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(198,244,50,0.3)] transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>DESPLEGANDO...</span>
                  </>
                ) : (
                  <>
                    <Zap size={15} className="fill-slate-950" />
                    <span>DESPLEGAR PIPELINE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CHIPS DE ACCIONES RÁPIDAS DEL COPILOTO */}
          <div className="flex items-center gap-2 px-2 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap mr-2">
              <Sparkles size={13} className="text-[#c6f432]" />
              Copiloto IA:
            </span>
            {[
              { label: "💬 Actualizar Saludo Oficial", prompt: "Modifica el saludo inicial para que dé la bienvenida oficial con registro BCRA 40.015" },
              { label: "🪪 Pedir DNI y Celular", prompt: "Agrega un nodo que pida el DNI y celular del cliente" },
              { label: "🔘 Menú 3 Opciones", prompt: "Agrega un nodo de opciones con 3 botones: Inversión, Asesor y Soporte" },
              { label: "🤖 Consulta RAG", prompt: "Agrega un nodo RAG que responda con la base de conocimiento oficial" },
              { label: "👥 Derivar a Asesor", prompt: "Agrega un nodo para derivar a un asesor humano" }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={async () => {
                  toast.info(`🤖 Copiloto ejecutando: "${chip.label}"...`);
                  try {
                    const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/copilot/chat`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                      body: JSON.stringify({
                        message: chip.prompt,
                        context: {
                          section: 'Editor de Flujos Nodal',
                          pathname: `/dashboard/flows/${flowId}`,
                          currentFlowConfig: {
                            flowId: activeFlowRecord?.id || flowId,
                            flowName: currentFlow.name,
                            nodes: currentFlow.nodes,
                            edges: currentFlow.edges
                          }
                        }
                      })
                    });
                    const data = await res.json();
                    if (data.action) {
                      window.dispatchEvent(new CustomEvent('routh-copilot-action', { detail: data.action }));
                    }
                  } catch (e) {
                    toast.error("Error contactando al Copiloto");
                  }
                }}
                className="whitespace-nowrap px-3.5 py-1.5 bg-slate-900/80 hover:bg-sky-500/20 text-slate-300 hover:text-white border border-white/10 hover:border-sky-500/40 rounded-full text-[10px] font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* CANVAS NODAL INTERACTIVO */}
          <div 
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="flex-1 rounded-[2.5rem] border border-white/10 relative overflow-hidden bg-[#050811] shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] canvas-area cursor-grab active:cursor-grabbing"
          >
            {/* FONDO DE GRILLA RADIAL DINÁMICA */}
            <div 
              className="absolute inset-0 pointer-events-none grid-bg transition-opacity duration-300"
              style={{ 
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)', 
                backgroundSize: `${28 * flowScale}px ${28 * flowScale}px`,
                backgroundPosition: `${flowPan.x}px ${flowPan.y}px`
              }}
            ></div>

            {/* CAPA DE TRANSFORMACIÓN (ZOOM & PAN) */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ 
                transform: `translate(${flowPan.x}px, ${flowPan.y}px) scale(${flowScale})`,
                transformOrigin: '0 0'
              }}
            >
              <div className="relative w-full h-full">

                {/* SI NO HAY NODOS */}
                {currentFlow.nodes.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 italic pointer-events-none py-32">
                    <Box size={56} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">El flujo está vacío</p>
                    <p className="text-xs text-slate-600 mt-1">Usa la barra inferior o pídele al Copiloto que cree los primeros pasos.</p>
                  </div>
                ) : (
                  <>
                    {/* CONEXIONES SVG BEZIER CURVED */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                        </marker>
                        <marker id="arrow-selected" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                        </marker>
                      </defs>

                      {currentFlow.edges.map(edge => {
                        const sourceNode = currentFlow.nodes.find(n => n.id === edge.source);
                        const targetNode = currentFlow.nodes.find(n => n.id === edge.target);
                        if (!sourceNode || !targetNode) return null;

                        const x1 = (sourceNode.position?.x ?? 0) + 280;
                        const y1 = (sourceNode.position?.y ?? 0) + 65;
                        const x2 = (targetNode.position?.x ?? 0);
                        const y2 = (targetNode.position?.y ?? 0) + 65;

                        const dx = Math.max(80, Math.abs(x2 - x1) * 0.5);
                        const cp1x = x1 + dx;
                        const cp2x = x2 - dx;

                        const isSelected = selectedElement?.id === edge.id;

                        return (
                          <g 
                            key={edge.id} 
                            className="cursor-pointer group/edge pointer-events-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElement({ id: edge.id, type: 'edge' });
                            }}
                          >
                            {/* Camino transparente grueso para facilitar el click */}
                            <path 
                              d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                              stroke="transparent" 
                              strokeWidth="24" 
                              fill="none" 
                            />
                            {/* Línea visual curva */}
                            <path 
                              d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                              stroke={isSelected ? '#38bdf8' : '#475569'} 
                              strokeWidth={isSelected ? "4" : "3"} 
                              fill="none" 
                              markerEnd={isSelected ? "url(#arrow-selected)" : "url(#arrow)"}
                              className={`transition-all ${isSelected ? 'opacity-100 shadow-[0_0_15px_#38bdf8]' : 'opacity-60 group-hover/edge:opacity-100 group-hover/edge:stroke-sky-400'}`}
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* TARJETAS NODALES */}
                    {currentFlow.nodes.map(node => {
                      const isHighlighted = highlightedNodeId === node.id;
                      const isConnectingSource = connectingNode === node.id;
                      const isSelected = selectedElement?.id === node.id;

                      // Vista previa del contenido
                      let previewText = node.description || '';
                      if (node.data?.message) {
                        previewText = `"${node.data.message.substring(0, 65)}${node.data.message.length > 65 ? '...' : ''}"`;
                      } else if (node.data?.question) {
                        previewText = `"${node.data.question.substring(0, 65)}${node.data.question.length > 65 ? '...' : ''}"`;
                      } else if (node.data?.prompt) {
                        previewText = `RAG: "${node.data.prompt.substring(0, 65)}${node.data.prompt.length > 65 ? '...' : ''}"`;
                      }

                      return (
                        <div 
                          key={node.id}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingNode(node);
                            setSelectedElement({ id: node.id, type: 'node' });
                            const mouseX = e.clientX;
                            const mouseY = e.clientY;
                            const nodeX = node.position?.x ?? 0;
                            const nodeY = node.position?.y ?? 0;
                            setDragOffset({
                              x: (mouseX - flowPan.x) / flowScale - nodeX,
                              y: (mouseY - flowPan.y) / flowScale - nodeY
                            });
                          }}
                          className={`absolute w-[280px] bg-gradient-to-br ${getNodeColor(node.type)} p-5 rounded-[2rem] border backdrop-blur-2xl shadow-2xl space-y-3 group/node cursor-move pointer-events-auto transition-shadow ${
                            isHighlighted ? 'ring-4 ring-[#c6f432] animate-bounce shadow-[0_0_40px_rgba(198,244,50,0.5)]' : ''
                          } ${
                            isConnectingSource ? 'ring-2 ring-sky-400 animate-pulse' : ''
                          } ${
                            isSelected ? 'border-sky-400 ring-2 ring-sky-400/50' : 'border-white/10 hover:border-white/20'
                          }`}
                          style={{ 
                            left: node.position?.x ?? 0, 
                            top: node.position?.y ?? 0 
                          }}
                        >
                          {/* CABECERA DEL NODO */}
                          <div className="flex items-center justify-between pointer-events-none">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-xl bg-black/40 border border-white/10">
                                {getNodeIcon(node.type)}
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-tight text-white line-clamp-1">
                                {node.name || node.type}
                              </span>
                            </div>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDeleteNode(node.id); 
                              }}
                              className="w-7 h-7 flex items-center justify-center bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all pointer-events-auto"
                              title="Eliminar este nodo"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* PREVIEW DEL MENSAJE / PREGUNTA */}
                          <div className="bg-black/30 rounded-2xl p-3 border border-white/5 pointer-events-none">
                            <p className="text-[10px] text-slate-300 font-medium leading-relaxed italic line-clamp-3">
                              {previewText || 'Sin contenido asignado aún.'}
                            </p>
                            {node.data?.variable_name && (
                              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold">
                                <span>variable:</span>
                                <code>{node.data.variable_name}</code>
                              </div>
                            )}
                          </div>

                          {/* PIE DEL NODO & BOTÓN CONFIGURAR */}
                          <div className="pt-2 border-t border-white/5 flex justify-between items-center pointer-events-auto">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              {node.type}
                            </span>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setEditingNode(node); 
                              }}
                              className="text-[9px] font-black hover:text-white transition-all bg-white/10 hover:bg-sky-500 px-3 py-1 rounded-xl uppercase tracking-wider text-white flex items-center gap-1 shadow-md"
                            >
                              <Settings size={11} />
                              CONFIG
                            </button>
                          </div>

                          {/* PUERTOS DE ENTRADA Y SALIDA (HANDLES) */}
                          {/* Entrada (Izquierda) */}
                          <div 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleNodeConnection(node.id, 'in'); 
                            }}
                            title="Puerto de entrada"
                            className={`absolute top-1/2 -left-2.5 w-5 h-5 rounded-full border-2 border-white/30 -translate-y-1/2 cursor-pointer transition-all flex items-center justify-center shadow-lg ${
                              connectingNode && connectingNode !== node.id 
                                ? 'bg-sky-500 scale-125 shadow-[0_0_15px_#38bdf8] animate-pulse border-white' 
                                : 'bg-slate-900 hover:bg-sky-500 hover:scale-125'
                            }`}
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>

                          {/* Salida (Derecha) */}
                          <div 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleNodeConnection(node.id, 'out'); 
                            }}
                            title="Puerto de salida"
                            className="absolute top-1/2 -right-2.5 w-5 h-5 bg-slate-900 hover:bg-sky-500 border-2 border-white/30 rounded-full -translate-y-1/2 cursor-pointer hover:scale-125 transition-all flex items-center justify-center shadow-lg"
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

              </div>
            </div>

            {/* BOTONERA FLOTANTE INFERIOR (LIBRERÍA DE NODOS) */}
            <div className="absolute left-6 bottom-6 flex items-center gap-2.5 p-3 bg-black/85 backdrop-blur-2xl rounded-[3rem] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-40 animate-in slide-in-from-left-6 duration-500 pointer-events-auto">
              <div className="flex items-center gap-2 pr-3 border-r border-white/10 mr-1">
                <Box size={16} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:inline">
                  Librería
                </span>
              </div>

              {NODE_TYPES.map(typeItem => (
                <button 
                  key={typeItem.type}
                  onClick={() => handleAddNodeFromDock(typeItem.type)}
                  className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-2xl text-slate-400 hover:bg-sky-500 hover:text-white transition-all group/btn relative border border-white/5 hover:border-sky-400/50 shadow-md"
                >
                  {getNodeIcon(typeItem.type)}
                  
                  {/* Tooltip flotante */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 border border-white/15 text-white text-[9px] font-black rounded-xl opacity-0 group-hover/btn:opacity-100 transition-all uppercase pointer-events-none shadow-2xl whitespace-nowrap z-50">
                    + {typeItem.label}
                  </div>
                </button>
              ))}
            </div>

            {/* PANEL LATERAL DE CONFIGURACIÓN DE NODO (SLIDE-OVER DRAWER) */}
            {editingNode && (
              <div className="absolute top-0 right-0 w-[380px] h-full bg-slate-950/95 backdrop-blur-2xl border-l border-white/15 z-50 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right-8 duration-300 pointer-events-auto overflow-y-auto custom-scrollbar">
                
                {/* Header Drawer */}
                <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2.5">
                    {getNodeIcon(editingNode.type)}
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Configurar Nodo</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Tipo: {editingNode.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingNode(null)} 
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Formulario de Campos */}
                <div className="space-y-5 flex-1 text-xs">
                  
                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Nombre del Nodo
                    </label>
                    <input 
                      type="text"
                      value={editingNode.name || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingNode(prev => ({ ...prev, name: val }));
                        setCurrentFlow(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, name: val } : n)
                        }));
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-sky-500 transition-all font-semibold"
                      placeholder="Ej: Saludo Oficial"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Descripción Breve
                    </label>
                    <input 
                      type="text"
                      value={editingNode.description || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingNode(prev => ({ ...prev, description: val }));
                        setCurrentFlow(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, description: val } : n)
                        }));
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-sky-500 transition-all"
                      placeholder="Breve propósito de este paso"
                    />
                  </div>

                  {/* Campos específicos por Tipo de Nodo */}
                  {/* Mensaje */}
                  {editingNode.type === 'message' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Mensaje a Enviar por WhatsApp
                      </label>
                      <textarea 
                        rows={6}
                        value={editingNode.data?.message || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingNode(prev => ({ ...prev, data: { ...(prev.data || {}), message: val } }));
                          setCurrentFlow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, data: { ...(n.data || {}), message: val } } : n)
                          }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-sky-500 font-sans leading-relaxed"
                        placeholder="Redacta el mensaje..."
                      />
                    </div>
                  )}

                  {/* Pedir Datos (Identity) */}
                  {editingNode.type === 'identity' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Pregunta al Usuario
                        </label>
                        <textarea 
                          rows={3}
                          value={editingNode.data?.question || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingNode(prev => ({ ...prev, data: { ...(prev.data || {}), question: val } }));
                            setCurrentFlow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, data: { ...(n.data || {}), question: val } } : n)
                            }));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-sky-500 font-sans leading-relaxed"
                          placeholder="Ej: Por favor indícanos tu número de DNI:"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Nombre de la Variable
                        </label>
                        <input 
                          type="text"
                          value={editingNode.data?.variable_name || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingNode(prev => ({ ...prev, data: { ...(prev.data || {}), variable_name: val } }));
                            setCurrentFlow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, data: { ...(n.data || {}), variable_name: val } } : n)
                            }));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs font-mono outline-none focus:border-sky-500"
                          placeholder="Ej: dni_cliente"
                        />
                      </div>
                    </>
                  )}

                  {/* RAG (Prompt) */}
                  {editingNode.type === 'rag' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Prompt o Instrucción de Conocimiento
                      </label>
                      <textarea 
                        rows={6}
                        value={editingNode.data?.prompt || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingNode(prev => ({ ...prev, data: { ...(prev.data || {}), prompt: val } }));
                          setCurrentFlow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, data: { ...(n.data || {}), prompt: val } } : n)
                          }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-sky-500 font-mono leading-relaxed"
                        placeholder="Instrucciones para el motor de IA..."
                      />
                    </div>
                  )}

                  {/* Botones / Opciones */}
                  {editingNode.type === 'buttons' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Texto Previo a los Botones
                      </label>
                      <textarea 
                        rows={3}
                        value={editingNode.data?.message || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingNode(prev => ({ ...prev, data: { ...(prev.data || {}), message: val } }));
                          setCurrentFlow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, data: { ...(n.data || {}), message: val } } : n)
                          }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-sky-500 font-sans"
                        placeholder="Mensaje con las opciones..."
                      />
                    </div>
                  )}

                  {/* Archivo / PDF */}
                  {editingNode.type === 'file_send' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        URL Pública del Archivo o PDF
                      </label>
                      <input 
                        type="text"
                        value={editingNode.data?.file_url || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingNode(prev => ({ ...prev, data: { ...(prev.data || {}), file_url: val } }));
                          setCurrentFlow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, data: { ...(n.data || {}), file_url: val } } : n)
                          }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs font-mono outline-none focus:border-sky-500"
                        placeholder="https://.../documento.pdf"
                      />
                    </div>
                  )}

                  {/* Derivación Humana (Approval) */}
                  {editingNode.type === 'approval' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Rol Destinatario de Derivación
                      </label>
                      <input 
                        type="text"
                        value={editingNode.data?.target_role || 'Asesores'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingNode(prev => ({ ...prev, data: { ...(prev.data || {}), target_role: val } }));
                          setCurrentFlow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, data: { ...(n.data || {}), target_role: val } } : n)
                          }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-sky-500"
                        placeholder="Asesores, Inversores, Soporte"
                      />
                    </div>
                  )}

                  {/* Ticket Helpdesk */}
                  {editingNode.type === 'ticket' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Asunto del Ticket
                      </label>
                      <input 
                        type="text"
                        value={editingNode.data?.subject || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingNode(prev => ({ ...prev, data: { ...(prev.data || {}), subject: val } }));
                          setCurrentFlow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === editingNode.id ? { ...n, data: { ...(n.data || {}), subject: val } } : n)
                          }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-sky-500"
                        placeholder="Ej: Solicitud de Inversión Asignada"
                      />
                    </div>
                  )}
                </div>

                {/* Botón Borrar Nodo */}
                <div className="pt-6 border-t border-white/10 mt-6 flex justify-between items-center">
                  <button 
                    onClick={() => handleDeleteNode(editingNode.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} />
                    Eliminar Nodo
                  </button>
                  <button 
                    onClick={() => setEditingNode(null)}
                    className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}

            {/* BOTÓN FLOTANTE PARA BORRAR CONEXIÓN SELECCIONADA */}
            {selectedElement?.type === 'edge' && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-red-500/30 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
                <span className="text-xs font-bold text-slate-300">Conexión seleccionada</span>
                <button 
                  onClick={() => handleDeleteEdge(selectedElement.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl transition-all"
                >
                  Eliminar Conexión
                </button>
                <button 
                  onClick={() => setSelectedElement(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}

          </div>

        </div>
      </Panel>
    </>
  );
}
