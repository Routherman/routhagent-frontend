"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import { API_URL } from "@/config/api";
import {
  Mail,
  RefreshCw,
  Search,
  Send,
  User,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserPlus,
  Inbox as InboxIcon,
  Sparkles,
  Copy,
  Check,
  FileText,
  Calendar,
  Video,
  Phone,
  ChevronDown,
  ChevronUp,
  X,
  MessageSquare,
  CheckCheck,
  CreditCard,
  Tag,
  MapPin,
  UserCheck,
  FileBadge,
  Pin
} from "lucide-react";
import ContactActionMenu from "@/components/dashboard/ContactActionMenu";
import { toast } from "sonner";

const EMAIL_TEMPLATES = [
  {
    id: "webinar-meet",
    title: "1. Invitación Webinar Asesores (Meet)",
    badge: "Asesores",
    desc: "Envía confirmación con enlace directo a Google Meet para capacitación.",
    subject: "Confirmación de Turno: Webinar de Capacitación Asesores Colaboratium",
    body: `¡Hola! Te confirmamos tu lugar en el Webinar Virtual de Capacitación para Asesores Comerciales de Colaboratium (Global Loan S.A., Registro Oficial BCRA Nº 40.015).

💻 Acceso directo a Google Meet:
https://meet.google.com/new

En esta sesión de 40 minutos veremos:
1. Esquema de comisiones (4%, 5% y 6%) y devengamiento inmediato al calce (3%).
2. Atribución de leads propios (Caso Carlos Gómez) vs leads de marketing (Caso Juan Ramírez).
3. Operatoria No Custodial con soporte de Banco BIND y Coinag.
4. Alta en consola y herramientas de prospección.

¡Te esperamos puntual!
Equipo Colaboratium
https://www.colaboratium.com.ar`
  },
  {
    id: "reunion-presencial",
    title: "2. Cita Presencial en Vicente López",
    badge: "Presencial",
    desc: "Confirma reunión en oficinas comerciales con dirección y mapa.",
    subject: "Confirmación de Reunión Presencial - Oficinas Comerciales Colaboratium",
    body: `¡Hola! Te confirmamos la reunión presencial en nuestras oficinas comerciales de Colaboratium.

📍 Dirección:
Av. del Libertador 264, 1° Piso Contrafrente, Vicente López, Provincia de Buenos Aires.
🗺️ Ver en Google Maps: https://maps.google.com/?q=Av.+del+Libertador+264,+Vicente+Lopez

Al llegar, por favor anunciate en recepción con tu DNI.
Estaremos revisando en conjunto tu plan comercial y la habilitación de tu red de clientes e inversores.

¡Te esperamos!
Equipo Colaboratium`
  },
  {
    id: "propuesta-inversor",
    title: "3. Propuesta Inversor de Capital",
    badge: "Inversores",
    desc: "Detalle de tasas variables de mercado y los 4 pilares de seguridad.",
    subject: "Información de Inversión No Custodial - Colaboratium (BCRA Nº 40.015)",
    body: `¡Hola! Gracias por tu interés en invertir a través de Colaboratium (GLOBAL LOAN S.A., Registro Oficial BCRA Nº 40.015).

Puntos clave de nuestra plataforma:
1. COSTO CERO PARA EL INVERSOR: Jamás cobramos ninguna comisión ni canon al inversor; todos los gastos de plataforma los abona el tomador del crédito.
2. OPERATORIA NO CUSTODIAL: Operás 100% bancarizado desde tu propio CVU con soporte de Banco BIND y Banco Coinag. Ni Colaboratium ni sus asesores custodian tus fondos.
3. TASAS VARIABLES DE MERCADO: Tasa promedio estimada entre el 75% y 105% TNA según plazo (3, 6 o 12 meses) y perfil de riesgo.
4. ATOMIZACIÓN Y SCORING IA: Nuestro motor de IA aprueba solo entre el 5% y 15% de solicitudes y fracciona tu capital en 20+ microcréditos distintos.

Podés ingresar a la consola para registrar tu usuario: https://consola.colaboratium.com.ar

Quedamos a tu entera disposición.
Equipo Colaboratium`
  },
  {
    id: "lideres-red",
    title: "4. Programa de Líderes de Equipo",
    badge: "Líderes",
    desc: "Propuesta para coordinadores de equipos con 10% adicional de bolsa.",
    subject: "Programa de Líderes de Redes Comerciales - Colaboratium",
    body: `¡Hola! Te acercamos los detalles del Programa de Líderes de Equipo de Colaboratium.

Beneficios para tu estructura:
• 10% de la bolsa total de comisiones generada por todos los asesores de tu equipo.
• Panel jerárquico para seguimiento de colocaciones de tu red.
• Material de prospección personalizado y soporte de admisiones.

Agendemos una llamada o reunión presencial para coordinar la apertura de tu equipo comercial.

Saludos cordiales,
Equipo Colaboratium`
  }
];

export default function InboxPage() {
  const { user, isLoaded } = useUser();
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);

  const [emails, setEmails] = useState([]);
  const [inboxStats, setInboxStats] = useState({ total: 0, unseen: 0 });
  const [accountEmail, setAccountEmail] = useState("colaboratium@gmail.com");
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedUid, setSelectedUid] = useState(null);
  const [activeEmail, setActiveEmail] = useState(null);
  const [loadingBody, setLoadingBody] = useState(false);

  // Quick Reply Composer
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // CRM Contact Drawer & Inline Summary
  const [contactProfile, setContactProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState("db"); // "db" | "ai" | "chat"
  const [isDropdownExpanded, setIsDropdownExpanded] = useState(false);

  // 1. Obtener código de empresa
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${API_URL}/users/me/${user.id}`, { headers: { "ngrok-skip-browser-warning": "true" } })
        .then((res) => res.json())
        .then((data) => {
          if (data.codigo_empresa) setCodigoEmpresa(data.codigo_empresa);
        })
        .catch((err) => console.error(err));
    }
  }, [isLoaded, user]);

  // 2. Cargar lista de correos
  const fetchEmails = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoadingList(true);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/inbox?limit=40`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails || []);
        setInboxStats(data.stats || { total: 0, unseen: 0 });
        if (data.account) setAccountEmail(data.account);

        // Seleccionar primer correo si ninguno está seleccionado
        if (!selectedUid && data.emails && data.emails.length > 0) {
          loadEmailDetails(data.emails[0].uid, data.emails[0]);
        }
      } else {
        toast.error(data.error || "No se pudo conectar al Inbox");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar correos de Gmail");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [codigoEmpresa]);

  // 3. Cargar detalle de un correo y su perfil de contacto asociado
  const loadEmailDetails = async (uid, fallbackEmailItem = null) => {
    if (!codigoEmpresa) return;
    setSelectedUid(uid);
    setLoadingBody(true);
    setContactProfile(null);

    const emailInList = fallbackEmailItem || emails.find((e) => e.uid === uid);
    const targetEmailAddress = emailInList?.fromEmail;

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/inbox/${uid}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = await res.json();
      if (data.success && data.email) {
        const fullEmail = {
          ...data.email,
          contact: emailInList?.contact || null,
          fromName: emailInList?.fromName || data.email.fromName
        };
        setActiveEmail(fullEmail);
        setReplySubject(`Re: ${data.email.subject || ""}`);
        setReplyBody("");

        // Cargar perfil completo del contacto si existe en BD
        const emailToLookup = fullEmail.fromEmail || targetEmailAddress;
        if (emailToLookup) {
          loadContactProfile(emailToLookup, fullEmail.contact?.id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al descargar cuerpo del correo");
    } finally {
      setLoadingBody(false);
    }
  };

  // Cargar perfil detallado de la persona (BD + IA + Historial de WhatsApp)
  const loadContactProfile = async (email, contactId = null) => {
    if (!codigoEmpresa) return;
    try {
      setLoadingProfile(true);
      const url = contactId
        ? `${API_URL}/empresas/${codigoEmpresa}/inbox/contact-profile?contactId=${contactId}`
        : `${API_URL}/empresas/${codigoEmpresa}/inbox/contact-profile?email=${encodeURIComponent(email)}`;

      const res = await fetch(url, { headers: { "ngrok-skip-browser-warning": "true" } });
      const data = await res.json();
      if (data.success) {
        setContactProfile(data);
      }
    } catch (e) {
      console.error("Error cargando perfil del contacto:", e);
    } finally {
      setLoadingProfile(false);
    }
  };

  // 4. Enviar Respuesta vía Gmail SMTP
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeEmail || !replyBody.trim()) {
      toast.error("Escribe un mensaje de respuesta");
      return;
    }

    try {
      setSendingReply(true);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/inbox/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          to: activeEmail.fromEmail || activeEmail.from,
          subject: replySubject,
          body: replyBody,
          inReplyTo: activeEmail.messageId
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Respuesta enviada vía Gmail SMTP a ${activeEmail.fromEmail}`);
        setReplyBody("");
      } else {
        toast.error(data.error || "Error al enviar correo");
      }
    } catch (err) {
      toast.error("Error de red al enviar respuesta");
    } finally {
      setSendingReply(false);
    }
  };

  const handleApplyTemplate = (tpl) => {
    setReplySubject(tpl.subject);
    setReplyBody(tpl.body);
    setCopiedId(tpl.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(`Plantilla "${tpl.title}" cargada en el redactor`);
  };

  const filteredEmails = emails.filter((e) => {
    const term = search.toLowerCase();
    return (
      (e.subject || "").toLowerCase().includes(term) ||
      (e.from || "").toLowerCase().includes(term) ||
      (e.fromEmail || "").toLowerCase().includes(term) ||
      (e.fromName || "").toLowerCase().includes(term) ||
      (e.contact?.nombre || "").toLowerCase().includes(term)
    );
  });

  const matchedContact = contactProfile?.contacto || activeEmail?.contact;

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="flex-1 flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-[#0c0d0e] text-white">
          {/* Top Bar Inbox Header */}
          <div className="px-6 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#121316]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-sm text-white">Inbox Gmail ({accountEmail})</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Conectado a IMAP & SMTP
                  </span>
                </div>
                <p className="text-[11px] text-white/50">
                  {inboxStats.total} correos en vista • {inboxStats.unseen} no leídos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchEmails}
                disabled={loadingList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-white transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* 3-Column Layout Style IABOX */}
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            {/* Columna 1: Lista de Correos (3 cols) */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-white/10 flex flex-col bg-[#141518] overflow-hidden">
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por remitente, asunto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {loadingList && emails.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-sky-400 rounded-full animate-spin" />
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className="text-center py-12 text-white/40 text-xs">
                    No hay correos en esta bandeja
                  </div>
                ) : (
                  filteredEmails.map((em) => {
                    const isSelected = em.uid === selectedUid;
                    const hasContact = !!em.contact;
                    const displayName = em.contact?.nombre || em.fromName || em.fromEmail || "Remitente";
                    const groupBadge = em.contact?.grupo || (hasContact ? "ASESORES" : null);
                    const isPending = (em.contact?.estado_resolucion || '').toUpperCase() === 'PENDIENTE';

                    return (
                      <div
                        key={em.uid}
                        onClick={() => loadEmailDetails(em.uid, em)}
                        className={`p-3.5 cursor-pointer transition-colors relative group ${
                          isSelected
                            ? "bg-white/10 border-l-2 border-sky-400"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-extrabold text-xs text-white truncate max-w-[140px]">
                              {displayName}
                            </span>
                            {groupBadge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                                {groupBadge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-white/40 font-mono">
                              {new Date(em.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                            </span>
                            {hasContact && (
                              <div onClick={(e) => e.stopPropagation()} className="relative shrink-0">
                                <ContactActionMenu
                                  contact={em.contact}
                                  codigoEmpresa={codigoEmpresa}
                                  currentUser={user}
                                  onUpdated={fetchEmails}
                                  buttonClassName="p-1 text-white/40 hover:text-white rounded hover:bg-white/10 transition text-xs"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <p className={`text-xs truncate ${!em.seen ? "font-bold text-sky-300" : "text-white/70"}`}>
                          {em.subject}
                        </p>

                        <div className="flex items-center justify-between gap-1.5 mt-1.5 text-[10px] text-white/40 truncate">
                          <span className="truncate">{em.fromEmail}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[9px]" title={em.contact?.nota_pendiente ? `Falta: ${em.contact.nota_pendiente}` : 'Pendiente'}>
                                ⏳ Pendiente
                              </span>
                            )}
                            {hasContact && (
                              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                <MessageSquare className="w-3 h-3" /> WhatsApp
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Columna 2: Lector de Correo con Resumen CRM Arriba a la Izquierda (6 cols) */}
            <div className="col-span-12 md:col-span-5 lg:col-span-6 flex flex-col bg-[#0e0f12] overflow-hidden border-r border-white/10">
              {loadingBody ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/10 border-t-sky-400 rounded-full animate-spin" />
                </div>
              ) : activeEmail ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Email Viewer Header */}
                  <div className="p-4 border-b border-white/10 bg-[#121316] shrink-0">
                    {/* RESUMEN DE CONTACTO CRM A LA IZQUIERDA ARRIBA (Tal como se ve en el Calendar) */}
                    {matchedContact && (
                      <div className="mb-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-slate-900 border border-blue-500/30 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
                              {(matchedContact.nombre || "J")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-sm text-white truncate">
                                  {matchedContact.nombre}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                                  {matchedContact.grupo || "ASESORES"}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/70">
                                  Rol: {matchedContact.rol_asignado || "General"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-white/50 mt-0.5 font-mono">
                                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                  <Phone className="w-3 h-3" /> {matchedContact.telefono}
                                </span>
                                <span>•</span>
                                <span className="truncate">{matchedContact.email}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setIsDropdownExpanded(!isDropdownExpanded)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold text-xs flex items-center gap-1 transition"
                            >
                              <span>{isDropdownExpanded ? "Ocultar" : "Resumen"}</span>
                              {isDropdownExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowContactDrawer(true);
                                setActiveDrawerTab("ai");
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Ficha BD & Chat ({contactProfile?.mensajes?.length || 0}) ▾</span>
                            </button>
                            <ContactActionMenu
                              contact={matchedContact}
                              codigoEmpresa={codigoEmpresa}
                              currentUser={user}
                              onUpdated={() => {
                                fetchEmails();
                                if (matchedContact?.email) loadContactProfile(matchedContact.email, matchedContact.id);
                              }}
                              buttonClassName="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1 shadow-sm text-xs"
                            />
                          </div>
                        </div>

                        {/* NOTA FLOTANTE / ALERTA DE CONTACTO PENDIENTE */}
                        {matchedContact.estado_resolucion === 'PENDIENTE' && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                            <Pin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-extrabold text-amber-300 uppercase text-[10px] tracking-wider block">
                                Estado Pendiente • Explicación de qué falta:
                              </span>
                              <p className="text-amber-100 text-[11px] mt-0.5 leading-relaxed font-medium">
                                {matchedContact.nota_pendiente || 'Falta información requerida para completar el trámite.'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Desplegable en línea con información de BD y Ticket */}
                        {isDropdownExpanded && (
                          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-[10px] uppercase font-bold text-white/40 block">Rol / Perfil</span>
                              <span className="font-bold text-white mt-0.5 block">
                                {matchedContact.grupo || "ASESORES"} ({matchedContact.rol_asignado || "General"})
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-[10px] uppercase font-bold text-white/40 block">Ticket Helpdesk</span>
                              <span className="font-bold text-sky-400 mt-0.5 block truncate">
                                {contactProfile?.ticket
                                  ? `#${contactProfile.ticket.id} (${contactProfile.ticket.status})`
                                  : "Sin ticket abierto"}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-[10px] uppercase font-bold text-white/40 block">Turno Capacitación</span>
                              <span className="font-medium text-blue-200 mt-0.5 block truncate">
                                {matchedContact.metadata_extra?.inscripcion || "Sin turno registrado"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <h3 className="text-base font-extrabold text-white leading-tight mb-2">
                      {activeEmail.subject}
                    </h3>
                    <div className="flex flex-wrap items-center justify-between text-xs text-white/60 gap-2">
                      <div>
                        <span className="text-white/40 font-medium">De: </span>
                        <strong className="text-white">{activeEmail.from}</strong>
                      </div>
                      <span className="font-mono text-[11px] text-white/40">
                        {new Date(activeEmail.date).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>

                  {/* Email Body Content */}
                  <div className="flex-1 p-5 overflow-y-auto bg-white text-slate-900 rounded-b-xl m-3 shadow-inner">
                    {activeEmail.html ? (
                      <div
                        className="prose prose-sm max-w-none text-xs"
                        dangerouslySetInnerHTML={{ __html: activeEmail.html }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800">
                        {activeEmail.text}
                      </pre>
                    )}
                  </div>

                  {/* Quick Reply Form */}
                  <div className="p-4 border-t border-white/10 bg-[#121316] shrink-0">
                    <form onSubmit={handleSendReply} className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="flex items-center gap-1.5 font-bold text-sky-400">
                          <Send className="w-3.5 h-3.5" /> Responder a {activeEmail.fromEmail}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono truncate max-w-xs">{replySubject}</span>
                      </div>

                      <textarea
                        rows={3}
                        required
                        placeholder="Escribí tu respuesta para el cliente o seleccioná una plantilla a la derecha..."
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40">
                          Se envía certificado desde <strong>{accountEmail}</strong>
                        </span>
                        <button
                          type="submit"
                          disabled={sendingReply}
                          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition"
                        >
                          <Send className={`w-3.5 h-3.5 ${sendingReply ? "animate-spin" : ""}`} />
                          <span>{sendingReply ? "Enviando..." : "Enviar Respuesta via Gmail SMTP"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/30">
                  <Mail className="w-12 h-12 mb-3 text-white/10" />
                  <p className="font-bold text-sm">Selecciona un correo para leerlo</p>
                </div>
              )}
            </div>

            {/* Columna 3: Ficha Remitente & Plantillas de Envío Rápido (3 cols) */}
            <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-[#121316] p-4 flex flex-col overflow-y-auto">
              {/* Remitente Ficha */}
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 mb-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-xs">
                    {(matchedContact?.nombre || activeEmail?.fromEmail || "R")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {matchedContact?.nombre || "Remitente Activo"}
                    </p>
                    <p className="text-[10px] text-white/40 truncate">
                      {activeEmail?.fromEmail || "Sin remitente seleccionado"}
                    </p>
                  </div>
                </div>

                {matchedContact && (
                  <div className="space-y-2 mt-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40">Rol / Grupo:</span>
                      <span className="font-bold text-blue-300 text-[10px] uppercase">
                        {matchedContact.grupo || "ASESORES"}
                      </span>
                    </div>
                    {matchedContact.telefono && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40">Teléfono:</span>
                        <a
                          href={`https://wa.me/${matchedContact.telefono.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{matchedContact.telefono}</span>
                        </a>
                      </div>
                    )}
                    <button
                      onClick={() => setShowContactDrawer(true)}
                      className="w-full mt-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ver Ficha & Chat ({contactProfile?.mensajes?.length || 0})</span>
                    </button>
                  </div>
                )}

                {!matchedContact && (
                  <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                    Podés responder de forma instantánea usando una de las plantillas prearmadas debajo.
                  </p>
                )}
              </div>

              {/* Plantillas de Envío Rápido */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
                  Plantillas de Envío ({EMAIL_TEMPLATES.length})
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1">
                {EMAIL_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white group-hover:text-sky-300 transition">
                        {tpl.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/50 line-clamp-2">
                      {tpl.desc}
                    </p>
                    <div className="mt-2 flex items-center justify-end text-[10px] text-sky-400 font-bold">
                      {copiedId === tpl.id ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Check className="w-3 h-3" /> Cargado
                        </span>
                      ) : (
                        <span>Cargar en redactor →</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SLIDE-OVER DRAWER DE FICHA Y CONVERSACIÓN (TAL COMO SE VE EN EL CALENDAR) */}
          {showContactDrawer && contactProfile && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity">
              <div className="bg-white text-gray-900 w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                {/* Header del Drawer */}
                <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                      {(contactProfile.contacto.nombre || "J")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base text-gray-900">
                          {contactProfile.contacto.nombre}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {contactProfile.contacto.grupo || "ASESORES"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          Rol: {contactProfile.contacto.rol_asignado || "General"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {contactProfile.contacto.telefono} • {contactProfile.contacto.email || "Sin email"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowContactDrawer(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs de Navegación del Drawer */}
                <div className="px-6 border-b border-gray-100 flex gap-4 bg-white">
                  <button
                    onClick={() => setActiveDrawerTab("db")}
                    className={`py-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition ${
                      activeDrawerTab === "db"
                        ? "border-black text-black"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <FileBadge className="w-4 h-4" />
                    <span>Ficha BD</span>
                  </button>

                  <button
                    onClick={() => setActiveDrawerTab("ai")}
                    className={`py-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition ${
                      activeDrawerTab === "ai"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Resumen Respuestas (IA)</span>
                  </button>

                  <button
                    onClick={() => setActiveDrawerTab("chat")}
                    className={`py-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition ${
                      activeDrawerTab === "chat"
                        ? "border-emerald-600 text-emerald-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Conversación ({contactProfile.mensajes?.length || 0})</span>
                  </button>
                </div>

                {/* Contenido de Tabs */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {/* Pestaña 1: Ficha BD */}
                  {activeDrawerTab === "db" && (
                    <div className="space-y-4">
                      {/* Ticket de admisiones */}
                      {contactProfile.ticket && (
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-amber-600" />
                              Ticket #{contactProfile.ticket.id}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-200 text-amber-900">
                              {contactProfile.ticket.status}
                            </span>
                          </div>
                          <p className="text-xs text-amber-950 font-medium">
                            {contactProfile.ticket.summary}
                          </p>
                        </div>
                      )}

                      {/* Grilla de Datos CRM */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">DNI / Identificación</span>
                          <span className="font-bold text-gray-800 mt-0.5 block">{contactProfile.contacto.dni || "Sin registrar"}</span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Grupo / Rol</span>
                          <span className="font-bold text-gray-800 mt-0.5 block">{contactProfile.contacto.grupo || "ASESORES"}</span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Banco Asociado</span>
                          <span className="font-bold text-gray-800 mt-0.5 block">{contactProfile.contacto.banco || "Sin registrar"}</span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">CBU / CVU</span>
                          <span className="font-mono font-bold text-gray-800 mt-0.5 block truncate">{contactProfile.contacto.cbu || "Sin registrar"}</span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Domicilio Comercial</span>
                          <span className="font-medium text-gray-800 mt-0.5 block">{contactProfile.contacto.direccion || "Sin registrar"}</span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Inscripción / Turno Agendado</span>
                          <span className="font-bold text-indigo-700 mt-0.5 block">
                            {contactProfile.contacto.metadata_extra?.inscripcion || "Sin turno asignado"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pestaña 2: Resumen IA */}
                  {activeDrawerTab === "ai" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-50 via-indigo-50 to-blue-50 border border-indigo-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-indigo-900 font-black text-xs uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span>Síntesis Inteligente del Candidato</span>
                        </div>
                        <p className="text-xs text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                          {contactProfile.resumen_ia}
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                        <h4 className="text-xs font-extrabold text-gray-900">Puntos Clave Detectados:</h4>
                        <ul className="text-xs text-gray-600 space-y-1.5">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Interés confirmado en el programa de <b>Asesores Comerciales</b>.</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Canales de comunicación: <b>WhatsApp Oficial</b> y <b>Gmail</b>.</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Correo verificado y notificado vía SMTP de Colaboratium.</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Ticket registrado en estado: <b>{contactProfile.ticket?.status || "Activo"}</b>.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Pestaña 3: Conversación de WhatsApp */}
                  {activeDrawerTab === "chat" && (
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {(!contactProfile.mensajes || contactProfile.mensajes.length === 0) ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl text-xs text-gray-400">
                          No hay mensajes registrados en base de datos para este contacto
                        </div>
                      ) : (
                        contactProfile.mensajes.map((m) => {
                          const isIncoming = m.direccion === "ENTRANTE";
                          return (
                            <div
                              key={m.id}
                              className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                  isIncoming
                                    ? "bg-gray-100 text-gray-900 font-medium rounded-bl-xs"
                                    : "bg-black text-white font-normal rounded-br-xs"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{m.contenido}</p>
                                <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-60">
                                  <span>
                                    {new Date(m.creado_en).toLocaleTimeString("es-AR", {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                  {!isIncoming && <CheckCheck className="w-3 h-3 text-sky-400" />}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Footer del Drawer */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-2 bg-gray-50">
                  <a
                    href={`https://wa.me/${(contactProfile.contacto.telefono || "").replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Abrir Chat WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("https://meet.google.com/new");
                      toast.success("Enlace de Google Meet copiado");
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    <span>Copiar Link Meet</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </>
  );
}
