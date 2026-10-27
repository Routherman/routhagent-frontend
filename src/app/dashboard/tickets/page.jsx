"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import { API_URL } from '@/config/api';
import { 
  Ticket, 
  Search, 
  Plus, 
  Trash2, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  X,
  Send,
  User,
  Phone,
  FileText,
  UserCheck,
  Edit3,
  ShieldCheck,
  Tag,
  Share2,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function TicketsPage() {
  const { user, isLoaded } = useUser();
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copilotFilterIds, setCopilotFilterIds] = useState(null);

  // Escuchar acciones de entorno emitidas por el Copiloto Routh IA
  useEffect(() => {
    const handleCopilotAction = (e) => {
      const action = e.detail;
      if (!action) return;

      if (action.type === 'FILTER_TICKETS') {
        const ticketIds = action.payload?.ticketIds || [];
        setCopilotFilterIds(ticketIds);
        toast.info(`Copiloto: Mostrando ${ticketIds.length} tickets con más de 24 hs sin atención`);
      }
    };

    window.addEventListener('routh-copilot-action', handleCopilotAction);
    return () => window.removeEventListener('routh-copilot-action', handleCopilotAction);
  }, []);
  
  // Modals & Actions
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  
  const [summarizingId, setSummarizingId] = useState(null);
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [authorizingId, setAuthorizingId] = useState(null);
  
  // Form states
  const [newTicket, setNewTicket] = useState({
    phone: '',
    customer_name: '',
    summary: '',
    details: '',
    status: 'open',
    priority: 'media',
    category: 'General'
  });

  const [editingTicket, setEditingTicket] = useState(null);
  const [delegatingTicket, setDelegatingTicket] = useState(null);
  const [delegateTarget, setDelegateTarget] = useState({
    assigned_to_user_id: '',
    assigned_to_name: '',
    internal_notes: ''
  });

  // 1. Obtener código de empresa y datos de usuario
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => {
          if (data.codigo_empresa) {
            setCodigoEmpresa(data.codigo_empresa);
            setCurrentUserData(data);
          }
        })
        .catch(err => console.error("Error fetching user data:", err));
    }
  }, [isLoaded, user]);

  // 2. Cargar tickets y usuarios del equipo
  const fetchTickets = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? '' : filter;
      const roleParam = currentUserData?.rol_nombre ? `&role=${encodeURIComponent(currentUserData.rol_nombre)}&user_id=${currentUserData.id}` : '';
      const [tRes, uRes] = await Promise.all([
        fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets?status=${encodeURIComponent(statusParam)}${roleParam}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }),
        fetch(`${API_URL}/empresas/${codigoEmpresa}/users`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
      ]);

      const tData = await tRes.json();
      const uData = await uRes.json();

      if (tData.success) {
        setTickets(Array.isArray(tData.tickets) ? tData.tickets : []);
      }
      if (Array.isArray(uData)) {
        setTeamUsers(uData);
      }
    } catch (err) {
      console.error('Error fetching tickets or users:', err);
      toast.error('Error al cargar datos del Helpdesk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [codigoEmpresa, filter, currentUserData?.rol_nombre]);

  // Crear nuevo ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.phone || !newTicket.summary) {
      toast.error('Por favor completa teléfono y resumen');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(newTicket)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Ticket creado con éxito');
        setShowCreateModal(false);
        setNewTicket({ phone: '', customer_name: '', summary: '', details: '', status: 'open', priority: 'media', category: 'General' });
        fetchTickets();
      } else {
        toast.error(data.error || 'No se pudo crear el ticket');
      }
    } catch (err) {
      toast.error('Error al guardar ticket');
    }
  };

  // Abrir Modal de Modificación
  const handleOpenEdit = (ticket) => {
    setEditingTicket({
      ...ticket,
      priority: ticket.priority || 'media',
      category: ticket.category || 'General',
      internal_notes: ticket.internal_notes || ''
    });
    setShowEditModal(true);
  };

  // Guardar Modificación de Ticket
  const handleSaveEditTicket = async (e) => {
    e.preventDefault();
    if (!editingTicket) return;

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/${editingTicket.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          customer_name: editingTicket.customer_name,
          summary: editingTicket.summary,
          status: editingTicket.status,
          priority: editingTicket.priority,
          category: editingTicket.category,
          internal_notes: editingTicket.internal_notes,
          assigned_to_name: editingTicket.assigned_to_name
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Ticket #${editingTicket.id} actualizado correctamente`);
        setShowEditModal(false);
        setTickets(prev => prev.map(t => t.id === editingTicket.id ? { ...t, ...editingTicket } : t));
      } else {
        toast.error(data.error || 'No se pudo actualizar el ticket');
      }
    } catch (err) {
      toast.error('Error de red al actualizar ticket');
    }
  };

  // Autorizar Ticket (Pasar de pending_auth a open / autorizado)
  const handleAuthorizeTicket = async (ticketId) => {
    try {
      setAuthorizingId(ticketId);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/${ticketId}/authorize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          usuario_id: currentUserData?.id || user?.id,
          usuario_nombre: currentUserData?.first_name ? `${currentUserData.first_name} ${currentUserData.last_name || ''}` : 'Administrador',
          usuario_email: currentUserData?.email || user?.emailAddresses?.[0]?.emailAddress,
          rol: currentUserData?.rol_nombre || 'Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`¡Ticket #${ticketId} autorizado exitosamente!`);
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'open', authorized_at: new Date() } : t));
      } else {
        toast.error(data.error || 'No se pudo autorizar el ticket');
      }
    } catch (err) {
      toast.error('Error de conexión al autorizar');
    } finally {
      setAuthorizingId(null);
    }
  };

  // Abrir Modal de Delegación
  const handleOpenDelegate = (ticket) => {
    setDelegatingTicket(ticket);
    setDelegateTarget({
      assigned_to_user_id: ticket.assigned_to_user_id || '',
      assigned_to_name: ticket.assigned_to_name || '',
      internal_notes: ticket.internal_notes || ''
    });
    setShowDelegateModal(true);
  };

  // Confirmar Delegación
  const handleConfirmDelegate = async (e) => {
    e.preventDefault();
    if (!delegatingTicket) return;

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/${delegatingTicket.id}/delegate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          assigned_to_user_id: delegateTarget.assigned_to_user_id,
          assigned_to_name: delegateTarget.assigned_to_name,
          internal_notes: delegateTarget.internal_notes,
          delegator_id: currentUserData?.id || user?.id,
          delegator_name: currentUserData?.first_name ? `${currentUserData.first_name} ${currentUserData.last_name || ''}` : 'Admin',
          delegator_email: currentUserData?.email,
          rol: currentUserData?.rol_nombre || 'Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Ticket delegado a ${delegateTarget.assigned_to_name} con éxito`);
        setShowDelegateModal(false);
        setTickets(prev => prev.map(t => t.id === delegatingTicket.id ? { 
          ...t, 
          assigned_to_user_id: delegateTarget.assigned_to_user_id,
          assigned_to_name: delegateTarget.assigned_to_name,
          internal_notes: delegateTarget.internal_notes 
        } : t));
      } else {
        toast.error(data.error || 'No se pudo delegar el ticket');
      }
    } catch (err) {
      toast.error('Error al delegar ticket');
    }
  };

  // Actualizar estado de ticket directamente desde selector
  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Estado actualizado a ${newStatus}`);
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      toast.error('Error actualizando estado');
    }
  };

  // Resumen automático con IA
  const handleSummarizeWithAI = async (ticket) => {
    try {
      setSummarizingId(ticket.id);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/summarize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ phone: ticket.phone || ticket.customer_number })
      });
      const data = await res.json();
      if (data.success && data.summary) {
        await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/${ticket.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ summary: data.summary })
        });
        toast.success('Resumen de IA generado y guardado');
        setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, summary: data.summary } : t));
      } else {
        toast.error('No se pudo generar el resumen');
      }
    } catch (err) {
      toast.error('Error generando resumen con IA');
    } finally {
      setSummarizingId(null);
    }
  };

  // Enviar ticket por Email a colaboratium@gmail.com
  const handleSendEmail = async (ticket) => {
    try {
      setSendingEmailId(ticket.id);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/${ticket.id}/send-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ target_email: 'colaboratium@gmail.com' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Ticket enviado por correo a colaboratium@gmail.com con éxito');
      } else {
        toast.error(data.error || 'Error al enviar por email');
      }
    } catch (err) {
      toast.error('Error de red al enviar email');
    } finally {
      setSendingEmailId(null);
    }
  };

  // Eliminar ticket
  const handleDeleteTicket = async (id) => {
    if (!confirm('¿Deseas eliminar este ticket definitivamente?')) return;
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/${id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Ticket eliminado');
        setTickets(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      toast.error('Error al eliminar ticket');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300"><Clock className="w-3.5 h-3.5" /> Abierto</span>;
      case 'pending_auth':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300"><AlertCircle className="w-3.5 h-3.5" /> Pendiente Aut.</span>;
      case 'en logistica':
      case 'delegated':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300"><Truck className="w-3.5 h-3.5" /> En Gestión</span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" /> Cerrado</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgente':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-500 text-white animate-pulse">Urgente</span>;
      case 'alta':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-700 border border-rose-300">Alta</span>;
      case 'media':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-100 text-yellow-800 border border-yellow-300">Media</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">Baja</span>;
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Inversor':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">📈 Inversor</span>;
      case 'Asesor':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">💼 Asesor</span>;
      case 'Líder':
      case 'Lider':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">👑 Líder</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-50 text-gray-600 border border-gray-200">{category || 'General'}</span>;
    }
  };

  const isSoporteRole = (currentUserData?.rol_nombre || '').toLowerCase().includes('soporte') || (currentUserData?.email || '').toLowerCase().includes('damduff');

  // Si es rol Soporte, solo le mostramos tickets con rol/categoría soporte o asignados a él
  const visibleTickets = tickets.filter(t => {
    if (!isSoporteRole) return true;
    const isSoporteCat = (t.category || '').toLowerCase().includes('soporte');
    const isSoporteAssigned = (t.assigned_to_name || '').toLowerCase().includes('soporte');
    const isAssignedToMe = currentUserData?.id && t.assigned_to_user_id === currentUserData.id;
    return isSoporteCat || isSoporteAssigned || isAssignedToMe;
  });

  const filteredTickets = visibleTickets.filter(t => {
    if (copilotFilterIds !== null && !copilotFilterIds.includes(t.id)) {
      return false;
    }
    const term = searchTerm.toLowerCase();
    const phoneMatch = (t.phone || t.customer_number || '').includes(term);
    const nameMatch = (t.customer_name || '').toLowerCase().includes(term);
    const summaryMatch = (t.summary || '').toLowerCase().includes(term);
    const assignedMatch = (t.assigned_to_name || '').toLowerCase().includes(term);
    return phoneMatch || nameMatch || summaryMatch || assignedMatch;
  });

  // Conteo para las pestañas
  const counts = {
    all: visibleTickets.length,
    pending_auth: visibleTickets.filter(t => t.status === 'pending_auth').length,
    open: visibleTickets.filter(t => t.status === 'open').length,
    delegated: visibleTickets.filter(t => t.status === 'en logistica' || t.status === 'delegated' || !!t.assigned_to_name).length,
    closed: visibleTickets.filter(t => t.status === 'closed').length
  };

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="px-8 pb-8 flex-1 overflow-y-auto">
          {/* Title and Top Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    Administrador de Tickets Helpdesk
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Gestión Integral • Autorización, Delegación y Despacho a colaboratium@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTickets}
                className="p-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                title="Actualizar"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                Nuevo Ticket
              </button>
            </div>
          </div>

          {/* Banner de Filtro Activo por Copilot */}
          {copilotFilterIds !== null && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                <span className="font-bold">
                  Filtro Copilot: Mostrando {filteredTickets.length} ticket(s) con más de 24 horas sin atención.
                </span>
              </div>
              <button
                onClick={() => setCopilotFilterIds(null)}
                className="px-3 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-black text-xs transition"
              >
                Ver Todos los Tickets (Restablecer)
              </button>
            </div>
          )}

          {/* Filter Bar & Search */}
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'all', label: 'Todos', count: counts.all },
                { id: 'pending_auth', label: 'Pendientes Aut.', count: counts.pending_auth },
                { id: 'open', label: 'Abiertos', count: counts.open },
                { id: 'en logistica', label: 'En Gestión', count: counts.delegated },
                { id: 'closed', label: 'Cerrados', count: counts.closed }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFilter(f.id);
                    setCopilotFilterIds(null);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filter === f.id
                      ? 'bg-white text-gray-950 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    filter === f.id ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por teléfono, nombre, asignado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-950 placeholder-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
              <Ticket className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-700 font-bold text-sm">No hay tickets en este estado</p>
              <p className="text-gray-400 text-xs mt-1">Crea un nuevo ticket o cambia el filtro de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredTickets.map(ticket => {
                const isPendingAuth = ticket.status === 'pending_auth';
                const dateStr = ticket.creado_en 
                  ? new Date(ticket.creado_en).toLocaleString('es-AR') 
                  : (ticket.created_at ? new Date(ticket.created_at).toLocaleString('es-AR') : 'Reciente');

                return (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-black text-gray-400">#{ticket.id}</span>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority || 'media')}
                        {getCategoryBadge(ticket.category)}
                        <span className="text-[11px] text-gray-400 font-medium">
                          {dateStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm font-bold text-gray-900 mb-1">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {ticket.customer_name || 'Sin nombre'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1.5 font-mono text-xs text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {ticket.phone || ticket.customer_number}
                        </span>

                        {ticket.assigned_to_name && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span 
                              onClick={() => handleOpenDelegate(ticket)}
                              className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
                              title="Hacé clic para reasignar"
                            >
                              <UserCheck className="w-3 h-3" />
                              {ticket.assigned_to_name}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-gray-700 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 font-medium line-clamp-2">
                        {ticket.summary}
                      </p>

                      {ticket.internal_notes && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/60 px-2.5 py-1 rounded-lg border border-amber-200">
                          <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="font-semibold">Nota Interna:</span> {ticket.internal_notes}
                        </div>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                      
                      {/* Botón Destacado: Autorizar (si está pendiente) */}
                      {isPendingAuth && (
                        <button
                          onClick={() => handleAuthorizeTicket(ticket.id)}
                          disabled={authorizingId === ticket.id}
                          className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-sm transition-all"
                          title="Autorizar este ticket y habilitar gestión"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{authorizingId === ticket.id ? 'Autorizando...' : 'Autorizar'}</span>
                        </button>
                      )}

                      {/* Botón Delegar / Asignar */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDelegate(ticket)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold border border-indigo-200 transition"
                          title="Delegar a Asesor o Líder del equipo"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Delegar</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(ticket)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-[11px] font-bold border border-gray-200 transition"
                          title="Modificar ticket completo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modificar</span>
                        </button>
                      </div>

                      {/* AI Summary and Send Email */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleSummarizeWithAI(ticket)}
                          disabled={summarizingId === ticket.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-bold border border-purple-200 transition"
                          title="Generar resumen de conversación con IA"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${summarizingId === ticket.id ? 'animate-spin' : ''}`} />
                          <span>{summarizingId === ticket.id ? 'Resumiendo...' : 'Resumir IA'}</span>
                        </button>

                        <button
                          onClick={() => handleSendEmail(ticket)}
                          disabled={sendingEmailId === ticket.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition"
                          title="Despachar ticket por mail a colaboratium@gmail.com"
                        >
                          <Mail className={`w-3.5 h-3.5 ${sendingEmailId === ticket.id ? 'animate-bounce' : ''}`} />
                          <span>{sendingEmailId === ticket.id ? 'Enviando...' : 'Enviar Email'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Eliminar ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Nuevo Ticket */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-lg text-gray-900">Crear Nuevo Ticket</h3>
                  </div>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateTicket} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Cliente</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        value={newTicket.customer_name}
                        onChange={(e) => setNewTicket({ ...newTicket, customer_name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono WhatsApp *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 5491122334455"
                        value={newTicket.phone}
                        onChange={(e) => setNewTicket({ ...newTicket, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Categoría</label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none font-bold"
                      >
                        <option value="General">General</option>
                        <option value="Inversor">📈 Inversor</option>
                        <option value="Asesor">💼 Asesor</option>
                        <option value="Líder">👑 Líder</option>
                        <option value="Soporte">🛠️ Soporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Prioridad</label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none font-bold"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Resumen del Ticket *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describa el motivo, perfil o solicitud del cliente..."
                      value={newTicket.summary}
                      onChange={(e) => setNewTicket({ ...newTicket, summary: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Guardar Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Modificar Ticket */}
          {showEditModal && editingTicket && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-lg text-gray-900">Modificar Ticket #{editingTicket.id}</h3>
                  </div>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditTicket} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={editingTicket.customer_name || ''}
                        onChange={(e) => setEditingTicket({ ...editingTicket, customer_name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Estado</label>
                      <select
                        value={editingTicket.status}
                        onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold"
                      >
                        <option value="pending_auth">Pendiente Aut.</option>
                        <option value="open">Abierto</option>
                        <option value="en logistica">En Gestión</option>
                        <option value="closed">Cerrado</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Categoría</label>
                      <select
                        value={editingTicket.category || 'General'}
                        onChange={(e) => setEditingTicket({ ...editingTicket, category: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold"
                      >
                        <option value="General">General</option>
                        <option value="Inversor">📈 Inversor</option>
                        <option value="Asesor">💼 Asesor</option>
                        <option value="Líder">👑 Líder</option>
                        <option value="Soporte">🛠️ Soporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Prioridad</label>
                      <select
                        value={editingTicket.priority || 'media'}
                        onChange={(e) => setEditingTicket({ ...editingTicket, priority: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Resumen del Ticket</label>
                    <textarea
                      rows={3}
                      value={editingTicket.summary || ''}
                      onChange={(e) => setEditingTicket({ ...editingTicket, summary: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Notas Internas</label>
                    <textarea
                      rows={2}
                      placeholder="Instrucciones para el asesor asignado o notas de seguimiento..."
                      value={editingTicket.internal_notes || ''}
                      onChange={(e) => setEditingTicket({ ...editingTicket, internal_notes: e.target.value })}
                      className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Delegar Ticket */}
          {showDelegateModal && delegatingTicket && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-lg text-gray-900">Delegar Ticket #{delegatingTicket.id}</h3>
                  </div>
                  <button 
                    onClick={() => setShowDelegateModal(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleConfirmDelegate} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Asignar a Asesor / Líder del Equipo</label>
                    <select
                      value={delegateTarget.assigned_to_name}
                      onChange={(e) => {
                        const selName = e.target.value;
                        const foundUser = teamUsers.find(u => `${u.first_name} ${u.last_name || ''}`.trim() === selName || u.email === selName);
                        setDelegateTarget({
                          ...delegateTarget,
                          assigned_to_name: selName,
                          assigned_to_user_id: foundUser ? foundUser.id : ''
                        });
                      }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold focus:outline-none"
                    >
                      <option value="">-- Seleccionar Asesor o Equipo --</option>
                      <optgroup label="Equipos Funcionales">
                        <option value="Mesa de Inversiones">📈 Mesa de Inversiones</option>
                        <option value="Equipo Líderes">👑 Equipo Líderes</option>
                        <option value="Equipo Asesores">💼 Equipo Asesores</option>
                        <option value="Mesa de Créditos">💳 Mesa de Créditos</option>
                      </optgroup>
                      {teamUsers.length > 0 && (
                        <optgroup label="Usuarios Registrados">
                          {teamUsers.map(u => {
                            const fullName = `${u.first_name} ${u.last_name || ''}`.trim() || u.email;
                            return (
                              <option key={u.id} value={fullName}>
                                {fullName} ({u.rol_nombre || 'Usuario'})
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Notas de Delegación</label>
                    <textarea
                      rows={3}
                      placeholder="Instrucciones para el agente asignado (ej. coordinar llamada para onboarding)..."
                      value={delegateTarget.internal_notes}
                      onChange={(e) => setDelegateTarget({ ...delegateTarget, internal_notes: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDelegateModal(false)}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!delegateTarget.assigned_to_name}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Confirmar Delegación
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </Panel>
    </>
  );
}
