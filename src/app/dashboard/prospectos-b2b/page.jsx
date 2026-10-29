"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import { API_URL } from '@/config/api';
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MessageSquare, 
  Crown, 
  UserCheck, 
  Ban, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  FileSpreadsheet, 
  FileText, 
  Clock, 
  ShieldAlert, 
  AlertTriangle,
  Play,
  Layers,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProspectosB2BPage() {
  const { user, isLoaded } = useUser();
  const [prospects, setProspects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    total: 0,
    with_email: 0,
    with_whatsapp: 0,
    leaders_count: 0,
    advisors_count: 0,
    opt_out_count: 0,
    gmail_exported_count: 0,
    converted_count: 0
  });

  // Filtros
  const [search, setSearch] = useState('');
  const [filterLayer, setFilterLayer] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 40;

  // Modales
  const [showGmailBatchModal, setShowGmailBatchModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScraperModal, setShowScraperModal] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState('asesor'); // 'asesor' | 'broker'

  // Parámetros de Generación de Lote Gmail
  const [batchOptions, setBatchOptions] = useState({
    maxPerDomain: 40,
    totalBatchSize: 40,
    targetRole: 'ALL',
    webinarDate: 'Lunes 3 de Noviembre',
    webinarTime: '10:00',
    webinarTitle: 'Reunión Informativa Red de Asesores Independientes',
    bookingLink: 'https://consola.colaboratium.com.ar/reservar',
    optOutBaseUrl: 'https://consola.colaboratium.com.ar/b2b/baja',
    syncToAgenda: true
  });
  const [generatingBatch, setGeneratingBatch] = useState(false);

  // Parámetros de Importación Manual
  const [importText, setImportText] = useState('');
  const [importLayer, setImportLayer] = useState('CAPA_1_REMAX');
  const [importing, setImporting] = useState(false);

  // Scraper en ejecución
  const [scraping, setScraping] = useState(false);

  // Cargar KPIs
  const fetchKPIs = async () => {
    try {
      const res = await fetch(`${API_URL}/b2b-prospects/kpis?codigoEmpresa=KRZMJI`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success && data.kpis) {
        setKpis(data.kpis);
      }
    } catch (e) {
      console.error('Error fetching KPIs:', e);
    }
  };

  // Cargar Prospectos con filtros
  const fetchProspects = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        codigoEmpresa: 'KRZMJI',
        limit: String(limit),
        offset: String(offset)
      });
      if (search.trim()) params.append('search', search.trim());
      if (filterLayer !== 'ALL') params.append('layer', filterLayer);
      if (filterRole !== 'ALL') params.append('role', filterRole);
      if (filterStatus !== 'ALL') params.append('status', filterStatus);

      const res = await fetch(`${API_URL}/b2b-prospects?${params.toString()}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        setProspects(data.prospects || []);
        setTotalCount(data.total || 0);
      }
    } catch (e) {
      console.error('Error fetching prospects:', e);
      toast.error('Error cargando prospectos B2B');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [page, filterLayer, filterRole, filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProspects();
  };

  // Convertir en Asesor Activo
  const handleConvertToAdvisor = async (prospect) => {
    if (!confirm(`¿Confirmás convertir a "${prospect.first_name} ${prospect.last_name}" en Asesor Activo del CRM?`)) return;
    try {
      const res = await fetch(`${API_URL}/b2b-prospects/${prospect.id}/convert-to-advisor`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ codigoEmpresa: 'KRZMJI' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchKPIs();
        fetchProspects();
      } else {
        toast.error(data.message || 'Error en la conversión');
      }
    } catch (e) {
      toast.error('Error conectando al servidor');
    }
  };

  // Marcar Baja (Opt-Out)
  const handleOptOut = async (prospect) => {
    if (!confirm(`¿Dar de baja a ${prospect.first_name} ${prospect.last_name} (${prospect.email}) conforme a Ley 25.326?`)) return;
    try {
      const res = await fetch(`${API_URL}/b2b-prospects/${prospect.id}/opt-out`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ email: prospect.email, codigoEmpresa: 'KRZMJI' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Prospecto dado de baja y bloqueado permanentemente');
        fetchKPIs();
        fetchProspects();
      }
    } catch(e) {
      toast.error('Error procesando baja');
    }
  };

  // Descargar CSV de Lote Seguro para Gmail
  const handleGenerateGmailBatch = async () => {
    setGeneratingBatch(true);
    try {
      const res = await fetch(`${API_URL}/b2b-prospects/export-gmail-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          ...batchOptions,
          codigoEmpresa: 'KRZMJI'
        })
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || 'No se pudo generar el lote');
        setGeneratingBatch(false);
        return;
      }

      // Descargar archivo CSV
      const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Lote_Gmail_B2B_${today}_${data.count}_contactos.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`¡Lote generado con éxito! ${data.count} prospectos exportados con throttling anti-spam.`);
      setShowGmailBatchModal(false);
      fetchKPIs();
      fetchProspects();
    } catch (e) {
      console.error(e);
      toast.error('Error al generar lote');
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Importar CSV Manual
  const handleManualImport = async () => {
    if (!importText.trim()) {
      toast.error('Por favor ingresa o pega el contenido CSV / texto');
      return;
    }
    setImporting(true);
    try {
      // Parsear líneas simples o CSV delimitado por comas/tabuladores
      const lines = importText.split('\n').filter(l => l.trim().length > 0);
      const items = [];

      for (const line of lines) {
        const parts = line.split(/[,\t;|]/).map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          items.push({
            full_name: parts[0] || '',
            email: parts.find(p => p.includes('@')) || null,
            phone: parts.find(p => /\d{7,}/.test(p.replace(/\D/g, ''))) || null,
            office_name: parts[2] || parts[1] || 'Oficina Inmobiliaria',
            city: parts[3] || 'Argentina',
            role: parts.find(p => /broker|lider|asesor|agente|martillero/i.test(p)) || 'Asesor'
          });
        }
      }

      if (items.length === 0) {
        toast.error('No se pudieron detectar filas válidas en el texto.');
        setImporting(false);
        return;
      }

      const res = await fetch(`${API_URL}/b2b-prospects/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          items,
          sourceLayer: importLayer,
          codigoEmpresa: 'KRZMJI'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Importación completada: ${data.inserted} nuevos, ${data.updated} actualizados.`);
        setShowImportModal(false);
        setImportText('');
        fetchKPIs();
        fetchProspects();
      }
    } catch (e) {
      toast.error('Error procesando importación');
    } finally {
      setImporting(false);
    }
  };

  // Ejecutar Scraper / Conector
  const handleRunScraper = async (layer) => {
    setScraping(true);
    try {
      const res = await fetch(`${API_URL}/b2b-prospects/run-scraper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ layer })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowScraperModal(false);
        fetchKPIs();
        fetchProspects();
      } else {
        toast.error('Error al ejecutar conector');
      }
    } catch(e) {
      toast.error('Error de conexión');
    } finally {
      setScraping(false);
    }
  };

  const copyToClipboard = (text, label = 'Copiado') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} al portapapeles`);
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Plantillas Cold Email Textos
  const TEMPLATE_A = {
    title: 'Plantilla A • Asesor Inmobiliario (Flujo 2)',
    subject: '[PUBLICIDAD] Alianza para tu cartera de clientes en {{Office}}, {{First Name}} (BCRA Nº 40.015)',
    body: `Hola {{First Name}}, ¿cómo estás?

Vi tu perfil público en el equipo de {{Office}} en {{City}} y te escribo porque en Colaboratium (Global Loan S.A. — Registro BCRA Nº 40.015) estamos incorporando agentes inmobiliarios con cartera activa a nuestra Red de Asesores Independientes.

Sabemos que en la operatoria inmobiliaria hablás todas las semanas con clientes que acaban de vender, que están esperando cerrar una operación o que tienen excedentes de liquidez y buscan una renta superadora al plazo fijo tradicional sin inmovilizar su capital a largo plazo.

¿Cómo funciona la alianza para vos y para tu cliente?

Para tu cliente inversor (Costo 0%): Invierte desde una plataforma 100% bancarizada (Banco BIND y Banco Coinag) operando desde su propio CVU, financiando créditos atomizados que pasan por un motor de Inteligencia Artificial que filtra solo entre el 5% y el 15% de los mejores perfiles crediticios (validando BCRA, Renaper, Nosis, Veraz y UIF). Al inversor jamás se le cobra comisión ni gasto administrativo (todo el costo lo absorbe el tomador del crédito).

Para vos como Asesor (Esquema similar a RE/MAX): Ya conocés la modalidad de agencia independiente. Por cada inversor que vincules con tu link propio desde nuestra consola, percibís comisiones directas del 4% (plazo 3 meses), 5% (6 meses) y 6% (12 meses) sobre el capital colocado, cobrando un 3% de forma inmediata al calce del crédito y el resto con las cuotas, más el 100% de comisión en cada reinversión futura de tu cliente. Además, podés recibir inversores captados por las campañas de marketing de Colaboratium.

Este {{1}} a las {{2}} hs vamos a dar una reunión informativa online de {{3}} exclusiva para profesionales independientes, donde mostramos la consola en vivo, la escala de comisiones y el respaldo normativo del BCRA.

👉 Podés reservar tu lugar sin costo acá: {{4}}

Si preferís conocer nuestras oficinas comerciales personalmente, estamos en Av. del Libertador 264, 1° Piso Contrafrente, Vicente López (podés responderme este correo o escribirme por WhatsApp y coordinamos un café de 15 minutos).

Te mando un cordial saludo,

Lic. Damián Feuermann
Presidente | Global Loan S.A. — Colaboratium
Registro BCRA PNFC Nº 40.015 (Verificable en bcra.gob.ar)
Av. del Libertador 264, 1° Piso, Vicente López / Maipú 568, Piso 8°, CABA

Aviso Legal (Ley 25.326 y Disp. DNPDP 4/2009): Te contactamos únicamente porque tu correo profesional figura publicado como contacto comercial en el directorio público de tu red en {{City}}. Según el Art. 27 de la Ley 25.326 y el Decreto 1558/2001, tenés derecho de acceso gratuito y de solicitar el retiro o bloqueo total de tu nombre y correo de nuestra base en cualquier momento haciendo clic en [este enlace de baja inmediata ({{5}})] o respondiendo este correo con la palabra "BAJA".`
  };

  const TEMPLATE_B = {
    title: 'Plantilla B • Broker / Martillero Responsable (Flujo 3: Nodo + 10% Overriding)',
    subject: '[PUBLICIDAD] Unidad de negocio adicional para tu equipo en {{Office}}, {{First Name}} (BCRA Nº 40.015)',
    body: `Hola {{First Name}}, ¿cómo estás?

Te contacto como Broker / Responsable de {{Office}} porque en Colaboratium (Global Loan S.A. — Primera plataforma Fintech de créditos entre particulares registrada en el BCRA bajo el Nº 40.015) estamos habilitando nodos de Líderes de Equipo para directores de oficinas inmobiliarias y redes comerciales.

Sabemos que ya liderás un equipo de agentes que trabajan bajo el modelo de contrato independiente. Nuestra propuesta te permite sumar una unidad de ingresos recurrentes para tu oficina, sin ningún costo para los clientes inversores de tu cartera:

Consola Jerárquica Propia (consola.colaboratium.com.ar): Dás de alta a los agentes de tu equipo bajo tu propio nodo. Ellos cobran entre el 4% y el 6% de comisión por ofrecer alternativas de inversión en pesos (100% bancarizadas vía BIND/Coinag y filtradas por IA) a sus clientes con liquidez.

10% de Overriding para vos como Líder: Percibís un 10% adicional sobre la bolsa total de comisiones que generen todos los agentes de tu equipo (sin descontárselo a ellos).

Derivación de Inversores del Marketing Central de Colaboratium: Los inversores que entran por la publicidad propia de Colaboratium se asignan a nuestros Líderes de Equipo para que vos o tus agentes gestionen su cartera y cobren las cuotas residuales y el 100% de cada reinversión futura.

Me gustaría invitarte este {{1}} a las {{2}} hs a nuestra presentación ejecutiva online de {{3}} (registrate sin cargo en {{4}}), o bien coordinar una reunión privada 1 a 1 por Zoom o en nuestras oficinas de Av. del Libertador 264, 1° Piso, Vicente López.

¿Te queda cómodo que coordinemos una breve llamada esta semana o preferís sumarte a la sesión del {{1}}?

Un cordial saludo,

Lic. Damián Feuermann
Presidente | Global Loan S.A. — Colaboratium
Registro BCRA PNFC Nº 40.015

Aviso Legal (Ley 25.326 y Disp. DNPDP 4/2009): Tus datos fueron relevados de tu perfil público profesional en el directorio de {{Office}}. Conforme al Art. 27 de la Ley 25.326, podés ejercer sin cargo tu derecho de acceso, retiro o bloqueo inmediato de nuestra base haciendo clic en [Darme de baja ({{5}})] o respondiendo con la palabra "BAJA".`
  };

  return (
    <div className="flex h-screen bg-[#141313] text-[#FEFEFE] font-sans overflow-hidden">
      <Sidebar />
      <Panel>
        <Header />

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Top Banner / Title Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#A28444]/20 text-[#D4AF37] border border-[#A28444]/40 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  Acceso Exclusivo Administración • Capas 1 & 2
                </span>
                <span className="text-xs text-neutral-400 font-mono">Ley 25.326 & Disp. DNPDP 4/2009</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <Building2 className="w-7 h-7 text-[#D4AF37]" />
                Motor de Extracción y Base de Prospectos B2B
              </h1>
              <p className="text-xs text-neutral-400 max-w-3xl mt-1 leading-relaxed">
                Relevamiento lícito de directores, brokers y agentes inmobiliarios (RE/MAX & Padrones Oficiales). Estandarización telefónica E.164, clasificación automática hacia los flujos del Bot y exportación en lotes seguros con Throttling anti-spam para Gmail.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowGmailBatchModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#A28444] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#A28444]/20 flex items-center gap-2 transition-all transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Generar Lote Gmail (CSV)</span>
              </button>

              <button
                onClick={() => setShowTemplatesModal(true)}
                className="px-3.5 py-2.5 bg-[#232121] hover:bg-[#2c2929] border border-[#A28444]/40 text-[#D4AF37] font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Plantillas Cold Email</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2.5 bg-[#232121] hover:bg-[#2c2929] border border-white/10 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4 text-neutral-400" />
                <span>Importar CSV</span>
              </button>

              <button
                onClick={() => setShowScraperModal(true)}
                className="px-3.5 py-2.5 bg-[#232121] hover:bg-[#2c2929] border border-white/10 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Ejecutar Scraper</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Card 1: Total */}
            <div className="p-4 bg-[#1b1a1a] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-[#A28444]/40 transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1">
                <span>Total Relevados</span>
                <Users className="w-4 h-4 text-neutral-500" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{kpis.total}</p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A28444]" />
                <span>Capas 1 a 5 consolidadas</span>
              </div>
            </div>

            {/* Card 2: Email Válido */}
            <div className="p-4 bg-[#1b1a1a] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-[#A28444]/40 transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1">
                <span>Con Email Válido</span>
                <Mail className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-black text-sky-400 font-mono">{kpis.with_email}</p>
              <div className="mt-1 text-[10px] text-neutral-500">
                {kpis.total > 0 ? `${Math.round((kpis.with_email / kpis.total) * 100)}% de cobertura` : '0%'}
              </div>
            </div>

            {/* Card 3: WhatsApp E.164 */}
            <div className="p-4 bg-[#1b1a1a] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-[#A28444]/40 transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1">
                <span>WhatsApp E.164</span>
                <Phone className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono">{kpis.with_whatsapp}</p>
              <div className="mt-1 text-[10px] text-emerald-500/80 font-medium">
                Listo para Bot v3.0 (+549)
              </div>
            </div>

            {/* Card 4: Líderes / Brokers */}
            <div className="p-4 bg-[#1b1a1a] border border-[#A28444]/20 rounded-2xl relative overflow-hidden group hover:border-[#A28444]/60 transition-all bg-gradient-to-br from-[#1b1a1a] to-[#25221b]">
              <div className="flex items-center justify-between text-[#D4AF37] text-xs font-bold mb-1">
                <span>Líderes / Brokers</span>
                <Crown className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-black text-[#D4AF37] font-mono">{kpis.leaders_count}</p>
              <div className="mt-1 text-[10px] text-amber-300/80 font-semibold">
                Flujo 3: Nodo + 10%
              </div>
            </div>

            {/* Card 5: Asesores */}
            <div className="p-4 bg-[#1b1a1a] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1">
                <span>Asesores Potenciales</span>
                <UserCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-indigo-400 font-mono">{kpis.advisors_count}</p>
              <div className="mt-1 text-[10px] text-neutral-500">
                Flujo 2: Comisiones 4-6%
              </div>
            </div>

            {/* Card 6: Bajas Opt-Out */}
            <div className="p-4 bg-[#1b1a1a] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1">
                <span>Bajas (Opt-Out)</span>
                <Ban className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-rose-400 font-mono">{kpis.opt_out_count}</p>
              <div className="mt-1 text-[10px] text-rose-400/80">
                Bloqueados por Ley
              </div>
            </div>
          </div>

          {/* Operational Filters Bar */}
          <div className="p-4 bg-[#1b1a1a] border border-white/10 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email, oficina o ciudad..."
                className="w-full bg-[#121111] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#A28444]"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Filtro Capa */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Capa:</span>
                <select
                  value={filterLayer}
                  onChange={(e) => { setFilterLayer(e.target.value); setPage(1); }}
                  className="bg-[#121111] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#A28444]"
                >
                  <option value="ALL">Todas las Capas</option>
                  <option value="CAPA_1_REMAX">Capa 1: RE/MAX Argentina</option>
                  <option value="CAPA_2_PADRONES_CORREDORES">Capa 2: Padrones Corredores</option>
                  <option value="CAPA_3_PREVISIONALISTAS">Capa 3: Previsionalistas</option>
                  <option value="CAPA_5_PAS">Capa 5: Productores Seguros</option>
                </select>
              </div>

              {/* Filtro Rol */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Rol:</span>
                <select
                  value={filterRole}
                  onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                  className="bg-[#121111] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#A28444]"
                >
                  <option value="ALL">Todos los Roles</option>
                  <option value="LIDER_BROKER_POTENCIAL">Líder / Broker (Flujo 3)</option>
                  <option value="ASESOR_POTENCIAL">Asesor Potencial (Flujo 2)</option>
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Estado:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  className="bg-[#121111] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#A28444]"
                >
                  <option value="ALL">Todos los Estados</option>
                  <option value="NUEVO">NUEVO</option>
                  <option value="LOTE_GMAIL_EXPORTADO">Lote Gmail Exportado</option>
                  <option value="CONVERTIDO_ASESOR">Convertido en Asesor</option>
                  <option value="OPT_OUT_BAJA">Baja (Opt-Out)</option>
                </select>
              </div>

              <button
                onClick={() => { setPage(1); fetchProspects(); fetchKPIs(); }}
                className="p-2 bg-[#232121] hover:bg-[#2a2828] border border-white/10 rounded-xl text-neutral-300 hover:text-white transition-all"
                title="Refrescar lista"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-[#1b1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-[#141313] text-[10px] uppercase font-bold text-neutral-400 border-b border-white/10 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Prospecto / Organización</th>
                    <th className="py-3.5 px-4">Clasificación / Flujo Bot</th>
                    <th className="py-3.5 px-4">Email Institucional</th>
                    <th className="py-3.5 px-4">WhatsApp (E.164)</th>
                    <th className="py-3.5 px-4">Oficina & Ubicación</th>
                    <th className="py-3.5 px-4">Fuente (Trazabilidad)</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-neutral-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#A28444]" />
                        <span>Cargando prospectos B2B...</span>
                      </td>
                    </tr>
                  ) : prospects.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-neutral-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-neutral-400">No se encontraron prospectos con los filtros seleccionados</p>
                        <p className="text-[11px] mt-1 text-neutral-600">Prueba ajustando los criterios de búsqueda o ejecuta el Scraper.</p>
                      </td>
                    </tr>
                  ) : (
                    prospects.map((p) => {
                      const isLeader = p.detected_role === 'LIDER_BROKER_POTENCIAL';
                      const isOptOut = p.campaign_status === 'OPT_OUT_BAJA';
                      const isConverted = p.campaign_status === 'CONVERTIDO_ASESOR';

                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Prospect Name & Office */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isLeader 
                                  ? 'bg-[#A28444]/20 text-[#D4AF37] border border-[#A28444]/30' 
                                  : 'bg-neutral-800 text-neutral-300 border border-white/5'
                              }`}>
                                {isLeader ? <Crown className="w-4 h-4 text-[#D4AF37]" /> : <Building2 className="w-4 h-4 text-neutral-400" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate max-w-[200px]">
                                  {p.first_name} {p.last_name}
                                </p>
                                <p className="text-[10px] text-neutral-500 truncate max-w-[200px]">
                                  {p.office_name || p.company_or_board}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Classification & Bot Flow */}
                          <td className="py-3.5 px-4">
                            {isLeader ? (
                              <div className="inline-flex flex-col gap-0.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#A28444]/20 text-[#D4AF37] border border-[#A28444]/40 w-fit">
                                  👑 Líder / Broker
                                </span>
                                <span className="text-[9px] text-[#A28444] font-mono">FLOW_3_LIDERES (10% Over.)</span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col gap-0.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 w-fit">
                                  👤 Asesor Potencial
                                </span>
                                <span className="text-[9px] text-neutral-500 font-mono">FLOW_2_ASESORES (4-6%)</span>
                              </div>
                            )}
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4">
                            {p.email ? (
                              <div className="flex items-center gap-1.5 group/mail">
                                <span className="font-mono text-neutral-300 truncate max-w-[180px]">{p.email}</span>
                                <button
                                  onClick={() => copyToClipboard(p.email, 'Email')}
                                  className="opacity-0 group-hover/mail:opacity-100 p-1 hover:text-white text-neutral-500 transition-opacity"
                                  title="Copiar email"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-neutral-600 italic text-[11px]">No relevado</span>
                            )}
                          </td>

                          {/* WhatsApp E.164 */}
                          <td className="py-3.5 px-4">
                            {p.phone_e164 ? (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`https://wa.me/${p.phone_e164.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                                  title="Abrir WhatsApp directo"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{p.phone_e164}</span>
                                </a>
                              </div>
                            ) : p.phone_raw ? (
                              <span className="font-mono text-neutral-400 text-[11px]">{p.phone_raw}</span>
                            ) : (
                              <span className="text-neutral-600 italic text-[11px]">Sin teléfono</span>
                            )}
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-neutral-300 truncate max-w-[150px]">{p.city || 'Argentina'}</p>
                            <p className="text-[10px] text-neutral-500">{p.province || ''}</p>
                          </td>

                          {/* Source & Traceability */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-neutral-800 text-neutral-400 border border-white/5">
                                {p.source_layer.replace('CAPA_', 'C')}
                              </span>
                              {p.source_url && (
                                <a
                                  href={p.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-neutral-500 hover:text-[#D4AF37] transition-colors"
                                  title={`Ver fuente oficial: ${p.source_url}`}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {isOptOut ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                Baja Opt-Out
                              </span>
                            ) : isConverted ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Convertido
                              </span>
                            ) : p.campaign_status === 'LOTE_GMAIL_EXPORTADO' ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                Lote Gmail
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-medium uppercase bg-neutral-800 text-neutral-400">
                                Nuevo
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isConverted && !isOptOut && (
                                <button
                                  onClick={() => handleConvertToAdvisor(p)}
                                  className="px-2 py-1 bg-[#232121] hover:bg-[#A28444]/20 hover:text-[#D4AF37] border border-white/10 hover:border-[#A28444]/40 rounded-lg text-[10px] font-bold transition-all"
                                  title="Convertir en Asesor Activo del CRM"
                                >
                                  Convertir
                                </button>
                              )}

                              {!isOptOut && (
                                <button
                                  onClick={() => handleOptOut(p)}
                                  className="p-1 hover:text-rose-400 text-neutral-600 transition-colors"
                                  title="Marcar Baja Ley 25.326"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 bg-[#141313] border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
              <span>
                Mostrando <strong className="text-white">{prospects.length}</strong> de <strong className="text-white">{totalCount}</strong> prospectos B2B
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1.5 bg-[#232121] hover:bg-[#2c2929] disabled:opacity-30 rounded-lg text-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-neutral-300">
                  Página {page} de {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 bg-[#232121] hover:bg-[#2c2929] disabled:opacity-30 rounded-lg text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* MODAL 1: GENERADOR DE LOTE SEGURO PARA GMAIL (THROTTLING ANTI-SPAM) */}
        {showGmailBatchModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1b1a1a] border border-[#A28444]/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowGmailBatchModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#A28444]/20 border border-[#A28444]/40 flex items-center justify-center text-[#D4AF37]">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Generar Lote Diario para Gmail (CSV)</h3>
                  <p className="text-xs text-neutral-400">Protección Anti-Spam • Throttling Máx. 40 por dominio</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-[#141313] border border-amber-500/20 rounded-xl space-y-1 text-amber-200/90 text-[11px]">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Regla de Protección de Entregabilidad:
                  </p>
                  <p>
                    Para cuentas <code>@remax.com.ar</code>, la exportación se limita a un máximo de <strong>40 contactos por tanda diaria</strong> y mezcla distintas oficinas y ciudades para no disparar alertas de Google Workspace.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                      Fecha del Webinar ({`{{1}}`})
                    </label>
                    <input
                      type="text"
                      value={batchOptions.webinarDate}
                      onChange={(e) => setBatchOptions({ ...batchOptions, webinarDate: e.target.value })}
                      className="w-full bg-[#121111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A28444]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                      Horario ({`{{2}}`})
                    </label>
                    <input
                      type="text"
                      value={batchOptions.webinarTime}
                      onChange={(e) => setBatchOptions({ ...batchOptions, webinarTime: e.target.value })}
                      className="w-full bg-[#121111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A28444]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Título de la Reunión ({`{{3}}`})
                  </label>
                  <input
                    type="text"
                    value={batchOptions.webinarTitle}
                    onChange={(e) => setBatchOptions({ ...batchOptions, webinarTitle: e.target.value })}
                    className="w-full bg-[#121111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A28444]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Link de Reserva ({`{{4}}`})
                  </label>
                  <input
                    type="text"
                    value={batchOptions.bookingLink}
                    onChange={(e) => setBatchOptions({ ...batchOptions, bookingLink: e.target.value })}
                    className="w-full bg-[#121111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A28444]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                      Destinatarios a Filtrar
                    </label>
                    <select
                      value={batchOptions.targetRole}
                      onChange={(e) => setBatchOptions({ ...batchOptions, targetRole: e.target.value })}
                      className="w-full bg-[#121111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A28444]"
                    >
                      <option value="ALL">Todos (Asesores & Líderes)</option>
                      <option value="ASESOR_POTENCIAL">Solo Asesores Potenciales</option>
                      <option value="LIDER_BROKER_POTENCIAL">Solo Brokers / Líderes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                      Tamaño Máx. del Lote
                    </label>
                    <input
                      type="number"
                      max={100}
                      value={batchOptions.totalBatchSize}
                      onChange={(e) => setBatchOptions({ ...batchOptions, totalBatchSize: parseInt(e.target.value, 10) || 40 })}
                      className="w-full bg-[#121111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A28444]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="syncAgenda"
                    checked={batchOptions.syncToAgenda}
                    onChange={(e) => setBatchOptions({ ...batchOptions, syncToAgenda: e.target.checked })}
                    className="rounded bg-[#121111] border-white/20 text-[#A28444] focus:ring-0"
                  />
                  <label htmlFor="syncAgenda" className="text-neutral-300 text-[11px] cursor-pointer">
                    Sincronizar contactos automáticamente en la <strong>Agenda CRM</strong> (Grupo: PROSPECTO ASESORES)
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setShowGmailBatchModal(false)}
                  className="px-4 py-2 bg-[#232121] hover:bg-[#2c2929] text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  disabled={generatingBatch}
                  onClick={handleGenerateGmailBatch}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#A28444] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  {generatingBatch ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{generatingBatch ? 'Generando...' : 'Descargar CSV para Mail Merge'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: PLANTILLAS COLD EMAIL LISTAS PARA COPIAR */}
        {showTemplatesModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1b1a1a] border border-[#A28444]/40 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative text-left max-h-[90vh] flex flex-col">
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#A28444]/20 border border-[#A28444]/40 flex items-center justify-center text-[#D4AF37]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Plantillas Oficiales de Prospección Fría (Gmail)</h3>
                  <p className="text-xs text-neutral-400">Personalizadas con variables Mail Merge para Asesores y Brokers</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-4">
                <button
                  onClick={() => setActiveTemplateTab('asesor')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTemplateTab === 'asesor'
                      ? 'bg-[#A28444] text-black shadow'
                      : 'bg-[#232121] text-neutral-400 hover:text-white'
                  }`}
                >
                  Plantilla A • Asesores Inmobiliarios (Flujo 2)
                </button>
                <button
                  onClick={() => setActiveTemplateTab('broker')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTemplateTab === 'broker'
                      ? 'bg-[#A28444] text-black shadow'
                      : 'bg-[#232121] text-neutral-400 hover:text-white'
                  }`}
                >
                  Plantilla B • Broker / Martillero (Flujo 3: 10% Overriding)
                </button>
              </div>

              {/* Template Content */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {(() => {
                  const t = activeTemplateTab === 'asesor' ? TEMPLATE_A : TEMPLATE_B;
                  return (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Asunto del Correo:</span>
                          <button
                            onClick={() => copyToClipboard(t.subject, 'Asunto')}
                            className="text-[#D4AF37] hover:underline flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Copy className="w-3 h-3" /> Copiar Asunto
                          </button>
                        </div>
                        <div className="p-2.5 bg-[#121111] border border-white/10 rounded-xl font-mono text-white text-[11px]">
                          {t.subject}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Cuerpo del Correo:</span>
                          <button
                            onClick={() => copyToClipboard(t.body, 'Cuerpo de correo')}
                            className="text-[#D4AF37] hover:underline flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Copy className="w-3 h-3" /> Copiar Cuerpo
                          </button>
                        </div>
                        <div className="p-3.5 bg-[#121111] border border-white/10 rounded-xl font-sans text-neutral-300 text-xs whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                          {t.body}
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/90 space-y-1">
                        <p className="font-bold text-amber-300">💡 3 Reglas de Oro para el envío desde Gmail:</p>
                        <p>1. <strong>No adjuntes archivos PDF en el primer correo frío:</strong> Mandá solo texto limpio con el enlace {`{{4}}`}.</p>
                        <p>2. <strong>Seguimiento a los 4 días:</strong> Respondé sobre el mismo hilo con 3 líneas cortas recordando la reunión.</p>
                        <p>3. <strong>Pasa a WhatsApp solo a los tibios:</strong> A quienes abrieron 2 o más veces pero no reservaron, contactalos por WhatsApp con el Bot v3.0.</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowTemplatesModal(false)}
                  className="px-5 py-2 bg-[#232121] hover:bg-[#2c2929] text-white font-bold text-xs rounded-xl"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: IMPORTADOR CSV MANUAL */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1b1a1a] border border-white/10 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowImportModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-white mb-1">Importar Base B2B Manual (CSV / Texto)</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Pega líneas con formato: <code>Nombre, Email, Teléfono, Oficina, Ciudad, Rol</code>
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Capa de Origen:</label>
                  <select
                    value={importLayer}
                    onChange={(e) => setImportLayer(e.target.value)}
                    className="w-full bg-[#121111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="CAPA_1_REMAX">Capa 1: RE/MAX Argentina</option>
                    <option value="CAPA_2_PADRONES_CORREDORES">Capa 2: Padrones Corredores Inmobiliarios</option>
                    <option value="CAPA_3_PREVISIONALISTAS">Capa 3: Previsionalistas</option>
                    <option value="CAPA_4_CONTADORES">Capa 4: Contadores</option>
                    <option value="CAPA_5_PAS">Capa 5: Productores Asesores de Seguros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Pegar contenido CSV:</label>
                  <textarea
                    rows={8}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Ejemplo:
Carlos Gómez, cgomez@remax.com.ar, 011 15-4567-8901, RE/MAX Libertad, CABA, Asesor
Mart. Ana López, alopez@remax.com.ar, 342 15-5123456, RE/MAX Litoral, Santa Fe, Broker"
                    className="w-full bg-[#121111] border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#A28444]"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-[#232121] hover:bg-[#2c2929] text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  disabled={importing}
                  onClick={handleManualImport}
                  className="px-5 py-2.5 bg-[#A28444] hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{importing ? 'Procesando...' : 'Iniciar Ingesta y Limpieza E.164'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: EJECUTAR CONECTORES / SCRAPERS */}
        {showScraperModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1b1a1a] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowScraperModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-white mb-1">Conectores de Extracción B2B</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Workers asíncronos con Rate Limiting (2.5s a 5s) y bloqueo de assets para máxima velocidad.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#141313] border border-white/5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">Capa 1: RE/MAX Argentina</h4>
                    <p className="text-[11px] text-neutral-400">Directorio de 215 oficinas y agentes con email y celular.</p>
                  </div>
                  <button
                    disabled={scraping}
                    onClick={() => handleRunScraper('CAPA_1_REMAX')}
                    className="px-3.5 py-1.5 bg-[#A28444] text-black font-extrabold text-xs rounded-xl hover:brightness-110"
                  >
                    {scraping ? 'Extrayendo...' : 'Sincronizar'}
                  </button>
                </div>

                <div className="p-3.5 bg-[#141313] border border-white/5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">Capa 2: Padrones Corredores Inmobiliarios</h4>
                    <p className="text-[11px] text-neutral-400">Santa Fe, Entre Ríos (Vigentes), Salta (CUCIS) y La Matanza.</p>
                  </div>
                  <button
                    disabled={scraping}
                    onClick={() => handleRunScraper('CAPA_2_PADRONES_CORREDORES')}
                    className="px-3.5 py-1.5 bg-[#232121] text-white border border-white/10 font-bold text-xs rounded-xl hover:bg-[#2c2929]"
                  >
                    {scraping ? 'Extrayendo...' : 'Sincronizar'}
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowScraperModal(false)}
                  className="px-4 py-2 bg-[#232121] text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </Panel>
    </div>
  );
}
