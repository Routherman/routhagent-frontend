'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Building, Hash, Save, Check } from 'lucide-react';

export default function Empresa({ privilegios }) {
  const { user } = useUser();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);

  // Form state
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');

  const canEdit = privilegios?.can_edit_company === true;

  // Fetch local user and then the enterprise
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
            setNombre(dataEmpresa.nombre || '');
            setTelefono(dataEmpresa.telefono || '');
            setEmail(dataEmpresa.email || '');
            setDireccion(dataEmpresa.direccion || '');
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!codigoEmpresa || !canEdit) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = { nombre, telefono, email, direccion };
      const res = await fetch(`http://localhost:8080/api/empresas/${codigoEmpresa}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al guardar los datos');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (codigoEmpresa) {
      navigator.clipboard.writeText(codigoEmpresa);
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20 text-gray-400">Cargando datos de la empresa...</div>;
  }

  if (!codigoEmpresa) {
    return <div className="flex justify-center mt-20 text-gray-400">No estás asociado a ninguna empresa.</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto mt-6 pb-12">
      
      {/* Información principal */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Building className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Datos de la Empresa</h2>
                <p className="text-gray-500 text-sm mt-1">Gestiona la información pública de tu espacio de trabajo.</p>
            </div>
            </div>
        </div>

        {!canEdit && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-50 text-yellow-700 text-sm border border-yellow-100 flex items-center gap-2">
            No tienes los privilegios necesarios para editar los datos de la empresa.
          </div>
        )}

        {error && <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">{error}</div>}
        {success && (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 text-green-600 text-sm font-semibold border border-green-100 flex items-center gap-2">
                <Check className="w-4 h-4" /> Los cambios han sido guardados correctamente.
            </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Nombre de la empresa</label>
                  <input disabled={!canEdit} required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium disabled:opacity-60" />
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Número de teléfono</label>
                  <input disabled={!canEdit} type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium disabled:opacity-60" />
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Correo electrónico</label>
                  <input disabled={!canEdit} type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium disabled:opacity-60" />
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Dirección completa</label>
                  <input disabled={!canEdit} type="text" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium disabled:opacity-60" />
              </div>
          </div>

          {canEdit && (
            <div className="pt-4 flex justify-end">
                <button disabled={saving} className="px-8 py-3.5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-md flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
          )}
        </form>
      </div>

      {/* Código de Empresa */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Hash className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Código de Acceso</h2>
            <p className="text-gray-500 text-sm mt-1">Comparte este código para que otros se unan a la empresa.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-6 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-900 font-mono font-bold tracking-[0.2em] text-lg">
            {codigoEmpresa}
          </div>
          <button onClick={copyToClipboard} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-600 transition-colors" title="Copiar código">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
             </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
