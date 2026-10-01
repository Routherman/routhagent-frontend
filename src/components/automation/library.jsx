'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Save, BookOpen, Upload, FileText, Loader2 } from 'lucide-react';

export default function Library() {
  const { user } = useUser();
  const [empresa, setEmpresa] = useState(null);
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [promptIa, setPromptIa] = useState('');
  const [conocimientoIa, setConocimientoIa] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const resUser = await fetch(`http://localhost:8080/api/users/me/${user.id}`);
        const dataUser = await resUser.json();
        
        if (dataUser && dataUser.codigo_empresa) {
          setCodigoEmpresa(dataUser.codigo_empresa);
          const resEmpresa = await fetch(`http://localhost:8080/api/empresas/${dataUser.codigo_empresa}`);
          const dataEmpresa = await resEmpresa.json();
          if (resEmpresa.ok) {
            setEmpresa(dataEmpresa);
            setPromptIa(dataEmpresa.prompt_ia || '');
            setConocimientoIa(dataEmpresa.conocimiento_ia || '');
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!codigoEmpresa) return;
    setSaving(true);
    setSaveMessage('');
    try {
        const res = await fetch(`http://localhost:8080/api/empresas/${codigoEmpresa}/ia`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt_ia: promptIa, conocimiento_ia: conocimientoIa })
        });
        if (res.ok) {
            setSaveMessage('Base de conocimiento guardada.');
            setTimeout(() => setSaveMessage(''), 3000);
        } else {
            setSaveMessage('Error al guardar.');
        }
    } catch(e) {
        setSaveMessage('Error de conexión.');
    } finally {
        setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !codigoEmpresa) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch(`http://localhost:8080/api/empresas/${codigoEmpresa}/upload-doc`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            // Append summary to existing knowledge
            const newKnowledge = conocimientoIa 
                ? `${conocimientoIa}\n\n---\n\n${data.summary}`
                : data.summary;
            setConocimientoIa(newKnowledge);
        } else {
            alert('Error analizando documento: ' + data.error);
        }
    } catch(err) {
        alert('Error subiendo documento');
    } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20 text-gray-400">Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-4 pb-12">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <BookOpen className="w-32 h-32" />
        </div>

        <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Biblioteca de Conocimiento</h2>
        </div>
        <p className="text-gray-500 mb-8 max-w-2xl text-sm leading-relaxed ml-16">
          Sube documentos (PDFs, Docs, Excel, TXT). La IA los analizará, extraerá lo más importante y generará un resumen estructurado. Este resumen será la memoria de tu asistente para responder preguntas.
        </p>
        
        <div className="ml-16 space-y-6">
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center py-10 relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv" 
                />
                
                {uploading ? (
                    <div className="flex flex-col items-center text-blue-600">
                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                        <span className="font-semibold text-sm">La IA está leyendo y resumiendo tu documento...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <Upload className="w-8 h-8 mb-3" />
                        <span className="font-semibold text-gray-600 text-sm">Haz clic aquí para subir un documento</span>
                        <span className="text-xs mt-1">Soporta PDF, Word, Excel, TXT</span>
                    </div>
                )}
            </div>

            {/* Editable summary */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Resumen Generado (Base de Conocimiento Actual)
                </label>
                <textarea 
                    value={conocimientoIa}
                    onChange={(e) => setConocimientoIa(e.target.value)}
                    placeholder="El conocimiento extraído de tus documentos aparecerá aquí. Puedes editarlo o agregar información manualmente..."
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium min-h-[300px] resize-y text-[13px] leading-relaxed"
                />
            </div>

            <div className="pt-2 flex items-center justify-between">
                <div>
                    {saveMessage && (
                        <span className={`text-sm font-semibold ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                            {saveMessage}
                        </span>
                    )}
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
