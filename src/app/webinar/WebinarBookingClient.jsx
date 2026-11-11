"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/api";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Video,
} from "lucide-react";

export default function WebinarBookingClient() {
  const searchParams = useSearchParams();

  const initialPhone = (searchParams.get("tel") || searchParams.get("phone") || "").replace(/\D/g, "");
  const initialCategory = (searchParams.get("c") || searchParams.get("category") || "asesores").toLowerCase() === "lideres"
    ? "lideres"
    : "asesores";
  const codigoEmpresa = (searchParams.get("e") || searchParams.get("codigo") || "KRZMJI").trim() || "KRZMJI";
  const preselectedSlot = searchParams.get("slot") || "";

  const [category, setCategory] = useState(initialCategory);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(preselectedSlot);

  const [customerName, setCustomerName] = useState(searchParams.get("name") || "");
  const [customerEmail, setCustomerEmail] = useState(searchParams.get("email") || "");
  const [customerPhone, setCustomerPhone] = useState(initialPhone);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadSlots() {
      setLoadingSlots(true);
      setSlotsError("");
      try {
        const url = `${API_URL}/public/webinar/slots?codigo=${encodeURIComponent(codigoEmpresa)}&category=${encodeURIComponent(category)}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (!active) return;

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "No se pudieron obtener los horarios.");
        }

        const loaded = Array.isArray(data.slots) ? data.slots : [];
        setSlots(loaded);
        if (loaded.length > 0) {
          const matchedPre = preselectedSlot
            ? loaded.find((s) => String(s.id) === String(preselectedSlot))
            : null;
          setSelectedSlotId((prev) => {
            if (matchedPre) return String(matchedPre.id);
            const stillExists = loaded.find((s) => String(s.id) === String(prev));
            return stillExists ? String(stillExists.id) : String(loaded[0].id);
          });
        }
      } catch (err) {
        if (active) {
          setSlotsError(err.message || "Error al cargar fechas disponibles.");
        }
      } finally {
        if (active) setLoadingSlots(false);
      }
    }

    loadSlots();
    return () => {
      active = false;
    };
  }, [category, codigoEmpresa, preselectedSlot]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const cleanName = customerName.trim();
    const cleanEmail = customerEmail.trim().toLowerCase();

    if (cleanName.length < 2) {
      setSubmitError("Ingresá tu nombre y apellido completo.");
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      setSubmitError("Ingresá un correo electrónico válido.");
      return;
    }
    if (!selectedSlotId && slots.length > 0) {
      setSubmitError("Seleccioná una fecha y horario.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/public/webinar/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoEmpresa,
          category,
          slotChoice: selectedSlotId || "1",
          customerName: cleanName,
          customerEmail: cleanEmail,
          customerPhone: customerPhone.replace(/\D/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "No pudimos confirmar tu inscripción.");
      }
      setConfirmation({
        ...data,
        email: cleanEmail,
        name: cleanName,
      });
    } catch (err) {
      setSubmitError(err.message || "Ocurrió un problema al reservar. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between px-4 py-6 sm:py-10">
      <div className="w-full max-w-md mx-auto space-y-5">
        {/* Encabezado Marca Colaboratium */}
        <header className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>COLABORATIUM · BCRA Nº 40.015</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {confirmation ? "¡Lugar Confirmado!" : "Reservá tu lugar en el Webinar"}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {confirmation
              ? "Tu inscripción quedó agendada. Revisá tu correo electrónico para ver los detalles de acceso."
              : "Elegí el día y horario que mejor se adapte a tu agenda y completá tus datos en un solo paso."}
          </p>
        </header>

        {confirmation ? (
          /* Pantalla de Confirmación */
          <section className="bg-[#0d1424] border border-emerald-500/30 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Inscripción exitosa
                </p>
                <p className="text-base font-bold text-white">{confirmation.name}</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5 text-sm">
              <div className="font-semibold text-white">
                {confirmation.slot?.titulo || "Webinar de Capacitación"}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{confirmation.slot?.fechaStr}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{confirmation.slot?.horarioStr}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                {confirmation.slot?.modalidad === "PRESENCIAL" ? (
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Video className="w-4 h-4 text-sky-400 shrink-0" />
                )}
                <span>
                  {confirmation.slot?.modalidad === "PRESENCIAL"
                    ? confirmation.slot?.ubicacion
                    : "Virtual vía Google Meet"}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Confirmación enviada a <strong className="text-white">{confirmation.email}</strong></span>
              </div>
              {confirmation.whatsappSent && (
                <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/25 rounded-lg px-3 py-2 text-emerald-200">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>También enviamos los accesos a tu WhatsApp.</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-1">
              {confirmation.slot?.modalidad === "VIRTUAL" && confirmation.slot?.meetLink ? (
                <a
                  href={confirmation.slot.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Ver enlace de Google Meet</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              ) : (
                <a
                  href="https://maps.google.com/?q=Av.+del+Libertador+264,+Vicente+Lopez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] transition text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Abrir ubicación en Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              )}

              <a
                href="https://colaboratium.com.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-slate-100 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Ir a plataforma Colaboratium</span>
              </a>

              <a
                href="https://wa.me/5491124735062"
                className="w-full h-11 rounded-xl border border-slate-700 hover:bg-slate-800/60 transition text-slate-300 font-medium text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Volver al chat de WhatsApp</span>
              </a>
            </div>
          </section>
        ) : (
          /* Formulario Móvil de Selección + Registro */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Selector de perfil (Asesores / Líderes) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0d1424] border border-slate-800">
              <button
                type="button"
                onClick={() => setCategory("asesores")}
                className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  category === "asesores"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Asesor Comercial</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory("lideres")}
                className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  category === "lideres"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Líder de Equipo</span>
              </button>
            </div>

            {/* Paso 1: Selección de Fecha y Horario */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Elegí fecha y horario
              </label>

              {loadingSlots ? (
                <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Cargando turnos disponibles...</span>
                </div>
              ) : slotsError ? (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 text-sm text-rose-200">
                  {slotsError}
                </div>
              ) : (
                <div role="radiogroup" aria-label="Fechas disponibles de Webinar" className="space-y-2.5">
                  {slots.map((slot) => {
                    const isSelected = String(selectedSlotId) === String(slot.id);
                    const isPresencial = slot.modalidad === "PRESENCIAL";
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedSlotId(String(slot.id))}
                        className={`w-full text-left rounded-2xl p-4 border transition active:scale-[0.99] ${
                          isSelected
                            ? "bg-indigo-600/15 border-indigo-400 ring-2 ring-indigo-500/30"
                            : "bg-[#0d1424] border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                  isSelected
                                    ? "bg-indigo-500 text-white"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                Opción {slot.id}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                  isPresencial
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : "bg-sky-500/15 text-sky-300"
                                }`}
                              >
                                {isPresencial ? (
                                  <MapPin className="w-3 h-3" />
                                ) : (
                                  <Video className="w-3 h-3" />
                                )}
                                {isPresencial ? "Presencial V. López" : "Google Meet"}
                              </span>
                            </div>

                            <div className="text-base font-bold text-white leading-snug">
                              {slot.fechaStr}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-300">
                              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>{slot.horarioStr}</span>
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                              isSelected
                                ? "border-indigo-400 bg-indigo-500 text-white"
                                : "border-slate-600 bg-transparent"
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Paso 2: Datos de contacto */}
            <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Completá tus datos para el envío de acceso
              </div>

              <div className="space-y-1.5">
                <label htmlFor="wb-name" className="block text-sm font-medium text-slate-200">
                  Nombre y apellido *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="wb-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-slate-900 border border-slate-700 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="wb-email" className="block text-sm font-medium text-slate-200">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="wb-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Ej: juan@gmail.com"
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-slate-900 border border-slate-700 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Te enviaremos allí la invitación y el enlace de Google Meet.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="wb-phone" className="block text-sm font-medium text-slate-200">
                  WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="wb-phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej: 5491123456789"
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-slate-900 border border-slate-700 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {submitError && (
              <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl px-4 py-3 text-sm text-rose-200">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loadingSlots || slots.length === 0}
              className="w-full h-13 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 active:scale-[0.99] transition text-white font-extrabold text-base shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Confirmando tu lugar...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar Inscripción Sin Cargo</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <footer className="text-center text-[11px] text-slate-500 mt-8 space-y-1">
        <div>Global Loan S.A. — Colaboratium · Registro Oficial BCRA Nº 40.015</div>
        <div>Actividad gratuita sin compromiso · Plataforma oficial: https://colaboratium.com.ar/</div>
      </footer>
    </div>
  );
}

