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
  Pause,
  Square,
  Terminal,
  Cpu,
  X,
  Send,
  Zap,
  CheckSquare,
  Radio,
  Calendar,
  Megaphone,
  UserPlus,
  ArrowRight,
  Share2,
  BookmarkCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Definición exhaustiva de las Capas 1 a 5 para Prospección y CRM
export const CAPAS_CONFIG = [
  {
    id: 'CAPA_1_REMAX',
    num: 1,
    name: 'Capa 1: Franquicias Inmobiliarias',
    shortName: 'Franquicias',
    networks: 'RE/MAX, Century 21, Keller Williams',
    badge: 'Franquicias',
    color: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-300',
    bgColor: 'bg-amber-500/10',
    segmento: 'FRANQUICIA_INMOBILIARIA',
    tag: 'CAPA_1_FRANQUICIAS',
    templateEmailName: 'Prospección Fría: Agentes Inmobiliarios RE/MAX (Flujo 2 - Capa 1)',
    templateWhatsappName: 'Prospección WhatsApp: Agentes Franquicias (Capa 1)',
    templateLeaderEmailName: 'Prospección Fría: Broker / Martillero RE/MAX (Flujo 3)',
    desc: 'Agentes con cartera activa para monetizar operaciones inmobiliarias con comisiones de alto rendimiento al calce y créditos puente.'
  },
  {
    id: 'CAPA_2_PADRONES_CORREDORES',
    num: 2,
    name: 'Capa 2: Corredores Matriculados Independientes',
    shortName: 'Corredores Colegiados',
    networks: 'Colegios Oficiales, CCi Santa Fe, CUCICBA, CMCPSI',
    badge: 'Colegiados',
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    segmento: 'CORREDORES_MATRICULADOS',
    tag: 'CAPA_2_CORREDORES',
    templateEmailName: 'Prospección Fría: Corredores Matriculados (Capa 2)',
    templateWhatsappName: 'Prospección WhatsApp: Corredores Matriculados (Capa 2)',
    templateLeaderEmailName: 'Prospección Fría: Corredores Matriculados (Capa 2)',
    desc: 'Martilleros y corredores para destrabar operaciones con mutuos puente con garantía real en 48 hs aprobados por IA.'
  },
  {
    id: 'CAPA_3_PREVISIONALISTAS',
    num: 3,
    name: 'Capa 3: Abogados y Gestores Previsionales',
    shortName: 'Previsionales',
    networks: 'Estudios Jurídicos Previsionales, Gestorías ANSES',
    badge: 'Previsionales',
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-300',
    bgColor: 'bg-purple-500/10',
    segmento: 'ABOGADOS_PREVISIONALISTAS',
    tag: 'CAPA_3_PREVISIONAL',
    templateEmailName: 'Prospección Fría: Abogados y Gestores Previsionales (Capa 3)',
    templateWhatsappName: 'Prospección WhatsApp: Previsionales (Capa 3)',
    templateLeaderEmailName: 'Prospección Fría: Abogados y Gestores Previsionales (Capa 3)',
    desc: 'Profesionales previsionales para préstamos a jubilados con cuota fija y cobranza bancarizada con comisiones directas.'
  },
  {
    id: 'CAPA_4_DESARROLLADORES',
    num: 4,
    name: 'Capa 4: Desarrolladores Urbanos y Fideicomisos',
    shortName: 'Desarrolladores',
    networks: 'Constructoras, Loteos Urbanos, Fideicomisos al Costo',
    badge: 'Desarrolladores',
    color: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-300',
    bgColor: 'bg-orange-500/10',
    segmento: 'DESARROLLADORES_URBANOS',
    tag: 'CAPA_4_DESARROLLADORES',
    templateEmailName: 'Prospección Fría: Desarrolladores Urbanos y Fideicomisos (Capa 4)',
    templateWhatsappName: 'Prospección WhatsApp: Desarrolladores Urbanos (Capa 4)',
    templateLeaderEmailName: 'Prospección Fría: Desarrolladores Urbanos y Fideicomisos (Capa 4)',
    desc: 'Fondeo de pozo, financiamiento de obra y créditos puente con garantía prendaria o hipotecaria calificados por IA.'
  },
  {
    id: 'CAPA_5_PAS',
    num: 5,
    name: 'Capa 5: Productores Asesores de Seguros (PAS)',
    shortName: 'Seguros PAS',
    networks: 'Matrícula Oficial SSN, Productores y Brokers de Seguros',
    badge: 'Seguros PAS',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    segmento: 'PRODUCTOR_SEGUROS_PAS',
    tag: 'CAPA_5_SEGUROS_PAS',
    templateEmailName: 'Prospección Fría: Productores Asesores de Seguros PAS (Capa 5)',
    templateWhatsappName: 'Prospección WhatsApp: Productores Seguros PAS (Capa 5)',
    templateLeaderEmailName: 'Prospección Fría: Productores Asesores de Seguros PAS (Capa 5)',
    desc: 'Nueva unidad de préstamos con garantía y jubilados para su cartera de asegurados ganando comisiones de alto rendimiento más beneficios residuales.'
  }
];

export default function ProspectosB2BPage() {
  const router = useRouter();
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
  const [filterSegmento, setFilterSegmento] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 40;

  // Modales
  const [showGmailBatchModal, setShowGmailBatchModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScraperModal, setShowScraperModal] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState('franquicias'); // 'franquicias' | 'corredores' | 'seguros' | 'broker'

  // Parámetros de Generación de Lote Gmail
  const [batchOptions, setBatchOptions] = useState({
    maxPerDomain: 40,
    totalBatchSize: 40,
    targetRole: 'ALL',
    targetSegment: 'ALL',
    webinarDate: 'Lunes 3 de Noviembre',
    webinarTime: '10:00',
    webinarTitle: 'Reunión Informativa Red de Asesores Independientes',
    bookingLink: 'https://colaboratium.com.ar/reservar',
    optOutBaseUrl: 'https://colaboratium.com.ar/baja',
    syncToAgenda: true
  });
  const [generatingBatch, setGeneratingBatch] = useState(false);

  // Parámetros de Importación Manual
  const [importText, setImportText] = useState('');
  const [importLayer, setImportLayer] = useState('CAPA_1_REMAX');
  const [importing, setImporting] = useState(false);

  // Scraper en ejecución
  const [scraping, setScraping] = useState(false);
  const [importingLotes, setImportingLotes] = useState(false);

  // Crawler Playwright Stealth en tiempo real
  const [crawlerStatus, setCrawlerStatus] = useState({
    isRunning: false,
    isPaused: false,
    jobId: null,
    currentOffice: null,
    currentOfficeIndex: 0,
    totalOffices: 215,
    percent: 0,
    extractedCount: 0,
    startTime: null,
    recentLogs: []
  });

  // Selección Múltiple de Prospectos
  const [selectedProspectIds, setSelectedProspectIds] = useState(new Set());

  // Modales de Campaña y CRM
  const [showCampaignLauncherModal, setShowCampaignLauncherModal] = useState(false);
  const [showCrmIncorporateModal, setShowCrmIncorporateModal] = useState(false);
  const [launchingCampaign, setLaunchingCampaign] = useState(false);
  const [incorporatingCrm, setIncorporatingCrm] = useState(false);
  const [layersSummary, setLayersSummary] = useState([]);

  // Configuración de Lanzador de Campaña B2B
  const [campaignLauncherConfig, setCampaignLauncherConfig] = useState({
    name: '',
    channel: 'whatsapp', // 'whatsapp' | 'email'
    lineaWa: 'WA_B', // 'WA_B' | 'WA_S***5239'
    targetCapa: 'AUTO', // 'AUTO' o CAPA_1..5
    targetRole: 'ALL', // 'ALL' | 'ASESOR_POTENCIAL' | 'LIDER_BROKER_POTENCIAL'
    filterHasPhone: false,
    filterHasEmail: false,
    selectedTemplateId: '',
    customSubject: '',
    customMessage: '',
    messagesPerMinute: 15
  });

  // Configuración de Incorporación al CRM
  const [crmIncorporateConfig, setCrmIncorporateConfig] = useState({
    targetCapa: 'AUTO', // 'AUTO' o CAPA_1_REMAX ... CAPA_5_PAS
    targetGrupo: 'AUTO'
  });

  // Manejo de Selección
  const handleToggleSelectAll = () => {
    if (prospects.length === 0) return;
    const allSelectedOnPage = prospects.every(p => selectedProspectIds.has(p.id));
    const next = new Set(selectedProspectIds);
    if (allSelectedOnPage) {
      prospects.forEach(p => next.delete(p.id));
    } else {
      prospects.forEach(p => next.add(p.id));
    }
    setSelectedProspectIds(next);
  };

  const handleToggleSelectOne = (id) => {
    const next = new Set(selectedProspectIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProspectIds(next);
  };

  // Cargar resumen de capas
  const fetchLayersSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/b2b-prospects/layers-summary?codigoEmpresa=KRZMJI`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setLayersSummary(data.summary);
      }
    } catch(e) {}
  };

  // Incorporar un único prospecto al CRM al instante
  const handleSingleProspectIncorporate = async (p) => {
    try {
      toast.info(`Incorporando a ${p.first_name} ${p.last_name} al CRM...`);
      const res = await fetch(`${API_URL}/b2b-prospects/sync-to-crm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          prospectIds: [p.id],
          targetCapa: 'AUTO',
          codigoEmpresa: 'KRZMJI'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`✓ ${p.first_name} ${p.last_name} incorporado a CRM con su Capa y plantilla asignada.`);
        fetchKPIs();
        fetchProspects();
        fetchLayersSummary();
      } else {
        toast.error(data.message || 'Error al incorporar');
      }
    } catch (e) {
      toast.error('Error de conexión al incorporar al CRM');
    }
  };

  // Confirmar Incorporación Masiva a CRM
  const handleConfirmIncorporateToCRM = async () => {
    setIncorporatingCrm(true);
    try {
      const isSelectionMode = selectedProspectIds.size > 0;
      const payload = {
        prospectIds: isSelectionMode ? Array.from(selectedProspectIds) : null,
        filters: !isSelectionMode ? {
          layer: filterLayer,
          segmento: filterSegmento,
          role: filterRole,
          status: filterStatus,
          search: search
        } : null,
        targetCapa: crmIncorporateConfig.targetCapa,
        codigoEmpresa: 'KRZMJI'
      };

      const res = await fetch(`${API_URL}/b2b-prospects/sync-to-crm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowCrmIncorporateModal(false);
        setSelectedProspectIds(new Set());
        fetchKPIs();
        fetchProspects();
        fetchLayersSummary();
      } else {
        toast.error(data.message || 'Error en la incorporación masiva');
      }
    } catch (err) {
      toast.error('Error de red al sincronizar con CRM');
    } finally {
      setIncorporatingCrm(false);
    }
  };

  // Puente hacia el Diseñador Completo de Campañas
  const handleOpenInCampaignsDesigner = () => {
    try {
      const bridgeData = {
        source: 'b2b',
        channel: campaignLauncherConfig.channel,
        targetCapa: campaignLauncherConfig.targetCapa,
        prospectIds: Array.from(selectedProspectIds),
        contactsCount: selectedProspectIds.size > 0 ? selectedProspectIds.size : totalCount,
        campaignName: campaignLauncherConfig.name || `Campaña B2B (${campaignLauncherConfig.channel.toUpperCase()})`,
        templateId: campaignLauncherConfig.selectedTemplateId,
        timestamp: Date.now()
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('routh_b2b_campaign_bridge', JSON.stringify(bridgeData));
      }
      setShowCampaignLauncherModal(false);
      router.push(`/dashboard/campaigns?tab=${campaignLauncherConfig.channel === 'whatsapp' ? 'meta' : 'email'}&source=b2b&capa=${campaignLauncherConfig.targetCapa}`);
    } catch (e) {
      toast.error('Error al redirigir al diseñador de campañas');
    }
  };

  // Despacho Directo de Campaña B2B
  const handleDirectLaunchCampaign = async () => {
    if (campaignLauncherConfig.channel === 'whatsapp' && campaignLauncherConfig.lineaWa === 'WA_S***5239') {
      toast.error("🔒 La línea WA_S***5239 se encuentra en Periodo de Prueba con salidas bloqueadas. Solo recibe mensajes y responde automáticamente a agentes RE/MAX. Para campañas masivas utilice la línea oficial WA_B.");
      return;
    }
    setLaunchingCampaign(true);
    try {
      const isSelectionMode = selectedProspectIds.size > 0;
      const payload = {
        prospectIds: isSelectionMode ? Array.from(selectedProspectIds) : null,
        filters: !isSelectionMode ? {
          layer: filterLayer,
          segmento: filterSegmento,
          role: filterRole,
          status: filterStatus,
          search: search
        } : null,
        canal: campaignLauncherConfig.channel,
        targetCapa: campaignLauncherConfig.targetCapa,
        plantillaId: campaignLauncherConfig.selectedTemplateId,
        customSubject: campaignLauncherConfig.customSubject,
        customContent: campaignLauncherConfig.customMessage,
        campaignName: campaignLauncherConfig.name || `Campaña B2B • ${campaignLauncherConfig.channel.toUpperCase()} (${new Date().toLocaleDateString('es-AR')})`,
        codigoEmpresa: 'KRZMJI'
      };

      const res = await fetch(`${API_URL}/b2b-prospects/launch-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowCampaignLauncherModal(false);
        setSelectedProspectIds(new Set());
        fetchKPIs();
        fetchProspects();
      } else {
        toast.error(data.message || 'Error al lanzar campaña');
      }
    } catch (e) {
      toast.error('Error de red al despachar campaña');
    } finally {
      setLaunchingCampaign(false);
    }
  };

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
      if (filterSegmento !== 'ALL') params.append('segmento', filterSegmento);
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
  }, [page, filterLayer, filterSegmento, filterRole, filterStatus]);

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

  // Consultar estado en vivo del Crawler Playwright Stealth
  const fetchCrawlerStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/b2b-prospects/crawler/status`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        setCrawlerStatus(data);
      }
    } catch (e) {}
  };

  // Polling del estado del crawler
  useEffect(() => {
    fetchCrawlerStatus();
    const interval = setInterval(() => {
      if (showScraperModal || crawlerStatus.isRunning) {
        fetchCrawlerStatus();
        fetchKPIs();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [showScraperModal, crawlerStatus.isRunning]);

  // Iniciar Crawler Playwright Stealth
  const handleStartCrawler = async (fresh = false) => {
    setScraping(true);
    try {
      toast.info('🕷️ Inicializando navegador Chromium Headless con flags Stealth...');
      const res = await fetch(`${API_URL}/b2b-prospects/crawler/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ layer: 'CAPA_1_REMAX', fresh, codigoEmpresa: 'KRZMJI' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchCrawlerStatus();
      } else {
        toast.error(data.message || 'Error al iniciar crawler');
      }
    } catch(e) {
      toast.error('Error de conexión con el crawler');
    } finally {
      setScraping(false);
    }
  };

  // Pausar Crawler
  const handlePauseCrawler = async () => {
    try {
      toast.info('Pausando crawler...');
      const res = await fetch(`${API_URL}/b2b-prospects/crawler/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        toast.warning('⏸️ Crawler pausado en punto de control.');
        fetchCrawlerStatus();
      }
    } catch(e) {
      toast.error('Error al pausar');
    }
  };

  // Reanudar Crawler
  const handleResumeCrawler = async () => {
    try {
      toast.info('Reanudando crawler...');
      const res = await fetch(`${API_URL}/b2b-prospects/crawler/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('⏯️ Crawler reanudado desde último checkpoint.');
        fetchCrawlerStatus();
      }
    } catch(e) {
      toast.error('Error al reanudar');
    }
  };

  // Detener Crawler
  const handleStopCrawler = async () => {
    try {
      const res = await fetch(`${API_URL}/b2b-prospects/crawler/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        toast.info('⏹️ Crawler detenido.');
        fetchCrawlerStatus();
        fetchKPIs();
        fetchProspects();
      }
    } catch(e) {
      toast.error('Error al detener');
    }
  };

  // Importar Lotes 1 y 2 de RE/MAX desde Excel
  const handleImportLotesExcel = async () => {
    setImportingLotes(true);
    toast.info('📥 Importando y normalizando lotes 1 y 2 de RE/MAX (830 agentes)...');
    try {
      const res = await fetch(`${API_URL}/b2b-prospects/import-lotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ codigoEmpresa: 'KRZMJI' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`🎉 Lotes 1 y 2 importados: ${data.totalInExcel} perfiles procesados (${data.withEmail} con email, ${data.withPhone} con WhatsApp E.164)`);
        fetchKPIs();
        fetchProspects();
      } else {
        toast.error(data.error || 'Error al importar Excel de lotes');
      }
    } catch(e) {
      toast.error('Error de red al importar lotes');
    } finally {
      setImportingLotes(false);
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
        toast.success(data.message || 'Scraper iniciado en segundo plano');
        fetchKPIs();
        fetchProspects();
        fetchCrawlerStatus();
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

  // Plantilla Única Oficial para Cold Mail B2B (Directiva: Solo esta plantilla para Mail)
  const TEMPLATE_FRANQUICIAS = {
    title: 'Prospección Fría: Agentes Inmobiliarios RE/MAX (Flujo 2 - Capa 1)',
    subject: 'Colaboratium P2P comunicado de Alianza para tu cartera de clientes en {{Office}}, {{First Name}} (BCRA Nº 40.015)',
    body: `Hola {{First Name}}, ¿cómo estás?

Vi tu perfil público en el equipo de {{Office}} en {{City}} y te escribo porque en Colaboratium (registro BCRA Nº 40.015) estamos incorporando agentes inmobiliarios con cartera activa a nuestra Red de Asesores Independientes.

Sabemos que en la operatoria inmobiliaria hablás todas las semanas con clientes que acaban de vender, que están esperando cerrar una operación o que tienen excedentes de liquidez y buscan una renta superadora al plazo fijo tradicional sin inmovilizar su capital a largo plazo.

¿Cómo funciona la alianza para vos y para tu cliente?

Para tu cliente inversor (Costo 0%): Invierte desde una plataforma 100% bancarizada (Banco BIND y Banco Coinag) operando desde su propio CVU, financiando créditos atomizados calificados por IA. Al inversor jamás se le cobra comisión ni gasto administrativo.

Para vos como Asesor: Percibís Comisiones de alto rendimiento sobre capital colocado, cobrando un % inmediato al calce del crédito y el resto con las cuotas, más el 100% de comisión en cada reinversión futura de tu cliente.

Este {{1}} a las {{2}} hs brindamos una reunión informativa online de {{3}} exclusiva para agentes y brokers de redes.

👉 Podés reservar tu lugar: {{4}}


Aviso Legal (Ley 25.326 y Disp. DNPDP 4/2009): Datos de contacto comercial del directorio público de {{Office}} en {{City}}. Baja inmediata en [este enlace ({{5}})] o respondiendo "BAJA".`
  };

  const TEMPLATE_CORREDORES = {
    title: 'Plantilla 2 • Corredores Inmobiliarios Matriculados (Colegios Oficiales / CCi)',
    subject: '[PUBLICIDAD] Financiamiento ágil para destrabar operaciones inmobiliarias en {{City}}, {{First Name}} (BCRA Nº 40.015)',
    body: `Hola {{First Name}}, ¿cómo estás?

Te contacto como Corredor Inmobiliario Matriculado en {{City}} porque en Colaboratium (Global Loan S.A. — Primera plataforma Fintech de créditos entre particulares registrada en el BCRA bajo el Nº 40.015) desarrollamos un canal específico para martilleros y corredores colegiados independientes.

Sabemos que uno de los mayores frenos en la operatoria inmobiliaria son las operaciones que se caen o se demoran 90 a 120 días por la lentitud de los créditos bancarios tradicionales, o clientes compradores que necesitan un crédito puente con garantía para calzar la compra de su nueva propiedad antes de vender la anterior.

¿Qué soluciones brindamos para tu inmobiliaria y tus clientes?

1. Créditos Puente y Mutuos con Garantía Real: Financiación ágil en 48 hs aprobada por motor de IA, permitiendo destrabar reservas y boletos de compraventa para clientes calificados.
2. Destino para Clientes Vendedores con Liquidez: Si tu cliente acaba de vender y busca renta en pesos 100% bancarizada (vía Banco BIND y Banco Coinag con CVU propio), invierte sin comisiones ni cargos administrativos financiando carteras atomizadas de bajo riesgo.
3. Honorarios y Comisiones para Vos: Percibís comisiones de alto rendimiento directas sobre el capital colocado, cobrando de forma inmediata al calce de la operación, más el 100% en reinversiones futuras.

Este {{1}} a las {{2}} hs brindaremos una sesión online de {{3}} exclusiva para Corredores Matriculados donde mostramos cómo estructurar los mutuos puente y el marco legal regulatorio.

👉 Podés reservar tu acceso sin cargo acá: {{4}}

O bien respondeme este correo y coordinamos una reunión de 15 minutos personalizada.

Un cordial saludo,

Lic. Damián Feuermann
Presidente | Global Loan S.A. — Colaboratium
Registro BCRA PNFC Nº 40.015
Av. del Libertador 264, 1° Piso, Vicente López / Maipú 568, Piso 8°, CABA

Aviso Legal (Ley 25.326 y Disp. DNPDP 4/2009): Tus datos fueron obtenidos del padrón público oficial de profesionales habilitados en {{City}}. Tenés derecho a la baja inmediata haciendo clic en [este enlace ({{5}})] o respondiendo con la palabra "BAJA".`
  };

  const TEMPLATE_SEGUROS = {
    title: 'Plantilla 3 • Productores Asesores de Seguros (PAS - Matrícula SSN)',
    subject: '[PUBLICIDAD] Nueva unidad de préstamos con garantía y jubilados para tu cartera, {{First Name}} (PAS Mat. SSN)',
    body: `Hola {{First Name}}, ¿cómo estás?

Te escribo como Productor Asesor de Seguros (PAS) matriculado ante la Superintendencia de Seguros de la Nación porque en Colaboratium (Global Loan S.A. — Plataforma registrada en el BCRA bajo el Nº 40.015) creamos una alianza estratégica para que productores independientes sumen colocación de créditos a su cartera de asegurados.

Como PAS, ya contás con la confianza y el conocimiento financiero de tus asegurados particulares y comerciales. Nuestra plataforma te permite monetizar esa relación con productos que tu cliente ya necesita:

1. Préstamos a Jubilados y Pensionados: Créditos con cuota fija y débito seguro, ideales para familiares o asegurados de vida y retiro.
2. Créditos Prendarios e Hipotecarios: Para clientes de autos o patrimoniales que buscan liquidez inmediata sin desarmar posiciones de ahorro.
3. Inversión en Créditos con Rendimiento Superior al Plazo Fijo: Para asegurados con excedentes de liquidez en cuenta bancaria, con respaldo bancario vía Banco BIND y Coinag.

Tus Beneficios como Productor:
- Comisiones de alto rendimiento sobre el desembolso total del crédito (con cobro inmediato al calce).
- Ingresos residuales mes a mes y 100% de comisión sobre cada renovación de crédito.
- Operatoria 100% digital desde tu consola propia: el análisis de scoring crediticio (Veraz, Nosis, BCRA y UIF) lo realiza nuestra Inteligencia Artificial en segundos.

Este {{1}} a las {{2}} hs daremos una charla informativa online de {{3}} para Productores de Seguros.

👉 Reservá tu cupo sin costo acá: {{4}}

Te mando un cordial saludo,

Lic. Damián Feuermann
Presidente | Global Loan S.A. — Colaboratium
Registro BCRA PNFC Nº 40.015
Av. del Libertador 264, 1° Piso, Vicente López / Maipú 568, Piso 8°, CABA

Aviso Legal (Ley 25.326 y Disp. DNPDP 4/2009): Correo enviado en base a los datos públicos de matriculación profesional en la SSN. Podés solicitar la baja inmediata haciendo clic en [este link ({{5}})] o respondiendo "BAJA".`
  };

  const TEMPLATE_BROKER = {
    title: 'Plantilla B • Broker / Martillero Responsable (Flujo 3: Nodo + 10% Overriding)',
    subject: '[PUBLICIDAD] Unidad de negocio adicional para tu equipo en {{Office}}, {{First Name}} (BCRA Nº 40.015)',
    body: `Hola {{First Name}}, ¿cómo estás?

Te contacto como Broker / Responsable de {{Office}} porque en Colaboratium (Global Loan S.A. — Primera plataforma Fintech de créditos entre particulares registrada en el BCRA bajo el Nº 40.015) estamos habilitando nodos de Líderes de Equipo para directores de oficinas inmobiliarias y redes comerciales.

Sabemos que ya liderás un equipo de agentes que trabajan bajo el modelo de contrato independiente. Nuestra propuesta te permite sumar una unidad de ingresos recurrentes para tu oficina, sin ningún costo para los clientes inversores de tu cartera:

Plataforma Principal (https://colaboratium.com.ar/): Dás de alta a los agentes de tu equipo bajo tu propio nodo. Ellos cobran comisiones de alto rendimiento por ofrecer alternativas de inversión en pesos (100% bancarizadas vía BIND/Coinag y filtradas por IA) a sus clientes con liquidez.

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

  const TEMPLATE_PREVISIONAL = {
    title: 'Plantilla 3 • Abogados y Gestores Previsionales (Capa 3)',
    subject: '[PUBLICIDAD] Mutuos con código de débito y financiamiento para clientes previsionales en {{City}}, {{First Name}} (BCRA Nº 40.015)',
    body: `Hola {{First Name}}, ¿cómo estás?

Te contacto por tu actividad profesional en asesoramiento previsional y jubilaciones en {{City}}. En Colaboratium (Global Loan S.A. — Plataforma registrada en el BCRA bajo el Nº 40.015) desarrollamos una línea de mutuos atomizados y préstamos a jubilados con cuota fija y cobranza bancarizada segura.

Esta operatoria permite a los profesionales previsionales sumar una unidad de ingresos para su estudio, ofreciendo préstamos con tasa transparente y análisis de scoring en segundos:

1. Préstamos a Jubilados y Pensionados: Créditos con cuota fija y débito seguro en cuenta bancaria.
2. Inversión para Clientes con Sentencias o Cobros Retroactivos: Alternativa de renta bancarizada a través de BIND y Coinag sin comisiones de entrada ni salida.
3. Comisiones de alto rendimiento directas para el profesional, con cobro inmediato al desembolso del crédito.

Este {{1}} a las {{2}} hs daremos una charla explicativa online de {{3}} exclusiva para el sector previsional.

👉 Reservá tu cupo sin costo acá: {{4}}

Te mando un cordial saludo,

Lic. Damián Feuermann
Presidente | Global Loan S.A. — Colaboratium
Registro BCRA PNFC Nº 40.015
Av. del Libertador 264, 1° Piso, Vicente López / Maipú 568, Piso 8°, CABA

Aviso Legal (Ley 25.326 y Disp. DNPDP 4/2009): Enviado conforme a registros profesionales públicos en {{City}}. Solicitá baja inmediata en [este enlace ({{5}})] o respondiendo "BAJA".`
  };

  const TEMPLATE_DESARROLLADORES = {
    title: 'Plantilla 4 • Desarrolladores Urbanos y Fideicomisos (Capa 4)',
    subject: '[PUBLICIDAD] Fondeo ágil de pozo y créditos puente para desarrollos en {{City}}, {{First Name}} (BCRA Nº 40.015)',
    body: `Hola {{First Name}}, ¿cómo estás?

Te contacto como desarrollador / titular de proyectos constructivos en {{City}}. En Colaboratium (Global Loan S.A. — Primera plataforma Fintech de créditos entre particulares con Reg. BCRA Nº 40.015) estructuramos financiamiento de pozo y créditos puente con garantía real para loteos, edificios y fideicomisos al costo.

Conectamos proyectos calificados directamente con una comunidad activa de inversores bancarizados (Banco BIND y Banco Coinag) que operan bajo CVU propio y contratos de mutuo digitales auditados por IA.

Beneficios para tu desarrolladora:
- Calce ágil de fondos para avance de obra sin depender de la burocracia bancaria tradicional.
- Garantías reales adaptables (hipoteca en primer grado, cesión fiduciaria de boletos o prendas).
- Opción de comercializar tus unidades como alternativa de inversión dentro de nuestra red nacional de asesores.

Este {{1}} a las {{2}} hs brindaremos una sesión ejecutiva online de {{3}} para estructuradores de proyectos y desarrolladores.

👉 Podés confirmar tu participación acá: {{4}}

O bien respondeme este correo para coordinar una reunión privada en nuestras oficinas de Av. del Libertador 264, 1° Piso, Vicente López.

Un cordial saludo,

Lic. Damián Feuermann
Presidente | Global Loan S.A. — Colaboratium
Registro BCRA PNFC Nº 40.015
Av. del Libertador 264, 1° Piso, Vicente López / Maipú 568, Piso 8°, CABA

Aviso Legal (Ley 25.326 y Disp. DNPDP 4/2009): Relevado de registros públicos corporativos en {{City}}. Baja inmediata en [este link ({{5}})] o respondiendo "BAJA".`
  };

  const TEMPLATE_A = TEMPLATE_FRANQUICIAS;
  const TEMPLATE_B = TEMPLATE_BROKER;

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
              {/* Botón 1: Lanzador de Campaña B2B */}
              <button
                onClick={() => {
                  setCampaignLauncherConfig(prev => ({
                    ...prev,
                    name: `Campaña B2B • ${new Date().toLocaleDateString('es-AR')}`,
                    targetCapa: filterLayer !== 'ALL' ? filterLayer : 'AUTO'
                  }));
                  setShowCampaignLauncherModal(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform active:scale-95 ring-2 ring-cyan-300/70"
                title="Lanzar campaña de WhatsApp o Email directamente desde B2B o abrir en Diseñador"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>🚀 Lanzar Campaña B2B</span>
                {selectedProspectIds.size > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-cyan-300 text-[10px] font-mono font-bold">
                    {selectedProspectIds.size}
                  </span>
                )}
              </button>

              {/* Botón 2: Incorporar a Agenda CRM (Capas 1 a 5) */}
              <button
                onClick={() => setShowCrmIncorporateModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#A28444] to-[#D4AF37] hover:brightness-110 text-black font-black text-xs rounded-xl shadow-lg shadow-[#A28444]/25 flex items-center gap-2 transition-all transform active:scale-95 ring-2 ring-[#D4AF37]/50"
                title="Incorporar contactos B2B a la agenda CRM con origen de Capa 1 a 5 y plantilla correcta"
              >
                <Building2 className="w-4 h-4" />
                <span>📥 Incorporar a CRM (Capas 1-5)</span>
                {selectedProspectIds.size > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-black text-[#D4AF37] text-[10px] font-mono font-bold">
                    {selectedProspectIds.size}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowGmailBatchModal(true)}
                className="px-3.5 py-2.5 bg-[#232121] hover:bg-[#2c2929] border border-[#A28444]/40 text-[#D4AF37] font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Lote Gmail (CSV)</span>
              </button>

              <button
                disabled={importingLotes}
                onClick={handleImportLotesExcel}
                className="px-3.5 py-2.5 bg-[#1b1a1a] hover:bg-[#232121] border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 shadow-sm"
              >
                <FileSpreadsheet className={`w-4 h-4 ${importingLotes ? 'animate-spin' : 'text-emerald-400'}`} />
                <span>{importingLotes ? 'Importando Lotes...' : 'Importar Lotes 1 y 2 (Excel)'}</span>
              </button>

              <button
                onClick={() => setShowScraperModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all transform active:scale-95 ring-2 ring-cyan-300/70"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
                </span>
                <Cpu className="w-4 h-4 text-slate-950" />
                <span>🤖 CRAWLER PLAYWRIGHT STEALTH (EN VIVO)</span>
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
            </div>
          </div>

          {/* Hero Widget: Motor de Extracción Playwright Stealth (En Vivo) */}
          <div className="p-5 bg-gradient-to-r from-[#0a1824] via-[#0f2536] to-[#08151f] border-2 border-cyan-500/50 rounded-2xl shadow-xl shadow-cyan-950/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                  <Cpu className="w-7 h-7 text-cyan-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                      Motor Headless Playwright Stealth • RE/MAX Argentina
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                      crawlerStatus.isRunning 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.35)]' 
                        : (crawlerStatus.isPaused 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                            : 'bg-neutral-800 text-neutral-300 border-white/20')
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${crawlerStatus.isRunning ? 'bg-emerald-400 animate-ping' : (crawlerStatus.isPaused ? 'bg-amber-400' : 'bg-neutral-500')}`} />
                      {crawlerStatus.isRunning ? 'EJECUTÁNDOSE EN SEGUNDO PLANO' : (crawlerStatus.isPaused ? 'PAUSADO EN CHECKPOINT' : 'LISTO PARA INICIAR')}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-200/90 mt-1 max-w-3xl leading-relaxed">
                    {crawlerStatus.isRunning 
                      ? <>Oficina actual: <strong className="text-white font-extrabold">{crawlerStatus.currentOffice || 'Iniciando...'}</strong> (#{crawlerStatus.currentOfficeIndex} de {crawlerStatus.totalOffices}) • <strong className="text-emerald-300">{crawlerStatus.extractedCount} prospectos</strong> acumulados en sesión • Jitter humano ({'2.5s - 4.8s'}) • ETA: {crawlerStatus.etaStr}</>
                      : 'Navegador Chromium Headless con flags Stealth, bloqueo de assets (-70% RAM), demoras aleatorias de 2.5s a 4.8s y persistencia en base de datos con puntos de control (scraper_checkpoints).'}
                  </p>
                </div>
              </div>

              {/* Botones de Acción Directa del Widget */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {!crawlerStatus.isRunning ? (
                  <button
                    onClick={() => handleStartCrawler(false)}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Iniciar Extracción (215 Oficinas)</span>
                  </button>
                ) : (
                  <>
                    {!crawlerStatus.isPaused ? (
                      <button
                        onClick={handlePauseCrawler}
                        className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                      >
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pausar Worker</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleResumeCrawler}
                        className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Reanudar desde Checkpoint</span>
                      </button>
                    )}

                    <button
                      onClick={handleStopCrawler}
                      className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Detener</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowScraperModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-500/25 to-blue-500/25 hover:bg-cyan-500/40 text-cyan-200 border-2 border-cyan-400/60 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all transform active:scale-95"
                >
                  <Terminal className="w-4 h-4 text-cyan-300" />
                  <span>Ver Consola & Logs en Vivo</span>
                </button>
              </div>
            </div>

            {/* Barra de Progreso en Vivo en el Widget */}
            {crawlerStatus.isRunning && (
              <div className="mt-4 pt-3 border-t border-cyan-500/20">
                <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono mb-1.5">
                  <span>Oficinas completadas: <strong>{crawlerStatus.currentOfficeIndex}</strong> / {crawlerStatus.totalOffices}</span>
                  <span className="font-bold text-emerald-400">{crawlerStatus.percent}% • ETA: {crawlerStatus.etaStr}</span>
                </div>
                <div className="w-full bg-black/60 border border-cyan-500/30 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${crawlerStatus.percent}%` }}
                  />
                </div>
              </div>
            )}
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
                Flujo 2: Comisiones de alto rendimiento
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
                  <option value="CAPA_1_REMAX">Capa 1: Franquicias (RE/MAX, C21)</option>
                  <option value="CAPA_2_PADRONES_CORREDORES">Capa 2: Padrones Corredores</option>
                  <option value="CAPA_3_PREVISIONALISTAS">Capa 3: Previsionalistas</option>
                  <option value="CAPA_5_PAS">Capa 5: Productores Seguros (PAS)</option>
                </select>
              </div>

              {/* Filtro Segmento & Plantilla */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Origen / Plantilla:</span>
                <select
                  value={filterSegmento}
                  onChange={(e) => { setFilterSegmento(e.target.value); setPage(1); }}
                  className="bg-[#121111] border border-[#A28444]/40 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#A28444]"
                >
                  <option value="ALL">Todos los Orígenes / Plantillas</option>
                  <option value="FRANQUICIA_INMOBILIARIA">🏢 Franquicias (RE/MAX & Century 21)</option>
                  <option value="CORREDORES_MATRICULADOS">📜 Corredores Matriculados (CCi Santa Fe)</option>
                  <option value="PRODUCTOR_SEGUROS_PAS">🛡️ Productores Seguros (PAS SSN)</option>
                  <option value="ABOGADOS_PREVISIONALISTAS">⚖️ Abogados Previsionales</option>
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
                    <th className="py-3.5 px-3 text-center w-10">
                      <input 
                        type="checkbox"
                        checked={prospects.length > 0 && prospects.every(p => selectedProspectIds.has(p.id))}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded bg-[#121111] border-white/20 text-[#D4AF37] focus:ring-[#A28444] cursor-pointer accent-[#D4AF37]"
                        title="Seleccionar todos los de esta página"
                      />
                    </th>
                    <th className="py-3.5 px-4">Prospecto / Organización</th>
                    <th className="py-3.5 px-4">Clasificación / Flujo Bot</th>
                    <th className="py-3.5 px-4">Origen / Plantilla</th>
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
                      <td colSpan="10" className="py-12 text-center text-neutral-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#A28444]" />
                        <span>Cargando prospectos B2B...</span>
                      </td>
                    </tr>
                  ) : prospects.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-neutral-500">
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
                      const isInCrm = p.campaign_status === 'CONVERTIDO_CRM';
                      const isSelected = selectedProspectIds.has(p.id);

                      return (
                        <tr key={p.id} className={`hover:bg-white/[0.02] transition-colors group ${isSelected ? 'bg-[#A28444]/10' : ''}`}>
                          {/* Checkbox individual */}
                          <td className="py-3.5 px-3 text-center">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(p.id)}
                              className="w-4 h-4 rounded bg-[#121111] border-white/20 text-[#D4AF37] focus:ring-[#A28444] cursor-pointer accent-[#D4AF37]"
                            />
                          </td>

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

                          {/* Origen & Plantilla Sugerida */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              {p.segmento_origen === 'FRANQUICIA_INMOBILIARIA' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 w-fit flex items-center gap-1">
                                  🏢 Franquicia
                                </span>
                              ) : p.segmento_origen === 'CORREDORES_MATRICULADOS' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 w-fit flex items-center gap-1">
                                  📜 Corredor Mat.
                                </span>
                              ) : p.segmento_origen === 'PRODUCTOR_SEGUROS_PAS' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 w-fit flex items-center gap-1">
                                  🛡️ Seguros (PAS)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30 w-fit flex items-center gap-1">
                                  ⚖️ Previsional
                                </span>
                              )}
                              <span className="text-[9px] text-neutral-400 font-mono font-semibold">
                                {p.plantilla_sugerida || 'PLANTILLA_FRANQUICIAS'}
                              </span>
                            </div>
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
                            ) : isInCrm ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-fit shadow-sm">
                                <BookmarkCheck className="w-2.5 h-2.5" />
                                En CRM
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
                              {/* Botón rápido Incorporar a CRM */}
                              {!isInCrm && !isConverted && !isOptOut && (
                                <button
                                  onClick={() => handleSingleProspectIncorporate(p)}
                                  className="px-2 py-1 bg-[#A28444]/15 hover:bg-[#A28444]/30 text-[#D4AF37] border border-[#A28444]/40 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all"
                                  title="Incorporar este contacto a la agenda CRM con origen de Capa 1-5"
                                >
                                  <Building2 className="w-3 h-3 text-[#D4AF37]" />
                                  <span>+CRM</span>
                                </button>
                              )}

                              {/* Botón rápido Lanzar Campaña */}
                              {!isOptOut && (
                                <button
                                  onClick={() => {
                                    setSelectedProspectIds(new Set([p.id]));
                                    setCampaignLauncherConfig(prev => ({
                                      ...prev,
                                      targetCapa: p.source_layer || 'AUTO',
                                      name: `Campaña B2B • ${p.first_name} ${p.last_name}`
                                    }));
                                    setShowCampaignLauncherModal(true);
                                  }}
                                  className="px-2 py-1 bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all"
                                  title="Lanzar campaña inmediata a este contacto"
                                >
                                  <Zap className="w-3 h-3 text-cyan-400 fill-current" />
                                  <span>Lanzar</span>
                                </button>
                              )}

                              {!isConverted && !isInCrm && !isOptOut && (
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

          {/* Floating Selection Action Bar */}
          {selectedProspectIds.size > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1b1a1a]/95 backdrop-blur-xl border-2 border-[#A28444] rounded-2xl px-6 py-3.5 shadow-2xl shadow-black/80 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <span className="text-xs font-black text-white">
                  {selectedProspectIds.size} prospectos seleccionados
                </span>
              </div>
              <div className="h-5 w-px bg-white/10" />
              <button 
                onClick={() => {
                  setCampaignLauncherConfig(prev => ({
                    ...prev,
                    name: `Campaña B2B (${selectedProspectIds.size} seleccionados)`
                  }));
                  setShowCampaignLauncherModal(true);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Lanzar Campaña</span>
              </button>
              <button 
                onClick={() => setShowCrmIncorporateModal(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#A28444] to-[#D4AF37] hover:brightness-110 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Incorporar a CRM (Capas 1-5)</span>
              </button>
              <button 
                onClick={() => setSelectedProspectIds(new Set())}
                className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors text-xs"
                title="Deseleccionar todos"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    <label className="block text-[10px] uppercase font-bold text-[#D4AF37] mb-1">
                      Segmento / Plantilla Objetivo
                    </label>
                    <select
                      value={batchOptions.targetSegment}
                      onChange={(e) => setBatchOptions({ ...batchOptions, targetSegment: e.target.value })}
                      className="w-full bg-[#121111] border border-[#A28444]/40 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="ALL">Todos los Segmentos</option>
                      <option value="FRANQUICIA_INMOBILIARIA">🏢 Franquicias (RE/MAX, C21)</option>
                      <option value="CORREDORES_MATRICULADOS">📜 Corredores Matriculados (CCi)</option>
                      <option value="PRODUCTOR_SEGUROS_PAS">🛡️ Productores Seguros (PAS)</option>
                      <option value="ABOGADOS_PREVISIONALISTAS">⚖️ Previsionales</option>
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
            <div className="bg-[#1b1a1a] border border-[#A28444]/40 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative text-left max-h-[90vh] flex flex-col">
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
                  <p className="text-xs text-neutral-400">Personalizadas y segmentadas por origen: Franquicias, Corredores Colegiados y PAS Seguros</p>
                </div>
              </div>

              {/* Tabs Diferenciadas por Segmento */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2 mb-4">
                <button
                  onClick={() => setActiveTemplateTab('franquicias')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTemplateTab === 'franquicias'
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-[#232121] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>🏢 1. Franquicias (C21 / RE/MAX)</span>
                </button>
                <button
                  onClick={() => setActiveTemplateTab('corredores')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTemplateTab === 'corredores'
                      ? 'bg-cyan-500 text-black shadow'
                      : 'bg-[#232121] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>📜 2. Corredores Colegiados (CCi)</span>
                </button>
                <button
                  onClick={() => setActiveTemplateTab('seguros')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTemplateTab === 'seguros'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'bg-[#232121] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>🛡️ 3. Productores Seguros (PAS)</span>
                </button>
                <button
                  onClick={() => setActiveTemplateTab('broker')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTemplateTab === 'broker'
                      ? 'bg-[#A28444] text-black shadow'
                      : 'bg-[#232121] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>👑 Líderes & Brokers (10% Over.)</span>
                </button>
              </div>

              {/* Template Content */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {(() => {
                  const t = activeTemplateTab === 'franquicias' ? TEMPLATE_FRANQUICIAS :
                            activeTemplateTab === 'corredores' ? TEMPLATE_CORREDORES :
                            activeTemplateTab === 'seguros' ? TEMPLATE_SEGUROS : TEMPLATE_BROKER;
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

        {/* MODAL 4: CONSOLA Y CONTROL DEL CRAWLER PLAYWRIGHT STEALTH */}
        {showScraperModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#181717] border border-cyan-500/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-left max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setShowScraperModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Encabezado del Modal */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Crawler Playwright Stealth • RE/MAX Argentina</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      crawlerStatus.isRunning 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' 
                        : (crawlerStatus.isPaused 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-neutral-800 text-neutral-400 border-white/10')
                    }`}>
                      {crawlerStatus.isRunning ? 'EN EJECUCIÓN' : (crawlerStatus.isPaused ? 'PAUSADO' : 'INACTIVO')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Navegador Headless Chrome • Bloqueo de Assets (-70% RAM) • Jitter Humano (2.5s-4.8s) • Checkpoints en MySQL
                  </p>
                </div>
              </div>

              {/* Métricas en Vivo del Trabajo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                <div className="p-3 bg-[#121111] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-0.5">Oficinas</span>
                  <span className="text-base font-black text-white font-mono">
                    {crawlerStatus.currentOfficeIndex} <span className="text-xs text-neutral-500 font-normal">/ {crawlerStatus.totalOffices}</span>
                  </span>
                </div>
                <div className="p-3 bg-[#121111] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-0.5">Agentes Extraídos</span>
                  <span className="text-base font-black text-cyan-300 font-mono">
                    {crawlerStatus.extractedCount}
                  </span>
                </div>
                <div className="p-3 bg-[#121111] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-0.5">Progreso</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {crawlerStatus.percent}%
                  </span>
                </div>
                <div className="p-3 bg-[#121111] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-0.5">Tiempo Estimado</span>
                  <span className="text-xs font-black text-amber-300 font-mono">
                    {crawlerStatus.etaStr}
                  </span>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5 font-bold">
                  <span>Oficina actual: <strong className="text-cyan-200">{crawlerStatus.currentOffice || 'En espera'}</strong></span>
                  <span>{crawlerStatus.percent}%</span>
                </div>
                <div className="w-full bg-[#121111] border border-white/10 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${crawlerStatus.percent}%` }}
                  />
                </div>
              </div>

              {/* Botones de Control del Worker */}
              <div className="flex flex-wrap items-center gap-2.5 p-3 bg-[#121111] border border-white/5 rounded-2xl mb-4">
                {!crawlerStatus.isRunning ? (
                  <button
                    disabled={scraping}
                    onClick={() => handleStartCrawler(false)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Iniciar Extracción en Segundo Plano</span>
                  </button>
                ) : (
                  <>
                    {!crawlerStatus.isPaused ? (
                      <button
                        onClick={handlePauseCrawler}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md"
                      >
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pausar Worker</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleResumeCrawler}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Reanudar desde Checkpoint</span>
                      </button>
                    )}

                    <button
                      onClick={handleStopCrawler}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Detener Crawler</span>
                    </button>
                  </>
                )}

                <button
                  disabled={importingLotes}
                  onClick={handleImportLotesExcel}
                  className="px-3.5 py-2 bg-[#232121] hover:bg-[#2c2929] border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 ml-auto"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Importar Lotes 1 y 2 (Excel)</span>
                </button>
              </div>

              {/* Principios de Arquitectura skillscrap.md */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-3 bg-[#121111]/80 border border-white/5 rounded-xl mb-4 text-neutral-300">
                <div className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold shrink-0">🛡️ Playwright Stealth:</span>
                  <span>Bypass de WAF Cloudflare con huella de Chrome real y cookies de sesión.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold shrink-0">⚡ Bloqueo de Assets:</span>
                  <span>Imágenes, fuentes y scripts analíticos cancelados (-70% RAM, +500% velocidad).</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">⏳ Jitter Humano:</span>
                  <span>Demoras aleatorias de 2.5s a 4.8s por oficina para evitar baneos de IP.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold shrink-0">💾 Checkpoints en MySQL:</span>
                  <span>Si se interrumpe, reanuda desde la última oficina sin reiniciar desde 0.</span>
                </div>
              </div>

              {/* Consola de Logs en Tiempo Real */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Consola de Salida del Worker (Live Logs):
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Actualización cada 2.5s</span>
                </div>
                <div className="bg-black/90 border border-white/10 rounded-xl p-3 font-mono text-[11px] text-emerald-400 h-44 overflow-y-auto space-y-1">
                  {crawlerStatus.logs && crawlerStatus.logs.length > 0 ? (
                    crawlerStatus.logs.map((log, idx) => (
                      <div key={idx} className="leading-tight">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-neutral-500 italic">
                      Listo para iniciar. Haz clic en &quot;Iniciar Extracción en Segundo Plano&quot; para comenzar el recorrido de las 215 oficinas.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowScraperModal(false)}
                  className="px-4 py-2 bg-[#232121] hover:bg-[#2c2929] text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cerrar Ventana
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: LANZADOR DE CAMPAÑAS B2B (WHATSAPP META / COLD EMAIL & VINCULACIÓN AL DISEÑADOR) */}
        {showCampaignLauncherModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#181717] border-2 border-cyan-500/40 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative text-left max-h-[92vh] flex flex-col overflow-hidden">
              <button
                onClick={() => setShowCampaignLauncherModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20 shrink-0">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">Lanzador de Campañas B2B & Prospección Inteligente</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Capas 1 a 5
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Vinculación directa desde el Motor B2B al lanzador de campañas omnicanal (WhatsApp Meta & Cold Email) con plantillas segmentadas por origen.
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
                
                {/* 1. Selector de Canal de Disparo */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-neutral-400 mb-2">
                    1. Seleccioná el Canal de Comunicación
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCampaignLauncherConfig(prev => ({ ...prev, channel: 'whatsapp' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        campaignLauncherConfig.channel === 'whatsapp'
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-[#121111] border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        campaignLauncherConfig.channel === 'whatsapp' ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        <MessageSquare className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm text-white">WhatsApp Bot & Meta Cloud</p>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                            Alta Conversión (+549)
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Disparo interactivo con el Bot de Colaboratium (Flujo 2 Asesores / Flujo 3 Líderes) y cadencia humana.
                        </p>
                      </div>
                    </button>

                    {/* Selector de Línea WhatsApp en Launcher */}
                    {campaignLauncherConfig.channel === 'whatsapp' && (
                      <div className="col-span-2 p-3 bg-[#121111] border border-white/10 rounded-2xl">
                        <label className="text-[10px] font-black uppercase text-neutral-400 block mb-2">
                          Línea de WhatsApp para el Envío
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCampaignLauncherConfig(prev => ({ ...prev, lineaWa: 'WA_B' }))}
                            className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                              campaignLauncherConfig.lineaWa === 'WA_B'
                                ? 'bg-emerald-500/15 border-emerald-500 text-white font-extrabold ring-1 ring-emerald-500'
                                : 'bg-[#1b1a1a] border-white/10 text-neutral-400 hover:border-white/20'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-black block text-emerald-300">WA_B</span>
                              <span className="text-[10px] text-neutral-400 block">WhatsApp Business Oficial</span>
                            </div>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black border border-emerald-500/30">
                              Oficial
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCampaignLauncherConfig(prev => ({ ...prev, lineaWa: 'WA_S***5239' }))}
                            className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                              campaignLauncherConfig.lineaWa === 'WA_S***5239'
                                ? 'bg-purple-500/15 border-purple-500 text-white font-extrabold ring-1 ring-purple-500'
                                : 'bg-[#1b1a1a] border-white/10 text-neutral-400 hover:border-white/20'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-black block text-purple-300">WA_S***5239</span>
                              <span className="text-[10px] text-neutral-400 block">WASender API (Colab)</span>
                            </div>
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black border border-amber-500/30">
                              Prueba
                            </span>
                          </button>
                        </div>

                        {campaignLauncherConfig.lineaWa === 'WA_S***5239' && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong>Línea en Modo Prueba:</strong> <strong>WA_S***5239</strong> tiene bloqueadas las campañas salientes por seguridad. Está configurada exclusivamente para responder al flujo bot cuando ingresan mensajes desde anuncios o agentes RE/MAX.
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setCampaignLauncherConfig(prev => ({ ...prev, channel: 'email' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        campaignLauncherConfig.channel === 'email'
                          ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg shadow-sky-500/10'
                          : 'bg-[#121111] border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        campaignLauncherConfig.channel === 'email' ? 'bg-sky-500 text-black' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm text-white">Cold Outreach Email</p>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-sky-500/20 text-sky-300">
                            Throttling Anti-Spam
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Envío con Mail-Merge, enlace de baja Ley 25.326 y rotación de dominios para no quemar IPs.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Resumen de Audiencia */}
                <div className="p-3.5 bg-[#121111] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                      Audiencia a impactar:
                    </span>
                    <p className="text-sm font-black text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      {selectedProspectIds.size > 0 
                        ? `${selectedProspectIds.size} prospectos seleccionados en la tabla`
                        : `Audiencia completa con filtros actuales (${totalCount} prospectos B2B)`}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {campaignLauncherConfig.channel === 'whatsapp' 
                        ? `Se filtrarán únicamente los contactos con número WhatsApp E.164 normalizado.`
                        : `Se enviará únicamente a direcciones corporativas válidas con dominio corporativo.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-white/10 text-[11px] font-bold text-neutral-300">
                      Capa actual: {filterLayer !== 'ALL' ? filterLayer.replace('CAPA_', 'Capa ') : 'Todas'}
                    </span>
                  </div>
                </div>

                {/* 3. Selector de Capa del 1 al 5 y Plantilla Sugerida */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] uppercase font-bold text-neutral-400">
                      2. Identificación del Origen • Capas del 1 al 5
                    </label>
                    <span className="text-[10px] text-[#D4AF37] font-semibold">
                      Selecciona una capa para fijar la plantilla correcta o deja en Auto
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {/* Tarjeta Auto */}
                    <button
                      type="button"
                      onClick={() => setCampaignLauncherConfig(prev => ({ ...prev, targetCapa: 'AUTO' }))}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        campaignLauncherConfig.targetCapa === 'AUTO'
                          ? 'bg-[#A28444]/20 border-[#D4AF37] text-white shadow-md'
                          : 'bg-[#121111] border-white/10 text-neutral-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase block text-[#D4AF37]">🌟 AUTO</span>
                      <span className="text-[10px] font-bold block text-white truncate">Según Prospecto</span>
                      <span className="text-[9px] text-neutral-500 block mt-0.5">Dinámica</span>
                    </button>

                    {/* Capas 1 a 5 */}
                    {CAPAS_CONFIG.map(capa => {
                      const isSelected = campaignLauncherConfig.targetCapa === capa.id;
                      return (
                        <button
                          key={capa.id}
                          type="button"
                          onClick={() => setCampaignLauncherConfig(prev => ({ ...prev, targetCapa: capa.id }))}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? `${capa.bgColor} ${capa.borderColor} text-white shadow-md ring-1 ${capa.borderColor}`
                              : 'bg-[#121111] border-white/10 text-neutral-400 hover:border-white/20'
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase block ${capa.textColor}`}>
                            Capa {capa.num}
                          </span>
                          <span className="text-[11px] font-bold block text-white truncate">
                            {capa.shortName}
                          </span>
                          <span className="text-[9px] text-neutral-500 block mt-0.5 truncate">
                            {capa.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Previsualización de la Plantilla que se enviará */}
                <div className="p-4 bg-[#121111] border border-white/10 rounded-2xl space-y-2.5">
                  {(() => {
                    const currentCapaKey = campaignLauncherConfig.targetCapa === 'AUTO' 
                      ? (filterLayer !== 'ALL' ? filterLayer : 'CAPA_1_REMAX') 
                      : campaignLauncherConfig.targetCapa;
                    const matchedCapa = CAPAS_CONFIG.find(c => c.id === currentCapaKey) || CAPAS_CONFIG[0];
                    const templateName = campaignLauncherConfig.channel === 'whatsapp' 
                      ? matchedCapa.templateWhatsappName 
                      : matchedCapa.templateEmailName;

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${matchedCapa.bgColor} ${matchedCapa.textColor} border ${matchedCapa.borderColor}`}>
                              Capa {matchedCapa.num}: {matchedCapa.badge}
                            </span>
                            <span className="text-white font-bold text-xs truncate max-w-md">
                              {templateName}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Variables: {'{{First Name}}, {{Office}}, {{City}}'}
                          </span>
                        </div>

                        <div className="p-3 bg-black/60 border border-white/5 rounded-xl font-mono text-[11px] text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto">
                          {campaignLauncherConfig.channel === 'whatsapp' ? (
                            matchedCapa.num === 1 
                              ? `Hola {{First Name}}, ¿cómo estás? Vi tu perfil público en {{Office}} ({{City}}). En Colaboratium (Global Loan S.A. - Reg. BCRA Nº 40.015) incorporamos agentes con cartera para monetizar operaciones inmobiliarias con comisiones de alto rendimiento al calce. Este {{1}} a las {{2}} hs brindamos un webinar de 40 min exclusivo. ¿Te gustaría sumarte o que coordinemos un café en nuestras oficinas de Av. del Libertador 264, Vicente López?`
                              : matchedCapa.num === 2
                              ? `Hola {{First Name}}, ¿cómo estás? Te escribo como Corredor Inmobiliario Matriculado en {{City}}. En Colaboratium (Global Loan S.A. - Reg. BCRA Nº 40.015) creamos un canal para martilleros que permite destrabar operaciones con créditos puente con garantía real en 48 hs aprobados por IA, y captar renta para vendedores con comisiones de alto rendimiento. Este {{1}} a las {{2}} hs explicamos el marco legal en un webinar de 40 min. ¿Te gustaría recibir el link de Google Meet?`
                              : matchedCapa.num === 3
                              ? `Hola {{First Name}}, ¿cómo estás? Te escribo por tu actividad previsional en {{City}}. En Colaboratium (Reg. BCRA Nº 40.015) habilitamos un canal para gestores y abogados previsionales con créditos a jubilados de cuota fija y comisiones de alto rendimiento. Este {{1}} a las {{2}} hs tenemos una sesión online de 40 min. ¿Te gustaría participar?`
                              : matchedCapa.num === 4
                              ? `Hola {{First Name}}, ¿cómo estás? Te escribo como desarrollador en {{City}}. En Colaboratium (Reg. BCRA Nº 40.015) brindamos financiamiento puente y fondeo para desarrollos y loteos con garantía real y aprobación ágil. Este {{1}} a las {{2}} hs daremos una presentación para desarrolladores. ¿Te paso el link de acceso a la sala?`
                              : `Hola {{First Name}}, ¿cómo estás? Te escribo como Productor Asesor de Seguros (PAS) en {{City}}. En Colaboratium (Global Loan S.A. - Reg. BCRA Nº 40.015) creamos una alianza para que productores sumen colocación de créditos con garantía y préstamos a jubilados a su cartera, ganando comisiones de alto rendimiento inmediatas más residuales. Este {{1}} a las {{2}} hs tenemos un webinar de 40 min para PAS. ¿Te reservo un lugar?`
                          ) : (
                            matchedCapa.num === 1 ? TEMPLATE_FRANQUICIAS.body :
                            matchedCapa.num === 2 ? TEMPLATE_CORREDORES.body :
                            matchedCapa.num === 3 ? TEMPLATE_PREVISIONAL.body :
                            matchedCapa.num === 4 ? TEMPLATE_DESARROLLADORES.body :
                            TEMPLATE_SEGUROS.body
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

              </div>

              {/* Modal Footer & Actions */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowCampaignLauncherModal(false)}
                  className="px-4 py-2.5 bg-[#232121] hover:bg-[#2c2929] text-neutral-300 font-bold text-xs rounded-xl transition-all"
                >
                  Cerrar
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Opción 1: Abrir en Diseñador Completo de Campañas */}
                  <button
                    type="button"
                    onClick={handleOpenInCampaignsDesigner}
                    className="px-4 py-2.5 bg-[#232121] hover:bg-[#2c2929] border border-cyan-500/40 text-cyan-300 hover:text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm"
                    title="Vincular audiencia y abrir en la solapa de Campañas con el diseñador completo"
                  >
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span>Abrir en Diseñador de Campañas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Opción 2: Despachar Directamente */}
                  <button
                    type="button"
                    disabled={launchingCampaign}
                    onClick={handleDirectLaunchCampaign}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {launchingCampaign ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 fill-current" />
                    )}
                    <span>{launchingCampaign ? 'Despachando Campaña...' : '⚡ Despachar Campaña Inmediata'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 6: INCORPORAR A LA AGENDA CRM (CAPAS DEL 1 AL 5) */}
        {showCrmIncorporateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1b1a1a] border-2 border-[#A28444]/60 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-left max-h-[92vh] flex flex-col overflow-hidden">
              <button
                onClick={() => setShowCrmIncorporateModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-[#A28444]/20 border border-[#A28444]/50 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#A28444]/20 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">Incorporar a la Agenda CRM</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#A28444]/20 text-[#D4AF37] border border-[#A28444]/40">
                      Capas 1 al 5
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Ingresa los prospectos a la agenda oficial (contactos) con su origen, rol (Líder vs Asesor) y plantilla asignada para disparos inmediatos.
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                
                {/* Audiencia */}
                <div className="p-3.5 bg-[#121111] border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                      Contactos a incorporar:
                    </span>
                    <p className="text-base font-black text-white">
                      {selectedProspectIds.size > 0 
                        ? `${selectedProspectIds.size} prospectos seleccionados` 
                        : `${totalCount} prospectos bajo los filtros actuales`}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#A28444]/20 text-[#D4AF37] border border-[#A28444]/40">
                    Grupo CRM: PROSPECTO ASESORES / LIDERES
                  </span>
                </div>

                {/* Selector de Capa a Asignar */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-neutral-400 mb-2">
                    Seleccioná la Capa Oficial de Origen (1 al 5):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    {/* Auto */}
                    <button
                      type="button"
                      onClick={() => setCrmIncorporateConfig(prev => ({ ...prev, targetCapa: 'AUTO' }))}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        crmIncorporateConfig.targetCapa === 'AUTO'
                          ? 'bg-[#A28444]/20 border-[#D4AF37] text-white shadow'
                          : 'bg-[#121111] border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-[#D4AF37]">🌟 Auto-Detectar Capa</span>
                        <span className="text-[9px] uppercase font-bold text-neutral-500">Recomendado</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Mantiene la capa de origen de cada prospecto (RE/MAX = Capa 1, Corredores = Capa 2, etc.)
                      </p>
                    </button>

                    {/* Capas 1 a 5 */}
                    {CAPAS_CONFIG.map(capa => {
                      const isSelected = crmIncorporateConfig.targetCapa === capa.id;
                      return (
                        <button
                          key={capa.id}
                          type="button"
                          onClick={() => setCrmIncorporateConfig(prev => ({ ...prev, targetCapa: capa.id }))}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? `${capa.bgColor} ${capa.borderColor} text-white shadow ring-1 ${capa.borderColor}`
                              : 'bg-[#121111] border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-black text-xs ${capa.textColor}`}>
                              Capa {capa.num}: {capa.shortName}
                            </span>
                            <span className="text-[9px] uppercase font-mono text-neutral-500">{capa.tag}</span>
                          </div>
                          <p className="text-[11px] text-neutral-300 mt-1 truncate">
                            {capa.desc}
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
                            Redes: {capa.networks}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lo que ocurrirá en el CRM */}
                <div className="p-3.5 bg-black/60 border border-white/5 rounded-2xl text-[11px] text-neutral-300 space-y-1.5">
                  <p className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Atributos que se registrarán en la tabla de Contactos del CRM:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-400">
                    <li><strong>Identificador de Capa:</strong> <code>metadata_extra.capa_numero</code> (1 al 5) y tag de origen para filtros en el CRM.</li>
                    <li><strong>Clasificación Jerárquica:</strong> Líderes/Brokers se asignan al grupo <code>LIDERES</code> con rol Líder; agentes a <code>PROSPECTO ASESORES</code>.</li>
                    <li><strong>Plantilla Vinculada:</strong> Cada contacto queda rotulado con su plantilla sugerida (Email y WhatsApp) para no mezclar discursos.</li>
                    <li><strong>Estandarización E.164:</strong> Teléfonos normalizados a +549... para disparos directos por WhatsApp Cloud API.</li>
                  </ul>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCrmIncorporateModal(false)}
                  className="px-4 py-2.5 bg-[#232121] hover:bg-[#2c2929] text-neutral-300 font-bold text-xs rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={incorporatingCrm}
                  onClick={handleConfirmIncorporateToCRM}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#A28444] to-[#D4AF37] hover:brightness-110 text-black font-black text-xs rounded-xl shadow-lg shadow-[#A28444]/25 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {incorporatingCrm ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                  <span>{incorporatingCrm ? 'Incorporando al CRM...' : 'Confirmar e Incorporar al CRM'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </Panel>
    </div>
  );
}
