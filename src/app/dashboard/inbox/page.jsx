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
  Video
} from "lucide-react";
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
https://meet.google.com/qmv-wqzk-hxo

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
• 100% de la escala oficial en inversores precargados o propios (4% a 3m, 5% a 6m, 6% a 12m).
• Consola jerárquica para monitorear en vivo la producción de tus asesores.
• Respaldo comercial y salas de reuniones ejecutivas en Av. del Libertador 264, Vicente López.

¿Te gustaría que coordinemos una videollamada de 20 minutos para diagramar tu equipo?
Atentamente,
Dirección Comercial • Colaboratium`
  },
  {
    id: "bcra-transparencia",
    title: "5. Marco Normativo BCRA Nº 40.015",
    badge: "Legal",
    desc: "Certificado oficial ante el Banco Central de la República Argentina.",
    subject: "Marco Regulatorio y Transparencia Oficial - Registro BCRA Nº 40.015",
    body: `¡Hola! Compartimos la información legal y regulatoria de Colaboratium:

• Razón Social: GLOBAL LOAN S.A.
• Registro Oficial BCRA: Nº 40.015 (Registro de Proveedores de Servicios de Créditos entre Particulares a través de Plataformas).
• Podés consultar nuestro registro en la web oficial del Banco Central:
https://www.bcra.gob.ar/registro-de-proveedores-de-servicios-de-creditos-entre-particulares-a-traves-de-plataformas/
• Bancos Partners para compensación: Banco BIND (Banco Industrial) y Banco Coinag.

Operamos bajo estrictos estándares de transparencia y cumplimiento normativo.
Atentamente,
Colaboratium Legal & Compliance`
  },
  {
    id: "alta-documentacion",
    title: "6. Datos para Alta y Documentación",
    badge: "Admisiones",
    desc: "Solicitud de datos personales, DNI y constancia de CUIT/CBU.",
    subject: "Requerimiento de Datos para Alta en Plataforma Colaboratium",
    body: `¡Hola! Para avanzar con tu habilitación en la plataforma oficial, necesitamos que nos respondas con los siguientes datos:

1. Nombre completo:
2. DNI o CUIT/CUIL:
3. Teléfono / WhatsApp:
4. Domicilio particular:
5. CBU o Alias bancario (BIND o banco de tu preferencia para cobros):
6. Modalidad seleccionada (Asesor Comercial / Inversor / Líder de Equipo):

Una vez recibida la información, generaremos tus credenciales de acceso a la consola.
Muchas gracias,
Equipo de Admisiones • Colaboratium`
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

  // 1. Obtener código de empresa
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => {
          if (data.codigo_empresa) setCodigoEmpresa(data.codigo_empresa);
        })
        .catch(err => console.error(err));
    }
  }, [isLoaded, user]);

  // 2. Cargar lista de correos
  const fetchEmails = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoadingList(true);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/inbox?limit=40`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails || []);
        setInboxStats(data.stats || { total: 0, unseen: 0 });
        if (data.account) setAccountEmail(data.account);

        // Seleccionar primer correo si ninguno está seleccionado
        if (!selectedUid && data.emails && data.emails.length > 0) {
          loadEmailDetails(data.emails[0].uid);
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

  // 3. Cargar detalle de un correo
  const loadEmailDetails = async (uid) => {
    if (!codigoEmpresa) return;
    setSelectedUid(uid);
    setLoadingBody(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/inbox/${uid}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success && data.email) {
        setActiveEmail(data.email);
        setReplySubject(`Re: ${data.email.subject || ""}`);
        setReplyBody("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al descargar cuerpo del correo");
    } finally {
      setLoadingBody(false);
    }
  };

  // 4. Enviar Respuesta vía Gmail SMTP
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeEmail || !replyBody.trim()) {
      toast.error("Escribe un mensaje de respuesta");
      return;
    }

    setSendingReply(true);
    try {
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

  const filteredEmails = emails.filter(e => {
    const term = search.toLowerCase();
    return (
      (e.subject || "").toLowerCase().includes(term) ||
      (e.from || "").toLowerCase().includes(term) ||
      (e.fromEmail || "").toLowerCase().includes(term)
    );
  });

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
            {/* Columna 1: Lista de Correos (3.5 cols) */}
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
                    return (
                      <div
                        key={em.uid}
                        onClick={() => loadEmailDetails(em.uid)}
                        className={`p-3.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-white/10 border-l-2 border-sky-400"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white truncate max-w-[170px]">
                            {em.fromName || em.fromEmail || "Remitente"}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {new Date(em.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${!em.seen ? "font-bold text-sky-300" : "text-white/70"}`}>
                          {em.subject}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-white/40 truncate">
                          {!em.seen && (
                            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                          )}
                          <span className="truncate">{em.fromEmail}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Columna 2: Lector de Correo y Redactor (5 cols) */}
            <div className="col-span-12 md:col-span-5 lg:col-span-6 flex flex-col bg-[#0e0f12] overflow-hidden border-r border-white/10">
              {loadingBody ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/10 border-t-sky-400 rounded-full animate-spin" />
                </div>
              ) : activeEmail ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Email Viewer Header */}
                  <div className="p-5 border-b border-white/10 bg-[#121316] shrink-0">
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
                        <span className="text-[10px] text-white/40 font-mono">{replySubject}</span>
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

            {/* Columna 3: Ficha Remitente & Plantillas de Envío Rápido (3.5 cols) */}
            <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-[#121316] p-4 flex flex-col overflow-y-auto">
              {/* Remitente Ficha */}
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Remitente Activo</p>
                    <p className="text-[10px] text-white/40 truncate max-w-[150px]">
                      {activeEmail?.fromEmail || "Sin remitente seleccionado"}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Podés responder de forma instantánea usando una de las plantillas prearmadas debajo.
                </p>
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
        </div>
      </Panel>
    </>
  );
}
