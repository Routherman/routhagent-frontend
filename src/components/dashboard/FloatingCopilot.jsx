"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { API_URL } from "@/config/api";
import {
  Sparkles,
  Bot,
  X,
  Send,
  Minimize2,
  Maximize2,
  Trash2,
  Copy,
  Check,
  Calendar,
  Mail,
  Ticket,
  Users,
  Cpu,
  Workflow,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export default function FloatingCopilot() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [codigoEmpresa, setCodigoEmpresa] = useState("KRZMJI");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! 👋 Soy tu **Copiloto Routh IA** para Colaboratium. Te asisto en tiempo real con datos de clientes, redacción de correos, inscripciones de calendario y soporte normativo del BCRA. ¿En qué te ayudo hoy?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  // Obtener código de empresa
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${API_URL}/users/me/${user.id}`, { headers: { "ngrok-skip-browser-warning": "true" } })
        .then((res) => res.json())
        .then((data) => {
          if (data.codigo_empresa) setCodigoEmpresa(data.codigo_empresa);
        })
        .catch(() => {});
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Contexto dinámico según la sección activa
  const getSectionInfo = () => {
    if (pathname.includes("/calendar")) {
      return {
        name: "Calendario & Meet",
        icon: Calendar,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        suggestions: [
          "¿Cuántos inscriptos hay para el Lunes?",
          "Redactar invitación para el Google Meet oficial",
          "¿Dónde queda la oficina para las reuniones presenciales?"
        ]
      };
    }
    if (pathname.includes("/inbox")) {
      return {
        name: "Inbox Gmail",
        icon: Mail,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        suggestions: [
          "Redactar respuesta para un asesor interesado",
          "¿Cómo responder a un inversor sobre las tasas variables?",
          "Generar plantilla de bienvenida para Colaboratium"
        ]
      };
    }
    if (pathname.includes("/tickets")) {
      return {
        name: "Tickets Helpdesk",
        icon: Ticket,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        suggestions: [
          "¿Qué significa el estado 'pending_auth'?",
          "¿Cómo derivar un ticket a atención de admisiones?",
          "Redactar actualización de ticket para el directivo"
        ]
      };
    }
    if (pathname.includes("/crm")) {
      return {
        name: "Agenda CRM",
        icon: Users,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        suggestions: [
          "¿Cómo exportar contactos a formato VCF para celulares?",
          "Buscar ficha del asesor Juan Ramón Valle",
          "Explicar diferencia entre leads Carlos Gómez y Juan Ramírez"
        ]
      };
    }
    if (pathname.includes("/models")) {
      return {
        name: "Router Multi-IA",
        icon: Cpu,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        suggestions: [
          "¿Cuál es el modelo más rápido entre Groq y Ollama?",
          "¿Cómo se calculan los costos de tokens en USD?",
          "¿Cómo funciona la cascada de respaldo ante fallos?"
        ]
      };
    }
    if (pathname.includes("/automation") || pathname.includes("/flows")) {
      return {
        name: "Automatizaciones & RAG",
        icon: Workflow,
        color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
        suggestions: [
          "Explicar la escala de comisiones del Flujo A",
          "¿Cuáles son los guardarraíles obligatorios del BCRA 40.015?",
          "¿Cómo se conecta el formulario interactivo en WhatsApp?"
        ]
      };
    }
    return {
      name: "Dashboard General",
      icon: Sparkles,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      suggestions: [
        "Resumen del estado operativo de Colaboratium",
        "¿Cuáles son los 4 pilares de seguridad para inversores?",
        "¿Por qué es obligatorio el registro BCRA 40.015?"
      ]
    };
  };

  const sectionInfo = getSectionInfo();
  const SectionIcon = sectionInfo.icon;

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/copilot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          message: textToSend,
          context: {
            section: sectionInfo.name,
            pathname: pathname,
            history: messages.slice(-4)
          }
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Disculpa, no pude procesar la consulta en este instante. ¿Quieres intentar nuevamente?" }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión con el Copiloto IA. Verifica tu servidor backend." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Texto copiado al portapapeles");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "assistant",
        content: `Historial reiniciado. Estoy listo en la sección **${sectionInfo.name}**. ¿Qué necesitas consultar?`
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans pointer-events-auto">
      {/* Botón Flotante FAB (cuando está cerrado) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white shadow-2xl border border-white/20 hover:border-indigo-500/50 hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>Copiloto Routh</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-500/30 text-indigo-300 font-mono">IA</span>
            </div>
            <div className="text-[10px] text-gray-400 font-medium truncate max-w-[140px]">
              {sectionInfo.name}
            </div>
          </div>
        </button>
      )}

      {/* Ventana Flotante del Copiloto */}
      {isOpen && (
        <div
          className={`bg-gray-950/95 backdrop-blur-2xl border border-white/10 text-white rounded-3xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${
            isMinimized
              ? "w-80 h-16"
              : "w-[410px] sm:w-[440px] h-[580px] sm:h-[620px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-900 via-gray-950 to-black border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white tracking-tight">Copiloto Routh IA</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${sectionInfo.color}`}
                  >
                    <SectionIcon className="w-2.5 h-2.5" />
                    <span>{sectionInfo.name}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <button
                onClick={handleClearHistory}
                title="Limpiar conversación"
                className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expandir" : "Minimizar"}
                className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg transition"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar Copiloto"
                className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Sugerencias Rápidas de la Sección */}
              <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Sugerencias para {sectionInfo.name}</span>
                </div>
                <div className="flex gap-1.5 flex-nowrap pb-1">
                  {sectionInfo.suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      disabled={loading}
                      className="shrink-0 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/30 text-[11px] text-gray-300 hover:text-white transition whitespace-nowrap"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed de Conversación */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((msg, idx) => {
                  const isAssistant = msg.role === "assistant";
                  return (
                    <div
                      key={idx}
                      className={`flex gap-2.5 ${isAssistant ? "justify-start" : "justify-end"}`}
                    >
                      {isAssistant && (
                        <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`group relative max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                          isAssistant
                            ? "bg-white/[0.06] text-gray-200 border border-white/10 shadow-sm"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md"
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-sans text-[12px] break-words">
                          {msg.content}
                        </div>

                        {isAssistant && (
                          <button
                            onClick={() => handleCopy(msg.content, idx)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-black/40 hover:bg-black/60 text-gray-400 hover:text-white transition"
                            title="Copiar respuesta"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 text-indigo-400 text-xs py-2">
                    <div className="w-5 h-5 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 animate-spin" />
                    </div>
                    <span className="font-medium animate-pulse text-[11px]">
                      Consultando Router Multi-IA...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="p-3 bg-gray-900/60 border-t border-white/10 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Pregúntame sobre ${sectionInfo.name}...`}
                    disabled={loading}
                    className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputValue.trim()}
                    className="w-9 h-9 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white flex items-center justify-center shadow transition shrink-0 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
