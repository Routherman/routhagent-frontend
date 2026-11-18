import React, { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function InfoContact({ contact, codigoEmpresa, onClose }) {
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
          toast.success('Asignación actualizada correctamente');
      } catch (err) {
          console.error(err);
          toast.error('Error al actualizar asignación');
      } finally {
          setLoading(false);
      }
  };

  if (!contact) return null;

  return (
    <div className="w-[300px] max-w-[90vw] flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#070b14] border-l border-gray-100 dark:border-white/10 overflow-y-auto relative">
      {/* Header Info */}
      <div className="flex flex-col items-center pt-6 pb-6 px-4 border-b border-gray-100 dark:border-white/10 relative">
        <div className="w-full flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-[15px]">Información del Contacto</h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
              title="Cerrar panel de información"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 ring-4 ring-gray-50 dark:ring-white/10 shadow-sm">
           <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-[16px] font-extrabold text-gray-900 dark:text-white text-center px-2">{contact.name}</h2>
        <p className="text-[13px] font-mono text-sky-700 dark:text-sky-400 mt-1 font-semibold">
          {contact.formattedPhone || (contact.telefono ? `+${String(contact.telefono).replace(/^\+/, '')}` : '')}
        </p>
        {contact.email && (
          <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5 truncate max-w-full">{contact.email}</p>
        )}
      </div>

      {/* Asignación Section */}
      <div className="p-5 border-b border-gray-100 dark:border-white/10">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-gray-800 dark:text-white text-[14px]">Delegar Chat</h4>
        </div>
        <div className="flex flex-col gap-3">
            <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Rol Asignado</label>
                <select 
                   className="w-full text-sm text-gray-900 dark:text-white bg-white dark:bg-[#11192a] border-gray-200 dark:border-white/15 rounded-lg p-2 border"
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
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Usuario Específico (Opcional)</label>
                <select 
                   className="w-full text-sm text-gray-900 dark:text-white bg-white dark:bg-[#11192a] border-gray-200 dark:border-white/15 rounded-lg p-2 border"
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
    </div>
  );
}
