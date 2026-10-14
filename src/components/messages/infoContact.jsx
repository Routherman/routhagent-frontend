import React, { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';

export default function InfoContact({ contact, codigoEmpresa }) {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codigoEmpresa) {
        fetch(`${API_URL}/empresas/${codigoEmpresa}/roles`)
            .then(res => res.json())
            .then(data => setRoles(data || []))
            .catch(err => console.error(err));
        
        fetch(`${API_URL}/empresas/${codigoEmpresa}/users`)
            .then(res => res.json())
            .then(data => setUsers(data || []))
            .catch(err => console.error(err));
    }
  }, [codigoEmpresa]);

  const handleAssign = async (rolName, userId) => {
      setLoading(true);
      try {
          await fetch(`${API_URL}/contacts/${contact.id}/assign`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rol_asignado: rolName, usuario_asignado_id: userId })
          });
          alert('Asignación actualizada correctamente');
      } catch (err) {
          console.error(err);
          alert('Error al actualizar asignación');
      } finally {
          setLoading(false);
      }
  };

  if (!contact) return null;

  return (
    <div className="w-[300px] flex-shrink-0 flex flex-col h-full bg-white overflow-y-auto">
      {/* Header Info */}
      <div className="flex flex-col items-center pt-8 pb-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-[15px] mb-6">Information</h3>
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-gray-50 shadow-sm">
           <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-[18px] font-bold text-gray-900">{contact.name}</h2>
        <p className="text-[13px] text-gray-500 mt-1 font-medium">{contact.telefono}</p>
      </div>

      {/* Asignación Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800 text-[14px]">Delegar Chat</h4>
        </div>
        <div className="flex flex-col gap-3">
            <div>
                <label className="block text-xs text-gray-500 mb-1">Rol Asignado</label>
                <select 
                   className="w-full text-sm text-gray-900 bg-white border-gray-200 rounded-md focus:ring-black focus:border-black p-2 border"
                   onChange={(e) => handleAssign(e.target.value, contact.usuario_asignado_id)}
                   value={contact.categoria || 'General'}
                   disabled={loading}
                >
                    <option value="General">General</option>
                    {roles.map(r => (
                        <option key={r.id} value={r.nombre}>{r.nombre}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1">Usuario Específico (Opcional)</label>
                <select 
                   className="w-full text-sm text-gray-900 bg-white border-gray-200 rounded-md focus:ring-black focus:border-black p-2 border"
                   onChange={(e) => handleAssign(contact.categoria, e.target.value || null)}
                   value={contact.usuario_asignado_id || ''}
                   disabled={loading}
                >
                    <option value="">Cualquiera con el rol</option>
                    {users.map(u => (
                        <option key={u.clerk_id} value={u.clerk_id}>{u.email}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>
      
      {/* Media Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800 text-[14px]">Media</h4>
          <span className="text-[11px] font-medium text-gray-400 hover:text-gray-600 cursor-pointer">Show More</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=100&fit=crop" className="w-full aspect-square rounded-xl object-cover shadow-sm" />
          <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop" className="w-full aspect-square rounded-xl object-cover shadow-sm" />
          <div className="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center text-white text-[13px] font-bold shadow-sm cursor-pointer hover:bg-gray-700 transition">
            +5
          </div>
        </div>
      </div>

    </div>
  );
}
