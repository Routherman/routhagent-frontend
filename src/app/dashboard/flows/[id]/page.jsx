"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Sidebar from '@/components/dashboard/Sidebar';
import Panel from '@/components/dashboard/Panel';
import Header from '@/components/dashboard/Header';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Panel as FlowPanel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { API_URL } from '@/config/api';

const nodeTypesList = [
  { type: 'message', name: 'Mensaje Simple' },
  { type: 'identity', name: 'Pedir Datos' },
  { type: 'rag', name: 'Consulta a IA (RAG)' },
  { type: 'file_send', name: 'Enviar Archivo' },
  { type: 'approval', name: 'Derivar Humano' }
];

function FlowEditor({ flowId }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [flowData, setFlowData] = useState(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(userData => {
        setCodigoEmpresa(userData.codigo_empresa);
        if (userData.codigo_empresa) {
          loadFlow(userData.codigo_empresa);
        }
      });
  }, [isLoaded, user]);

  const loadFlow = async (codigo) => {
    try {
      const res = await fetch(`${API_URL}/empresas/${codigo}/flujos`);
      const allFlows = await res.json();
      const current = allFlows.find(f => f.id.toString() === flowId);
      if (current) {
        setFlowData(current);
        const dataJson = typeof current.data_json === 'string' ? JSON.parse(current.data_json) : current.data_json;
        if (dataJson) {
           const initialNodes = (dataJson.nodes || []).map(n => ({
               id: n.id,
               type: 'default', // Using default node type for now
               position: n.position || { x: Math.random() * 200, y: Math.random() * 200 },
               data: { label: `${n.name} (${n.type})` },
               // Store the raw node data inside node properties
               raw: n
           }));
           
           const initialEdges = (dataJson.edges || []).map(e => ({
               id: e.id,
               source: e.source,
               target: e.target
           }));

           setNodes(initialNodes);
           setEdges(initialEdges);
        }
      }
    } catch(err) {
      console.error(err);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (typeInfo) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'default',
      position: { x: 250, y: 150 },
      data: { label: `${typeInfo.name}` },
      raw: {
         id: `node_${Date.now()}`,
         type: typeInfo.type,
         name: typeInfo.name,
         data: {}
      }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = (key, value) => {
    if (!selectedNode) return;
    
    setNodes((nds) => 
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const updatedRaw = { ...n.raw };
          updatedRaw.data = { ...updatedRaw.data, [key]: value };
          
          let newLabel = n.raw.name;
          // Si cambian el mensaje, mostrar un preview en la caja
          if (key === 'message' && value) {
             newLabel = `${n.raw.name}\n"${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"`;
          }
          
          const updatedNode = { 
            ...n, 
            data: { ...n.data, label: newLabel },
            raw: updatedRaw
          };
          setSelectedNode(updatedNode); // Update selected state too
          return updatedNode;
        }
        return n;
      })
    );
  };

  const saveFlow = async () => {
    if (!flowData || !codigoEmpresa) return;
    setSaving(true);
    try {
      const formattedNodes = nodes.map(n => ({
         id: n.id,
         type: n.raw?.type || 'message',
         name: n.raw?.name || 'Node',
         position: n.position,
         data: n.raw?.data || {}
      }));
      
      const formattedEdges = edges.map(e => ({
         id: e.id,
         source: e.source,
         target: e.target
      }));

      const newJson = {
          name: flowData.nombre,
          nodes: formattedNodes,
          edges: formattedEdges
      };

      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/flujos/${flowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_json: newJson,
          activo: flowData.activo,
          trigger_keyword: flowData.trigger_keyword
        })
      });
      if (res.ok) {
        alert("Flujo guardado correctamente");
      }
    } catch (err) {
      console.error(err);
      alert("Error guardando el flujo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="flex flex-col h-[calc(100vh-120px)] p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/dashboard/flows')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm transition-colors text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold text-black">{flowData ? flowData.nombre : 'Cargando...'}</h2>
            </div>
            <button 
                onClick={saveFlow}
                disabled={saving}
                className="bg-black text-[#c6f432] px-6 py-2.5 rounded-full font-semibold shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
            >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

          <div className="flex flex-1 gap-6 min-h-0">
             {/* Toolbox */}
             <div className="w-64 bg-white rounded-3xl shadow-sm p-4 flex flex-col gap-2 overflow-y-auto border border-gray-100">
                <h3 className="font-bold text-black mb-4 px-2">Agregar Nodo</h3>
                {nodeTypesList.map(type => (
                    <button 
                        key={type.type}
                        onClick={() => addNode(type)}
                        className="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors border border-transparent hover:border-gray-200 text-black"
                    >
                        {type.name}
                    </button>
                ))}
                
                <div className="mt-8 px-2">
                    <p className="text-xs text-black bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                        * Selecciona un nodo para agregarlo al lienzo. Arrastralos y conectalos para definir el camino.
                    </p>
                </div>
             </div>

             {/* Canvas */}
             <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                 <ReactFlowProvider>
                     <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        fitView
                     >
                        <Background color="#ccc" gap={16} />
                        <Controls />
                        <MiniMap />
                     </ReactFlow>
                 </ReactFlowProvider>
             </div>

             {/* Properties Panel */}
             {selectedNode && (
               <div className="w-80 bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 overflow-y-auto border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-black text-lg">Configurar Nodo</h3>
                    <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">
                      ✕
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-3 mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Tipo</p>
                    <p className="text-sm font-medium text-black">{nodeTypesList.find(t => t.type === selectedNode.raw?.type)?.name || selectedNode.raw?.type}</p>
                  </div>

                  {/* Dynamic Fields based on node type */}
                  {selectedNode.raw?.type === 'message' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-black">Mensaje a enviar</label>
                      <textarea 
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Escribe el mensaje..."
                        value={selectedNode.raw?.data?.message || ''}
                        onChange={(e) => updateNodeData('message', e.target.value)}
                      />
                    </div>
                  )}

                  {selectedNode.raw?.type === 'identity' && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-black">Pregunta al usuario</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Ej: ¿Cuál es tu nombre?"
                          value={selectedNode.raw?.data?.question || ''}
                          onChange={(e) => updateNodeData('question', e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-black">Nombre de la variable</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Ej: nombre_cliente"
                          value={selectedNode.raw?.data?.variable_name || ''}
                          onChange={(e) => updateNodeData('variable_name', e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Se guardará lo que responda el cliente en esta variable.</p>
                      </div>
                    </div>
                  )}

                  {selectedNode.raw?.type === 'rag' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-black">Prompt o Instrucción (RAG)</label>
                      <textarea 
                        rows={5}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Instrucciones para la IA..."
                        value={selectedNode.raw?.data?.prompt || ''}
                        onChange={(e) => updateNodeData('prompt', e.target.value)}
                      />
                    </div>
                  )}

                  {/* Fallback for nodes that don't have specific UI yet */}
                  {!['message', 'identity', 'rag'].includes(selectedNode.raw?.type) && (
                     <p className="text-sm text-gray-500 italic">No hay propiedades extra para configurar en este tipo de nodo todavía.</p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                      onClick={() => setNodes(nds => nds.filter(n => n.id !== selectedNode.id))}
                      className="text-red-500 hover:text-red-600 text-sm font-semibold"
                    >
                      Eliminar Nodo
                    </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      </Panel>
    </>
  );
}

export default function Page() {
  const params = useParams();
  return <FlowEditor flowId={params.id} />;
}
