"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import { API_URL } from '@/config/api';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Mail, 
  Phone, 
  Landmark, 
  Globe, 
  CheckCircle2, 
  Filter, 
  X, 
  ExternalLink,
  CreditCard,
  Building2,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Tag,
  Pin,
  Clock,
  Crown,
  Layers,
  ArrowRight,
  FileText,
  Award,
  Rocket,
  Sparkles,
  Send,
  Zap,
  Check,
  Share2
} from 'lucide-react';
import CrmHierarchyTree from '@/components/dashboard/CrmHierarchyTree';
import ContactActionMenu from '@/components/dashboard/ContactActionMenu';
import { toast } from 'sonner';

// 9 Rubros requeridos ordenados según requerimientos de Colaboratium
export const OFFICIAL_RUBROS = [
  'TODOS',
  'TEAM',
  'ASESORES',
  'LIDERES',
  'MAIN',
  'INVERSORES',
  'SOPORTE',
  'CREDITOS',
  'MASTER',
  'PROSPECTO LIDERES',
  'PROSPECTO ASESORES'
];

export const RUBROS_METADATA = {
  'TODOS': { label: 'Todos', badge: 'Total', desc: 'Agenda Completa de Contactos' },
  'TEAM': { label: 'TEAM', badge: 'Staff', desc: 'Empleados de Colaboratium' },
  'ASESORES': { label: 'Asesores', badge: 'Activos', desc: 'Asesores comerciales activos' },
  'LIDERES': { label: 'Líderes', badge: 'Red', desc: 'Líderes con al menos 1 asesor a cargo' },
  'MAIN': { label: 'Main', badge: 'Nómina', desc: 'Líder de líderes y asesores en nómina' },
  'INVERSORES': { label: 'Inversores', badge: 'Capital', desc: 'Inversores canalizados (WhatsApp, email, redes)' },
  'SOPORTE': { label: 'Soporte', badge: 'Helpdesk', desc: 'Usuario TEAM para atención y soporte' },
  'CREDITOS': { label: 'Créditos', badge: 'Scoring', desc: 'Analistas de créditos y tomadores' },
  'MASTER': { label: 'Master', badge: 'Admin', desc: 'Super Administrador del sistema' },
  'PROSPECTO LIDERES': { label: 'Prospecto Líderes', badge: 'Brokers B2B', desc: 'Brokers y líderes fríos sin ingreso ni solicitud' },
  'PROSPECTO ASESORES': { label: 'Prospecto Asesores', badge: 'Campañas', desc: 'Candidatos para campañas de captación' }
};

// Configuración visual y plantillas asignadas a Capas B2B 1 al 5
export const CRM_CAPAS_INFO = {
  1: {
    num: 1,
    id: 'CAPA_1_REMAX',
    name: 'Capa 1: Franquicias Inmobiliarias',
    shortName: 'Franquicias',
    networks: 'RE/MAX, Century 21, Keller Williams',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    dotClass: 'bg-amber-500',
    emailTemplate: 'Prospección Fría: Agentes Inmobiliarios RE/MAX (Flujo 2 - Capa 1)',
    whatsappTemplate: 'Prospección WhatsApp: Agentes Franquicias (Capa 1)',
    leaderEmailTemplate: 'Prospección Fría: Broker / Martillero RE/MAX (Flujo 3)'
  },
  2: {
    num: 2,
    id: 'CAPA_2_PADRONES_CORREDORES',
    name: 'Capa 2: Corredores Matriculados',
    shortName: 'Corredores Colegiados',
    networks: 'Colegios Oficiales, CCi Santa Fe, CUCICBA, CMCPSI',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    dotClass: 'bg-cyan-500',
    emailTemplate: 'Prospección Fría: Corredores Matriculados (Capa 2)',
    whatsappTemplate: 'Prospección WhatsApp: Corredores Matriculados (Capa 2)',
    leaderEmailTemplate: 'Prospección Fría: Corredores Matriculados (Capa 2)'
  },
  3: {
    num: 3,
    id: 'CAPA_3_PREVISIONALISTAS',
    name: 'Capa 3: Abogados y Gestores Previsionales',
    shortName: 'Previsionales',
    networks: 'Estudios Jurídicos Previsionales, Gestorías ANSES',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    dotClass: 'bg-purple-500',
    emailTemplate: 'Prospección Fría: Abogados y Gestores Previsionales (Capa 3)',
    whatsappTemplate: 'Prospección WhatsApp: Previsionales (Capa 3)',
    leaderEmailTemplate: 'Prospección Fría: Abogados y Gestores Previsionales (Capa 3)'
  },
  4: {
    num: 4,
    id: 'CAPA_4_DESARROLLADORES',
    name: 'Capa 4: Desarrolladores Urbanos y Fideicomisos',
    shortName: 'Desarrolladores Urbanos',
    networks: 'Constructoras, Loteos Urbanos, Fideicomisos',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
    dotClass: 'bg-orange-500',
    emailTemplate: 'Prospección Fría: Desarrolladores Urbanos y Fideicomisos (Capa 4)',
    whatsappTemplate: 'Prospección WhatsApp: Desarrolladores Urbanos (Capa 4)',
    leaderEmailTemplate: 'Prospección Fría: Desarrolladores Urbanos y Fideicomisos (Capa 4)'
  },
  5: {
    num: 5,
    id: 'CAPA_5_PAS',
    name: 'Capa 5: Productores Asesores de Seguros (PAS)',
    shortName: 'Seguros PAS',
    networks: 'Matrícula Oficial SSN, Productores y Brokers de Seguros',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    dotClass: 'bg-emerald-500',
    emailTemplate: 'Prospección Fría: Productores Asesores de Seguros PAS (Capa 5)',
    whatsappTemplate: 'Prospección WhatsApp: Productores Seguros PAS (Capa 5)',
    leaderEmailTemplate: 'Prospección Fría: Productores Asesores de Seguros PAS (Capa 5)'
  }
};

export function extractB2BLayer(contact) {
  if (!contact) return null;
  let meta = contact.metadata_extra;
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = null;
    }
  }

  if (meta && (meta.origen_b2b || meta.capa_numero || meta.origen_capa)) {
    const num = Number(meta.capa_numero) || (
      meta.origen_capa === 'CAPA_1_REMAX' ? 1 :
      meta.origen_capa === 'CAPA_2_PADRONES_CORREDORES' ? 2 :
      meta.origen_capa === 'CAPA_3_PREVISIONALISTAS' ? 3 :
      meta.origen_capa === 'CAPA_4_DESARROLLADORES' ? 4 :
      meta.origen_capa === 'CAPA_5_PAS' ? 5 : 1
    );
    const cfg = CRM_CAPAS_INFO[num] || CRM_CAPAS_INFO[1];
    return {
      isB2B: true,
      num,
      info: cfg,
      code: meta.capa_codigo || cfg.id,
      name: meta.capa_nombre || cfg.name,
      tag: meta.capa_tag || cfg.shortName,
      plantillaEmail: meta.plantilla_email_sugerida || cfg.emailTemplate,
      plantillaWhatsapp: meta.plantilla_whatsapp_sugerida || cfg.whatsappTemplate,
      canalRecomendado: meta.canal_recomendado || (contact.telefono ? 'WHATSAPP' : 'EMAIL'),
      detectedRole: meta.detected_role || (contact.grupo === 'LIDERES' ? 'LIDER_BROKER_POTENCIAL' : 'ASESOR_POTENCIAL'),
      office: meta.office_name || '',
      city: meta.city || '',
      province: meta.province || ''
    };
  }

  const resumen = contact.resumen_necesidad || '';
  for (let n = 1; n <= 5; n++) {
    if (resumen.includes(`CAPA_${n}`) || (contact.origen || '').includes(`CAPA_${n}`)) {
      const cfg = CRM_CAPAS_INFO[n];
      return {
        isB2B: true,
        num: n,
        info: cfg,
        code: cfg.id,
        name: cfg.name,
        tag: cfg.shortName,
        plantillaEmail: cfg.emailTemplate,
        plantillaWhatsapp: cfg.whatsappTemplate,
        canalRecomendado: contact.telefono ? 'WHATSAPP' : 'EMAIL',
        detectedRole: contact.grupo === 'LIDERES' ? 'LIDER_BROKER_POTENCIAL' : 'ASESOR_POTENCIAL',
        office: '',
        city: '',
        province: ''
      };
    }
  }

  return null;
}

export default function CrmPage() {
  const { user, isLoaded } = useUser();
  const [currentUserData, setCurrentUserData] = useState(null);
  const [codigoEmpresa, setCodigoEmpresa] = useState('KRZMJI');
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [rubros, setRubros] = useState(OFFICIAL_RUBROS);
  const [selectedGroup, setSelectedGroup] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Router & Navegación a Campañas B2B
  const router = useRouter();

  // Filtro por Capas B2B 1 al 5
  const [selectedCapaFilter, setSelectedCapaFilter] = useState('ALL'); // 'ALL' | 'ALL_B2B' | 1 | 2 | 3 | 4 | 5
  const [quickLaunchModalContact, setQuickLaunchModalContact] = useState(null);
  const [quickLaunchChannel, setQuickLaunchChannel] = useState('whatsapp'); // 'whatsapp' | 'email'

  // Árbol de dependencias jerárquico
  const [treeData, setTreeData] = useState(null);
  const [treeBranch, setTreeBranch] = useState('TODOS'); // 'TODOS' | 'CLIENTES' | 'INVERSORES' | 'ASESORES_LIDERES'
  const [showTree, setShowTree] = useState(true);
  const [hoveredCrmNoteId, setHoveredCrmNoteId] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showManageRubros, setShowManageRubros] = useState(false);
  const [newRubroName, setNewRubroName] = useState('');

  // Form State
  const initialForm = {
    nombre: '',
    telefono: '',
    email: '',
    dni: '',
    direccion: '',
    cbu: '',
    alias: '',
    banco: '',
    sucursal: '',
    grupo: 'CLIENTES',
    instagram: '',
    facebook: '',
    linkedin: '',
    telegram: '',
    metadata_extra: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const fileInputRef = useRef(null);

  // 1. Obtener código de empresa
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('codigoEmpresa') : null;
    if (saved) setCodigoEmpresa(saved);
    if (isLoaded && user) {
      fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data) setCurrentUserData(data);
          if (data?.codigo_empresa) {
            setCodigoEmpresa(data.codigo_empresa);
          }
        })
        .catch(err => console.error("Error fetching user data:", err));
    }
  }, [isLoaded, user]);

  // 2. Cargar contactos
  const fetchContacts = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoading(true);
      const queryGroup = selectedGroup === 'TODOS' ? '' : selectedGroup;
      const roleParam = currentUserData?.rol_nombre ? `&role=${encodeURIComponent(currentUserData.rol_nombre)}&user_id=${currentUserData.id}` : '';
      const clerkParam = user?.id ? `&clerkId=${user.id}` : '';
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/crm/contacts?grupo=${encodeURIComponent(queryGroup)}&search=${encodeURIComponent(search)}${roleParam}${clerkParam}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        const contactList = Array.isArray(data.contacts) ? data.contacts : [];
        setContacts(contactList);
        if (selectedGroup === 'TODOS' && !search) {
          setAllContacts(contactList);
        }
      }
    } catch (err) {
      console.error('Error fetching CRM contacts:', err);
      toast.error('Error al cargar la agenda');
    } finally {
      setLoading(false);
    }
  };

  // Cargar todos los contactos para calcular contadores de cada rubro en los tabs
  const fetchAllForCounts = async () => {
    if (!codigoEmpresa) return;
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/crm/contacts`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.contacts)) {
        setAllContacts(data.contacts);
      }
    } catch (e) {
      console.error('Error fetching contacts for counts:', e);
    }
  };

  // Cargar árbol de dependencias jerárquico
  const fetchTreeData = async () => {
    if (!codigoEmpresa) return;
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/crm/tree`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success && data.tree) {
        setTreeData(data.tree);
      }
    } catch (e) {
      console.error('Error fetching CRM tree:', e);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchTreeData();
  }, [codigoEmpresa, selectedGroup]);

  // Cargar lista de rubros de la empresa
  const fetchRubros = async () => {
    if (!codigoEmpresa) return;
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/crm/rubros`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.rubros)) {
        const fromDb = data.rubros.map(r => typeof r === 'string' ? r : r.nombre).filter(Boolean);
        const combined = Array.from(new Set([...OFFICIAL_RUBROS, ...fromDb]));
        setRubros(combined);
      } else {
        setRubros(OFFICIAL_RUBROS);
      }
    } catch (e) {
      console.error('Error fetching rubros:', e);
      setRubros(OFFICIAL_RUBROS);
    }
  };

  useEffect(() => {
    fetchRubros();
    fetchAllForCounts();
  }, [codigoEmpresa]);

  const getRubroCount = (g) => {
    const list = allContacts.length > 0 ? allContacts : contacts;
    if (g === 'TODOS') return list.length;
    const gUpper = g.toUpperCase();
    return list.filter(c => {
      const grp = (c.grupo || '').toUpperCase();
      const rol = (c.rol_asignado || '').toUpperCase();
      const isProspect = grp.includes('PROSPECTO') || (!['ASESORES', 'ASESOR', 'LIDERES', 'LIDER', 'LÍDERES', 'LÍDER'].includes(grp) && rol.includes('PROSPECTO'));
      if (gUpper === 'PROSPECTO LIDERES') return grp.includes('PROSPECTO LIDER') || (!grp && rol.includes('PROSPECTO LIDER'));
      if (gUpper === 'PROSPECTO ASESORES') return isProspect && !grp.includes('LIDER');
      if (gUpper === 'TEAM') return ['TEAM', 'STAFF', 'EMPLEADOS'].includes(grp) || ['TEAM', 'STAFF', 'EMPLEADO', 'EMPLEADOS'].includes(rol);
      if (gUpper === 'ASESORES') return !isProspect && (['ASESORES', 'ASESOR'].includes(grp) || ['ASESORES', 'ASESOR'].includes(rol));
      if (gUpper === 'LIDERES') return !isProspect && (['LIDERES', 'LIDER', 'LÍDERES', 'LÍDER'].includes(grp) || ['LIDERES', 'LIDER', 'LÍDERES', 'LÍDER'].includes(rol));
      if (gUpper === 'INVERSORES') return ['INVERSORES', 'INVERSOR'].includes(grp) || ['INVERSORES', 'INVERSOR'].includes(rol);
      if (gUpper === 'SOPORTE') return ['SOPORTE', 'SUPPORT'].includes(grp) || ['SOPORTE', 'SUPPORT'].includes(rol);
      if (gUpper === 'CREDITOS') return ['CREDITOS', 'CRÉDITOS'].includes(grp) || ['CREDITOS', 'CRÉDITOS'].includes(rol);
      if (gUpper === 'MAIN') return grp === 'MAIN' || rol === 'MAIN';
      if (gUpper === 'MASTER') return grp === 'MASTER' || rol === 'MASTER';
      return grp === gUpper || rol === gUpper;
    }).length;
  };

  // Guardar / Actualizar Contacto
  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!formData.telefono) {
      toast.error('El número de teléfono es obligatorio');
      return;
    }

    try {
      const endpoint = editingId 
        ? `${API_URL}/empresas/${codigoEmpresa}/crm/contacts/${editingId}`
        : `${API_URL}/empresas/${codigoEmpresa}/crm/contacts`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Contacto actualizado' : 'Contacto creado con éxito');
        setShowAddModal(false);
        setEditingId(null);
        setFormData(initialForm);
        fetchContacts();
      } else {
        toast.error(data.error || 'Error al guardar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  // Editar Contacto
  const openEditModal = (c) => {
    setEditingId(c.id);
    setFormData({
      nombre: c.nombre || '',
      telefono: c.telefono || '',
      email: c.email || '',
      dni: c.dni || '',
      direccion: c.direccion || '',
      cbu: c.cbu || '',
      alias: c.alias || '',
      banco: c.banco || '',
      sucursal: c.sucursal || '',
      grupo: c.grupo || 'CLIENTES',
      instagram: c.instagram || '',
      facebook: c.facebook || '',
      linkedin: c.linkedin || '',
      telegram: c.telegram || '',
      metadata_extra: typeof c.metadata_extra === 'object' ? JSON.stringify(c.metadata_extra, null, 2) : (c.metadata_extra || '')
    });
    setShowAddModal(true);
  };

  // Eliminar Contacto
  const handleDeleteContact = async (id) => {
    if (!confirm('¿Eliminar este contacto de la agenda?')) return;
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/crm/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contacto eliminado');
        setContacts(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  // Exportar a archivo VCF (vCard para móviles)
  const handleExportVCF = () => {
    if (!codigoEmpresa) return;
    const url = `${API_URL}/empresas/${codigoEmpresa}/crm/export-vcf?grupo=${selectedGroup === 'TODOS' ? '' : selectedGroup}`;
    window.open(url, '_blank');
    toast.success('Generando y descargando libreta VCF para celulares...');
  };

  // Manejo de importación CSV
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvText(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return;

    // Helper para parsear fila respetando comillas
    const parseRow = (str) => {
      const row = [];
      let cur = '';
      let inQ = false;
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === '"') inQ = !inQ;
        else if ((c === ',' || c === ';' || c === '\t') && !inQ) {
          row.push(cur.replace(/^"|"$/g, '').trim());
          cur = '';
        } else cur += c;
      }
      row.push(cur.replace(/^"|"$/g, '').trim());
      return row;
    };

    const firstRow = parseRow(lines[0]);
    const lowerHeaders = firstRow.map(h => h.toLowerCase().trim());
    const hasHeader = lowerHeaders.some(h => 
      h.includes('nombre') || h.includes('name') || h.includes('tel') || h.includes('phone') || h.includes('email') || h.includes('dni')
    );

    let colNombre = lowerHeaders.findIndex(h => h.includes('nombre') || h.includes('name'));
    let colTel = lowerHeaders.findIndex(h => h.includes('tel') || h.includes('phone') || h.includes('cel') || h.includes('whatsapp'));
    let colDni = lowerHeaders.findIndex(h => h.includes('dni') || h.includes('doc'));
    let colEmail = lowerHeaders.findIndex(h => h.includes('email') || h.includes('correo') || h.includes('mail'));
    let colBanco = lowerHeaders.findIndex(h => h.includes('banco'));
    let colCbu = lowerHeaders.findIndex(h => h.includes('cbu') || h.includes('cvu'));
    let colAlias = lowerHeaders.findIndex(h => h.includes('alias'));
    let colGrupo = lowerHeaders.findIndex(h => h.includes('grupo') || h.includes('rubro'));
    let colZona = lowerHeaders.findIndex(h => h.includes('zona') || h.includes('ubicacion'));
    let colRol = lowerHeaders.findIndex(h => h.includes('rol') || h.includes('puesto'));

    if (colNombre === -1) colNombre = 0;
    if (colTel === -1) colTel = 1;
    if (colDni === -1) colDni = 2;
    if (colEmail === -1) colEmail = 3;

    const startIdx = hasHeader ? 1 : 0;
    const parsed = [];

    for (let i = startIdx; i < lines.length; i++) {
      const row = parseRow(lines[i]);
      if (row.length === 0 || !row[colNombre] || row[colNombre] === 'Sin Nombre' || row[colNombre] === '-') continue;

      let rawPhone = colTel !== -1 ? (row[colTel] || '') : '';
      if (!rawPhone || rawPhone === '-') continue;

      let phoneNorm = rawPhone.replace(/[^\d]/g, '');
      if (phoneNorm.startsWith('54011')) phoneNorm = '54911' + phoneNorm.slice(5);
      else if (phoneNorm.startsWith('5415')) phoneNorm = '54911' + phoneNorm.slice(4);
      else if (phoneNorm.startsWith('54') && !phoneNorm.startsWith('549')) phoneNorm = '549' + phoneNorm.slice(2);
      else if (phoneNorm.startsWith('11') || phoneNorm.length === 10) phoneNorm = '549' + phoneNorm;

      let rawDni = colDni !== -1 ? (row[colDni] || '') : '';
      let cleanDni = rawDni.replace(/[^\d]/g, '');
      if (cleanDni && cleanDni.length >= 6) {
        cleanDni = cleanDni.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      } else {
        cleanDni = rawDni !== '-' ? rawDni : '';
      }

      parsed.push({
        nombre: row[colNombre] || '',
        telefono: phoneNorm || rawPhone,
        dni: cleanDni,
        email: colEmail !== -1 && row[colEmail] !== '-' ? row[colEmail] : '',
        banco: colBanco !== -1 ? (row[colBanco] || '') : '',
        cbu: colCbu !== -1 ? (row[colCbu] || '') : '',
        alias: colAlias !== -1 ? (row[colAlias] || '') : '',
        grupo: (colGrupo !== -1 && row[colGrupo]) ? row[colGrupo] : 'PROSPECTO ASESORES',
        metadata_extra: {
          zona: colZona !== -1 ? (row[colZona] || '') : '',
          puesto: colRol !== -1 ? (row[colRol] || '') : ''
        }
      });
    }

    setParsedPreview(parsed);
  };

  const handleExecuteBatchImport = async () => {
    if (parsedPreview.length === 0) {
      toast.error('No hay datos válidos para importar');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/crm/import-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ contacts: parsedPreview })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`¡Se importaron ${data.imported} contactos correctamente!`);
        setShowImportModal(false);
        setCsvText('');
        setParsedPreview([]);
        fetchContacts();
      } else {
        toast.error(data.error || 'Error al importar');
      }
    } catch (err) {
      toast.error('Error de red al importar lote');
    }
  };

  const getCapaCount = (capaNum) => {
    const list = allContacts.length > 0 ? allContacts : contacts;
    if (capaNum === 'ALL_B2B') {
      return list.filter(c => !!extractB2BLayer(c)).length;
    }
    return list.filter(c => extractB2BLayer(c)?.num === Number(capaNum)).length;
  };

  const filtered = contacts.filter(c => {
    const term = search.toLowerCase();
    const matchesSearch = (
      (c.nombre || '').toLowerCase().includes(term) ||
      (c.telefono || '').includes(term) ||
      (c.dni || '').includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.alias || '').toLowerCase().includes(term) ||
      (c.banco || '').toLowerCase().includes(term)
    );
    if (!matchesSearch) return false;
    if (selectedCapaFilter && selectedCapaFilter !== 'ALL') {
      const b2b = extractB2BLayer(c);
      if (selectedCapaFilter === 'ALL_B2B') {
        return !!b2b;
      }
      return b2b?.num === Number(selectedCapaFilter);
    }
    return true;
  });

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
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    Agenda CRM Avanzada
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Opción C • Ficha Completa, DNI, CBU/Bancos, Redes Sociales y Exportación VCF
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportVCF}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition shadow-sm"
                title="Descargar archivo .VCF para sincronizar en contactos de celular"
              >
                <Download className="w-4 h-4" />
                <span>Exportar VCF Celular</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold transition shadow-sm"
                title="Importar contactos por lote desde archivo CSV o pegado masivo"
              >
                <Upload className="w-4 h-4" />
                <span>Importar CSV</span>
              </button>

              <a
                href={`${API_URL}/empresas/${codigoEmpresa}/scores/pdf-guia`}
                target="_blank"
                rel="noreferrer"
                download="Colaboratium_Reglamento_Score_2026_Disponibilidad_Declarada.pdf"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black transition shadow-xs hover:scale-[1.02]"
                title="Descargar Reglamento Oficial 2026 con Disponibilidad Declarada (PDF)"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Reglamento Score 2026 (PDF)</span>
              </a>

              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData(initialForm);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Contacto</span>
              </button>
            </div>
          </div>

          {/* KPI Mini-cards (Clickeables para enfocar líneas del árbol y filtrar la tabla) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {/* Total Contactos -> Todo el árbol */}
            <div 
              onClick={() => {
                setSelectedGroup('TODOS');
                setTreeBranch('TODOS');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center justify-between group ${
                selectedGroup === 'TODOS'
                  ? 'bg-slate-900 text-white border-slate-800 ring-2 ring-black/20'
                  : 'bg-white hover:border-gray-300 border-gray-100 text-gray-900'
              }`}
              title="Clic para ver todos los contactos registrados en la agenda"
            >
              <div>
                <p className={`text-[10px] font-bold uppercase transition ${selectedGroup === 'TODOS' ? 'text-gray-300' : 'text-gray-400'}`}>
                  Total Contactos
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className={`text-xl font-black ${selectedGroup === 'TODOS' ? 'text-white' : 'text-gray-900'}`}>
                    {allContacts.length || contacts.length}
                  </p>
                  <span className="text-[10px] font-medium opacity-70 group-hover:opacity-100">
                    ➔ Ver todo
                  </span>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                selectedGroup === 'TODOS' ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-700'
              }`}>
                <Users className="w-4 h-4" />
              </div>
            </div>

            {/* Prospecto Asesores (Candidatos para Campañas) */}
            <div 
              onClick={() => {
                setSelectedGroup('PROSPECTO ASESORES');
                setTreeBranch('TODOS');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center justify-between group ${
                selectedGroup === 'PROSPECTO ASESORES'
                  ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-500/30'
                  : 'bg-white hover:border-amber-200 border-gray-100 text-gray-900'
              }`}
              title="Clic para ver prospectos de asesores para campañas de incorporación"
            >
              <div>
                <p className={`text-[10px] font-bold uppercase transition ${selectedGroup === 'PROSPECTO ASESORES' ? 'text-amber-100' : 'text-amber-600'}`}>
                  Prospectos Asesores
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className={`text-xl font-black ${selectedGroup === 'PROSPECTO ASESORES' ? 'text-white' : 'text-amber-600'}`}>
                    {(allContacts.length ? allContacts : contacts).filter(c => (c.grupo || '').toUpperCase().includes('PROSPECTO')).length}
                  </p>
                  <span className="text-[10px] font-medium opacity-70 group-hover:opacity-100">
                    ➔ Campañas
                  </span>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                selectedGroup === 'PROSPECTO ASESORES' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
              }`}>
                ★
              </div>
            </div>

            {/* Asesores / Líderes -> Red Comercial */}
            <div 
              onClick={() => {
                setSelectedGroup('ASESORES');
                setTreeBranch('ASESORES_LIDERES');
                setShowTree(true);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center justify-between group ${
                ['ASESORES', 'LIDERES'].includes(selectedGroup)
                  ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-500/30'
                  : 'bg-white hover:border-purple-200 border-gray-100 text-gray-900'
              }`}
              title="Clic para ver Asesores y Líderes activos"
            >
              <div>
                <p className={`text-[10px] font-bold uppercase transition ${['ASESORES', 'LIDERES'].includes(selectedGroup) ? 'text-purple-100' : 'text-purple-600'}`}>
                  Asesores / Líderes
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className={`text-xl font-black ${['ASESORES', 'LIDERES'].includes(selectedGroup) ? 'text-white' : 'text-purple-600'}`}>
                    {(allContacts.length ? allContacts : contacts).filter(c => ['ASESORES', 'LIDERES'].includes((c.grupo || '').toUpperCase())).length}
                  </p>
                  <span className="text-[10px] font-medium opacity-70 group-hover:opacity-100">
                    ➔ Red
                  </span>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                ['ASESORES', 'LIDERES'].includes(selectedGroup) ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'
              }`}>
                👑
              </div>
            </div>

            {/* Inversores */}
            <div 
              onClick={() => {
                setSelectedGroup('INVERSORES');
                setTreeBranch('INVERSORES');
                setShowTree(true);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center justify-between group ${
                selectedGroup === 'INVERSORES'
                  ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500/30'
                  : 'bg-white hover:border-emerald-200 border-gray-100 text-gray-900'
              }`}
              title="Clic para ver inversores registrados"
            >
              <div>
                <p className={`text-[10px] font-bold uppercase transition ${selectedGroup === 'INVERSORES' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                  Inversores
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className={`text-xl font-black ${selectedGroup === 'INVERSORES' ? 'text-white' : 'text-emerald-600'}`}>
                    {(allContacts.length ? allContacts : contacts).filter(c => (c.grupo || '').toUpperCase() === 'INVERSORES').length}
                  </p>
                  <span className="text-[10px] font-medium opacity-70 group-hover:opacity-100">
                    ➔ Capital
                  </span>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                selectedGroup === 'INVERSORES' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
              }`}>
                $
              </div>
            </div>

            {/* TEAM / Staff Colaboratium */}
            <div 
              onClick={() => {
                setSelectedGroup('TEAM');
                setTreeBranch('TODOS');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center justify-between group ${
                ['TEAM', 'SOPORTE', 'CREDITOS', 'MAIN', 'MASTER'].includes(selectedGroup)
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500/30'
                  : 'bg-white hover:border-blue-200 border-gray-100 text-gray-900'
              }`}
              title="Clic para ver equipo interno y staff de Colaboratium"
            >
              <div>
                <p className={`text-[10px] font-bold uppercase transition ${['TEAM', 'SOPORTE', 'CREDITOS', 'MAIN', 'MASTER'].includes(selectedGroup) ? 'text-blue-100' : 'text-blue-600'}`}>
                  TEAM / Staff
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className={`text-xl font-black ${['TEAM', 'SOPORTE', 'CREDITOS', 'MAIN', 'MASTER'].includes(selectedGroup) ? 'text-white' : 'text-blue-600'}`}>
                    {(allContacts.length ? allContacts : contacts).filter(c => ['TEAM', 'SOPORTE', 'CREDITOS', 'MAIN', 'MASTER'].includes((c.grupo || '').toUpperCase())).length}
                  </p>
                  <span className="text-[10px] font-medium opacity-70 group-hover:opacity-100">
                    ➔ Staff
                  </span>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                ['TEAM', 'SOPORTE', 'CREDITOS', 'MAIN', 'MASTER'].includes(selectedGroup) ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                🏢
              </div>
            </div>
          </div>

          {/* Toggle Button Árbol de Dependencias */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Estructura Organizacional
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                Línea: {treeBranch === 'TODOS' ? 'Completa' : treeBranch}
              </span>
            </div>
            <button
              onClick={() => setShowTree(!showTree)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1 rounded-xl transition flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showTree ? 'Contraer Árbol' : 'Mostrar Árbol Jerárquico'}</span>
            </button>
          </div>

          {/* ÁRBOL DE DEPENDENCIAS JERÁRQUICO (colaboratium@gmail.com -> Líderes -> Asesores -> Inversores) */}
          {showTree && (
            <CrmHierarchyTree 
              treeData={treeData} 
              activeBranch={treeBranch} 
              onSelectBranch={(b) => {
                setTreeBranch(b);
                if (b === 'CLIENTES') setSelectedGroup('CLIENTES');
                else if (b === 'INVERSORES') setSelectedGroup('INVERSORES');
                else if (b === 'ASESORES_LIDERES') setSelectedGroup('ASESORES');
                else setSelectedGroup('TODOS');
              }}
              onSelectContact={(c) => {
                setSearch(c.nombre || c.telefono || '');
              }}
            />
          )}

          {/* Group Filter Tabs & Search */}
          <div className="bg-gray-50/90 p-3 rounded-2xl border border-gray-200/90 mb-6 flex flex-col gap-3 shadow-xs">
            {/* Rubros Tabs Pill Grid / Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {rubros.map(g => {
                const info = RUBROS_METADATA[g] || { label: g, badge: null, desc: g };
                const count = getRubroCount(g);
                const isSelected = selectedGroup === g;
                return (
                  <button
                    key={g}
                    onClick={() => {
                      setSelectedGroup(g);
                      if (g === 'INVERSORES') setTreeBranch('INVERSORES');
                      else if (g === 'ASESORES' || g === 'LIDERES') setTreeBranch('ASESORES_LIDERES');
                      else setTreeBranch('TODOS');
                    }}
                    title={info.desc}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-gray-950 text-white shadow-md ring-2 ring-black/20'
                        : 'bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span>{info.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : (count > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-gray-100 text-gray-400')
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sub-bar de Filtro por Capas B2B (1 al 5) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-thin border-t border-gray-200/50">
              <div className="text-[10px] font-black uppercase text-gray-400 shrink-0 flex items-center gap-1 pr-1">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Capas B2B:</span>
              </div>

              <button
                onClick={() => setSelectedCapaFilter('ALL')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap shrink-0 ${
                  selectedCapaFilter === 'ALL'
                    ? 'bg-gray-900 text-white shadow-2xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Todas las Capas
              </button>

              <button
                onClick={() => setSelectedCapaFilter('ALL_B2B')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  selectedCapaFilter === 'ALL_B2B'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-amber-50/80 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
                }`}
                title="Filtrar solo contactos incorporados desde Prospección B2B"
              >
                <span>🚀 Solo B2B</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                  selectedCapaFilter === 'ALL_B2B' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-900'
                }`}>
                  {getCapaCount('ALL_B2B')}
                </span>
              </button>

              {[1, 2, 3, 4, 5].map(num => {
                const cfg = CRM_CAPAS_INFO[num];
                const count = getCapaCount(num);
                const isSelected = selectedCapaFilter === num;
                return (
                  <button
                    key={num}
                    onClick={() => setSelectedCapaFilter(isSelected ? 'ALL' : num)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isSelected
                        ? `${cfg.badgeClass} ring-2 ring-black/10 font-black shadow-2xs`
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                    title={`${cfg.name} • ${cfg.networks}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                    <span>Capa {num}: {cfg.shortName}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                      count > 0 ? 'bg-black/5 text-gray-900' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sub-bar with search and active filter indicator */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-200/60">
              <div className="text-xs text-gray-500 font-semibold flex items-center gap-2 self-start sm:self-center">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span>Rubro Activo: <strong className="text-gray-900 font-black">{RUBROS_METADATA[selectedGroup]?.label || selectedGroup}</strong></span>
                <span className="text-gray-400 hidden md:inline">• {RUBROS_METADATA[selectedGroup]?.desc}</span>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI, teléfono, CBU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-950 font-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Table of Contacts */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-700 font-bold text-sm">No se encontraron contactos en este rubro</p>
              <p className="text-gray-400 text-xs mt-1">Añade uno nuevo o ajusta tu término de búsqueda</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-extrabold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Contacto / DNI</th>
                      <th className="py-3 px-4">WhatsApp / Teléfono</th>
                      <th className="py-3 px-4">Datos Bancarios (CBU / Alias)</th>
                      <th className="py-3 px-4">Grupo / Rubro</th>
                      <th className="py-3 px-4">Redes</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Name & DNI */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-gray-900 text-sm">
                              {c.nombre || 'Sin Nombre'}
                            </span>
                            {c.score !== null && c.score !== undefined && (
                              <span 
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border shadow-2xs ${
                                  c.score >= 850
                                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                                    : c.score >= 700
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : c.score >= 500
                                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                                    : c.score >= 350
                                    ? 'bg-orange-100 text-orange-900 border-orange-300'
                                    : 'bg-red-100 text-red-900 border-red-300'
                                }`}
                                title={`Score de Rendimiento: ${c.score} Pts • Rango ${c.rango || 'Plata'}`}
                              >
                                <span>{c.rangoMeta?.icono || (c.score >= 850 ? '💎' : c.score >= 700 ? '🥇' : c.score >= 500 ? '🥈' : '🥉')}</span>
                                <span className="font-mono font-bold">{c.score} pts</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 text-[11px] mt-0.5">
                            {c.dni ? (
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-bold">
                                DNI: {c.dni}
                              </span>
                            ) : (
                              <span className="italic">Sin DNI</span>
                            )}
                            {c.email && (
                              <span className="text-gray-500 truncate max-w-[140px]">
                                {c.email}
                              </span>
                            )}
                          </div>

                          {/* IDENTIFICACIÓN VISUAL DE ORIGEN B2B CAPAS 1 AL 5 */}
                          {(() => {
                            const b2b = extractB2BLayer(c);
                            if (!b2b) return null;
                            return (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span 
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border shadow-2xs ${b2b.info.badgeClass}`}
                                  title={`${b2b.name} • Redes: ${b2b.info.networks}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${b2b.info.dotClass} animate-pulse`} />
                                  <span>{b2b.tag}</span>
                                </span>

                                <span 
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-gray-100 text-gray-700 border border-gray-200/80 truncate max-w-[210px] cursor-help"
                                  title={`Plantilla Asignada: ${b2b.canalRecomendado === 'WHATSAPP' ? b2b.plantillaWhatsapp : b2b.plantillaEmail}`}
                                >
                                  <span>{b2b.canalRecomendado === 'WHATSAPP' ? '💬 WA:' : '📧 Mail:'}</span>
                                  <span className="truncate">{b2b.canalRecomendado === 'WHATSAPP' ? b2b.plantillaWhatsapp : b2b.plantillaEmail}</span>
                                </span>
                              </div>
                            );
                          })()}

                          {/* Estado de Resolución y Nota Flotante */}
                          <div className="mt-1 flex items-center gap-1.5">
                            {(c.estado_resolucion || '').toUpperCase() === 'PENDIENTE' ? (
                              <div 
                                className="relative inline-flex items-center"
                                onMouseEnter={() => setHoveredCrmNoteId(c.id)}
                                onMouseLeave={() => setHoveredCrmNoteId(null)}
                              >
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold cursor-pointer hover:bg-amber-100 transition shadow-2xs">
                                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                  <span>Pendiente</span>
                                </span>

                                {/* NOTA FLOTANTE EXPLICATIVA */}
                                {hoveredCrmNoteId === c.id && (
                                  <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 text-xs animate-in fade-in duration-150">
                                    <div className="flex items-center gap-1 text-amber-300 font-bold mb-1 border-b border-gray-700 pb-1 text-[11px]">
                                      <Pin className="w-3 h-3" /> Explicación de qué falta:
                                    </div>
                                    <p className="text-[11px] text-gray-200 leading-relaxed font-medium">
                                      {c.nota_pendiente || 'Faltan datos por completar.'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Resuelto</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Phone & WA */}
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <a 
                              href={`https://wa.me/${(c.telefono || '').replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {c.telefono}
                            </a>
                            {c.linea_wa?.startsWith('WA_S') || c.canal === 'wasender' ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 text-[9px] font-black tracking-tight" title="Línea WASender API (Pruebas / Ads)">
                                <span className="w-1 h-1 rounded-full bg-purple-600 animate-pulse"></span>
                                <span>{c.linea_wa || 'WA_S***5239'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-black tracking-tight" title="Línea WhatsApp Business Oficial">
                                <span className="w-1 h-1 rounded-full bg-emerald-600"></span>
                                <span>WA_B</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Banking details */}
                        <td className="py-3.5 px-4">
                          {c.cbu || c.alias || c.banco ? (
                            <div className="space-y-0.5">
                              {c.banco && (
                                <p className="font-bold text-gray-800 flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-gray-400" />
                                  {c.banco} {c.sucursal ? `(${c.sucursal})` : ''}
                                </p>
                              )}
                              {c.alias && (
                                <p className="text-[11px] font-mono text-indigo-600 font-bold">
                                  Alias: {c.alias}
                                </p>
                              )}
                              {c.cbu && (
                                <p className="text-[10px] font-mono text-gray-500 truncate max-w-[180px]">
                                  CBU: {c.cbu}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Rubro */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                            {c.grupo || 'CLIENTES'}
                          </span>
                        </td>

                        {/* Social Links */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            {c.instagram && (
                              <span className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 text-[10px] font-bold">
                                IG: {c.instagram}
                              </span>
                            )}
                            {c.linkedin && (
                              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-bold">
                                IN
                              </span>
                            )}
                            {c.telegram && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                                TG: {c.telegram}
                              </span>
                            )}
                            {!c.instagram && !c.linkedin && !c.telegram && (
                              <span className="text-gray-300 italic">-</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botón Lanzador Directo de Campaña B2B */}
                            {(() => {
                              const b2b = extractB2BLayer(c);
                              if (!b2b) return null;
                              return (
                                <button
                                  onClick={() => {
                                    setQuickLaunchChannel(b2b.canalRecomendado.toLowerCase());
                                    setQuickLaunchModalContact(c);
                                  }}
                                  className="px-2 py-1 rounded-lg text-white bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 font-black text-[10px] flex items-center gap-1 shadow-2xs transition"
                                  title={`Lanzar campaña B2B (${b2b.name}) a este contacto`}
                                >
                                  <Rocket className="w-3 h-3" />
                                  <span>Lanzar</span>
                                </button>
                              );
                            })()}

                            <button
                              onClick={() => setShowDetailModal(c)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
                              title="Ver ficha completa"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(c)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              title="Editar contacto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(c.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {/* Menú de 3 puntitos (Derivar a Team, Asignar Líder/Asesor, Marcar Resuelto/Pendiente) */}
                            <ContactActionMenu
                              contact={c}
                              codigoEmpresa={codigoEmpresa}
                              currentUser={user}
                              onUpdated={() => {
                                fetchContacts();
                                fetchTreeData();
                              }}
                              buttonClassName="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Nuevo / Editar Contacto */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-lg text-gray-900">
                      {editingId ? 'Editar Contacto' : 'Nuevo Contacto en Agenda CRM'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveContact} className="mt-4 space-y-4">
                  {/* Seccion 1: Datos Personales */}
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" /> Datos Personales
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre Completo</label>
                        <input
                          type="text"
                          required
                          placeholder="ej. Carlos Benítez"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Teléfono (WhatsApp)</label>
                        <input
                          type="text"
                          required
                          placeholder="ej. 5491136822409"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">DNI / Pasaporte</label>
                        <input
                          type="text"
                          placeholder="ej. 34567890"
                          value={formData.dni}
                          onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Email</label>
                        <input
                          type="email"
                          placeholder="ej. carlos@ejemplo.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seccion 2: Datos Bancarios */}
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-gray-400" /> Datos Bancarios / Cobros
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Banco</label>
                        <input
                          type="text"
                          placeholder="ej. BIND Banco Industrial / Galicia"
                          value={formData.banco}
                          onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Alias</label>
                        <input
                          type="text"
                          placeholder="ej. carlos.inversor.bind"
                          value={formData.alias}
                          onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">CBU / CVU (22 dígitos)</label>
                        <input
                          type="text"
                          placeholder="ej. 0000003100010000000000"
                          value={formData.cbu}
                          onChange={(e) => setFormData({ ...formData, cbu: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seccion 3: Clasificación y Redes */}
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gray-400" /> Clasificación y Redes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Grupo / Rubro</label>
                        <select
                          value={formData.grupo}
                          onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold focus:bg-white focus:outline-none"
                        >
                          {rubros.filter(r => r !== 'TODOS').map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Instagram (@usuario)</label>
                        <input
                          type="text"
                          placeholder="@carlos.ok"
                          value={formData.instagram}
                          onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">LinkedIn</label>
                        <input
                          type="text"
                          placeholder="in/carlos-benitez"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Telegram (@usuario)</label>
                        <input
                          type="text"
                          placeholder="@carlos_tg"
                          value={formData.telegram}
                          onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                          className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Notas Adicionales</label>
                    <textarea
                      rows={2}
                      placeholder="Condiciones pactadas, referencias, montos de inversión habituales..."
                      value={formData.metadata_extra}
                      onChange={(e) => setFormData({ ...formData, metadata_extra: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-950 font-bold placeholder-gray-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-gray-800 text-white shadow-md"
                    >
                      {editingId ? 'Guardar Cambios' : 'Crear Contacto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Ficha Completa Detail */}
          {showDetailModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                      {(showDetailModal.nombre?.[0] || 'C').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900">{showDetailModal.nombre}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-gray-400 font-mono">{showDetailModal.telefono}</p>
                        {showDetailModal.linea_wa?.startsWith('WA_S') || showDetailModal.canal === 'wasender' ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-black border border-purple-200">
                            {showDetailModal.linea_wa || 'WA_S***5239'}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black border border-emerald-200">
                            WA_B
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowDetailModal(null)} className="p-1 rounded-xl hover:bg-gray-100 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-2xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">DNI:</span>
                      <span className="font-mono font-bold text-gray-800">{showDetailModal.dni || 'No registrado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Email:</span>
                      <span className="font-medium text-gray-800">{showDetailModal.email || 'No registrado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Grupo:</span>
                      <span className="font-bold text-indigo-600">{showDetailModal.grupo || 'CLIENTES'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-2xl space-y-2">
                    <p className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Datos de Cuenta / Cobro</p>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Banco:</span>
                      <span className="font-bold text-gray-800">{showDetailModal.banco || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Alias:</span>
                      <span className="font-mono font-bold text-blue-600">{showDetailModal.alias || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">CBU/CVU:</span>
                      <span className="font-mono text-gray-700">{showDetailModal.cbu || '-'}</span>
                    </div>
                  </div>

                  {/* Ficha Especial de Origen B2B Capas 1 al 5 */}
                  {(() => {
                    const b2b = extractB2BLayer(showDetailModal);
                    if (!b2b) return null;
                    return (
                      <div className="p-3.5 bg-linear-to-br from-amber-50/90 via-orange-50/50 to-white rounded-2xl border border-amber-200/80 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                              {b2b.num}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-xs">{b2b.name}</p>
                              <p className="text-[10px] text-amber-800 font-medium">{b2b.info.networks}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${b2b.info.badgeClass}`}>
                            {b2b.tag}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2 bg-white/90 rounded-xl border border-amber-100">
                            <p className="text-[9px] font-black uppercase text-gray-400">Plantilla Email Asignada</p>
                            <p className="text-[11px] font-bold text-gray-800 truncate" title={b2b.plantillaEmail}>
                              📧 {b2b.plantillaEmail}
                            </p>
                          </div>
                          <div className="p-2 bg-white/90 rounded-xl border border-amber-100">
                            <p className="text-[9px] font-black uppercase text-gray-400">Plantilla WhatsApp Asignada</p>
                            <p className="text-[11px] font-bold text-gray-800 truncate" title={b2b.plantillaWhatsapp}>
                              💬 {b2b.plantillaWhatsapp}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-gray-500 font-semibold">
                            Canal recomendado: <strong className="text-gray-900">{b2b.canalRecomendado}</strong>
                          </span>
                          <button
                            onClick={() => {
                              const currentContact = showDetailModal;
                              setShowDetailModal(null);
                              setQuickLaunchChannel(b2b.canalRecomendado.toLowerCase());
                              setQuickLaunchModalContact(currentContact);
                            }}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-2xs transition"
                          >
                            <Rocket className="w-3.5 h-3.5" />
                            <span>Lanzar Campaña</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {showDetailModal.metadata_extra && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-2xl">
                      <p className="font-bold text-amber-900 text-[10px] uppercase mb-1">Notas / Info Extra:</p>
                      <div className="text-amber-800 text-xs">
                        {typeof showDetailModal.metadata_extra === 'object' ? (
                          <div className="space-y-1">
                            {Object.entries(showDetailModal.metadata_extra).map(([k, v]) => (
                              <div key={k} className="flex flex-wrap gap-1 text-[11px]">
                                <span className="font-bold uppercase text-[9px] text-amber-950">{k.replace(/_/g, ' ')}:</span>
                                <span className="break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{showDetailModal.metadata_extra}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      const c = showDetailModal;
                      setShowDetailModal(null);
                      openEditModal(c);
                    }}
                    className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold"
                  >
                    Editar Ficha
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Importar CSV */}
          {showImportModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-lg text-gray-900">Importación Masiva (CSV / Texto)</h3>
                  </div>
                  <button onClick={() => setShowImportModal(false)} className="p-1 rounded-xl hover:bg-gray-100 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-xs text-gray-600">
                    Sube un archivo <strong>.CSV</strong> o pega las líneas en formato:
                    <br />
                    <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">
                      Nombre, Teléfono, DNI, Email, Banco, CBU, Alias, Grupo
                    </code>
                  </p>

                  <input
                    type="file"
                    accept=".csv,.txt"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">O pega directamente aquí el texto:</label>
                    <textarea
                      rows={4}
                      value={csvText}
                      onChange={(e) => {
                        setCsvText(e.target.value);
                        parseCsv(e.target.value);
                      }}
                      placeholder="Juan Perez, 5491136822409, 35123456, juan@mail.com, BIND, 0000003100010000000000, juan.bind, INVERSORES"
                      className="w-full mt-1 p-2.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>

                  {parsedPreview.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Detectados {parsedPreview.length} contactos listos para guardar en BD
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteBatchImport}
                      disabled={parsedPreview.length === 0}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white shadow-md"
                    >
                      Confirmar e Importar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Lanzador Directo de Campaña B2B a Contacto Individual */}
          {quickLaunchModalContact && (() => {
            const b2b = extractB2BLayer(quickLaunchModalContact);
            const firstName = (quickLaunchModalContact.nombre || '').split(' ')[0] || 'Colega';
            const cleanPhone = (quickLaunchModalContact.telefono || '').replace(/\D/g, '');
            const targetTemplateName = quickLaunchChannel === 'whatsapp' ? b2b?.plantillaWhatsapp : b2b?.plantillaEmail;

            // Mensajes demo adaptados al canal
            const waDemoMessage = `Hola ${firstName}, ¿cómo estás? Te escribo por tu actividad en ${b2b?.office || 'el sector'}. En Colaboratium (Global Loan S.A. - Reg. BCRA Nº 40.015) desarrollamos soluciones para ${b2b?.info.shortName || 'profesionales'} con comisiones de alto rendimiento al calce. ¿Te gustaría coordinar una charla de 15 min?`;

            return (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                        <Rocket className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-base text-gray-900">
                          Lanzar Campaña B2B • {b2b?.tag || 'Capa B2B'}
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Envío directo con plantilla oficial asignada
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setQuickLaunchModalContact(null)} 
                      className="p-1 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Contact Preview Summary */}
                  <div className="mt-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-black text-sm text-gray-900">{quickLaunchModalContact.nombre}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="font-mono">{quickLaunchModalContact.telefono}</span>
                        {quickLaunchModalContact.email && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[180px]">{quickLaunchModalContact.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {b2b && (
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${b2b.info.badgeClass}`}>
                        {b2b.name}
                      </span>
                    )}
                  </div>

                  {/* Channel Switcher */}
                  <div className="mt-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      Canal de Contacto
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setQuickLaunchChannel('whatsapp')}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition text-left ${
                          quickLaunchChannel === 'whatsapp'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black text-xs">WhatsApp Directo</p>
                          <p className="text-[10px] text-gray-500">Apertura inmediata</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickLaunchChannel('email')}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition text-left ${
                          quickLaunchChannel === 'email'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black text-xs">Cold Email</p>
                          <p className="text-[10px] text-gray-500">Vía Campañas Hub</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Template Info Card */}
                  <div className="mt-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70">
                    <p className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Plantilla Asignada por Capa</span>
                    </p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">
                      {targetTemplateName || 'Plantilla General'}
                    </p>
                    <div className="mt-2 p-2.5 bg-white/90 rounded-xl border border-amber-200/60 text-[11px] text-gray-700 font-mono leading-relaxed max-h-32 overflow-y-auto">
                      {waDemoMessage}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setQuickLaunchModalContact(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const contactToBridge = quickLaunchModalContact;
                          setQuickLaunchModalContact(null);
                          // Configurar el bridge en sessionStorage
                          const bridgePayload = {
                            source: 'crm_single',
                            contactId: contactToBridge.id,
                            contactName: contactToBridge.nombre,
                            targetCapa: b2b?.code || 'CAPA_1_REMAX',
                            channel: quickLaunchChannel,
                            templateName: targetTemplateName,
                            campaignName: `Envío B2B • ${contactToBridge.nombre} (${b2b?.tag || 'Capa'})`
                          };
                          sessionStorage.setItem('routh_b2b_campaign_bridge', JSON.stringify(bridgePayload));
                          toast.success('Abriendo en Diseñador de Campañas...');
                          router.push(`/dashboard/campaigns?source=b2b&capa=${b2b?.code || 'CAPA_1_REMAX'}&tab=${quickLaunchChannel}`);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Abrir en Diseñador</span>
                      </button>

                      {quickLaunchChannel === 'whatsapp' ? (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waDemoMessage)}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            toast.success(`Abriendo WhatsApp para ${quickLaunchModalContact.nombre}`);
                            setQuickLaunchModalContact(null);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Enviar por WhatsApp</span>
                        </a>
                      ) : (
                        <a
                          href={`mailto:${quickLaunchModalContact.email || ''}?subject=${encodeURIComponent(targetTemplateName || 'Propuesta de Alianza Colaboratium')}&body=${encodeURIComponent(waDemoMessage)}`}
                          onClick={() => {
                            toast.success(`Abriendo cliente de correo para ${quickLaunchModalContact.nombre}`);
                            setQuickLaunchModalContact(null);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5 transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Abrir Correo</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </Panel>
    </>
  );
}
