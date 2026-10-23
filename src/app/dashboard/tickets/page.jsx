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
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export default function TicketsPage() {
  const { user, isLoaded } = useUser();
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Actions
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [summarizingId, setSummarizingId] = useState(null);
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [newTicket, setNewTicket] = useState({
    phone: '',
    customer_name: '',
    summary: '',
    details: '',
    status: 'open',
    priority: 'media'
  });

  // 1. Obtener código de empresa
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => {
          if (data.codigo_empresa) {
            setCodigoEmpresa(data.codigo_empresa);
          }
        })
        .catch(err => console.error("Error fetching user data:", err));
    }
  }, [isLoaded, user]);

  // 2. Cargar tickets
  const fetchTickets = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? '' : filter;
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets?status=${encodeURIComponent(statusParam)}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [codigoEmpresa, filter]);

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
        setNewTicket({ phone: '', customer_name: '', summary: '', details: '', status: 'open', priority: 'media' });
        fetchTickets();
      } else {
        toast.error(data.error || 'No se pudo crear el ticket');
      }
    } catch (err) {
      toast.error('Error al guardar ticket');
    }
  };

  // Actualizar estado de ticket directamente
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
        body: JSON.stringify({ phone: ticket.phone })
      });
      const data = await res.json();
      if (data.success && data.summary) {
        // Actualizar ticket con el resumen nuevo
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
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300"><Truck className="w-3.5 h-3.5" /> En Logística</span>;
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

  const filteredTickets = tickets.filter(t => {
    const term = searchTerm.toLowerCase();
    const phoneMatch = (t.phone || '').includes(term);
    const nameMatch = (t.customer_name || '').toLowerCase().includes(term);
    const summaryMatch = (t.summary || '').toLowerCase().includes(term);
    return phoneMatch || nameMatch || summaryMatch;
  });

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
                    Opción B • Derivación, Resumen IA y Despacho a colaboratium@gmail.com
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

          {/* Filter Bar & Search */}
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'open', label: 'Abiertos' },
                { id: 'pending_auth', label: 'Pendientes' },
                { id: 'en logistica', label: 'En Logística' },
                { id: 'closed', label: 'Cerrados' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filter === f.id
                      ? 'bg-white text-gray-950 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por teléfono, nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
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
              <p className="text-gray-700 font-bold text-sm">No hay tickets registrados</p>
              <p className="text-gray-400 text-xs mt-1">Crea un nuevo ticket o cambia el filtro de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-black text-gray-400">#{ticket.id}</span>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <span className="text-[11px] text-gray-400 font-medium">
                        {new Date(ticket.created_at).toLocaleString()}
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
                        {ticket.phone}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 font-medium line-clamp-2">
                      {ticket.summary}
                    </p>

                    {ticket.details && (
                      <p className="text-[11px] text-gray-500 mt-1 italic">
                        Detalles: {ticket.details}
                      </p>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                    {/* Status Select */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Estado:</label>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                        className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="open">Abierto</option>
                        <option value="pending_auth">Pendiente Aut.</option>
                        <option value="en logistica">En Logística</option>
                        <option value="closed">Cerrado</option>
                      </select>
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
              ))}
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
                    className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateTicket} className="mt-4 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 uppercase">Teléfono (WhatsApp)</label>
                      <input
                        type="text"
                        required
                        placeholder="ej. 5491136822409"
                        value={newTicket.phone}
                        onChange={(e) => setNewTicket({ ...newTicket, phone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 uppercase">Nombre Cliente</label>
                      <input
                        type="text"
                        placeholder="ej. Juan Pérez"
                        value={newTicket.customer_name}
                        onChange={(e) => setNewTicket({ ...newTicket, customer_name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 uppercase">Prioridad</label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 uppercase">Estado Inicial</label>
                      <select
                        value={newTicket.status}
                        onChange={(e) => setNewTicket({ ...newTicket, status: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                      >
                        <option value="open">Abierto</option>
                        <option value="pending_auth">Pendiente Autorización</option>
                        <option value="en logistica">En Logística</option>
                        <option value="closed">Cerrado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 uppercase">Resumen / Asunto</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Consulta sobre requisitos para Inversor de Capital"
                      value={newTicket.summary}
                      onChange={(e) => setNewTicket({ ...newTicket, summary: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 uppercase">Detalles Adicionales</label>
                    <textarea
                      rows={3}
                      placeholder="Notas del asesor, número de cuenta, o condiciones requeridas..."
                      value={newTicket.details}
                      onChange={(e) => setNewTicket({ ...newTicket, details: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-gray-800 text-white shadow-md"
                    >
                      Guardar Ticket
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
