"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import { API_URL } from "@/config/api";
import {
  Calendar as CalendarIcon,
  Video,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  HelpCircle,
  Key,
  ShieldCheck,
  Building2,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  UserCheck,
  MessageSquare,
  Sparkles,
  Mail,
  Phone,
  FileText,
  BadgeAlert,
  ArrowRight,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

export default function CalendarPage() {
  const { user, isLoaded } = useUser();
  const [codigoEmpresa, setCodigoEmpresa] = useState("KRZMJI");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);

  // Inscriptos Dropdown state por slot
  const [expandedSlotId, setExpandedSlotId] = useState(null);

  // Drawer / Modal de Detalle de Inscripto
  const [selectedSubscriberId, setSelectedSubscriberId] = useState(null);
  const [subscriberProfile, setSubscriberProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("db"); // "db" | "ai" | "chat"

  // Rol y permisos del usuario conectado
  const [userRole, setUserRole] = useState("");
  const [userPrivs, setUserPrivs] = useState({});
  const [userName, setUserName] = useState("");

  // Estado del Modal para Crear Evento (Webinar o Meet)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState("webinar"); // 'webinar' | 'meet'
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [createForm, setCreateForm] = useState({
    titulo: "",
    modalidad: "VIRTUAL",
    categoria: "ASESORES",
    fechaDate: new Date().toISOString().split('T')[0],
    fecha: "Hoy",
    horaInicio: "10:30",
    horaFin: "12:00",
    horario: "10:30 a 12:00 hs",
    cupos: 25,
    meetLink: "https://meet.google.com/new",
    ubicacion: "Google Meet"
  });

  // Form State para Inscribir Asesor
  const [bookForm, setBookForm] = useState({
    nombre: "",
    email: "",
    telefono: ""
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // 1. Obtener código de empresa y permisos de usuario
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${API_URL}/users/me/${user.id}`, { headers: { "ngrok-skip-browser-warning": "true" } })
        .then((res) => res.json())
        .then((data) => {
          if (data.codigo_empresa) setCodigoEmpresa(data.codigo_empresa);
          if (data.rol_nombre) setUserRole(data.rol_nombre.toLowerCase());
          setUserName(`${data.first_name || ''} ${data.last_name || ''}`.trim() || user.firstName || 'Usuario');
          let privs = data.rol_privilegios;
          if (typeof privs === 'string') {
            try { privs = JSON.parse(privs); } catch (e) {}
          }
          if (privs) setUserPrivs(privs);
        })
        .catch((err) => console.error(err));
    }
  }, [isLoaded, user]);

  const isSuper = !userRole || ["master", "main"].includes(userRole);
  const canCreateWebinar = isSuper || userPrivs?.manage_calendar_webinar || userRole.includes("lider");
  const canCreateMeet = isSuper || userPrivs?.manage_calendar_meet || userRole.includes("asesor");
  const canManageEvents = isSuper || userPrivs?.manage_calendar_events;

  // 2. Cargar slots de capacitación con inscriptos
  const fetchSlots = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/calendar/slots`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar turnos del calendario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [codigoEmpresa]);

  // Escuchar acciones de creación de eventos emitidas por el Copiloto Routh IA
  useEffect(() => {
    const handleCopilotAction = (e) => {
      const action = e.detail;
      if (action && action.type === 'CALENDAR_EVENT_CREATED') {
        fetchSlots();
      }
    };

    window.addEventListener('routh-copilot-action', handleCopilotAction);
    return () => window.removeEventListener('routh-copilot-action', handleCopilotAction);
  }, [codigoEmpresa]);

  // 3. Cargar Ficha Detallada del Inscripto
  const loadSubscriberDetail = async (subscriberId) => {
    setSelectedSubscriberId(subscriberId);
    setLoadingProfile(true);
    setActiveTab("db");
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/calendar/subscriber/${subscriberId}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = await res.json();
      if (data.success) {
        setSubscriberProfile(data);
      } else {
        toast.error(data.error || "No se pudo cargar la ficha del inscripto");
      }
    } catch (err) {
      toast.error("Error al obtener datos del inscripto");
    } finally {
      setLoadingProfile(false);
    }
  };

  // 4. Inscribir asesor manualmente
  const handleManualBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlotForBooking || !bookForm.email || !bookForm.telefono) {
      toast.error("Por favor completa los datos del asesor");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/calendar/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          slotChoice: selectedSlotForBooking.id.toString(),
          customerName: bookForm.nombre,
          customerEmail: bookForm.email,
          customerPhone: bookForm.telefono
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`¡Asesor inscripto! Se envió confirmación a ${bookForm.email} y a colaboratium@gmail.com`);
        setShowBookModal(false);
        setBookForm({ nombre: "", email: "", telefono: "" });
        fetchSlots(); // Recargar slots para mostrar el nuevo inscripto
      } else {
        toast.error(data.error || "Error al registrar");
      }
    } catch (err) {
      toast.error("Error de conexión al inscribir");
    } finally {
      setBookingLoading(false);
    }
  };

  const openCreateModal = (type = 'webinar') => {
    setCreateModalType(type);
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 1);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayName = targetDate.toLocaleDateString('es-AR', { weekday: 'long' });
    const monthName = targetDate.toLocaleDateString('es-AR', { month: 'long' });
    const fechaFormatted = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${targetDate.getDate()} de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;

    setCreateForm({
      titulo: type === 'webinar' ? 'Webinar Virtual de Capacitación Líderes' : 'Reunión Meet de Inversión',
      modalidad: 'VIRTUAL',
      categoria: type === 'webinar' ? 'LIDERES' : 'INVERSORES',
      fechaDate: dateStr,
      fecha: fechaFormatted,
      horaInicio: '10:30',
      horaFin: '12:00',
      horario: '10:30 a 12:00 hs',
      cupos: type === 'webinar' ? 25 : 5,
      meetLink: 'https://meet.google.com/new',
      ubicacion: 'Google Meet'
    });
    setShowCreateModal(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!createForm.titulo || !createForm.fecha || !createForm.horario) {
      toast.error("Por favor completa los campos del evento");
      return;
    }
    setCreatingEvent(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/calendar/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          titulo: createForm.titulo,
          tipo: createModalType,
          modalidad: createForm.modalidad,
          categoria: createForm.categoria,
          fecha: createForm.fecha,
          fechaDate: createForm.fechaDate,
          horario: createForm.horario,
          horaInicio: createForm.horaInicio,
          horaFin: createForm.horaFin,
          meetLink: createForm.meetLink || 'https://meet.google.com/new',
          ubicacion: createForm.ubicacion,
          cupos: parseInt(createForm.cupos, 10) || 25,
          userId: user?.id,
          userName: userName,
          userRole: userRole
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("¡Evento creado y registrado en Google Calendar (colaboratium@gmail.com)!", {
          action: data.googleCalendarUrl ? {
            label: "Ver en Google Calendar",
            onClick: () => window.open(data.googleCalendarUrl, '_blank')
          } : undefined
        });
        setShowCreateModal(false);
        fetchSlots();
      } else {
        toast.error(data.error || "Error al registrar evento");
      }
    } catch (err) {
      toast.error("Error de conexión al registrar evento");
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleDeleteCustomEvent = async (dbId) => {
    if (!confirm("¿Deseas eliminar este evento del calendario y auditarlo en Google Colaboratium?")) return;
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/calendar/events/${dbId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          userId: user?.id,
          userName: userName,
          userRole: userRole
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Evento eliminado del calendario");
        fetchSlots();
      } else {
        toast.error(data.error || "No se pudo eliminar el evento");
      }
    } catch (err) {
      toast.error("Error al eliminar evento");
    }
  };

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="px-8 pb-8 flex-1 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-blue-600">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    Calendario de Capacitaciones & Meet
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sincronización con Google Calendar • Google Meet Oficial • Control de Inscriptos
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              {canCreateWebinar && (
                <button
                  onClick={() => openCreateModal('webinar')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black transition shadow-sm"
                  title="Facultad de Líder de Equipo para capacitar asesores"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Crear Webinar (Líder)</span>
                </button>
              )}

              {canCreateMeet && (
                <button
                  onClick={() => openCreateModal('meet')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition shadow-sm"
                  title="Facultad de Asesor Comercial para conectar con inversores"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>+ Crear Meet con Inversor</span>
                </button>
              )}

              <button
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>¿Cómo conectar?</span>
              </button>

              <button
                onClick={fetchSlots}
                disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold transition shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Banner de Sincronización */}
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white">Google Calendar Sincronizado</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    En Vivo (iCal Oficial)
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  El bot lee en tiempo real los eventos de capacitación de tu cuenta, gestiona cupos y despacha invitaciones automáticas desde colaboratium@gmail.com.
                </p>
              </div>
            </div>

            <a
              href="https://meet.google.com/qmv-wqzk-hxo"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition shadow-lg shrink-0"
            >
              <Video className="w-4 h-4" />
              <span>Abrir Sala Google Meet</span>
            </a>
          </div>

          {/* Grid de Sesiones / Turnos Detectados */}
          <div className="mb-8">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Sesiones Disponibles en tu Calendario ({slots.length})
            </h3>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 text-xs">
                No hay sesiones cargadas actualmente
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {slots.map((s) => {
                  const isVirtual = s.modalidad === "VIRTUAL";
                  const subsCount = s.inscriptosCount ?? s.subscribers?.length ?? 0;
                  const totalCupos = s.cupos || (isVirtual ? 25 : 15);
                  const libres = s.cuposDisponibles ?? Math.max(0, totalCupos - subsCount);
                  const pctOcupado = Math.min(100, Math.round((subsCount / totalCupos) * 100));
                  const isExpanded = expandedSlotId === s.id;

                  return (
                    <div
                      key={s.id}
                      className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header de la tarjeta */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                isVirtual
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {isVirtual ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                              {s.modalidad}
                            </span>
                            {s.categoria && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                s.categoria === 'LIDERES' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {s.categoria}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-gray-400">
                              Opción {s.id}
                            </span>
                            {s.isCustom && canManageEvents && (
                              <button
                                onClick={() => handleDeleteCustomEvent(s.dbId)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded-lg transition"
                                title="Eliminar evento del calendario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-extrabold text-sm text-gray-900 mb-1">{s.titulo}</h4>
                        <p className="font-black text-xs text-indigo-600 mb-1 flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {s.fechaStr}
                        </p>
                        <p className="font-mono font-bold text-xs text-gray-700 mb-3 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {s.horarioStr}
                        </p>

                        {/* Barra y contador de suscriptores */}
                        <div className="mb-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{subsCount} Suscriptores</span>
                            </span>
                            <span className="text-[11px] font-bold text-gray-500">
                              {libres} cupos libres ({totalCupos} tot.)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                              style={{ width: `${pctOcupado}%` }}
                            />
                          </div>
                        </div>

                        {/* Ubicación / Enlace */}
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-600 space-y-1">
                          <p className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{s.ubicacion}</span>
                          </p>
                          {isVirtual && s.meetLink && (
                            <p className="font-mono text-[10px] text-blue-600 truncate">
                              Link: {s.meetLink}
                            </p>
                          )}
                        </div>

                        {/* Desplegable de Inscriptos */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => setExpandedSlotId(isExpanded ? null : s.id)}
                            className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-black py-1.5 px-2 rounded-xl bg-gray-50/60 hover:bg-gray-100 transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Ver inscriptos ({subsCount})</span>
                            </span>
                            <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                              {isExpanded ? (
                                <>
                                  <span>Ocultar</span>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  <span>Desplegar</span>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              )}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 space-y-2 max-h-56 overflow-y-auto pr-1">
                              {(!s.subscribers || s.subscribers.length === 0) ? (
                                <p className="text-[11px] text-gray-400 italic py-3 text-center bg-gray-50/70 rounded-xl">
                                  No hay candidatos inscriptos aún para esta fecha
                                </p>
                              ) : (
                                s.subscribers.map((sub) => (
                                  <div
                                    key={sub.id}
                                    onClick={() => loadSubscriberDetail(sub.id)}
                                    className="p-2.5 rounded-2xl bg-white hover:bg-indigo-50/70 border border-gray-200/80 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs group"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                        {(sub.nombre || "A")[0].toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-extrabold text-gray-900 group-hover:text-indigo-600 transition truncate">
                                          {sub.nombre}
                                        </p>
                                        <p className="text-[10px] text-gray-500 truncate">
                                          {sub.email || sub.telefono}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-blue-100 text-blue-800 uppercase">
                                        {sub.canal || "WhatsApp"}
                                      </span>
                                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer de la Tarjeta */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        {isVirtual ? (
                          <a
                            href={s.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <span>Probar Meet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <a
                            href="https://maps.google.com/?q=Av.+del+Libertador+264,+Vicente+Lopez"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <span>Ver Mapa</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setSelectedSlotForBooking(s);
                            setShowBookModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          Inscribir Asesor
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal / Slide-over de Ficha Completa del Inscripto */}
          {selectedSubscriberId && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0c1424] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-white/10 max-h-[92vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header del Modal */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                      {subscriberProfile?.contacto?.nombre?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{subscriberProfile?.contacto?.nombre || "Cargando..."}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">
                          {subscriberProfile?.contacto?.grupo || "ASESORES"}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                        {subscriberProfile?.contacto?.telefono} • {subscriberProfile?.contacto?.email || "Sin email"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSubscriberId(null);
                      setSubscriberProfile(null);
                    }}
                    className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loadingProfile ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-4 border-gray-200 dark:border-white/10 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400">Cargando base de datos e historial de respuestas...</p>
                  </div>
                ) : subscriberProfile ? (
                  <div className="mt-4 flex-1 flex flex-col">
                    {/* Selector de Pestañas */}
                    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-2xl mb-4">
                      <button
                        onClick={() => setActiveTab("db")}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          activeTab === "db"
                            ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ficha BD</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("ai")}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          activeTab === "ai"
                            ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Resumen Respuestas (IA)</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("chat")}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          activeTab === "chat"
                            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Conversación ({subscriberProfile.mensajes?.length || 0})</span>
                      </button>
                    </div>

                    {/* Contenido Pestaña 1: Ficha BD */}
                    {activeTab === "db" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 dark:bg-[#0e1628] rounded-2xl border border-gray-100 dark:border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Teléfono / WhatsApp</span>
                            <span className="text-xs font-mono font-extrabold text-gray-900 dark:text-white">
                              {subscriberProfile.contacto.telefono}
                            </span>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-[#0e1628] rounded-2xl border border-gray-100 dark:border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Correo Electrónico</span>
                            <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate block">
                              {subscriberProfile.contacto.email || "No registrado"}
                            </span>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-[#0e1628] rounded-2xl border border-gray-100 dark:border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">DNI / Identificación</span>
                            <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                              {subscriberProfile.contacto.dni || "Pendiente de presentación"}
                            </span>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-[#0e1628] rounded-2xl border border-gray-100 dark:border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Localidad / Dirección</span>
                            <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate block">
                              {subscriberProfile.contacto.direccion || "Sin especificar"}
                            </span>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-[#0e1628] rounded-2xl border border-gray-100 dark:border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">CBU / Alias</span>
                            <span className="text-xs font-mono font-extrabold text-gray-900 dark:text-white">
                              {subscriberProfile.contacto.cbu || subscriberProfile.contacto.alias || "Sin registrar"}
                            </span>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-[#0e1628] rounded-2xl border border-gray-100 dark:border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Entidad Bancaria</span>
                            <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                              {subscriberProfile.contacto.banco || "BIND / Coinag"}
                            </span>
                          </div>
                        </div>

                        {/* Ticket Asociado */}
                        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                              <BadgeAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <span>Ticket Helpdesk #{subscriberProfile.ticket?.id || "N/A"}</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                              {subscriberProfile.ticket?.status || "pending_auth"}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                            {subscriberProfile.ticket?.summary || subscriberProfile.contacto?.metadata_extra?.inscripcion || "Inscripción a capacitación"}
                          </p>
                          <div className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-between">
                            <span>Asignado a: {subscriberProfile.ticket?.assigned_to_name || "Equipo Admisiones"}</span>
                            <span>Fecha: {new Date(subscriberProfile.contacto.creado_en).toLocaleString("es-AR")}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contenido Pestaña 2: Resumen IA */}
                    {activeTab === "ai" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#0f172a] dark:bg-[#0c1424] border border-indigo-500/40 shadow-sm text-slate-200">
                          <div className="flex items-center gap-2 mb-2 text-indigo-400 font-black text-xs uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span>Síntesis Inteligente del Candidato</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                            {subscriberProfile.resumen_ia}
                          </p>
                        </div>

                        <div className="p-4 bg-[#0f172a] dark:bg-[#0c1424] rounded-2xl border border-slate-800 space-y-2 text-slate-300">
                          <h4 className="text-xs font-extrabold text-white">Puntos Clave Detectados:</h4>
                          <ul className="text-xs text-slate-300 space-y-1.5">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Interés confirmado en el programa de <b>Asesores Comerciales</b>.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Canal de ingreso: <b>WhatsApp Cloud Oficial</b>.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Correo verificado y notificado vía SMTP de Colaboratium.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Ticket en espera de contacto por el directivo/admisiones.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Contenido Pestaña 3: Conversación */}
                    {activeTab === "chat" && (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {(!subscriberProfile.mensajes || subscriberProfile.mensajes.length === 0) ? (
                          <div className="text-center py-10 bg-gray-50 dark:bg-[#0e1628] rounded-2xl text-xs text-gray-400 dark:text-slate-500">
                            No hay mensajes registrados en base de datos para este contacto
                          </div>
                        ) : (
                          subscriberProfile.mensajes.map((m) => {
                            const isIncoming = m.direccion === "ENTRANTE";
                            return (
                              <div
                                key={m.id}
                                className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
                              >
                                <div
                                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                                    isIncoming
                                      ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                                      : "bg-indigo-600 text-white font-normal"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{m.contenido}</p>
                                  <span className="block mt-1 text-[9px] opacity-60 text-right">
                                    {new Date(m.creado_en).toLocaleTimeString("es-AR", {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* Acciones del Footer del Modal */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/${subscriberProfile.contacto.telefono.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Abrir Chat WhatsApp</span>
                      </a>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("https://meet.google.com/qmv-wqzk-hxo");
                          toast.success("Enlace de Google Meet copiado al portapapeles");
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5 text-blue-600" />
                        <span>Copiar Link Meet</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Modal Guía de Conexión Google Calendar */}
          {showGuideModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-sm text-gray-900">
                      Sincronización con Google Calendar
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowGuideModal(false)}
                    className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-4 space-y-4 text-xs text-gray-600">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-medium">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Conexión Activa por Feed iCal Secreto
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Tu calendario ya está vinculado a través de la Dirección Secreta de Google Calendar. Todos los eventos de tu cuenta se reflejan en tiempo real en los turnos del bot y en este panel.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setShowGuideModal(false)}
                    className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Reserva Manual */}
          {showBookModal && selectedSlotForBooking && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Inscribir Asesor Manualmente</h3>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {selectedSlotForBooking.titulo} • {selectedSlotForBooking.fechaStr}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBookModal(false)}
                    className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleManualBooking} className="py-4 space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Juan Ramón Valle"
                      value={bookForm.nombre}
                      onChange={(e) => setBookForm({ ...bookForm, nombre: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase">Correo Electrónico (Para invitación)</label>
                    <input
                      type="email"
                      required
                      placeholder="ej. damduff@gmail.com"
                      value={bookForm.email}
                      onChange={(e) => setBookForm({ ...bookForm, email: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase">Teléfono (WhatsApp)</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. 5491136822409"
                      value={bookForm.telefono}
                      onChange={(e) => setBookForm({ ...bookForm, telefono: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowBookModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{bookingLoading ? "Procesando..." : "Confirmar y Enviar Emails"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Crear Evento (Webinar Líder o Meet Inversor) */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                      createModalType === 'webinar' ? 'bg-amber-500' : 'bg-blue-600'
                    }`}>
                      {createModalType === 'webinar' ? <CalendarIcon className="w-5 h-5 text-black" /> : <Video className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900">
                        {createModalType === 'webinar' ? 'Nuevo Webinar de Capacitación (Líder)' : 'Nueva Reunión Meet con Inversor (Asesor)'}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-mono font-medium">
                        Ámbito Google Oficial: colaboratium@gmail.com
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="py-4 space-y-3.5">
                  <div>
                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Título del Evento</label>
                    <input
                      type="text"
                      required
                      value={createForm.titulo}
                      onChange={(e) => setCreateForm({ ...createForm, titulo: e.target.value })}
                      placeholder={createModalType === 'webinar' ? "ej. Webinar Virtual de Líderes" : "ej. Asesoría Financiera Personalizada"}
                      className="w-full mt-1 px-3 py-2 text-xs text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Modalidad</label>
                      <select
                        value={createForm.modalidad}
                        onChange={(e) => setCreateForm({ 
                          ...createForm, 
                          modalidad: e.target.value,
                          ubicacion: e.target.value === 'PRESENCIAL' ? 'Av. del Libertador 264, Vicente López' : 'Google Meet'
                        })}
                        className="w-full mt-1 px-3 py-2 text-xs text-gray-900 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold"
                      >
                        <option value="VIRTUAL" className="text-gray-900 font-bold">Virtual (Google Meet)</option>
                        <option value="PRESENCIAL" className="text-gray-900 font-bold">Presencial (Oficinas)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Categoría</label>
                      <select
                        value={createForm.categoria}
                        onChange={(e) => setCreateForm({ ...createForm, categoria: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs text-gray-900 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold"
                      >
                        <option value="LIDERES" className="text-gray-900 font-bold">Líderes de Equipo</option>
                        <option value="ASESORES" className="text-gray-900 font-bold">Asesores Comerciales</option>
                        <option value="INVERSORES" className="text-gray-900 font-bold">Inversores</option>
                      </select>
                    </div>
                  </div>

                  {/* Selector de Fecha Estilo Google Calendar */}
                  <div>
                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Fecha del Evento (Desplegable Google Calendar)</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={createForm.fechaDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCreateForm(prev => {
                          let str = prev.fecha;
                          if (val) {
                            const [y, m, d] = val.split('-').map(Number);
                            const dt = new Date(y, m - 1, d);
                            const dayName = dt.toLocaleDateString('es-AR', { weekday: 'long' });
                            const monthName = dt.toLocaleDateString('es-AR', { month: 'long' });
                            str = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${d} de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
                          }
                          return { ...prev, fechaDate: val, fecha: str };
                        });
                      }}
                      className="w-full mt-1 px-3 py-2 text-xs text-gray-900 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold cursor-pointer"
                    />
                    {createForm.fecha && (
                      <p className="text-[10px] text-indigo-600 font-bold mt-1">
                        📅 Fecha seleccionada: {createForm.fecha}
                      </p>
                    )}
                  </div>

                  {/* Horario de Inicio y Fin */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Hora Inicio</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={createForm.horaInicio}
                        onChange={(e) => {
                          const start = e.target.value;
                          setCreateForm(prev => ({
                            ...prev,
                            horaInicio: start,
                            horario: `${start} a ${prev.horaFin} hs`
                          }));
                        }}
                        className="w-full mt-1 px-3 py-2 text-xs text-gray-900 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Hora Fin</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={createForm.horaFin}
                        onChange={(e) => {
                          const end = e.target.value;
                          setCreateForm(prev => ({
                            ...prev,
                            horaFin: end,
                            horario: `${prev.horaInicio} a ${end} hs`
                          }));
                        }}
                        className="w-full mt-1 px-3 py-2 text-xs text-gray-900 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Cupos</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={createForm.cupos}
                        onChange={(e) => setCreateForm({ ...createForm, cupos: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold"
                      />
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Sala Google Meet</label>
                        <a
                          href="https://meet.google.com/new"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition"
                        >
                          <Video className="w-3 h-3" />
                          <span>Iniciar Sala Nueva</span>
                        </a>
                      </div>
                      <input
                        type="text"
                        value={createForm.meetLink}
                        onChange={(e) => setCreateForm({ ...createForm, meetLink: e.target.value })}
                        placeholder="https://meet.google.com/new"
                        className="w-full mt-1 px-3 py-2 text-xs text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-mono font-bold"
                      />
                    </div>
                  </div>

                  {createForm.modalidad === 'PRESENCIAL' && (
                    <div>
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Dirección Física</label>
                      <input
                        type="text"
                        value={createForm.ubicacion}
                        onChange={(e) => setCreateForm({ ...createForm, ubicacion: e.target.value })}
                        placeholder="Av. del Libertador 264..."
                        className="w-full mt-1 px-3 py-2 text-xs text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Este evento se sincronizará y registrará en el historial de sucesos de colaboratium@gmail.com.</span>
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
                      disabled={creatingEvent}
                      className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{creatingEvent ? "Guardando y Auditando..." : "Crear y Auditar en Google"}</span>
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
