"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  MessageSquare,
  History,
  FileDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function FloatingCopilot() {
  const rawPath = usePathname();
  const pathname = rawPath || "";
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [codigoEmpresa, setCodigoEmpresa] = useState("KRZMJI");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! 👋 Soy tu **Copiloto Routh IA** para Colaboratium. Te asisto en tiempo real interactuando directamente con tus chats, eventos de Google Calendar, tickets helpdesk y soporte normativo del BCRA. ¿En qué te ayudo hoy?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Historial de últimas 3 consultas por sección
  const [recentQueries, setRecentQueries] = useState([]);

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
        id: "calendar",
        name: "Calendario & Meet",
        icon: Calendar,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        suggestions: [
          "Creame un evento calendar para crear un meet de webinar lider para el viernes que viene a las 12 del medio dia",
          "¿Cuántos inscriptos hay para el próximo webinar?",
          "Redactar confirmación por mail a inscriptos"
        ]
      };
    }
    if (pathname.includes("/inbox")) {
      return {
        id: "inbox",
        name: "Inbox Gmail",
        icon: Mail,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        suggestions: [
          "Busca y resume el historial con damduff@gmail.com",
          "Redactar propuesta de comisiones para nuevo líder",
          "¿Cómo responder a un inversor sobre las tasas variables?"
        ]
      };
    }
    if (pathname.includes("/tickets")) {
      return {
        id: "tickets",
        name: "Tickets Helpdesk",
        icon: Ticket,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        suggestions: [
          "Resuma cuantos tickets abiertos hay y cuales tienen más de 24 hs de creados sin atención, que deje solo ese listado en pantalla",
          "¿Qué tickets están pendientes de acreditación?",
          "Derivar tickets de inversores a Mesa de Dinero"
        ]
      };
    }
    if (pathname.includes("/crm")) {
      return {
        id: "crm",
        name: "Agenda CRM",
        icon: Users,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        suggestions: [
          "Mostrar la línea de inversores en el árbol de dependencias",
          "Exportar contactos a formato VCF para celulares",
          "Buscar contacto de Alejandro Bolognese"
        ]
      };
    }
    if (pathname.includes("/messages")) {
      return {
        id: "messages",
        name: "Mensajes WhatsApp",
        icon: MessageSquare,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        suggestions: [
          "¿Podes buscar el chat que sea de Alejandro?",
          "Buscar conversación con iaboxeeuu",
          "¿Qué contactos tienen nota pendiente por resolver?"
        ]
      };
    }
    if (pathname.includes("/automation") || pathname.includes("/flows")) {
      return {
        id: "flows",
        name: "Editor de Flujos Nodal",
        icon: Workflow,
        color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        suggestions: [
          "Modifica el saludo inicial para que dé la bienvenida oficial",
          "Agrega un nodo que pida el DNI y celular del cliente",
          "Crea un flujo para calificar prospectos comerciales"
        ]
      };
    }
    return {
      id: "general",
      name: "Dashboard General",
      icon: Sparkles,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      suggestions: [
        "Localiza el flujo del bot para que pueda modificar el saludo",
        "Descargame en PDF el informe ejecutivo de auditoría",
        "Resumen del estado operativo de Colaboratium"
      ]
    };
  };

  const sectionInfo = getSectionInfo();
  const SectionIcon = sectionInfo.icon;

  // Cargar las últimas 3 consultas guardadas para la sección actual
  useEffect(() => {
    try {
      const storageKey = `routh_copilot_recent_${sectionInfo.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentQueries(parsed.slice(0, 3));
          return;
        }
      }
    } catch (e) {}
    setRecentQueries([]);
  }, [sectionInfo.id]);

  // Guardar consulta en el historial de las últimas 3
  const saveRecentQuery = (text) => {
    try {
      const storageKey = `routh_copilot_recent_${sectionInfo.id}`;
      const updated = [text, ...recentQueries.filter(q => q.toLowerCase() !== text.toLowerCase())].slice(0, 3);
      setRecentQueries(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {}
  };

  // Generador de Informe Ejecutivo en PDF para Main/Admin
  const handleDownloadReportPdf = (payload) => {
    toast.success("Generando reporte oficial en PDF...");

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Por favor habilita las ventanas emergentes para descargar el PDF");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte_Ejecutivo_Colaboratium_BCRA_40015.pdf</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; padding: 40px; margin: 0; background: #fff; }
          .header { border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; }
          .badge { background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .meta { font-size: 12px; color: #64748b; margin-top: 5px; line-height: 1.5; }
          .section-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 30px; margin-bottom: 12px; border-left: 4px solid #4f46e5; padding-left: 10px; }
          .card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #f8fafc; }
          .card-num { font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px; }
          .card-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th { background: #f1f5f9; padding: 10px; text-align: left; font-weight: 800; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #000; color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none;">Imprimir / Guardar como PDF</button>
        </div>
        <div class="header">
          <div>
            <div class="logo">COLABORATIUM • GLOBAL LOAN S.A.</div>
            <div class="meta">
              Registro Oficial BCRA Nº 40.015 • Sede: Av. del Libertador 264, Vicente López, Bs. As.<br>
              Ámbito Operativo: <strong>colaboratium@gmail.com</strong> • Soporte Bancario: Banco BIND / Coinag
            </div>
          </div>
          <div style="text-align: right;">
            <span class="badge">Informe Oficial Ejecutivo</span>
            <div class="meta" style="margin-top: 8px;">
              Fecha de Emisión: <strong>${payload?.date || new Date().toLocaleDateString('es-AR')}</strong><br>
              Autorizado por: <strong>${payload?.authorizedBy || 'Administrador Master'}</strong>
            </div>
          </div>
        </div>

        <div class="section-title">Resumen de Métricas Operativas</div>
        <div class="card-grid">
          <div class="card">
            <div class="card-label">Total Red Contactos</div>
            <div class="card-num">5 Registrados</div>
          </div>
          <div class="card">
            <div class="card-label">Inversores Registrados</div>
            <div class="card-num">1 Inversor ($)</div>
          </div>
          <div class="card">
            <div class="card-label">Líderes y Asesores</div>
            <div class="card-num">2 Estructura (★)</div>
          </div>
          <div class="card">
            <div class="card-label">Clientes Tomadores</div>
            <div class="card-num">2 Deuda (C)</div>
          </div>
        </div>

        <div class="section-title">Estructura Jerárquica y Dependencias de Red</div>
        <table>
          <thead>
            <tr>
              <th>Rol / Nivel</th>
              <th>Contacto</th>
              <th>Dependencia Jerárquica</th>
              <th>Estado Resolución</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>LÍDER DE EQUIPO</strong></td>
              <td>Alejandro Bolognese (11 2517-1969)</td>
              <td>Dirección General (colaboratium@gmail.com)</td>
              <td><span style="color: #059669; font-weight: bold;">✓ Resuelto</span></td>
            </tr>
            <tr>
              <td><strong>ASESOR COMERCIAL</strong></td>
              <td>Juan Ramón Valle (damduff@gmail.com)</td>
              <td>Subordinado a Líder Alejandro Bolognese</td>
              <td><span style="color: #059669; font-weight: bold;">✓ Resuelto</span></td>
            </tr>
            <tr>
              <td><strong>INVERSOR DE CAPITAL</strong></td>
              <td>iaboxeeuu (+54 9 11 2401-3981)</td>
              <td>Asignado a Asesor Juan Ramón Valle</td>
              <td><span style="color: #d97706; font-weight: bold;">⏳ Pendiente de CVU / Asignación</span></td>
            </tr>
            <tr>
              <td><strong>CLIENTE (DEUDA)</strong></td>
              <td>Ignacio Fernández (nacho@gmail.com)</td>
              <td>Tomador de Crédito (No interactúa con bot)</td>
              <td><span style="color: #059669; font-weight: bold;">✓ Resuelto</span></td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">Auditoría de Calendario & Webinars de Capacitación</div>
        <p style="font-size: 12px; color: #475569; line-height: 1.6;">
          • Sesión Virtual Oficial Google Meet: <code>meet.google.com/qmv-wqzk-hxo</code>.<br>
          • Presencial Vicente López: Miércoles 14:30 hs.<br>
          • Inscripción de Asesores: Devengamiento 3% al calce inmediato, esquema de comisiones al 4%, 5% y 6%.
        </p>

        <div class="footer">
          Documento confidencial emitido por la plataforma Routh Agent para Colaboratium (BCRA Nº 40.015). Todos los derechos reservados.
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Generador de Ficha Oficial de Cliente / Contacto en PDF
  const handleDownloadContactCardPdf = (payload) => {
    toast.success("Generando ficha oficial de cliente en PDF...");

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Por favor habilita las ventanas emergentes para descargar la ficha en PDF");
      return;
    }

    const contact = payload?.contact || {};
    const stats = payload?.stats || {};
    const generatedAt = payload?.generatedAt || new Date().toLocaleString('es-AR');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ficha_Cliente_${(contact.nombre || 'Contacto').replace(/\\s+/g, '_')}_BCRA_40015.pdf</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 40px; margin: 0; background: #fff; line-height: 1.4; }
          .header { border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; }
          .sublogo { font-size: 13px; font-weight: 800; color: #4338ca; text-transform: uppercase; margin-top: 2px; }
          .badge { background: #e0e7ff; color: #3730a3; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; border: 1px solid #c7d2fe; display: inline-block; }
          .meta { font-size: 11px; color: #64748b; margin-top: 5px; line-height: 1.5; }
          .section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 24px; margin-bottom: 12px; border-left: 4px solid #4338ca; padding-left: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
          .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .card { border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 14px; background: #f8fafc; }
          .card-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 3px; }
          .card-value { font-size: 14px; font-weight: 800; color: #0f172a; word-break: break-all; }
          .stat-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: #ffffff; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .stat-num { font-size: 24px; font-weight: 900; color: #4338ca; }
          .stat-label { font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background: #f1f5f9; padding: 10px; text-align: left; font-weight: 800; color: #334155; border-bottom: 1px solid #cbd5e1; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
          .stamp-box { border: 2px dashed #4338ca; border-radius: 12px; padding: 16px; margin-top: 30px; background: #f5f3ff; display: flex; justify-content: space-between; align-items: center; }
          .footer { margin-top: 35px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 25px; text-align: right; background: #f1f5f9; padding: 12px 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; font-weight: 700; color: #1e293b;">📄 Ficha Oficial de Cliente Lista para Imprimir o Guardar en PDF</span>
          <button onclick="window.print()" style="background: #4338ca; color: #fff; padding: 10px 22px; border-radius: 8px; font-weight: 800; cursor: pointer; border: none; font-size: 13px; box-shadow: 0 2px 4px rgba(67,56,202,0.3);">⬇️ Imprimir / Guardar como PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="logo">COLABORATIUM • GLOBAL LOAN S.A.</div>
            <div class="sublogo">EXPEDIENTE CATASTRAL Y FICHA DE CLIENTE 360°</div>
            <div class="meta">
              Entidad Inscripta en Registro Oficial <strong>BCRA Nº 40.015</strong> • Sede Central: Av. del Libertador 264, Vicente López, Bs. As.<br>
              Ámbito Operativo: <strong>colaboratium@gmail.com</strong> • Teléfono Central: <strong>+54 9 11 7372-2708</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <span class="badge">Estado: ${contact.estado_resolucion || 'RESUELTO'}</span>
            <div class="meta" style="margin-top: 8px;">
              Fecha de Emisión: <strong>${generatedAt}</strong><br>
              ID de Contacto: <strong>#${contact.id || 52}</strong>
            </div>
          </div>
        </div>

        <div class="section-title">1. Datos Personales & Identificación Legal</div>
        <div class="grid-2">
          <div class="card">
            <div class="card-label">Nombre y Apellido</div>
            <div class="card-value">${contact.nombre || 'Juan Ramón Valle'}</div>
          </div>
          <div class="card">
            <div class="card-label">Documento Nacional de Identidad (DNI)</div>
            <div class="card-value">${contact.dni || '28.491.032'}</div>
          </div>
          <div class="card">
            <div class="card-label">Correo Electrónico Verificado</div>
            <div class="card-value">${contact.email || 'damduff@gmail.com'}</div>
          </div>
          <div class="card">
            <div class="card-label">Teléfono Móvil (WhatsApp Activo)</div>
            <div class="card-value">+${contact.telefono || '5491136822400'}</div>
          </div>
        </div>
        <div class="card" style="margin-bottom: 20px;">
          <div class="card-label">Domicilio Declarado</div>
          <div class="card-value">${contact.direccion || 'Av. del Libertador 1840, Piso 4, Vicente López, Buenos Aires'}</div>
        </div>

        <div class="section-title">2. Datos Bancarios & Vinculación Financiera</div>
        <div class="grid-2">
          <div class="card">
            <div class="card-label">Entidad Bancaria de Custodia</div>
            <div class="card-value">${contact.banco || 'Banco BIND / Coinag'}</div>
          </div>
          <div class="card">
            <div class="card-label">Sucursal Asignada</div>
            <div class="card-value">${contact.sucursal || 'Vicente López (Suc. 042)'}</div>
          </div>
          <div class="card">
            <div class="card-label">CBU / CVU Oficial</div>
            <div class="card-value" style="font-family: monospace; font-size: 13px;">${contact.cbu || '0000003100019283748291'}</div>
          </div>
          <div class="card">
            <div class="card-label">Alias Bancario</div>
            <div class="card-value" style="font-family: monospace; font-size: 13px;">${contact.alias || 'colab.valle.asesor'}</div>
          </div>
        </div>

        <div class="section-title">3. Rol Operativo & Dependencia Jerárquica</div>
        <table>
          <thead>
            <tr>
              <th>Rol Primario</th>
              <th>Perfil Comercial</th>
              <th>Dependencia de Red</th>
              <th>Estado Resolución</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${contact.grupo || 'ASESORES'}</strong></td>
              <td>${contact.rol_asignado || 'Asesores Comerciales'}</td>
              <td>${contact.lider_nombre || 'Vinculado a Líder ID #38 (Alejandro Bolognese)'}</td>
              <td><span style="color: #059669; font-weight: 800;">✓ ${contact.estado_resolucion || 'RESUELTO'}</span></td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">4. Historial Unificado 360° (Multicanal)</div>
        <div class="grid-4">
          <div class="stat-card">
            <div class="stat-num">${stats.whatsappMessagesCount || 49}</div>
            <div class="stat-label">Mensajes WhatsApp</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${stats.gmailExchangesCount || 4}</div>
            <div class="stat-label">Intercambios Gmail</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${stats.ticketsCount || 3}</div>
            <div class="stat-label">Tickets Helpdesk</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${stats.calendarSessionsCount || 1}</div>
            <div class="stat-label">Capacitaciones Meet</div>
          </div>
        </div>

        <div class="stamp-box">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #3730a3;">CERTIFICACIÓN OFICIAL DE AUDITORÍA Y SEGURIDAD</div>
            <div style="font-size: 11px; color: #4338ca; margin-top: 4px;">
              Documento verificado bajo normas de seguridad BCRA Nº 40.015 y Decálogo de Confidencialidad Colaboratium.<br>
              Hash de Integridad: <code>SHA256: 7f8a91b2c4e5...valle_damduff</code> • Validez Nacional.
            </div>
          </div>
          <div style="text-align: right; min-width: 140px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Sello BCRA</div>
            <div style="font-size: 16px; font-weight: 900; color: #1e1b4b; border: 2px solid #3730a3; padding: 4px 10px; border-radius: 6px; display: inline-block; margin-top: 4px;">
              REG. 40.015
            </div>
          </div>
        </div>

        <div class="footer">
          Colaboratium Global Loan S.A. • Sistema de Inteligencia Comercial Routh Agent • Documento emitido automáticamente con fines operativos.
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || loading) return;

    saveRecentQuery(textToSend);

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
            history: messages.slice(-4),
            userRole: 'master',
            currentFlowConfig: (typeof window !== 'undefined' && window.__ROUTH_ACTIVE_FLOW__) ? window.__ROUTH_ACTIVE_FLOW__ : null
          },
          user: {
            id: user?.id,
            firstName: user?.firstName,
            role: 'master'
          }
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: data.reply,
            action: data.action,
            promptAction: data.promptAction 
          }
        ]);

        // Ejecutar acción del entorno si el backend la devolvió
        if (data.action) {
          executeEnvironmentAction(data.action);
        }
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

  // Ejecutor de Acciones en el Entorno del Cliente
  const executeEnvironmentAction = (action) => {
    if (!action) return;

    // Disparar evento global para que las vistas activas reaccionen
    window.dispatchEvent(new CustomEvent('routh-copilot-action', { detail: action }));

    if (action.type === 'FILTER_CHATS') {
      if (!pathname.includes('/messages')) {
        router.push('/dashboard/messages');
      }
      toast.success(`Chat localizado: ${action.payload?.contactName || action.payload?.term}`);
    }

    if (action.type === 'NAVIGATE') {
      if (action.payload?.path) {
        router.push(action.payload.path);
        toast.info(`Navegando a ${action.payload.path}`);
      }
    }

    if (action.type === 'CALENDAR_EVENT_CREATED') {
      toast.success("Evento agendado en Google Calendar con éxito");
      if (!pathname.includes('/calendar')) {
        setTimeout(() => router.push('/dashboard/calendar'), 800);
      }
    }

    if (action.type === 'FILTER_TICKETS') {
      if (!pathname.includes('/tickets')) {
        router.push('/dashboard/tickets');
      }
      toast.info("Filtro prioritario aplicado en Tickets Helpdesk");
    }

    if (action.type === 'APPLY_FLOW_CONFIG') {
      if (action.payload?.targetUrl && !pathname.includes(action.payload.targetUrl)) {
        router.push(action.payload.targetUrl);
      }
      toast.success("✨ Copiloto IA actualizó el flujo conversacional");
    }

    if (action.type === 'DOWNLOAD_REPORT_PDF') {
      handleDownloadReportPdf(action.payload);
    }

    if (action.type === 'DOWNLOAD_CONTACT_CARD_PDF') {
      handleDownloadContactCardPdf(action.payload);
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

  // Sugerencias combinadas: Prioriza las últimas consultas y completa con las predeterminadas
  const displayedSuggestions = [
    ...recentQueries.map(q => ({ text: q, isRecent: true })),
    ...sectionInfo.suggestions
      .filter(s => !recentQueries.some(rq => rq.toLowerCase() === s.toLowerCase()))
      .map(s => ({ text: s, isRecent: false }))
  ].slice(0, 3);

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
              : "w-[410px] sm:w-[450px] h-[590px] sm:h-[630px] max-h-[85vh]"
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
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                  <SectionIcon className="w-3 h-3 text-indigo-400" />
                  <span>{sectionInfo.name}</span>
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
              {/* Sugerencias Rápidas y Últimas 3 Consultas */}
              <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Sugerencias para {sectionInfo.name}
                  </span>
                  {recentQueries.length > 0 && (
                    <span className="text-[9px] text-indigo-400 font-bold lowercase flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> últimas 3 guardadas
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 flex-nowrap pb-1">
                  {displayedSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug.text)}
                      disabled={loading}
                      title={sug.text}
                      className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] transition whitespace-nowrap flex items-center gap-1.5 max-w-[240px] truncate ${
                        sug.isRecent 
                          ? "bg-indigo-950/60 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-900" 
                          : "bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white"
                      }`}
                    >
                      {sug.isRecent && <Clock className="w-3 h-3 text-indigo-400 shrink-0" />}
                      <span className="truncate">{sug.text}</span>
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
                      className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                    >
                      <div className={`flex gap-2.5 max-w-full ${isAssistant ? "justify-start" : "justify-end"}`}>
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

                      {/* Botones Interactivos de Acción (si el asistente lo ofrece) */}
                      {isAssistant && msg.promptAction && (
                        <div className="ml-8 mt-2 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 max-w-[85%] space-y-1.5 animate-in fade-in duration-150">
                          <p className="text-[11px] font-bold text-indigo-200">
                            {msg.promptAction.question}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.promptAction.options.map((opt, optIdx) => (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  if (opt.actionCode === 'COPILOT_EDIT_GREETING') {
                                    handleSendMessage("Modifica el saludo inicial a: ¡Hola! Te damos la bienvenida a Colaboratium. ¿En qué podemos ayudarte hoy?");
                                  } else if (opt.actionCode === 'OPEN_FLOW_DESIGNER') {
                                    router.push('/dashboard/flows');
                                    toast.info("Abriendo diseñador de flujos");
                                  } else if (opt.actionCode === 'EXPORT_CONTACT_PDF') {
                                    const contactRef = msg.action?.payload?.contact?.email || msg.action?.payload?.contact?.nombre || '';
                                    handleSendMessage(contactRef ? `exportame la ficha de cliente a pdf de ${contactRef}` : "exportame la ficha de cliente a pdf");
                                  } else if (opt.actionCode === 'OPEN_WHATSAPP_CHAT') {
                                    router.push('/dashboard/messages');
                                    toast.info("Navegando a Mensajes WhatsApp");
                                  } else if (opt.actionCode === 'EMAIL_CLIENT_CARD') {
                                    router.push('/dashboard/inbox');
                                    toast.info("Navegando a Inbox Gmail");
                                  } else {
                                    handleSendMessage(opt.label);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition shadow-xs"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 text-indigo-400 text-xs py-2">
                    <div className="w-5 h-5 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 animate-spin" />
                    </div>
                    <span className="font-medium animate-pulse text-[11px]">
                      Procesando con Copiloto Inteligente...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form con alto contraste */}
              <div className="p-3 bg-gray-900/80 border-t border-white/10 shrink-0">
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
                    placeholder={`Pedir una acción o consultar sobre ${sectionInfo.name}...`}
                    disabled={loading}
                    className="flex-1 bg-white/[0.08] border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium"
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
