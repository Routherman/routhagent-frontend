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
    if (upper.includes('LIDER')) return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700/50';
    if (upper.includes('ASESOR')) return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700/50';
    if (upper.includes('INVERSOR')) return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50';
    if (upper === 'SOPORTE') return 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700/50';
    if (upper === 'MASTER') return 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700';
  };

  return (
    <div className="w-full flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-[#070b14] border-r border-gray-100 dark:border-white/10 select-none">
      {/* Search Bar con alto contraste de texto */}
      <div className="p-2 md:p-3 border-b border-gray-100 dark:border-white/10 flex items-center gap-2 shrink-0">
        <div className="flex-1 bg-white dark:bg-[#0d1322] flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border border-gray-300 dark:border-white/15 focus-within:border-black dark:focus-within:border-sky-400 transition-all shadow-xs">
          <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 dark:text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, tel, rol..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-[11.5px] md:text-[13px] text-gray-950 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 font-bold" 
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="text-gray-400 hover:text-black dark:hover:text-white text-sm font-black px-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filtros: Roles y Tiempo */}
      <div className="px-2.5 py-1.5 md:px-3 md:py-2 border-b border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-[#0a101d] space-y-1.5 shrink-0">
        {/* Selector de Rol */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[9.5px] md:text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 tracking-wider shrink-0">Rol:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex-1 text-[10.5px] md:text-[11px] font-extrabold bg-white dark:bg-[#11192a] border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-gray-900 dark:text-white focus:outline-none shadow-2xs"
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
        <div className="flex items-center gap-1">
          <span className="text-[9.5px] md:text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 tracking-wider shrink-0 mr-0.5">Tiempo:</span>
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
                className={`text-[9.5px] md:text-[10px] py-0.5 md:py-1 rounded-md font-bold transition text-center shadow-2xs ${
                  timeFilter === tf.id
                    ? 'bg-gray-950 dark:bg-sky-500 text-white font-extrabold shadow-xs'
                    : 'bg-white dark:bg-[#11192a] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-2.5 py-1.5 md:px-3 md:py-2 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#090e1a] shrink-0">
        <button 
          onClick={onStartMassive}
          className="w-full bg-[#111215] dark:bg-sky-600 hover:bg-black dark:hover:bg-sky-500 text-white font-bold text-[11px] md:text-xs py-1.5 md:py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 hover:shadow"
        >
          <Send className="w-3 h-3 md:w-3.5 md:h-3.5" />
          Generar envío masivo
        </button>
      </div>

      {/* Barra de Conteo */}
      <div className="px-3 py-1 bg-gray-50/40 dark:bg-[#0b1120] border-b border-gray-100 dark:border-white/10 flex items-center justify-between text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-slate-400 shrink-0">
        <span>Conversaciones con mensajes:</span>
        <span className="text-gray-900 dark:text-white font-extrabold bg-gray-200/80 dark:bg-white/10 px-2 py-0.5 rounded-full text-[9.5px] md:text-[10px]">
          {filteredContacts.length}
        </span>
      </div>

      {/* Contacts List (Scroll nativo habilitado en celular) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y divide-y divide-gray-100 dark:divide-white/10">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-xs">
            No se encontraron contactos que coincidan.
          </div>
        ) : (
          filteredContacts.map((c) => {
            const isPending = (c.estado_resolucion || '').toUpperCase() === 'PENDIENTE';
            const isActive = activeContact?.id === c.id;
            const cleanPhone = String(c.telefono || c.phone || '').replace(/\D/g, '');
            const formattedPhone = cleanPhone ? `+${cleanPhone}` : '';
            const rawName = String(c.name || '').trim();
            const isPlaceholder = !rawName || /^(Desconocido|Sin\s*nombre|Usuario|Lead\s*WA|Contacto\s*CRM)/i.test(rawName);
            const primaryIdentity = !isPlaceholder ? rawName : (formattedPhone || 'Sin número');
            const showSubPhone = !isPlaceholder && formattedPhone && primaryIdentity !== formattedPhone;

            return (
              <div 
                key={c.id} 
                onClick={() => onSelectContact(c)}
                className={`relative flex items-start gap-2.5 md:gap-3 p-2.5 md:p-3 cursor-pointer transition-all group ${
                  isActive
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600 dark:border-sky-400'
                    : 'hover:bg-gray-50/80 dark:hover:bg-white/5 border-l-4 border-transparent'
                }`}
              >
                {/* Avatar with Status indicator */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <img 
                    src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(primaryIdentity)}&background=0D8ABC&color=fff`} 
                    alt={primaryIdentity} 
                    className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover shadow-xs border border-gray-200 dark:border-white/15" 
                  />
                  <span
                    title={c.estado_bot === 'ACTIVO' ? 'IA Activa' : 'IA Desactivada (Modo Humano)'}
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 border-2 border-white dark:border-[#070b14] rounded-full ${
                      c.estado_bot === 'ACTIVO' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>

                {/* Contact Main Info */}
                <div className="flex-1 min-w-0">
                  {/* Fila 1: Nombre de quien habla (o Número si no está agendado) + Fecha */}
                  <div className="flex items-start justify-between gap-1.5 mb-0.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-[12px] md:text-[13.5px] text-gray-900 dark:text-white truncate leading-tight">
                        {primaryIdentity}
                      </h3>
                      {showSubPhone && (
                        <p className="text-[10px] md:text-[11px] font-mono font-semibold text-sky-700 dark:text-sky-400 truncate leading-tight mt-0.5">
                          {formattedPhone}
                        </p>
                      )}
                    </div>
                    <span className="text-[9.5px] md:text-[10px] font-medium text-gray-400 dark:text-slate-400 whitespace-nowrap shrink-0">
                      {c.time || ''}
                    </span>
                  </div>

                  {/* Fila 2: Último mensaje + Contador de no leídos */}
                  <div className="flex items-center justify-between gap-1.5 text-[11px] md:text-[12px] my-0.5">
                    <p className="text-gray-600 dark:text-slate-300 truncate text-[11px] md:text-[12px]">
                      {c.lastMessage || formattedPhone || 'Sin mensajes'}
                    </p>
                    
                    {c.unread > 0 && (
                      <span className="bg-indigo-600 text-white text-[9.5px] md:text-[10px] px-1.5 py-0.2 rounded-full font-bold min-w-[16px] text-center shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </div>

                  {/* Fila 3: Badges de Rol, Estado IA, Resolución y Línea */}
                  <div className="mt-1 flex items-center gap-1 flex-wrap">
                    {c.categoria && c.categoria.toLowerCase() !== 'general' && (
                      <span className={`text-[8.5px] md:text-[9px] px-1.5 py-0.2 rounded-md font-extrabold border uppercase tracking-wider shrink-0 ${getRoleBadgeStyle(c.categoria)}`}>
                        {c.categoria}
                      </span>
                    )}

                    {/* Indicador de IA Activa vs Modo Humano */}
                    {c.estado_bot === 'ACTIVO' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 text-[8.5px] md:text-[9px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>IA Activa</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 text-[8.5px] md:text-[9px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>Modo Humano</span>
                      </span>
                    )}

                    {isPending ? (
                      <div 
                        className="relative inline-flex items-center"
                        onMouseEnter={() => setHoveredNoteId(c.id)}
                        onMouseLeave={() => setHoveredNoteId(null)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 text-[10px] font-bold cursor-pointer hover:bg-amber-100 transition shadow-xs">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
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
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Resuelto</span>
                      </span>
                    )}

                    {/* Badge único de Línea: WA_B vs WA_S***XXXX */}
                    {c.linea_wa?.startsWith('WA_S') || c.canal === 'wasender' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50 text-[9px] font-black tracking-tight" title="Línea WASender API">
                        <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></span>
                        <span>{c.linea_wa || 'WA_S***5062'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 text-[9px] font-black tracking-tight" title="Línea WhatsApp Business Oficial">
                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                        <span>WA_B</span>
                      </span>
                    )}

                    {/* Chip de Resumen IA si fue derivado */}
                    {c.resumen_necesidad && (
                      <span 
                        title={`Resumen IA: ${c.resumen_necesidad}`}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50 text-[10px] font-black cursor-help shadow-xs"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                        <span>Resumen IA</span>
                      </span>
                    )}

                    {/* Mención del líder o asesor si está asignado */}
                    {(c.lider_id || c.asesor_id) && (
                      <span className="text-[9px] text-gray-400 dark:text-slate-400 font-medium">
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
                    buttonClassName="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/10 transition"
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
