'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Save, BrainCircuit } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function Intelligence() {
  const { user } = useUser();
  const [empresa, setEmpresa] = useState(null);
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [promptIa, setPromptIa] = useState('');
  const [conocimientoIa, setConocimientoIa] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const resUser = await fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const dataUser = await resUser.json();
        
        if (dataUser && dataUser.codigo_empresa) {
          setCodigoEmpresa(dataUser.codigo_empresa);
          const resEmpresa = await fetch(`${API_URL}/empresas/${dataUser.codigo_empresa}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
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
        const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/ia`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ prompt_ia: promptIa, conocimiento_ia: conocimientoIa })
        });
        if (res.ok) {
            setSaveMessage('Configuración guardada exitosamente.');
            setTimeout(() => setSaveMessage(''), 3000);
        } else {
            setSaveMessage('Error al guardar la configuración.');
        }
    } catch(e) {
        setSaveMessage('Error de conexión.');
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20 text-gray-400">Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-4 pb-12">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <BrainCircuit className="w-32 h-32" />
        </div>

        <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <BrainCircuit className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Comportamiento IA</h2>
        </div>
        <p className="text-gray-500 mb-8 max-w-2xl text-sm leading-relaxed ml-16">
          Instruye a tu asistente virtual. Define su personalidad, su rol en la empresa, el tono de voz que debe utilizar con los clientes y reglas generales de comportamiento.
        </p>
        
        <div className="ml-16 space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Prompt del Sistema</label>
                <textarea 
                    value={promptIa}
                    onChange={(e) => setPromptIa(e.target.value)}
                    placeholder="Ejemplo: Eres el asistente virtual de ventas de AutoMark. Eres amable, usas emojis y tratas de convencer al usuario de agendar una cita. Nunca das precios finales por chat."
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium min-h-[200px] resize-y"
                />
            </div>

            <div className="pt-4 flex items-center justify-between">
                <div>
                    {saveMessage && (
                        <span className={`text-sm font-semibold ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                            {saveMessage}
                        </span>
                    )}
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
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
