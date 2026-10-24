'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MoreVertical, 
  Users, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send, 
  ShieldCheck, 
  Crown, 
  UserCheck, 
  Building2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { API_URL } from '@/config/api';
import { toast } from 'sonner';

export default function ContactActionMenu({ 
  contact, 
  codigoEmpresa = 'KRZMJI', 
  currentUser, 
  onUpdated,
  buttonClassName = "p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition"
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Modals state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showHierarchyModal, setShowHierarchyModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  // Data state
  const [users, setUsers] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form states
  const [teamForm, setTeamForm] = useState({
    rol_asignado: contact?.categoria || contact?.rol_asignado || 'General',
    usuario_asignado_id: contact?.usuario_asignado_id || ''
  });

  const [hierarchyForm, setHierarchyForm] = useState({
    lider_id: contact?.lider_id ? contact.lider_id.toString() : '',
    asesor_id: contact?.asesor_id ? contact.asesor_id.toString() : ''
  });

  const [resolutionForm, setResolutionForm] = useState({
    estado_resolucion: contact?.estado_resolucion || 'RESUELTO',
    nota_pendiente: contact?.nota_pendiente || ''
  });

  const [submitting, setSubmitting] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Load team users and contacts for hierarchy
  const loadContextData = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoadingUsers(true);
      const [uRes, cRes] = await Promise.all([
        fetch(`${API_URL}/empresas/${codigoEmpresa}/users`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
        fetch(`${API_URL}/empresas/${codigoEmpresa}/crm/contacts`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      ]);
      const uData = await uRes.json();
      const cData = await cRes.json();
      if (Array.isArray(uData)) setUsers(uData);
      if (cData && Array.isArray(cData.contacts)) setAllContacts(cData.contacts);
    } catch (e) {
      console.error("Error loading context data for contact menu:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenTeamModal = () => {
    setMenuOpen(false);
    setTeamForm({
      rol_asignado: contact?.categoria || contact?.rol_asignado || 'General',
      usuario_asignado_id: contact?.usuario_asignado_id || ''
    });
    loadContextData();
    setShowTeamModal(true);
  };

  const handleOpenHierarchyModal = () => {
    setMenuOpen(false);
    setHierarchyForm({
      lider_id: contact?.lider_id ? contact.lider_id.toString() : '',
      asesor_id: contact?.asesor_id ? contact.asesor_id.toString() : ''
    });
    loadContextData();
    setShowHierarchyModal(true);
  };

  const handleOpenResolutionModal = () => {
    setMenuOpen(false);
    setResolutionForm({
      estado_resolucion: contact?.estado_resolucion || 'RESUELTO',
      nota_pendiente: contact?.nota_pendiente || ''
    });
    setShowResolutionModal(true);
  };

  // Submit 1: Derivar a Team o Staff
  const handleSubmitTeam = async (e) => {
    e.preventDefault();
    if (!contact?.id) return;
    setSubmitting(true);
    try {
      const selectedUser = users.find(u => u.id === teamForm.usuario_asignado_id);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/contacts/${contact.id}/assign-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          rol_asignado: teamForm.rol_asignado,
          usuario_asignado_id: teamForm.usuario_asignado_id || null,
          usuario_nombre: selectedUser ? `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() : null,
          updated_by: {
            id: currentUser?.id,
            name: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Administrador',
            role: 'master'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Conversación derivada al equipo ${teamForm.rol_asignado}`);
        setShowTeamModal(false);
        onUpdated?.();
      } else {
        toast.error(data.error || 'Error al derivar conversación');
      }
    } catch (e) {
      toast.error('Error de conexión al derivar conversación');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit 2: Asignar Líder o Asesor (Árbol)
  const handleSubmitHierarchy = async (e) => {
    e.preventDefault();
    if (!contact?.id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/contacts/${contact.id}/assign-hierarchy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          lider_id: hierarchyForm.lider_id ? parseInt(hierarchyForm.lider_id, 10) : null,
          asesor_id: hierarchyForm.asesor_id ? parseInt(hierarchyForm.asesor_id, 10) : null,
          updated_by: {
            id: currentUser?.id,
            name: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Administrador',
            role: 'master'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Jerarquía asignada en el árbol de Colaboratium`);
        setShowHierarchyModal(false);
        onUpdated?.();
      } else {
        toast.error(data.error || 'Error al asignar jerarquía');
      }
    } catch (e) {
      toast.error('Error de red al asignar jerarquía');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit 3: Marcar como Resuelto o Pendiente
  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    if (!contact?.id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/contacts/${contact.id}/resolution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          estado_resolucion: resolutionForm.estado_resolucion,
          nota_pendiente: resolutionForm.estado_resolucion === 'PENDIENTE' ? resolutionForm.nota_pendiente : null,
          updated_by: {
            id: currentUser?.id,
            name: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Administrador',
            role: 'master'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          resolutionForm.estado_resolucion === 'PENDIENTE'
            ? 'Marcado como PENDIENTE con nota explicativa visible'
            : 'Marcado como RESUELTO'
        );
        setShowResolutionModal(false);
        onUpdated?.();
      } else {
        toast.error(data.error || 'Error al actualizar estado');
      }
    } catch (e) {
      toast.error('Error de red al actualizar estado');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar posibles líderes y asesores de la base de contactos
  const availableLideres = allContacts.filter(c => 
    c.id !== contact?.id && ((c.grupo || '').toUpperCase() === 'LIDERES' || (c.rol_asignado || '').toLowerCase() === 'lideres')
  );
  const availableAsesores = allContacts.filter(c => 
    c.id !== contact?.id && ((c.grupo || '').toUpperCase() === 'ASESORES' || (c.rol_asignado || '').toLowerCase() === 'asesores')
  );

  return (
    <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      {/* Botón de 3 Puntitos */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className={buttonClassName}
        title="Opciones de derivación y estado"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Menú Desplegable Flotante */}
      {menuOpen && (
        <div className="absolute right-0 mt-1 w-64 rounded-2xl bg-white shadow-2xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-gray-100">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Gestión de Conversación</p>
            <p className="text-xs font-extrabold text-gray-900 truncate">{contact?.name || contact?.nombre || 'Contacto'}</p>
          </div>

          <button
            type="button"
            onClick={handleOpenTeamModal}
            className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-gray-50 flex items-center gap-2.5 transition group"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-extrabold text-gray-900 block leading-tight">1. Derivar a Team o Staff</span>
              <span className="text-[10px] text-gray-500 font-medium">Asignar a Soporte, Ventas o miembro</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleOpenHierarchyModal}
            className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-gray-50 flex items-center gap-2.5 transition group"
          >
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition shrink-0">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-extrabold text-gray-900 block leading-tight">2. Asignar Líder o Asesor</span>
              <span className="text-[10px] text-gray-500 font-medium">Vincular en árbol de dependencias</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleOpenResolutionModal}
            className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-gray-50 flex items-center gap-2.5 transition group"
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center group-hover:scale-105 transition shrink-0 ${
              contact?.estado_resolucion === 'PENDIENTE' 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-emerald-50 text-emerald-600'
            }`}>
              {contact?.estado_resolucion === 'PENDIENTE' ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
            </div>
            <div>
              <span className="font-extrabold text-gray-900 block leading-tight">3. Marcar Resuelto / Pendiente</span>
              <span className="text-[10px] text-gray-500 font-medium">
                {contact?.estado_resolucion === 'PENDIENTE' ? 'Estado: Pendiente con nota' : 'Estado: Resuelto'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* MODAL 1: DERIVAR A TEAM O STAFF */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Derivar Conversación a Team o Staff</h3>
                  <p className="text-[11px] text-gray-500">{contact?.name || contact?.nombre}</p>
                </div>
              </div>
              <button onClick={() => setShowTeamModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTeam} className="py-4 space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                  Rol Funcional / Equipo (Team)
                </label>
                <select
                  value={teamForm.rol_asignado}
                  onChange={(e) => setTeamForm({ ...teamForm, rol_asignado: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                >
                  <option value="General">General (Sin restricción)</option>
                  <option value="Soporte">Soporte Técnico</option>
                  <option value="Ventas">Ventas & Asesoría</option>
                  <option value="Inversores">Mesa de Inversiones</option>
                  <option value="Lideres">Coordinación de Líderes</option>
                  <option value="Onboarding">Onboarding / Verificación</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                  Miembro del Staff Específico (Opcional)
                </label>
                <select
                  value={teamForm.usuario_asignado_id}
                  onChange={(e) => setTeamForm({ ...teamForm, usuario_asignado_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                >
                  <option value="">-- Cualquiera disponible en este Team --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900">
                La derivación quedará registrada en el log de auditoría oficial de <strong>colaboratium@gmail.com</strong>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Derivando..." : "Confirmar Derivación"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASIGNAR LÍDER O ASESOR (ÁRBOL DE DEPENDENCIAS) */}
      {showHierarchyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Asignar en Árbol de Dependencias</h3>
                  <p className="text-[11px] text-gray-500">Estructura jerárquica de Colaboratium</p>
                </div>
              </div>
              <button onClick={() => setShowHierarchyModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visualización del Árbol de Dependencia */}
            <div className="my-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-200">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2.5">Estructura de la Red</p>
              
              <div className="space-y-2 text-xs">
                {/* Nivel 0: Raíz */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-gray-900">colaboratium@gmail.com</span>
                    <span className="text-[10px] text-emerald-600 font-bold block leading-tight">Dirección Central Colaboratium (Raíz)</span>
                  </div>
                </div>

                <div className="flex justify-center text-gray-400 text-xs">↓</div>

                {/* Nivel 1: Líder */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-900">
                      {hierarchyForm.lider_id 
                        ? (availableLideres.find(l => l.id.toString() === hierarchyForm.lider_id)?.nombre || `Líder ID #${hierarchyForm.lider_id}`)
                        : "Líder de Equipo (Sin asignar)"}
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold block leading-tight">Coordinación de Estructura (10% Bolsa)</span>
                  </div>
                </div>

                <div className="flex justify-center text-gray-400 text-xs">↓</div>

                {/* Nivel 2: Asesor */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/70 border border-blue-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-blue-900">
                      {hierarchyForm.asesor_id 
                        ? (availableAsesores.find(a => a.id.toString() === hierarchyForm.asesor_id)?.nombre || `Asesor ID #${hierarchyForm.asesor_id}`)
                        : "Asesor Comercial (Sin asignar)"}
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold block leading-tight">Atención directa y colocaciones</span>
                  </div>
                </div>

                <div className="flex justify-center text-gray-400 text-xs">↓</div>

                {/* Nivel 3: Contacto Actual */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 border border-purple-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">
                    ★
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-purple-900 truncate block">
                      {contact?.name || contact?.nombre} ({contact?.grupo || 'INVERSORES'})
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold block leading-tight">Contacto a subordinar en la red</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitHierarchy} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                  Seleccionar Líder de Equipo
                </label>
                <select
                  value={hierarchyForm.lider_id}
                  onChange={(e) => setHierarchyForm({ ...hierarchyForm, lider_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                >
                  <option value="">-- Sin Líder asignado (Directo a Dirección) --</option>
                  {availableLideres.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.nombre} ({l.telefono || l.email || 'Sin datos'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                  Seleccionar Asesor Comercial
                </label>
                <select
                  value={hierarchyForm.asesor_id}
                  onChange={(e) => setHierarchyForm({ ...hierarchyForm, asesor_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                >
                  <option value="">-- Sin Asesor asignado --</option>
                  {availableAsesores.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.telefono || a.email || 'Sin datos'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowHierarchyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Guardando..." : "Guardar en el Árbol"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MARCAR COMO RESUELTO / PENDIENTE */}
      {showResolutionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  resolutionForm.estado_resolucion === 'PENDIENTE'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {resolutionForm.estado_resolucion === 'PENDIENTE' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Estado de la Conversación</h3>
                  <p className="text-[11px] text-gray-500">{contact?.name || contact?.nombre}</p>
                </div>
              </div>
              <button onClick={() => setShowResolutionModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitResolution} className="py-4 space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                  Estado de Resolución
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionForm({ ...resolutionForm, estado_resolucion: 'PENDIENTE' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      resolutionForm.estado_resolucion === 'PENDIENTE'
                        ? 'bg-amber-500 text-black border-amber-600 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>⏳ Pendiente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolutionForm({ ...resolutionForm, estado_resolucion: 'RESUELTO', nota_pendiente: '' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      resolutionForm.estado_resolucion === 'RESUELTO'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Resuelto</span>
                  </button>
                </div>
              </div>

              {resolutionForm.estado_resolucion === 'PENDIENTE' ? (
                <div>
                  <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider block mb-1">
                    Nota Flotante sobre el Contacto (¿Qué falta?)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resolutionForm.nota_pendiente}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, nota_pendiente: e.target.value })}
                    placeholder="ej. Falta subir foto de DNI por Renaper y coordinar llamado telefónico con el asesor..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium leading-relaxed"
                  />
                  <p className="text-[10px] text-amber-700 mt-1 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    Esta nota aparecerá flotante sobre el contacto en la lista de chats y correos para recordar qué está pendiente.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800">
                  La conversación quedará cerrada como <strong>Resuelta</strong> y se retirarán las alertas de pendiente.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowResolutionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Guardando..." : "Guardar Estado"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
