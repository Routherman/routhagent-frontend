"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import { API_URL, BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Mail, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Copy, 
  Check, 
  Upload, 
  Music, 
  Image as ImageIcon, 
  FileText, 
  Presentation, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  Clock, 
  Users, 
  Paperclip, 
  ExternalLink, 
  Sparkles,
  Play,
  Pause,
  Download,
  Search,
  Filter,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  Zap,
  X
} from 'lucide-react';

export default function CampaignsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'meta';

  const [codigoEmpresa, setCodigoEmpresa] = useState('KRZMJI');
  const [activeTab, setActiveTab] = useState(initialTab); // 'meta', 'email', 'media', 'templates'
  const [loading, setLoading] = useState(true);

  // Datos principales
  const [campaigns, setCampaigns] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [medios, setMedios] = useState([]);
  const [crmContacts, setCrmContacts] = useState([]);

  // Estados de Modales
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null); // Modal de previsualización / reproducción
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEmailPreview, setShowEmailPreview] = useState(true);

  // Filtros de Biblioteca de Medios
  const [mediaRubroFilter, setMediaRubroFilter] = useState('todos'); // 'todos', 'audio', 'imagen', 'pdf', 'presentacion'
  const [mediaSearch, setMediaSearch] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Búsqueda de contactos en modal de Email
  const [emailContactSearch, setEmailContactSearch] = useState('');

  // Metodología combinada: Email-Skills (Entregabilidad), Mail-Merge (Test 1-clic y validación) y Minigun (Resiliencia)
  const [deliverability, setDeliverability] = useState({
    score: 98,
    status: 'excelente',
    warnings: [],
    suggestions: [],
    canSpamCompliant: true
  });
  const [mergeValidation, setMergeValidation] = useState(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [resumingCampaignId, setResumingCampaignId] = useState(null);
  const [showSpamDetails, setShowSpamDetails] = useState(false);

  // Formulario Campaña Meta
  const [metaForm, setMetaForm] = useState({
    nombre: '',
    plantillaId: '',
    targetGroup: 'TODOS',
    selectedContactIds: [],
    customMessage: '',
    selectedMedia: [],
    messagesPerMinute: 15
  });

  // Formulario Campaña Email
  const [emailForm, setEmailForm] = useState({
    nombre: '',
    asunto: '',
    plantillaId: '',
    targetGroup: 'PROSPECTO ASESORES',
    selectedContactIds: [],
    htmlContent: '',
    selectedMedia: [],
    humanPacing: true
  });

  // Formulario Editor de Plantilla
  const [templateForm, setTemplateForm] = useState({
    tipo: 'whatsapp',
    nombre: '',
    categoria: 'asesores',
    asunto: '',
    contenido: '',
    archivos_adjuntos: []
  });

  // Estados para Lanzador Rápido de Envíos y Plantillas Meta Aprobadas
  const [metaApprovedTemplates, setMetaApprovedTemplates] = useState([]);
  const [quickDispatchChannel, setQuickDispatchChannel] = useState('whatsapp'); // 'whatsapp' | 'email'
  const [quickSelectedTemplateId, setQuickSelectedTemplateId] = useState('');
  const [quickSelectedGroup, setQuickSelectedGroup] = useState('TODOS');

  // 1. Obtener código de empresa del usuario autenticado
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

  // 2. Cargar datos consolidados
  const fetchAllData = async (isInitial = false) => {
    if (!codigoEmpresa) return;
    try {
      if (isInitial) setLoading(true);
      const headers = { 'ngrok-skip-browser-warning': 'true' };

      const [resCamp, resPlan, resMed, resCont, resMetaTpls] = await Promise.all([
        fetch(`${API_URL}/empresas/${codigoEmpresa}/campanas`, { headers }),
        fetch(`${API_URL}/empresas/${codigoEmpresa}/plantillas`, { headers }),
        fetch(`${API_URL}/empresas/${codigoEmpresa}/medios`, { headers }),
        fetch(`${API_URL}/empresas/${codigoEmpresa}/crm/contacts`, { headers }),
        fetch(`${API_URL}/empresas/${codigoEmpresa}/templates`, { headers }).catch(() => ({ ok: false }))
      ]);

      if (resCamp.ok) setCampaigns(await resCamp.json());
      if (resPlan.ok) setPlantillas(await resPlan.json());
      if (resMed.ok) setMedios(await resMed.json());
      if (resCont.ok) {
        const contData = await resCont.json();
        const list = Array.isArray(contData) ? contData : (contData.contacts || []);
        setCrmContacts(list);
      }
      if (resMetaTpls && resMetaTpls.ok) {
        const metaTplData = await resMetaTpls.json();
        if (Array.isArray(metaTplData)) {
          setMetaApprovedTemplates(metaTplData.filter(t => t.status === 'APPROVED'));
        }
      }
    } catch (e) {
      console.error('Error fetching campaign hub data:', e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Enviar plantilla a Meta Cloud API para aprobación oficial
  const handleSubmitTemplateToMeta = async (plantillaId, templateName) => {
    try {
      toast.info(`Enviando plantilla "${templateName}" a Meta para aprobación oficial...`);
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/plantillas/${plantillaId}/submit-meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`🚀 ¡Plantilla "${data.metaName}" enviada a Meta con éxito! Estado: ${data.status}`);
        fetchAllData();
      } else {
        toast.error(data.error || 'Error al enviar plantilla a Meta');
      }
    } catch (err) {
      console.error('Error submitting template to Meta:', err);
      toast.error('Error de red al enviar plantilla a Meta');
    }
  };

  // Lanzador Rápido de Campañas
  const handleLaunchQuickDispatch = () => {
    if (quickDispatchChannel === 'whatsapp') {
      let chosenTpl = plantillas.find(p => p.id === Number(quickSelectedTemplateId) && p.tipo === 'whatsapp');
      let metaTpl = metaApprovedTemplates.find(t => t.name === quickSelectedTemplateId || t.id === quickSelectedTemplateId);
      
      setMetaForm({
        nombre: `Campaña WhatsApp - ${chosenTpl?.nombre || metaTpl?.name || 'General'} (${new Date().toLocaleDateString('es-AR')})`,
        plantillaId: chosenTpl ? chosenTpl.id : (metaTpl?.name || ''),
        targetGroup: quickSelectedGroup,
        selectedContactIds: [],
        customMessage: chosenTpl ? chosenTpl.contenido : (metaTpl?.components?.find(c => c.type === 'BODY')?.text || ''),
        selectedMedia: chosenTpl?.archivos_adjuntos || [],
        messagesPerMinute: 15
      });
      setShowMetaModal(true);
    } else {
      let chosenTpl = plantillas.find(p => p.id === Number(quickSelectedTemplateId) && p.tipo === 'email');
      if (!chosenTpl) {
        chosenTpl = plantillas.find(p => p.tipo === 'email');
      }
      const initialTargets = crmContacts
        .filter(c => c.email && c.email.includes('@'))
        .filter(c => quickSelectedGroup === 'TODOS' || (c.grupo || '').toUpperCase() === quickSelectedGroup.toUpperCase());

      setEmailForm({
        nombre: `Envío Email - ${chosenTpl?.nombre || 'General'} (${new Date().toLocaleDateString('es-AR')})`,
        asunto: chosenTpl?.asunto || 'Comunicación Oficial • Colaboratium',
        plantillaId: chosenTpl?.id || '',
        targetGroup: quickSelectedGroup,
        selectedContactIds: initialTargets.map(c => c.id),
        htmlContent: chosenTpl?.contenido || '',
        selectedMedia: chosenTpl?.archivos_adjuntos || [],
        humanPacing: true
      });
      setShowEmailPreview(true);
      setShowEmailModal(true);
    }
  };

  useEffect(() => {
    fetchAllData(true);
    const interval = setInterval(() => {
      fetchAllData(false);
    }, 7000);
    return () => clearInterval(interval);
  }, [codigoEmpresa]);

  // Obtener URL completa y accesible para medios y estáticos
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const clean = url.startsWith('/') ? url : `/${url}`;
    const base = BASE_URL || API_URL.replace(/\/api\/?$/, '');
    return `${base}${clean}`;
  };

  // Manejo de tabs con URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.replace(`/dashboard/campaigns?tab=${tab}`);
  };

  // Filtrado de Medios por Rubro
  const filteredMedios = medios.filter(m => {
    const matchRubro = mediaRubroFilter === 'todos' || m.rubro === mediaRubroFilter;
    const matchSearch = !mediaSearch || m.nombre.toLowerCase().includes(mediaSearch.toLowerCase());
    return matchRubro && matchSearch;
  });

  // Métricas
  const metaCampaigns = campaigns.filter(c => (c.tipo || 'whatsapp') === 'whatsapp');
  const emailCampaigns = campaigns.filter(c => c.tipo === 'email');

  const metaEnviados = metaCampaigns.reduce((acc, c) => acc + (Number(c.enviados) || 0), 0);
  const metaEntregados = metaCampaigns.reduce((acc, c) => acc + (Number(c.entregados) || 0), 0);
  const metaRespondidos = metaCampaigns.reduce((acc, c) => acc + (Number(c.respondidos) || 0), 0);
  const metaTasaRespuesta = metaEnviados > 0 ? Math.round((metaRespondidos / metaEnviados) * 100) : 0;

  const emailEnviados = emailCampaigns.reduce((acc, c) => acc + (Number(c.enviados) || 0), 0);
  const emailEntregados = emailCampaigns.reduce((acc, c) => acc + (Number(c.entregados) || 0), 0);

  // Subida de Archivo a la Biblioteca de Medios
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('rubro', mediaRubroFilter !== 'todos' ? mediaRubroFilter : 'auto');

    setUploadingMedia(true);
    toast.info("Subiendo archivo a la biblioteca de medios...");

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/medios/upload`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Archivo "${data.nombre}" subido al rubro ${data.rubro.toUpperCase()}`);
        fetchAllData();
      } else {
        toast.error(data.error || "Error subiendo archivo");
      }
    } catch (err) {
      toast.error("Error de conexión al subir medio");
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  // Eliminar medio
  const handleDeleteMedia = async (id, nombre) => {
    if (!confirm(`¿Deseas eliminar "${nombre}" de la biblioteca?`)) return;
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/medios/${id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        toast.success("Medio eliminado correctamente");
        setMedios(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      toast.error("Error eliminando medio");
    }
  };

  // Crear / Editar Plantilla
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.nombre || !templateForm.contenido) {
      toast.error("Completa el nombre y contenido de la plantilla");
      return;
    }

    try {
      const isEdit = !!editingTemplate;
      const url = isEdit 
        ? `${API_URL}/empresas/${codigoEmpresa}/plantillas/${editingTemplate.id}`
        : `${API_URL}/empresas/${codigoEmpresa}/plantillas`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(templateForm)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? "Plantilla actualizada con éxito" : "Plantilla creada con éxito");
        setShowTemplateModal(false);
        setEditingTemplate(null);
        setTemplateForm({ tipo: 'whatsapp', nombre: '', categoria: 'asesores', asunto: '', contenido: '', archivos_adjuntos: [] });
        fetchAllData();
      } else {
        toast.error(data.error || "Error guardando plantilla");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor");
    }
  };

  // Eliminar Plantilla
  const handleDeleteTemplate = async (id, nombre) => {
    if (!confirm(`¿Eliminar la plantilla "${nombre}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/plantillas/${id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        toast.success("Plantilla eliminada");
        setPlantillas(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      toast.error("Error eliminando plantilla");
    }
  };

  // Lanzar Campaña WhatsApp Meta
  const handleLaunchMetaCampaign = async (e) => {
    e.preventDefault();
    if (!metaForm.nombre) {
      toast.error("Ingresa un nombre para la campaña");
      return;
    }

    // Filtrar contactos según targetGroup
    let targetContacts = crmContacts;
    if (metaForm.targetGroup !== 'TODOS') {
      targetContacts = crmContacts.filter(c => (c.grupo || '').toUpperCase() === metaForm.targetGroup);
    }
    const contactIds = targetContacts.map(c => c.id);

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/campanas/meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          campaignName: metaForm.nombre,
          contactIds,
          plantillaId: metaForm.plantillaId || null,
          templateContent: metaForm.customMessage,
          attachments: metaForm.selectedMedia,
          messagesPerMinute: metaForm.messagesPerMinute
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Campaña de WhatsApp lanzada para ${data.totalContactos} contactos`);
        setShowMetaModal(false);
        fetchAllData();
      } else {
        toast.error(data.error || "Error al iniciar campaña");
      }
    } catch (err) {
      toast.error("Error de red al lanzar campaña");
    }
  };

  // Lanzar Campaña Email (Gmail)
  const handleLaunchEmailCampaign = async (e) => {
    e.preventDefault();
    if (!emailForm.nombre || !emailForm.asunto || !emailForm.htmlContent) {
      toast.error("Completa el nombre, asunto y contenido del correo");
      return;
    }

    let finalContactIds = [];
    if (emailForm.selectedContactIds && emailForm.selectedContactIds.length > 0) {
      finalContactIds = emailForm.selectedContactIds;
    } else {
      let targetContacts = crmContacts.filter(c => c.email && c.email.includes('@'));
      if (emailForm.targetGroup !== 'TODOS') {
        targetContacts = targetContacts.filter(c => (c.grupo || '').toUpperCase() === emailForm.targetGroup.toUpperCase());
      }
      finalContactIds = targetContacts.map(c => c.id);
    }

    if (finalContactIds.length === 0) {
      toast.error("No hay contactos con email válido seleccionados para la campaña");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/campanas/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          campaignName: emailForm.nombre,
          subject: emailForm.asunto,
          content: emailForm.htmlContent,
          contactIds: finalContactIds,
          plantillaId: emailForm.plantillaId || null,
          attachments: emailForm.selectedMedia,
          humanPacing: emailForm.humanPacing
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Campaña iniciada para ${data.totalContactos} destinatarios (${emailForm.humanPacing ? 'Ritmo humano anti-bloqueo 2-3/min' : 'Envío directo'})`);
        setShowEmailModal(false);
        fetchAllData();
      } else {
        toast.error(data.error || "Error al iniciar campaña");
      }
    } catch (err) {
      toast.error("Error de conexión al enviar correos");
    }
  };

  // Copiar link de medio
  const handleCopyLink = (url) => {
    const fullUrl = getMediaUrl(url);
    navigator.clipboard.writeText(fullUrl);
    toast.success("Enlace copiado al portapapeles");
  };

  // Contactos con email filtrados por rubro y búsqueda para el modal de email
  const contactsWithEmail = crmContacts.filter(c => c.email && c.email.includes('@'));
  const availableInGroup = emailForm.targetGroup === 'TODOS'
    ? contactsWithEmail
    : (emailForm.targetGroup === 'CUSTOM' ? contactsWithEmail : contactsWithEmail.filter(c => (c.grupo || '').toUpperCase() === emailForm.targetGroup.toUpperCase()));

  const filteredForSelection = availableInGroup.filter(c => {
    if (!emailContactSearch) return true;
    const q = emailContactSearch.toLowerCase();
    return (c.nombre || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.dni || '').includes(q);
  });

  const selectedCount = emailForm.selectedContactIds.length;

  const handleSelectDamPilot = () => {
    const dam = crmContacts.find(c => c.email && c.email.toLowerCase().includes('damduff'));
    const damId = dam ? dam.id : 52;
    setEmailForm({
      ...emailForm,
      nombre: 'Búsqueda de Asesores Comerciales Colaboratium (Prueba)',
      asunto: 'Búsqueda de Asesores Comerciales Colaboratium',
      targetGroup: 'CUSTOM',
      selectedContactIds: [damId],
      humanPacing: false
    });
    toast.success("Configurado para prueba piloto directa a damduff@gmail.com");
  };

  const handleSelectAllInGroup = () => {
    const ids = availableInGroup.map(c => c.id);
    setEmailForm(prev => ({
      ...prev,
      selectedContactIds: ids
    }));
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredForSelection.map(c => c.id);
    setEmailForm(prev => ({
      ...prev,
      selectedContactIds: Array.from(new Set([...prev.selectedContactIds, ...ids]))
    }));
  };

  const handleClearSelection = () => {
    setEmailForm(prev => ({
      ...prev,
      selectedContactIds: []
    }));
  };

  const toggleContact = (id) => {
    setEmailForm(prev => {
      const exists = prev.selectedContactIds.includes(id);
      return {
        ...prev,
        selectedContactIds: exists 
          ? prev.selectedContactIds.filter(x => x !== id)
          : [...prev.selectedContactIds, id]
      };
    });
  };

  // Efecto para análisis en vivo de entregabilidad anti-spam (Email-Skills)
  useEffect(() => {
    if (!showEmailModal) return;
    const timer = setTimeout(() => {
      if (emailForm.asunto || emailForm.htmlContent) {
        fetch(`${API_URL}/empresas/${codigoEmpresa}/campanas/email/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ subject: emailForm.asunto, content: emailForm.htmlContent })
        })
          .then(r => r.json())
          .then(data => {
            if (data.success && data.analysis) {
              setDeliverability(data.analysis);
            }
          })
          .catch(() => {});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [emailForm.asunto, emailForm.htmlContent, showEmailModal, codigoEmpresa]);

  // Efecto para validación de variables merge (Mail-Merge)
  useEffect(() => {
    if (!showEmailModal) return;
    const timer = setTimeout(() => {
      fetch(`${API_URL}/empresas/${codigoEmpresa}/campanas/email/validate-merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          content: emailForm.htmlContent,
          contactIds: emailForm.selectedContactIds
        })
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.validation) {
            setMergeValidation(data.validation);
          }
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [emailForm.htmlContent, emailForm.selectedContactIds, showEmailModal, codigoEmpresa]);

  // Test de Envío de 1 Clic (Mail-Merge test gate)
  const handleSendTestEmail = async (targetTestEmail = 'damduff@gmail.com') => {
    if (!emailForm.asunto || !emailForm.htmlContent) {
      toast.error("Ingresa un asunto y contenido antes de enviar la prueba");
      return;
    }
    setSendingTestEmail(true);
    toast.info(`Despachando correo de prueba a ${targetTestEmail}...`);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/campanas/email/test-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          testEmail: targetTestEmail,
          subject: emailForm.asunto,
          content: emailForm.htmlContent,
          attachments: emailForm.selectedMedia
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`✅ ${data.message}`);
      } else {
        toast.error(data.error || "Fallo al enviar correo de prueba");
      }
    } catch (err) {
      toast.error("Error al conectar para envío de prueba");
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Reanudar Campaña Interrumpida (Minigun Crash Recovery)
  const handleResumeCampaign = async (campaignId) => {
    setResumingCampaignId(campaignId);
    toast.info(`Reanudando campaña #${campaignId}...`);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/campanas/${campaignId}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchAllData();
      } else {
        toast.error(data.error || "No se pudo reanudar");
      }
    } catch (e) {
      toast.error("Error solicitando reanudación");
    } finally {
      setResumingCampaignId(null);
    }
  };

  // Variables para Modal de Previsualización Multimedia
  const previewFullUrl = previewMedia ? getMediaUrl(previewMedia.archivo_url) : '';
  const isPreviewPdf = previewMedia && (previewMedia.rubro === 'pdf' || previewMedia.mimetype === 'application/pdf' || previewMedia.nombre.toLowerCase().endsWith('.pdf'));
  const isPreviewAudio = previewMedia && (previewMedia.rubro === 'audio' || previewMedia.mimetype?.includes('audio') || previewMedia.nombre.match(/\.(ogg|mp3|wav|m4a)$/i));
  const isPreviewImage = previewMedia && (previewMedia.rubro === 'imagen' || previewMedia.mimetype?.includes('image') || previewMedia.nombre.match(/\.(jpg|jpeg|png|webp|gif)$/i));

  return (
    <>
      <Sidebar />
      <Panel>
        <Header />
        <div className="flex flex-col h-full w-full bg-white dark:bg-[#070b14] rounded-[32px] p-6 md:p-8 shadow-sm overflow-hidden text-gray-950 dark:text-white font-sans transition-colors">
          
          {/* Header & Tabs de Navegación Principal */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5 border-b border-gray-100 dark:border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 tracking-wider">
                  Marketing & Envíos 360°
                </span>
                <span className="text-xs font-bold text-gray-400 font-mono">BCRA Nº 40.015</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white mt-1">
                Centro de Campañas & Medios
              </h1>
              <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 mt-0.5">
                Organización de envíos masivos por WhatsApp Meta, Correos Gmail, Biblioteca de Medios y Plantillas
              </p>
            </div>

            {/* Menú de Sub-Navegación por Canales */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100/80 dark:bg-slate-900/80 rounded-2xl border border-gray-200 dark:border-white/10">
              <button
                onClick={() => handleTabChange('meta')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'meta'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>META (WhatsApp)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{metaCampaigns.length}</span>
              </button>

              <button
                onClick={() => handleTabChange('email')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'email'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Mails (Gmail)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{emailCampaigns.length}</span>
              </button>

              <button
                onClick={() => handleTabChange('media')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'media'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Biblioteca de Medios</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{medios.length}</span>
              </button>

              <button
                onClick={() => handleTabChange('templates')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'templates'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Editores de Plantillas</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{plantillas.length}</span>
              </button>
            </div>
          </div>

          {/* LANZADOR RÁPIDO DE ENVÍOS MASIVOS (WHATSAPP META / GMAIL) */}
          <div className="mb-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#0c1424] dark:via-[#0e1628] dark:to-[#0c1424] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-950 dark:text-white">Lanzador Directo de Envíos Masivos</h3>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">
                    Elige el canal (WhatsApp Meta o Email Gmail), selecciona la plantilla deseada y lanza el envío en 1 clic.
                  </p>
                </div>
              </div>

              {/* Selector de Canal */}
              <div className="flex items-center bg-gray-100 dark:bg-slate-900/90 p-1 rounded-xl border border-gray-200 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setQuickDispatchChannel('whatsapp');
                    setQuickSelectedTemplateId('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    quickDispatchChannel === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Meta</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickDispatchChannel('email');
                    setQuickSelectedTemplateId('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    quickDispatchChannel === 'email'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Gmail</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pt-3">
              {/* Seleccionar Plantilla */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                  {quickDispatchChannel === 'whatsapp' ? 'Plantilla WhatsApp (Aprobada / Configurada)' : 'Plantilla Email Activa'}
                </label>
                <select
                  value={quickSelectedTemplateId}
                  onChange={(e) => setQuickSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Elige una plantilla --</option>
                  {quickDispatchChannel === 'whatsapp' ? (
                    <>
                      <optgroup label="Plantillas WhatsApp Colaboratium">
                        {plantillas.filter(p => p.tipo === 'whatsapp').map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} ({p.categoria})
                          </option>
                        ))}
                      </optgroup>
                      {metaApprovedTemplates.length > 0 && (
                        <optgroup label="Plantillas Aprobadas en Meta WABA">
                          {metaApprovedTemplates.map(t => (
                            <option key={t.id} value={t.name}>
                              Meta: {t.name} ({t.language})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  ) : (
                    <optgroup label="Plantillas de Correo Electrónico">
                      {plantillas.filter(p => p.tipo === 'email').map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.categoria})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Destinatarios */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                  Público Destino
                </label>
                <select
                  value={quickSelectedGroup}
                  onChange={(e) => setQuickSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="TODOS">Todos los Contactos ({crmContacts.length})</option>
                  <option value="PROSPECTO ASESORES">Prospecto Asesores ({crmContacts.filter(c => (c.grupo || '').toUpperCase() === 'PROSPECTO ASESORES' || (c.grupo || '').toUpperCase() === 'ASESORES').length})</option>
                  <option value="LIDERES">Líderes de Equipo ({crmContacts.filter(c => (c.grupo || '').toUpperCase() === 'LIDERES').length})</option>
                  <option value="INVERSORES">Inversores Fintech ({crmContacts.filter(c => (c.grupo || '').toUpperCase() === 'INVERSORES').length})</option>
                  <option value="CLIENTES">Clientes Tomadores ({crmContacts.filter(c => (c.grupo || '').toUpperCase() === 'CLIENTES').length})</option>
                </select>
              </div>

              {/* Botón de Lanzamiento */}
              <div>
                <button
                  type="button"
                  onClick={handleLaunchQuickDispatch}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition hover:scale-[1.01] ${
                    quickDispatchChannel === 'whatsapp'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {quickDispatchChannel === 'whatsapp' ? (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Configurar e Iniciar Envío WhatsApp</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Configurar e Iniciar Envío Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* VISTA 1: META WHATSAPP                                    */}
          {/* ========================================================= */}
          {activeTab === 'meta' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-5 animate-in fade-in duration-200">
              
              {/* Tarjetas de Métricas WhatsApp */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4">
                  <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Campañas WhatsApp</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{metaCampaigns.length}</p>
                </div>
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4">
                  <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Enviados</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{metaEnviados}</p>
                </div>
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4">
                  <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Entregados en Celular</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{metaEntregados}</p>
                </div>
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4">
                  <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Tasa de Respuesta Bot</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-indigo-600">{metaTasaRespuesta}%</p>
                    <span className="text-xs font-bold text-indigo-800">({metaRespondidos})</span>
                  </div>
                </div>
              </div>

              {/* Barra de Acciones */}
              <div className="flex justify-between items-center bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950">Disparador de Campañas WhatsApp Meta</h3>
                    <p className="text-xs font-semibold text-emerald-700">Envíos masivos con multimedia adjunta (audios de voz PTT, imágenes y PDFs)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleTabChange('templates')}
                    className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-extrabold text-emerald-900 hover:bg-emerald-50 transition"
                  >
                    Ver Plantillas WhatsApp ({plantillas.filter(p => p.tipo === 'whatsapp').length})
                  </button>
                  <button
                    onClick={() => {
                      setMetaForm({
                        nombre: `Campaña WhatsApp ${new Date().toLocaleDateString('es-AR')}`,
                        plantillaId: plantillas.find(p => p.tipo === 'whatsapp')?.id || '',
                        targetGroup: 'TODOS',
                        selectedContactIds: [],
                        customMessage: '',
                        selectedMedia: [],
                        messagesPerMinute: 15
                      });
                      setShowMetaModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Campaña WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Tabla de Campañas WhatsApp */}
              <div className="flex-1 overflow-auto border border-gray-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-extrabold">
                      <th className="py-3 px-4">Campaña</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-center">Progreso</th>
                      <th className="py-3 px-4 text-center">Entregados</th>
                      <th className="py-3 px-4 text-center">Respuestas</th>
                      <th className="py-3 px-4 text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold">
                    {metaCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                          No hay campañas de WhatsApp registradas. Haz clic en "Nueva Campaña WhatsApp" para comenzar.
                        </td>
                      </tr>
                    ) : (
                      metaCampaigns.map((camp) => {
                        const total = camp.total_contactos || 1;
                        const enviados = Number(camp.enviados) || 0;
                        const percent = Math.min(100, Math.round((enviados / total) * 100));
                        const isProgress = camp.estado === 'en_progreso';

                        return (
                          <tr key={camp.id} className="hover:bg-gray-50/70 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-gray-950">{camp.nombre}</div>
                              <div className="text-[11px] text-gray-400 font-mono">ID: #{camp.id} • WhatsApp Meta</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                isProgress ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {isProgress && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>}
                                {isProgress ? 'Enviando...' : 'Completada'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex flex-col items-center gap-1 max-w-[140px] mx-auto">
                                <div className="flex justify-between w-full text-[11px] text-gray-600 font-bold">
                                  <span>{enviados}/{camp.total_contactos}</span>
                                  <span>{percent}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-gray-800">{camp.entregados || 0}</td>
                            <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{camp.respondidos || 0}</td>
                            <td className="py-3.5 px-4 text-right text-gray-500 font-mono text-[11px]">
                              {new Date(camp.creado_en).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VISTA 2: MAILS (GMAIL)                                    */}
          {/* ========================================================= */}
          {activeTab === 'email' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-5 animate-in fade-in duration-200">
              
              {/* Tarjetas de Métricas Email */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4">
                  <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Campañas Email</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{emailCampaigns.length}</p>
                </div>
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4">
                  <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Correos Despachados</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{emailEnviados}</p>
                </div>
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4">
                  <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Remitente Autorizado</p>
                  <p className="text-xs font-black text-blue-700 mt-2 truncate font-mono">colaboratium@gmail.com</p>
                </div>
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4">
                  <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Servicio de Correo</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-black text-gray-800">Gmail Oficial Activo</span>
                  </div>
                </div>
              </div>

              {/* Barra de Acciones */}
              <div className="flex justify-between items-center bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-blue-950">Despacho de Correos Masivos desde Gmail</h3>
                    <p className="text-xs font-semibold text-blue-700">Envíos con plantillas personalizadas, variables dinámicas y archivos adjuntos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleTabChange('templates')}
                    className="px-3.5 py-2 rounded-xl bg-white border border-blue-300 text-xs font-extrabold text-blue-900 hover:bg-blue-50 transition"
                  >
                    Ver Plantillas Email ({plantillas.filter(p => p.tipo === 'email').length})
                  </button>
                  <button
                    onClick={() => {
                      const officialTemplate = plantillas.find(p => p.id === 7 || p.nombre?.includes('Reunión Informativa')) || plantillas.find(p => p.tipo === 'email');
                      const presPdf = medios.find(m => m.nombre?.includes('Presentacion_Colaboratium') || m.url?.includes('Presentacion_Colaboratium'));
                      const initialTargets = crmContacts
                        .filter(c => c.email && c.email.includes('@'))
                        .filter(c => (c.grupo || '').toUpperCase() === 'PROSPECTO ASESORES');
                      setEmailForm({
                        nombre: `Reunión Informativa Asesores Colaboratium - ${new Date().toLocaleDateString('es-AR')}`,
                        asunto: officialTemplate?.asunto || 'Invitación: Reunión Informativa para Futuros Asesores Comerciales • Colaboratium',
                        plantillaId: officialTemplate?.id || '',
                        targetGroup: 'PROSPECTO ASESORES',
                        selectedContactIds: initialTargets.map(c => c.id),
                        htmlContent: officialTemplate?.contenido || '',
                        selectedMedia: presPdf ? [{ nombre: presPdf.nombre, path: presPdf.url }] : [],
                        humanPacing: true
                      });
                      setShowEmailPreview(true);
                      setShowEmailModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Campaña de Email</span>
                  </button>
                </div>
              </div>

              {/* Monitor en Tiempo Real de Campaña Activa */}
              {emailCampaigns.filter(c => c.estado === 'en_progreso').map(activeCamp => {
                const total = activeCamp.total_contactos || 1;
                const enviados = activeCamp.enviados || 0;
                const pct = Math.min(100, Math.round((enviados / total) * 100));
                return (
                  <div key={activeCamp.id} className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl shadow-md border border-blue-700 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-blue-200">
                          Despacho Activo en Tiempo Real: <span className="text-white font-extrabold">{activeCamp.nombre}</span>
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                        {enviados} de {total} ({pct}%) • Ritmo Humano Anti-Baneo
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-2">
                      <div 
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Log dinámico en vivo */}
                    <div className="flex items-center gap-2 text-xs font-mono text-blue-200 truncate">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                      <span className="truncate">{activeCamp.ultimo_log || 'Despachando emails a ritmo seguro para evitar bloqueos...'}</span>
                    </div>
                  </div>
                );
              })}

              {/* Tabla de Campañas Email */}
              <div className="flex-1 overflow-auto border border-gray-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-extrabold">
                      <th className="py-3 px-4">Campaña</th>
                      <th className="py-3 px-4">Asunto del Correo</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-center">Destinatarios</th>
                      <th className="py-3 px-4 text-center">Enviados</th>
                      <th className="py-3 px-4 text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold">
                    {emailCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                          No hay campañas de correo enviadas aún. Haz clic en "Nueva Campaña de Email" para comenzar.
                        </td>
                      </tr>
                    ) : (
                      emailCampaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-gray-50/70 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-gray-950">{camp.nombre}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-400 font-mono">ID: #{camp.id} • Canal Gmail</span>
                              {camp.spam_score && (
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  🛡️ {camp.spam_score}/100 Anti-Spam
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-800 max-w-[280px]">
                            <p className="truncate">{camp.asunto_email || 'Sin asunto registrado'}</p>
                            {camp.ultimo_log && (
                              <p className="text-[10px] text-indigo-600 font-mono truncate mt-0.5" title={camp.ultimo_log}>
                                ⚡ {camp.ultimo_log}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {camp.estado === 'en_progreso' ? (
                              <div className="flex flex-col gap-1 items-start">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                                  <span>En Progreso ({camp.enviados || 0}/{camp.total_contactos})</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleResumeCampaign(camp.id)}
                                  disabled={resumingCampaignId === camp.id}
                                  className="mt-1 px-2.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs transition flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  <span>{resumingCampaignId === camp.id ? 'Reanudando...' : 'Reanudar Envío'}</span>
                                </button>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✓ Completada ({camp.enviados || camp.total_contactos})
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-gray-700">{camp.total_contactos}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{camp.enviados}</td>
                          <td className="py-3.5 px-4 text-right text-gray-500 font-mono text-[11px]">
                            {new Date(camp.creado_en).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VISTA 3: BIBLIOTECA DE MEDIOS (MEDIA HUB INSPIRADO EN C:\SaaSIA) */}
          {/* ========================================================= */}
          {activeTab === 'media' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-4 animate-in fade-in duration-200">
              
              {/* Barra de Filtros por Rubro & Subida */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                
                {/* Rubros Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setMediaRubroFilter('todos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      mediaRubroFilter === 'todos' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Todos ({medios.length})
                  </button>
                  <button
                    onClick={() => setMediaRubroFilter('audio')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      mediaRubroFilter === 'audio' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Audios de Voz ({medios.filter(m => m.rubro === 'audio').length})</span>
                  </button>
                  <button
                    onClick={() => setMediaRubroFilter('imagen')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      mediaRubroFilter === 'imagen' ? 'bg-sky-600 text-white shadow-xs' : 'bg-white text-sky-800 border border-sky-200 hover:bg-sky-50'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Imágenes ({medios.filter(m => m.rubro === 'imagen').length})</span>
                  </button>
                  <button
                    onClick={() => setMediaRubroFilter('pdf')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      mediaRubroFilter === 'pdf' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDFs & Fichas ({medios.filter(m => m.rubro === 'pdf').length})</span>
                  </button>
                  <button
                    onClick={() => setMediaRubroFilter('presentacion')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      mediaRubroFilter === 'presentacion' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-purple-800 border border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Presentaciones PPTX ({medios.filter(m => m.rubro === 'presentacion').length})</span>
                  </button>
                </div>

                {/* Subir Archivo Botón */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar medios..."
                      value={mediaSearch}
                      onChange={e => setMediaSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <label className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingMedia ? 'Subiendo...' : 'Subir Archivo'}</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploadingMedia} />
                  </label>
                </div>
              </div>

              {/* Grid de Medios por Rubro */}
              <div className="flex-1 overflow-y-auto pr-1">
                {filteredMedios.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <FolderOpen className="w-12 h-12 mb-2 text-gray-300" />
                    <p className="font-bold text-gray-600">No se encontraron archivos en este rubro.</p>
                    <p className="text-xs text-gray-400 mt-0.5">Usa el botón "Subir Archivo" para agregar recursos multimedia.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredMedios.map((medio) => {
                      const isAudio = medio.rubro === 'audio';
                      const isImage = medio.rubro === 'imagen';
                      const isPdf = medio.rubro === 'pdf';
                      const isPres = medio.rubro === 'presentacion';
                      const fullUrl = getMediaUrl(medio.archivo_url);

                      return (
                        <div key={medio.id} className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all">
                          
                          {/* Header / Previsualización Visual */}
                          <div 
                            onClick={() => setPreviewMedia(medio)}
                            className="h-32 bg-gray-50 flex items-center justify-center relative p-3 border-b border-gray-100 overflow-hidden cursor-pointer hover:bg-gray-100/80 transition"
                            title="Haz clic para previsualizar o reproducir"
                          >
                            {isImage ? (
                              <img src={fullUrl} alt={medio.nombre} className="h-full w-full object-contain" />
                            ) : isAudio ? (
                              <div className="flex flex-col items-center justify-center gap-1.5 text-emerald-600 w-full px-2">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-xs">
                                  <Music className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-emerald-800">Nota de Voz WhatsApp</span>
                                <span className="text-[10px] text-gray-500 font-bold">▶ Clic para reproducir</span>
                              </div>
                            ) : isPdf ? (
                              <div className="flex flex-col items-center justify-center gap-1 text-rose-600">
                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shadow-xs">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-rose-800">Documento PDF Oficial</span>
                                <span className="text-[10px] text-gray-500 font-bold">👁 Clic para abrir PDF</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-1 text-purple-600">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shadow-xs">
                                  <Presentation className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-purple-800">Presentación / Video</span>
                                <span className="text-[10px] text-gray-500 font-bold">👁 Clic para ver</span>
                              </div>
                            )}

                            {/* Badge de Rubro */}
                            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isAudio ? 'bg-emerald-100 text-emerald-800' :
                              isImage ? 'bg-sky-100 text-sky-800' :
                              isPdf ? 'bg-rose-100 text-rose-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {medio.rubro}
                            </span>
                          </div>

                          {/* Info del Archivo */}
                          <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="font-extrabold text-xs text-gray-950 truncate" title={medio.nombre}>
                                {medio.nombre}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-medium">
                                <span>{(medio.tamano_bytes / 1024).toFixed(0)} KB</span>
                                <span>•</span>
                                <span>{new Date(medio.creado_en).toLocaleDateString('es-AR')}</span>
                              </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-gray-100">
                              <button
                                type="button"
                                onClick={() => setPreviewMedia(medio)}
                                className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-extrabold text-center flex items-center justify-center gap-1 transition border border-indigo-200/60"
                                title="Ver o reproducir archivo"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver / Reproducir</span>
                              </button>
                              <button
                                onClick={() => handleCopyLink(medio.archivo_url)}
                                title="Copiar enlace directo"
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={fullUrl}
                                download={medio.nombre}
                                target="_blank"
                                rel="noreferrer"
                                title="Descargar"
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDeleteMedia(medio.id, medio.nombre)}
                                title="Eliminar"
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VISTA 4: EDITORES DE PLANTILLAS                           */}
          {/* ========================================================= */}
          {activeTab === 'templates' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-4 animate-in fade-in duration-200">
              
              {/* Barra superior de Plantillas */}
              <div className="flex justify-between items-center bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-500/30 p-4 rounded-2xl">
                <div>
                  <h3 className="text-sm font-black text-amber-950 dark:text-amber-300">Gestor de Plantillas para WhatsApp y Email</h3>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400/80">Crea, modifica y borra plantillas con variables dinámicas y previsualización en vivo</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setTemplateForm({
                      tipo: 'whatsapp',
                      nombre: '',
                      categoria: 'asesores',
                      asunto: '',
                      contenido: '',
                      archivos_adjuntos: []
                    });
                    setShowTemplateModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Crear Nueva Plantilla</span>
                </button>
              </div>

              {/* Grid de Plantillas */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plantillas.map((plan) => {
                    const isWhatsApp = plan.tipo === 'whatsapp';
                    return (
                      <div key={plan.id} className="flex flex-col bg-white dark:bg-[#0e1628] border border-gray-200 dark:border-white/10 rounded-2xl p-4 hover:border-amber-400 dark:hover:border-amber-400/60 hover:shadow-md transition">
                        
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isWhatsApp 
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' 
                              : 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                          }`}>
                            {isWhatsApp ? '📱 WhatsApp Meta' : '✉️ Email Gmail'}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">{plan.categoria}</span>
                        </div>

                        <h4 className="font-black text-sm text-gray-950 dark:text-white mb-1">{plan.nombre}</h4>
                        {plan.asunto && (
                          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2 truncate">
                            Asunto: {plan.asunto}
                          </p>
                        )}

                        {/* Previsualización del Contenido */}
                        <div className="flex-1 bg-gray-50 dark:bg-[#090e1c] rounded-xl p-3 border border-gray-100 dark:border-white/10 text-xs text-gray-700 dark:text-slate-200 font-sans line-clamp-4 leading-relaxed mb-3">
                          {plan.contenido.replace(/<[^>]*>?/gm, '')}
                        </div>

                        {/* Adjuntos */}
                        {plan.archivos_adjuntos && plan.archivos_adjuntos.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {plan.archivos_adjuntos.map((att, aIdx) => (
                              <span key={aIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-[10px] font-bold text-gray-700 dark:text-slate-300 border border-transparent dark:border-white/10">
                                <Paperclip className="w-2.5 h-2.5" />
                                {att.nombre}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Botones de Acción */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/10">
                          {isWhatsApp && (
                            <button
                              onClick={() => handleSubmitTemplateToMeta(plan.id, plan.nombre)}
                              className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-black text-white transition shadow-xs"
                              title="Enviar plantilla a Meta WhatsApp API para aprobación oficial"
                            >
                              <Send className="w-3 h-3" />
                              <span>Aprobar en Meta</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingTemplate(plan);
                              setTemplateForm({
                                tipo: plan.tipo,
                                nombre: plan.nombre,
                                categoria: plan.categoria || 'general',
                                asunto: plan.asunto || '',
                                contenido: plan.contenido,
                                archivos_adjuntos: plan.archivos_adjuntos || []
                              });
                              setShowTemplateModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-bold text-gray-800 dark:text-slate-200 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(plan.id, plan.nombre)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                            title="Eliminar plantilla"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </Panel>

      {/* ========================================================= */}
      {/* MODAL: NUEVA CAMPAÑA WHATSAPP META                        */}
      {/* ========================================================= */}
      {showMetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-200 text-gray-950 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-950">Lanzar Campaña Masiva WhatsApp (Meta)</h3>
                  <p className="text-[11px] font-semibold text-gray-500">Envío programado a través de WhatsApp Cloud API</p>
                </div>
              </div>
              <button onClick={() => setShowMetaModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLaunchMetaCampaign} className="space-y-4 py-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Nombre de Campaña</label>
                <input
                  type="text"
                  required
                  value={metaForm.nombre}
                  onChange={e => setMetaForm({ ...metaForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">Público Destino</label>
                  <select
                    value={metaForm.targetGroup}
                    onChange={e => setMetaForm({ ...metaForm, targetGroup: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="TODOS">Todos los Contactos ({crmContacts.length})</option>
                    <option value="ASESORES">Asesores Comerciales ({crmContacts.filter(c => c.grupo === 'ASESORES').length})</option>
                    <option value="LIDERES">Líderes de Equipo ({crmContacts.filter(c => c.grupo === 'LIDERES').length})</option>
                    <option value="INVERSORES">Inversores Fintech ({crmContacts.filter(c => c.grupo === 'INVERSORES').length})</option>
                    <option value="CLIENTES">Clientes Tomadores ({crmContacts.filter(c => c.grupo === 'CLIENTES').length})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">Velocidad de Envío</label>
                  <select
                    value={metaForm.messagesPerMinute}
                    onChange={e => setMetaForm({ ...metaForm, messagesPerMinute: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={10}>10 mensajes / minuto (Seguro)</option>
                    <option value={15}>15 mensajes / minuto (Recomendado)</option>
                    <option value={25}>25 mensajes / minuto (Rápido)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Seleccionar Plantilla WhatsApp</label>
                <select
                  value={metaForm.plantillaId}
                  onChange={e => {
                    const sel = plantillas.find(p => p.id === Number(e.target.value));
                    setMetaForm({
                      ...metaForm,
                      plantillaId: e.target.value,
                      customMessage: sel ? sel.contenido : metaForm.customMessage,
                      selectedMedia: sel ? sel.archivos_adjuntos || [] : []
                    });
                  }}
                  className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Personalizado / Sin plantilla --</option>
                  {plantillas.filter(p => p.tipo === 'whatsapp').map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.categoria})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Mensaje del Chat</label>
                <textarea
                  rows={4}
                  value={metaForm.customMessage}
                  onChange={e => setMetaForm({ ...metaForm, customMessage: e.target.value })}
                  placeholder="Hola {{nombre}}, te escribimos de Colaboratium..."
                  className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Adjuntos desde Biblioteca de Medios</label>
                <div className="max-h-28 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                  {medios.map(m => {
                    const isSelected = metaForm.selectedMedia.some(att => att.nombre === m.nombre);
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          if (isSelected) {
                            setMetaForm({ ...metaForm, selectedMedia: metaForm.selectedMedia.filter(att => att.nombre !== m.nombre) });
                          } else {
                            setMetaForm({ ...metaForm, selectedMedia: [...metaForm.selectedMedia, { nombre: m.nombre, url: m.archivo_url, rubro: m.rubro }] });
                          }
                        }}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                          isSelected ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <span className="truncate">{m.nombre} ({m.rubro})</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowMetaModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Lanzar Campaña WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NUEVA CAMPAÑA EMAIL (GMAIL)                        */}
      {/* ========================================================= */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl border border-gray-200 text-gray-950 flex flex-col max-h-[92vh] overflow-hidden">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-gray-950">Lanzar Campaña Masiva por Email (Gmail)</h3>
                    <p className="text-[11px] font-semibold text-gray-500">
                      Remitente: <span className="font-mono text-blue-700 font-bold">colaboratium@gmail.com</span> • BCRA Nº 40.015
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Arquitectura Combinada: Entregabilidad (Email-Skills) + Test 1-Clic (Mail-Merge) */}
              <div className="mt-3 p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-800 rounded-2xl flex flex-col gap-2.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                          Entregabilidad Anti-Spam:
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                          deliverability.score >= 85 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : (deliverability.score >= 70 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30')
                        }`}>
                          {deliverability.score}/100 • {deliverability.status.toUpperCase()}
                        </span>
                        {deliverability.canSpamCompliant && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                            ✓ CAN-SPAM OK
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Filtro heurístico activo • Enlace de baja y razón social BCRA verificados
                      </p>
                    </div>
                  </div>

                  {/* Botón de Test de Envío Real de 1 Clic */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={sendingTestEmail}
                      onClick={() => handleSendTestEmail('damduff@gmail.com')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingTestEmail ? 'Enviando...' : '🎯 Test 1-Clic a damduff@gmail.com'}</span>
                    </button>
                    {(deliverability.warnings.length > 0 || deliverability.suggestions.length > 0) && (
                      <button
                        type="button"
                        onClick={() => setShowSpamDetails(!showSpamDetails)}
                        className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
                      >
                        {showSpamDetails ? 'Ocultar' : `Detalles (${deliverability.warnings.length})`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Desplegable de Recomendaciones Anti-Spam */}
                {showSpamDetails && (
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-900/50 text-xs space-y-1.5 text-slate-300">
                    {deliverability.warnings.map((w, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{w}</span>
                      </div>
                    ))}
                    {deliverability.suggestions.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                        <span className="text-emerald-400 font-bold">💡 Consejo:</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleLaunchEmailCampaign} className="space-y-4 py-3 overflow-y-auto flex-1 pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">Nombre de Campaña</label>
                    <input
                      type="text"
                      required
                      value={emailForm.nombre}
                      onChange={e => setEmailForm({ ...emailForm, nombre: e.target.value })}
                      placeholder="Ej: Búsqueda de Asesores Comerciales Colaboratium"
                      className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">Asunto del Correo</label>
                    <input
                      type="text"
                      required
                      value={emailForm.asunto}
                      onChange={e => setEmailForm({ ...emailForm, asunto: e.target.value })}
                      placeholder="Ej: Búsqueda de Asesores Comerciales Colaboratium"
                      className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">Público Destino / Rubro</label>
                    <select
                      value={emailForm.targetGroup}
                      onChange={e => {
                        const newGrp = e.target.value;
                        const grpContacts = newGrp === 'TODOS' || newGrp === 'CUSTOM'
                          ? contactsWithEmail
                          : contactsWithEmail.filter(c => (c.grupo || '').toUpperCase() === newGrp.toUpperCase());
                        setEmailForm({ 
                          ...emailForm, 
                          targetGroup: newGrp,
                          selectedContactIds: grpContacts.map(c => c.id) 
                        });
                      }}
                      className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="PROSPECTO ASESORES">
                        PROSPECTO ASESORES ({contactsWithEmail.filter(c => (c.grupo || '').toUpperCase() === 'PROSPECTO ASESORES').length} con email del Excel)
                      </option>
                      <option value="TODOS">
                        Todos los Contactos con Email ({contactsWithEmail.length})
                      </option>
                      <option value="ASESORES">Asesores Comerciales Activos</option>
                      <option value="LIDERES">Líderes de Equipo</option>
                      <option value="INVERSORES">Inversores</option>
                      <option value="CLIENTES">Clientes Tomadores</option>
                      <option value="CUSTOM">Selección Personalizada Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">Plantilla de Email</label>
                    <select
                      value={emailForm.plantillaId}
                      onChange={e => {
                        const sel = plantillas.find(p => p.id === Number(e.target.value));
                        setEmailForm({
                          ...emailForm,
                          plantillaId: e.target.value,
                          asunto: sel ? sel.asunto || emailForm.asunto : emailForm.asunto,
                          htmlContent: sel ? sel.contenido : emailForm.htmlContent,
                          selectedMedia: sel ? sel.archivos_adjuntos || [] : []
                        });
                      }}
                      className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">-- Redacción manual / Sin plantilla --</option>
                      {plantillas.filter(p => p.tipo === 'email').map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selector Individual de Destinatarios */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Destinatarios Seleccionados: <span className="text-blue-700 font-extrabold">{selectedCount}</span> de {availableInGroup.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllInGroup}
                        className="text-blue-600 hover:text-blue-800 font-extrabold"
                      >
                        Marcar todos ({availableInGroup.length})
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="text-gray-500 hover:text-gray-800 font-extrabold"
                      >
                        Desmarcar todos
                      </button>
                      {emailContactSearch && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={handleSelectAllFiltered}
                            className="text-indigo-600 hover:text-indigo-800 font-extrabold"
                          >
                            Marcar mostrados ({filteredForSelection.length})
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar destinatario específico por nombre o email..."
                      value={emailContactSearch}
                      onChange={e => setEmailContactSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-bold bg-white text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 border border-gray-200 bg-white rounded-xl">
                    {filteredForSelection.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500 font-medium">
                        No se encontraron contactos con email que coincidan con la búsqueda.
                      </div>
                    ) : (
                      filteredForSelection.map(c => {
                        const isChecked = emailForm.selectedContactIds.includes(c.id);
                        return (
                          <div 
                            key={c.id} 
                            onClick={() => toggleContact(c.id)}
                            className={`flex items-center justify-between p-2.5 hover:bg-blue-50/60 cursor-pointer transition text-xs ${isChecked ? 'bg-blue-50/40' : ''}`}
                          >
                            <div className="flex items-center gap-2.5 truncate pr-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="truncate">
                                <span className="font-extrabold text-gray-900">{c.nombre || 'Candidato'}</span>
                                <span className="text-gray-500 font-mono text-[11px] ml-1.5">({c.email})</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                              {c.grupo || 'PROSPECTO'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pre-flight Merge Stats (robindarlington/mail-merge) */}
                  <div className="mt-2.5 pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between gap-1 text-[11px] text-gray-600 font-semibold">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedCount} destinatarios listos con email válido</span>
                    </span>
                    {mergeValidation?.detectedVariables && mergeValidation.detectedVariables.length > 0 && (
                      <span className="text-gray-500 font-mono text-[10px]">
                        Variables: {mergeValidation.detectedVariables.map(v => `{{${v}}}`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Switch de Ritmo Humano Anti-Spam */}
                <label className="flex items-start gap-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailForm.humanPacing}
                    onChange={e => setEmailForm({ ...emailForm, humanPacing: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      🛡️ Modo Seguro Anti-Baneo Gmail (Recomendado)
                    </span>
                    <p className="text-[11px] text-emerald-700 mt-0.5 font-medium leading-relaxed">
                      Envía simulando el comportamiento de un humano real (2 a 3 emails por minuto con pausas aleatorias de 20 a 30 segundos) para evitar bloqueos y mantener la reputación del correo oficial colaboratium@gmail.com.
                    </p>
                  </div>
                </label>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black uppercase text-gray-700">Cuerpo del Email (HTML / Texto)</label>
                    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowEmailPreview(true)}
                        className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-md transition ${showEmailPreview ? 'bg-white shadow-xs text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        👁️ Vista Previa
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailPreview(false)}
                        className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-md transition ${!showEmailPreview ? 'bg-white shadow-xs text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        ✏️ Editor HTML
                      </button>
                    </div>
                  </div>

                  {showEmailPreview ? (
                    <div className="p-3 bg-gray-50 border border-gray-300 rounded-xl max-h-64 overflow-y-auto">
                      <div className="text-[10px] uppercase font-black text-gray-400 mb-2 flex items-center justify-between">
                        <span>Vista previa del correo renderizado:</span>
                        <span className="text-emerald-700 font-bold">✓ Web, Teléfono, WhatsApp, Mail, Redes y Desuscripción</span>
                      </div>
                      <div
                        className="bg-white rounded-lg p-2 border border-gray-200 shadow-inner overflow-x-auto text-xs"
                        dangerouslySetInnerHTML={{
                          __html: (emailForm.htmlContent || '')
                            .replace(/\{\{nombre\}\}/gi, 'Damian (Ejemplo)')
                            .replace(/\{\{email\}\}/gi, 'damduff@gmail.com')
                            .replace(/\{\{rol\}\}/gi, 'PROSPECTO ASESORES')
                            .replace(/\{\{telefono\}\}/gi, '+54 9 11 7372-2708')
                            .replace(/\{\{enlaceregistro\}\}/gi, 'https://wa.me/5491173722708?text=Hola%20Colaboratium,%20quiero%20confirmar%20mi%20asistencia%20y%20RESERVAR%20MI%20LUGAR%20EN%20LA%20REUNI%C3%93N%20de%20asesores')
                            .replace(/\{\{enlacebaja\}\}/gi, 'mailto:colaboratium@gmail.com?subject=Baja%20de%20Convocatorias&body=Deseo%20darme%20de%20baja')
                            .replace(/\{\{fecha\}\}/gi, 'Jueves, 29 de octubre')
                            .replace(/\{\{hora\}\}/gi, '13:00 hs')
                            .replace(/\{\{duracion\}\}/gi, '1 hora y media (90 minutos)')
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      rows={7}
                      required
                      value={emailForm.htmlContent}
                      onChange={e => setEmailForm({ ...emailForm, htmlContent: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-bold font-mono bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">Adjuntos desde Biblioteca de Medios</label>
                  <div className="max-h-24 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                    {medios.map(m => {
                      const isSelected = emailForm.selectedMedia.some(att => att.nombre === m.nombre);
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            if (isSelected) {
                              setEmailForm({ ...emailForm, selectedMedia: emailForm.selectedMedia.filter(att => att.nombre !== m.nombre) });
                            } else {
                              setEmailForm({ ...emailForm, selectedMedia: [...emailForm.selectedMedia, { nombre: m.nombre, url: m.archivo_url, rubro: m.rubro }] });
                            }
                          }}
                          className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                            isSelected ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'hover:bg-gray-100 text-gray-800'
                          }`}
                        >
                          <span className="truncate">{m.nombre} ({m.rubro})</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-700" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Lanzar Campaña por Gmail ({selectedCount} destinatarios)</span>
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREAR / EDITAR PLANTILLA                           */}
      {/* ========================================================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-200 text-gray-950 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="font-black text-base text-gray-950">
                {editingTemplate ? `Editar Plantilla: ${editingTemplate.nombre}` : 'Crear Nueva Plantilla'}
              </h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 py-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">Tipo de Canal</label>
                  <select
                    value={templateForm.tipo}
                    onChange={e => setTemplateForm({ ...templateForm, tipo: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="whatsapp">📱 WhatsApp Meta</option>
                    <option value="email">✉️ Email Gmail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">Categoría</label>
                  <select
                    value={templateForm.categoria}
                    onChange={e => setTemplateForm({ ...templateForm, categoria: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="asesores">Asesores</option>
                    <option value="lideres">Líderes</option>
                    <option value="inversores">Inversores</option>
                    <option value="marketing">Marketing</option>
                    <option value="soporte">Soporte</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Nombre de la Plantilla</label>
                <input
                  type="text"
                  required
                  value={templateForm.nombre}
                  onChange={e => setTemplateForm({ ...templateForm, nombre: e.target.value })}
                  placeholder="Ej: Convocatoria Líderes Comerciales"
                  className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {templateForm.tipo === 'email' && (
                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">Asunto del Correo</label>
                  <input
                    type="text"
                    required
                    value={templateForm.asunto}
                    onChange={e => setTemplateForm({ ...templateForm, asunto: e.target.value })}
                    placeholder="Ej: Invitación Oficial Colaboratium"
                    className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-black uppercase text-gray-700">Contenido del Mensaje</label>
                  <span className="text-[10px] text-gray-500 font-bold">Variables: {'{{nombre}}, {{rol}}, {{telefono}}'}</span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={templateForm.contenido}
                  onChange={e => setTemplateForm({ ...templateForm, contenido: e.target.value })}
                  placeholder="Hola {{nombre}}, te damos la bienvenida..."
                  className="w-full px-3 py-2 text-xs font-bold bg-white text-gray-950 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Archivos Adjuntos de la Biblioteca de Medios</label>
                <div className="max-h-24 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                  {medios.map(m => {
                    const isSelected = templateForm.archivos_adjuntos.some(att => att.nombre === m.nombre);
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          if (isSelected) {
                            setTemplateForm({ ...templateForm, archivos_adjuntos: templateForm.archivos_adjuntos.filter(att => att.nombre !== m.nombre) });
                          } else {
                            setTemplateForm({ ...templateForm, archivos_adjuntos: [...templateForm.archivos_adjuntos, { nombre: m.nombre, url: m.archivo_url, rubro: m.rubro }] });
                          }
                        }}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                          isSelected ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <span className="truncate">{m.nombre} ({m.rubro})</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md"
                >
                  {editingTemplate ? 'Actualizar Plantilla' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PREVISUALIZADOR Y REPRODUCTOR MULTIMEDIA           */}
      {/* ========================================================= */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold">
                    {isPreviewPdf ? <FileText className="w-5 h-5 text-rose-600" /> :
                     isPreviewAudio ? <Music className="w-5 h-5 text-emerald-600" /> :
                     isPreviewImage ? <ImageIcon className="w-5 h-5 text-sky-600" /> :
                     <Presentation className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-950 truncate max-w-md">{previewMedia.nombre}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                      <span className="uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/50">
                        {previewMedia.rubro}
                      </span>
                      <span>•</span>
                      <span>{(previewMedia.tamano_bytes / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      <span>{new Date(previewMedia.creado_en).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(previewMedia.archivo_url)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1.5"
                    title="Copiar URL directa"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace</span>
                  </button>
                  <a
                    href={previewFullUrl}
                    download={previewMedia.nombre}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    title="Descargar archivo"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </a>
                  <button
                    onClick={() => setPreviewMedia(null)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Visor Multimedia según tipo de archivo */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-gray-950/5 min-h-[460px]">
                {isPreviewPdf ? (
                  <iframe
                    src={previewFullUrl}
                    className="w-full h-[620px] rounded-2xl border border-gray-200 shadow-inner bg-white"
                    title={previewMedia.nombre}
                  />
                ) : isPreviewAudio ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-3xl shadow-sm max-w-md w-full text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-100 shadow-inner">
                      <Music className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{previewMedia.nombre}</h4>
                      <p className="text-xs text-gray-500 mt-1">Audio Oficial / Nota de Voz de WhatsApp</p>
                    </div>
                    <audio controls autoPlay className="w-full mt-2">
                      <source src={previewFullUrl} type={previewMedia.mimetype || 'audio/ogg'} />
                      Tu navegador no soporta reproducción de audio.
                    </audio>
                  </div>
                ) : isPreviewImage ? (
                  <div className="flex items-center justify-center w-full">
                    <img
                      src={previewFullUrl}
                      alt={previewMedia.nombre}
                      className="max-h-[620px] max-w-full object-contain rounded-2xl shadow-lg border border-gray-200 bg-white"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-3xl shadow-sm max-w-md w-full text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100 shadow-inner">
                      <Presentation className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{previewMedia.nombre}</h4>
                      <p className="text-xs text-gray-500 mt-1">Presentación ejecutiva o documento oficial</p>
                    </div>
                    <a
                      href={previewFullUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Abrir Archivo en Pestaña Completa</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

    </>
  );
}
