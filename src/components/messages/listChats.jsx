'use client';

import React, { useState } from 'react';
import ContactActionMenu from '@/components/dashboard/ContactActionMenu';
import { 
  Search, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Crown, 
  UserCheck, 
  DollarSign, 
  HelpCircle,
  Clock,
  Pin,
  Sparkles
} from 'lucide-react';

export default function ListChats({ 
  contacts = [], 
  onStartMassive, 
  onSelectContact, 
  activeContact,
  codigoEmpresa = 'KRZMJI',
  currentUser,
  onRefreshContacts
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('TODOS');
  const [timeFilter, setTimeFilter] = useState('TODOS'); // 'TODOS', '24H', 'SEMANA', 'MES'
  const [hoveredNoteId, setHoveredNoteId] = useState(null);

  // Escuchar acciones de entorno emitidas por el Copiloto Routh IA
  React.useEffect(() => {
    const handleCopilotAction = (e) => {
      const action = e.detail;
      if (!action) return;

      if (action.type === 'FILTER_CHATS' || action.type === 'SELECT_CHAT') {
        const query = action.payload?.term || action.payload?.query || '';
        if (query) setSearchTerm(query);

        // Buscar coincidencia en contactos para seleccionarlo
        const targetName = (action.payload?.contactName || query).toLowerCase();
        const matched = contacts.find(c => 
          (c.name || '').toLowerCase().includes(targetName) ||
          (c.telefono || '').includes(targetName) ||
          (c.phone || '').includes(targetName) ||
          c.id === action.payload?.contactId
        );
        if (matched) {
          onSelectContact(matched);
        }
      }
    };

    window.addEventListener('routh-copilot-action', handleCopilotAction);
    return () => window.removeEventListener('routh-copilot-action', handleCopilotAction);
  }, [contacts, onSelectContact]);

  // Filtrado de contactos por búsqueda, rol y tiempo
  const filteredContacts = contacts.filter((c) => {
    // 1. Filtro de búsqueda
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchesSearch = 
        (c.name || '').toLowerCase().includes(term) ||
        (c.phone || c.telefono || '').toLowerCase().includes(term) ||
        (c.categoria || '').toLowerCase().includes(term) ||
        (c.nota_pendiente || '').toLowerCase().includes(term) ||
        (c.lastMessage || '').toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // 2. Filtro por Rol / Rubro
    if (selectedRole !== 'TODOS') {
      const roleStr = (c.categoria || c.grupo || '').toUpperCase();
      if (roleStr !== selectedRole.toUpperCase()) return false;
    }

    // 3. Filtro por Tiempo
    if (timeFilter !== 'TODOS') {
      const msgDate = c.lastMessageTime ? new Date(c.lastMessageTime) : (c.time ? new Date(c.time) : new Date(c.creado_en));
      const diffMs = Date.now() - msgDate.getTime();
      if (timeFilter === '24H' && diffMs > 24 * 3600 * 1000) return false;
      if (timeFilter === 'SEMANA' && diffMs > 7 * 24 * 3600 * 1000) return false;
      if (timeFilter === 'MES' && diffMs > 30 * 24 * 3600 * 1000) return false;
    }

    return true;
  });

  const getRoleBadgeStyle = (cat) => {
    const upper = (cat || '').toUpperCase();
    if (upper === 'LIDERES') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (upper === 'ASESORES') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (upper === 'INVERSORES') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (upper === 'SOPORTE') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (upper === 'MASTER') return 'bg-slate-200 text-slate-800 border-slate-300';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="w-full md:w-[340px] flex-shrink-0 flex flex-col h-full bg-white border-r border-gray-100 select-none">
      {/* Search Bar con alto contraste de texto */}
      <div className="p-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className="flex-1 bg-white flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all shadow-xs">
          <Search className="w-4 h-4 text-gray-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, tel, rol..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-[13px] text-gray-950 placeholder-gray-500 font-bold" 
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="text-gray-400 hover:text-black text-sm font-black px-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filtros: Roles y Tiempo */}
      <div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50/70 space-y-2">
        {/* Selector de Rol */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider shrink-0">Rol:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex-1 text-[11px] font-extrabold bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs"
          >
            <option value="TODOS">Todos los roles ({contacts.length})</option>
            <option value="ASESORES">Asesores</option>
            <option value="LIDERES">Líderes</option>
            <option value="INVERSORES">Inversores</option>
            <option value="SOPORTE">Soporte</option>
            <option value="MASTER">Master</option>
            <option value="PROSPECTO ASESORES">Prospecto Asesores</option>
          </select>
        </div>

        {/* Selector de Tiempo */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider shrink-0 mr-0.5">Tiempo:</span>
          <div className="grid grid-cols-4 gap-1 flex-1">
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: '24H', label: '24 hs' },
              { id: 'SEMANA', label: '7 días' },
              { id: 'MES', label: '30 días' }
            ].map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeFilter(tf.id)}
                className={`text-[10px] py-1 rounded-md font-bold transition text-center shadow-2xs ${
                  timeFilter === tf.id
                    ? 'bg-gray-950 text-white font-extrabold shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-3.5 py-2 border-b border-gray-100 bg-gray-50/50">
        <button 
          onClick={onStartMassive}
          className="w-full bg-[#111215] hover:bg-black text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 hover:shadow"
        >
          <Send className="w-3.5 h-3.5" />
          Generar envío masivo
        </button>
      </div>

      {/* Barra de Conteo */}
      <div className="px-3.5 py-1.5 bg-gray-50/40 border-b border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500">
        <span>Conversaciones con mensajes:</span>
        <span className="text-gray-900 font-extrabold bg-gray-200/80 px-2 py-0.5 rounded-full text-[10px]">
          {filteredContacts.length}
        </span>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            No se encontraron contactos que coincidan.
          </div>
        ) : (
          filteredContacts.map((c) => {
            const isPending = (c.estado_resolucion || '').toUpperCase() === 'PENDIENTE';
            const isActive = activeContact?.id === c.id;

            return (
              <div 
                key={c.id} 
                onClick={() => onSelectContact(c)}
                className={`relative flex items-center gap-3 p-3.5 cursor-pointer transition-all group ${
                  isActive ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : 'hover:bg-gray-50/80 border-l-4 border-transparent'
                }`}
              >
                {/* Avatar with Status indicator */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'User')}&background=0D8ABC&color=fff`} 
                    alt={c.name} 
                    className="w-11 h-11 rounded-full object-cover shadow-xs border border-gray-100" 
                  />
                  {c.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                {/* Contact Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-bold text-[13px] text-gray-900 truncate group-hover:text-black">
                        {c.name}
                      </h3>
                      {c.categoria && c.categoria.toLowerCase() !== 'general' && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-extrabold border uppercase tracking-wider shrink-0 ${getRoleBadgeStyle(c.categoria)}`}>
                          {c.categoria}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap ml-1 shrink-0">
                      {c.time || ''}
                    </span>
                  </div>

                  {/* Message & Status Row */}
                  <div className="flex items-center justify-between gap-1 text-[12px]">
                    <p className="text-gray-500 truncate text-[12px]">
                      {c.lastMessage || c.phone || 'Sin mensajes'}
                    </p>
                    
                    {c.unread > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold min-w-[18px] text-center shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </div>

                  {/* NOTA FLOTANTE / BADGE DE PENDIENTE O RESUELTO */}
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    {isPending ? (
                      <div 
                        className="relative inline-flex items-center"
                        onMouseEnter={() => setHoveredNoteId(c.id)}
                        onMouseLeave={() => setHoveredNoteId(null)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold cursor-pointer hover:bg-amber-100 transition shadow-xs">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>Pendiente</span>
                        </span>

                        {/* Tooltip / Nota Flotante explicativa */}
                        {hoveredNoteId === c.id && (
                          <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
                            <div className="flex items-center justify-between border-b border-gray-700 pb-1.5 mb-1.5 font-bold text-[11px] text-amber-300">
                              <span className="flex items-center gap-1">
                                <Pin className="w-3 h-3" /> Explicación de qué falta:
                              </span>
                              <span className="text-[9px] uppercase tracking-wider text-gray-400">Nota CRM</span>
                            </div>
                            <p className="text-[11px] text-gray-200 leading-relaxed font-medium">
                              {c.nota_pendiente || 'No se ingresó detalle. Haga clic en los 3 puntitos para editar la nota.'}
                            </p>
                            <div className="mt-2 pt-1 border-t border-gray-800 text-[9px] text-gray-400 flex justify-between items-center">
                              <span>Estado: PENDIENTE</span>
                              <span className="text-amber-400 font-bold">⋮ Editar en menú</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Resuelto</span>
                      </span>
                    )}

                    {/* Chip de Resumen IA si fue derivado */}
                    {c.resumen_necesidad && (
                      <span 
                        title={`Resumen IA: ${c.resumen_necesidad}`}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black cursor-help shadow-xs"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                        <span>Resumen IA</span>
                      </span>
                    )}

                    {/* Mención del líder o asesor si está asignado */}
                    {(c.lider_id || c.asesor_id) && (
                      <span className="text-[9px] text-gray-400 font-medium">
                        • {c.lider_id ? 'Con Líder' : ''} {c.asesor_id ? 'Con Asesor' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3 PUNTITOS: MENÚ DE ACCIONES (Derivar a team, Asignar Líder/Asesor, Marcar Resuelto/Pendiente) */}
                <div 
                  className="shrink-0 relative self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ContactActionMenu 
                    contact={c}
                    codigoEmpresa={codigoEmpresa}
                    currentUser={currentUser}
                    onUpdated={onRefreshContacts}
                    buttonClassName="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100/80 transition"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
