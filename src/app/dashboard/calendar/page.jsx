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
  X
} from "lucide-react";
import { toast } from "sonner";

export default function CalendarPage() {
  const { user, isLoaded } = useUser();
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);

  // Form State
  const [bookForm, setBookForm] = useState({
    nombre: "",
    email: "",
    telefono: ""
  });
  const [bookingLoading, setBookingLoading] = useState(false);

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

  // 2. Cargar slots de capacitación
  const fetchSlots = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/calendar/slots`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
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

  // 3. Inscribir asesor manualmente
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
      } else {
        toast.error(data.error || "Error al registrar");
      }
    } catch (err) {
      toast.error("Error de conexión al inscribir");
    } finally {
      setBookingLoading(false);
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
                    Sincronización con Google Calendar • Google Meet Oficial • Sesiones Presenciales
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>¿Cómo conectar tu Google Calendar?</span>
              </button>

              <button
                onClick={fetchSlots}
                className="p-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                title="Actualizar turnos"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Banner de Estado Google Calendar */}
          <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-black text-white p-5 rounded-3xl mb-6 shadow-md border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">Google Calendar Sincronizado</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    En Vivo
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-0.5">
                  El bot lee en tiempo real los eventos de capacitación de tu cuenta y despacha las invitaciones por email certificado desde <strong>colaboratium@gmail.com</strong>.
                </p>
              </div>
            </div>

            <a
              href="https://meet.google.com/qmv-wqzk-hxo"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-md transition shrink-0"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((s) => {
                  const isVirtual = s.modalidad === "VIRTUAL";
                  return (
                    <div
                      key={s.id}
                      className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
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
                          <span className="font-mono text-xs font-black text-gray-400">
                            Opción {s.id}
                          </span>
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
                      </div>

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

          {/* Modal Guía de Conexión Google Calendar */}
          {showGuideModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-gray-900">
                      Dónde encontrar la integración de Google Calendar
                    </h3>
                  </div>
                  <button onClick={() => setShowGuideModal(false)} className="p-1 rounded-xl hover:bg-gray-100 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-4 text-xs text-gray-700 leading-relaxed">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                    <p className="font-bold text-blue-900 mb-1">
                      ✅ Opción 1: Dirección Secreta iCal (La más rápida y fácil)
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-blue-800">
                      <li>Entra en tu navegador a <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="underline font-bold">calendar.google.com</a>.</li>
                      <li>En la barra lateral izquierda (debajo de <strong>Mis calendarios</strong>), pasa el mouse sobre <strong>Damian Feuermann</strong> y haz clic en los <strong>tres puntos (⋮)</strong>.</li>
                      <li>Haz clic en <strong>Configuración y uso compartido</strong>.</li>
                      <li>Baja por la página hasta encontrar la sección <strong>"Integrar el calendario"</strong>.</li>
                      <li>Verás un recuadro llamado <strong>"Dirección secreta en formato iCal"</strong> (empieza con <code>https://calendar.google.com/calendar/ical/.../basic.ics</code>).</li>
                      <li>Copia esa dirección y pégala en tu archivo <code>.env</code> como <code>GOOGLE_CALENDAR_ICAL_URL</code>.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl">
                    <p className="font-bold text-purple-900 mb-1">
                      ⚡ Opción 2: Google Cloud Service Account (Para invitar con Meet automático)
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-purple-800">
                      <li>Entra a <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="underline font-bold">console.cloud.google.com</a>.</li>
                      <li>Habilita la <strong>Google Calendar API</strong> en la biblioteca de APIs.</li>
                      <li>Ve a <strong>IAM y administración</strong> ➔ <strong>Cuentas de servicio</strong> (Service Accounts).</li>
                      <li>Crea una cuenta de servicio, haz clic en ella y ve a la pestaña <strong>Claves (Keys)</strong> ➔ <strong>Crear clave nueva (JSON)</strong>.</li>
                      <li>Coloca ese archivo en la carpeta <code>backend/google_credentials.json</code>.</li>
                      <li>En tu Google Calendar, ve a <strong>Compartir con personas específicas</strong> y añade el email de esa cuenta de servicio con permisos de <strong>"Hacer cambios en eventos"</strong>.</li>
                    </ol>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setShowGuideModal(false)}
                    className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Inscribir Asesor Manualmente */}
          {showBookModal && selectedSlotForBooking && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-sm text-gray-900">
                      Inscribir Asesor al Turno #{selectedSlotForBooking.id}
                    </h3>
                  </div>
                  <button onClick={() => setShowBookModal(false)} className="p-1 rounded-xl hover:bg-gray-100 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl my-3 text-xs">
                  <p className="font-bold text-gray-800">{selectedSlotForBooking.titulo}</p>
                  <p className="text-indigo-600 font-semibold">{selectedSlotForBooking.fechaStr} • {selectedSlotForBooking.horarioStr}</p>
                </div>

                <form onSubmit={handleManualBooking} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Juan Ramón Valle"
                      value={bookForm.nombre}
                      onChange={(e) => setBookForm({ ...bookForm, nombre: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Correo Electrónico (Para invitación)</label>
                    <input
                      type="email"
                      required
                      placeholder="ej. damduff@gmail.com"
                      value={bookForm.email}
                      onChange={(e) => setBookForm({ ...bookForm, email: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Teléfono (WhatsApp)</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. 5491136822409"
                      value={bookForm.telefono}
                      onChange={(e) => setBookForm({ ...bookForm, telefono: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
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
        </div>
      </Panel>
    </>
  );
}
