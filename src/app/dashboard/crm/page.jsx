"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import { API_URL } from '@/config/api';
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
  ArrowRight
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
  'PROSPECTO ASESORES': { label: 'Prospecto Asesores', badge: 'Campañas', desc: 'Candidatos para campañas de captación' }
};

export default function CrmPage() {
  const { user, isLoaded } = useUser();
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [rubros, setRubros] = useState(OFFICIAL_RUBROS);
  const [selectedGroup, setSelectedGroup] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  // 2. Cargar contactos
  const fetchContacts = async () => {
    if (!codigoEmpresa) return;
    try {
      setLoading(true);
      const queryGroup = selectedGroup === 'TODOS' ? '' : selectedGroup;
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/crm/contacts?grupo=${encodeURIComponent(queryGroup)}&search=${encodeURIComponent(search)}`, {
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
      if (gUpper === 'PROSPECTO ASESORES') return grp.includes('PROSPECTO') || rol.includes('PROSPECTO');
      if (gUpper === 'TEAM') return ['TEAM', 'STAFF', 'EMPLEADOS'].includes(grp) || ['TEAM', 'STAFF', 'EMPLEADO', 'EMPLEADOS'].includes(rol);
      if (gUpper === 'ASESORES') return ['ASESORES', 'ASESOR'].includes(grp) || ['ASESORES', 'ASESOR'].includes(rol);
      if (gUpper === 'LIDERES') return ['LIDERES', 'LIDER', 'LÍDERES', 'LÍDER'].includes(grp) || ['LIDERES', 'LIDER', 'LÍDERES', 'LÍDER'].includes(rol);
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
      metadata_extra: c.metadata_extra || ''
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

  const filtered = contacts.filter(c => {
    const term = search.toLowerCase();
    return (
      (c.nombre || '').toLowerCase().includes(term) ||
      (c.telefono || '').includes(term) ||
      (c.dni || '').includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.alias || '').toLowerCase().includes(term) ||
      (c.banco || '').toLowerCase().includes(term)
    );
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
                          <div className="font-extrabold text-gray-900 text-sm">
                            {c.nombre || 'Sin Nombre'}
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
                          <a 
                            href={`https://wa.me/${(c.telefono || '').replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {c.telefono}
                          </a>
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
                      <p className="text-xs text-gray-400 font-mono">{showDetailModal.telefono}</p>
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

                  {showDetailModal.metadata_extra && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-2xl">
                      <p className="font-bold text-amber-900 text-[10px] uppercase mb-1">Notas:</p>
                      <p className="text-amber-800">{showDetailModal.metadata_extra}</p>
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
        </div>
      </Panel>
    </>
  );
}
