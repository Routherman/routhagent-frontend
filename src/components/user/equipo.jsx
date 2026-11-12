'use client';
import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Shield, 
    Plus, 
    Edit2, 
    Trash2, 
    Check, 
    X, 
    ShieldAlert, 
    ShieldCheck, 
    Activity, 
    Calendar, 
    Video, 
    Ticket, 
    UserPlus, 
    RefreshCw, 
    Mail, 
    Lock,
    Eye,
    Zap,
    LayoutGrid,
    MessageSquare,
    Building2,
    BarChart3,
    FolderOpen,
    Cpu,
    GitFork,
    Settings,
    FileText,
    GraduationCap
} from 'lucide-react';
import { API_URL } from '@/config/api';
import { toast } from 'sonner';

/**
 * Catálogo maestro de todas las secciones del sistema Colaboratium / Routh Agent
 */
export const SECCIONES_SISTEMA = [
    {
        id: 'dashboard',
        label: 'Dashboard / Métricas',
        desc: 'Panel principal de estadísticas, ranking de puntos y KPIs en vivo.',
        icon: LayoutGrid,
        badge: 'General',
        badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
        canCrud: false, // Panel de estadísticas solo lectura
    },
    {
        id: 'messages',
        label: 'Chats & Conversaciones',
        desc: 'Bandeja en vivo WhatsApp, handoff IA y respuestas a clientes.',
        icon: MessageSquare,
        badge: 'WhatsApp',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        canCrud: true,
    },
    {
        id: 'inbox',
        label: 'Bandeja de Entrada (Gmail)',
        desc: 'Lectura y despacho de correos electrónicos sincronizados con Google.',
        icon: Mail,
        badge: 'Email',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        canCrud: true,
    },
    {
        id: 'calendar',
        label: 'Calendario & Google Meet',
        desc: 'Agenda comercial, turnos de Meet, webinars de inducción y eventos.',
        icon: Calendar,
        badge: 'Reuniones',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        canCrud: true,
    },
    {
        id: 'tickets',
        label: 'Tickets Helpdesk',
        desc: 'Mesa de soporte, solicitudes internas, autorizaciones y trazabilidad.',
        icon: Ticket,
        badge: 'Soporte',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        canCrud: true,
    },
    {
        id: 'crm',
        label: 'Agenda CRM (Contactos & Asesores)',
        desc: 'Fichas de clientes, inversores, asesores, jerarquías y datos bancarios.',
        icon: Users,
        badge: 'Comercial',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        canCrud: true,
    },
    {
        id: 'prospectos_b2b',
        label: 'Prospectos B2B (Crawler Playwright)',
        desc: 'Scraping autónomo de corredores inmobiliarios, filtros y prospección masiva.',
        icon: Building2,
        badge: 'CRAWLER VIVO',
        badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        canCrud: true,
    },
    {
        id: 'academia',
        label: 'Academia & Capacitación',
        desc: 'Cursos internos, clases con seguimiento real, prácticas y tablero de equipo.',
        icon: GraduationCap,
        badge: 'Formación',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        canCrud: false,
    },
    {
        id: 'campaigns',
        label: 'Campañas Masivas (Meta & Email)',
        desc: 'Envíos masivos por WhatsApp Cloud API y correos con plantillas oficiales.',
        icon: BarChart3,
        badge: 'Marketing',
        badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
        canCrud: true,
    },
    {
        id: 'media',
        label: 'Biblioteca de Medios',
        desc: 'Subida, visualización y gestión de archivos, imágenes y catálogos PDF.',
        icon: FolderOpen,
        badge: 'Archivos',
        badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
        canCrud: true,
    },
    {
        id: 'models',
        label: 'Router Multi-IA',
        desc: 'Modelos de lenguaje (Ollama, Groq, Cerebras, OpenRouter) y fallbacks.',
        icon: Cpu,
        badge: 'Inteligencia',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
        canCrud: true,
    },
    {
        id: 'automation',
        label: 'Automatización & Skills',
        desc: 'Disparadores automáticos, reglas de negocio y automatismos de sistema.',
        icon: Zap,
        badge: 'Reglas',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        canCrud: true,
    },
    {
        id: 'flows',
        label: 'Flujos del Bot',
        desc: 'Diseñador visual de árboles conversacionales y nodos de respuesta.',
        icon: GitFork,
        badge: 'Bot Engine',
        badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
        canCrud: true,
    },
    {
        id: 'roles',
        label: 'Equipo & Roles',
        desc: 'Administración de usuarios de la empresa, creación y edición de roles.',
        icon: ShieldCheck,
        badge: 'Seguridad',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        canCrud: true,
    },
    {
        id: 'settings',
        label: 'Configuración de Empresa & Perfil',
        desc: 'Datos institucionales, vinculación de Meta Cloud API y credenciales.',
        icon: Settings,
        badge: 'Ajustes',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
        canCrud: true,
    }
];

export const getDefaultPrivs = (isSuper = false) => {
    const privs = {};
    SECCIONES_SISTEMA.forEach(sec => {
        privs[`view_${sec.id}`] = isSuper ? true : ['dashboard', 'messages', 'inbox', 'calendar', 'tickets', 'crm', 'prospectos_b2b'].includes(sec.id);
        if (sec.canCrud) {
            privs[`create_${sec.id}`] = isSuper ? true : ['messages', 'crm', 'tickets', 'calendar', 'prospectos_b2b'].includes(sec.id);
            privs[`edit_${sec.id}`] = isSuper ? true : ['messages', 'crm', 'tickets', 'calendar', 'prospectos_b2b'].includes(sec.id);
            privs[`delete_${sec.id}`] = isSuper ? true : false;
        }
    });
    // Flags heredados y operativos para compatibilidad
    privs.manage_calendar_webinar = isSuper;
    privs.manage_calendar_meet = isSuper;
    privs.manage_calendar_events = isSuper;
    privs.manage_contacts = isSuper;
    privs.manage_tickets = isSuper;
    privs.can_manage_users = isSuper;
    privs.can_manage_roles = isSuper;
    privs.can_manage_social = isSuper;
    privs.can_edit_company = isSuper;
    privs.can_access_support_chats = true;
    privs.can_access_sales_chats = true;
    return privs;
};

export default function Equipo({ userData, privilegios }) {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'roles' | 'sucesos'
    
    // Verificación estricta: Master, Main y Administradores pueden gestionar vistas y permisos
    const userRole = (userData?.rol_nombre || '').toLowerCase();
    const isMasterOrMain = !userRole || ['master', 'main', 'admin', 'gerencia', 'director'].includes(userRole);

    // Role form state
    const [showRoleForm, setShowRoleForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleForm, setRoleForm] = useState({
        nombre: '',
        privilegios: getDefaultPrivs(false)
    });

    useEffect(() => {
        if (!userData || !userData.codigo_empresa) return;
        fetchData();
    }, [userData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`${API_URL}/empresas/${userData.codigo_empresa}/users`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
                fetch(`${API_URL}/empresas/${userData.codigo_empresa}/roles`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
            ]);
            
            const usersData = await usersRes.json();
            const rolesData = await rolesRes.json();
            
            setUsuarios(Array.isArray(usersData) ? usersData : []);
            setRoles(Array.isArray(rolesData) ? rolesData : []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar datos del equipo");
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        if (!userData?.codigo_empresa) return;
        setLoadingLogs(true);
        try {
            const res = await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/audit-logs?limit=100`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            const data = await res.json();
            if (data.success) {
                setAuditLogs(data.logs || []);
            }
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            toast.error("Error al cargar log de sucesos");
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'sucesos') {
            fetchAuditLogs();
        }
    }, [activeTab]);

    const handleAssignRole = async (userId, rolId) => {
        if (!isMasterOrMain) {
            toast.error("Solo usuarios con rol Master o Main pueden modificar roles.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/users/${userId}/role`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ rolId: rolId === '' ? null : rolId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Rol asignado correctamente");
                fetchData();
            } else {
                toast.error(data.error || "Error al asignar rol");
            }
        } catch (error) {
            console.error("Error assigning role:", error);
            toast.error("Error de conexión al asignar rol");
        }
    };

    const handleSaveRole = async () => {
        if (!isMasterOrMain) {
            toast.error("Solo usuarios con rol Master o Main pueden crear o editar roles.");
            return;
        }
        if (!roleForm.nombre.trim()) {
            toast.error("Por favor ingresa un nombre para el rol");
            return;
        }

        try {
            const payloadPrivs = { ...roleForm.privilegios };
            // Sincronizar flags de compatibilidad
            payloadPrivs.manage_contacts = Boolean(payloadPrivs.create_crm || payloadPrivs.edit_crm || payloadPrivs.delete_crm || payloadPrivs.manage_contacts);
            payloadPrivs.manage_tickets = Boolean(payloadPrivs.create_tickets || payloadPrivs.edit_tickets || payloadPrivs.manage_tickets);
            payloadPrivs.manage_calendar_events = Boolean(payloadPrivs.create_calendar || payloadPrivs.edit_calendar || payloadPrivs.delete_calendar || payloadPrivs.manage_calendar_events);

            const payload = {
                nombre: roleForm.nombre,
                privilegios: payloadPrivs
            };

            let res;
            if (editingRole) {
                res = await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/roles/${editingRole.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/roles`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(payload)
                });
            }
            const data = await res.json();
            if (data.success) {
                toast.success(editingRole ? "Rol actualizado correctamente" : "Rol creado exitosamente");
                setShowRoleForm(false);
                setEditingRole(null);
                fetchData();
            } else {
                toast.error(data.error || "Error al guardar el rol");
            }
        } catch (error) {
            console.error("Error saving role:", error);
            toast.error("Error de conexión al guardar el rol");
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!isMasterOrMain) {
            toast.error("Solo usuarios con rol Master o Main pueden eliminar roles.");
            return;
        }
        if (!confirm('¿Estás seguro de eliminar este rol? Los usuarios con este rol pasarán a ser main.')) return;
        try {
            const res = await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/roles/${roleId}`, {
                method: 'DELETE',
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Rol eliminado");
                fetchData();
            } else {
                toast.error(data.error || "No se pudo eliminar el rol");
            }
        } catch (error) {
            console.error("Error deleting role:", error);
            toast.error("Error al eliminar rol");
        }
    };

    const openRoleForm = (role = null) => {
        if (!isMasterOrMain) {
            toast.error("Solo usuarios con rol Master o Main pueden modificar vistas y roles.");
            return;
        }
        if (role) {
            setEditingRole(role);
            let privs = typeof role.privilegios === 'string' ? JSON.parse(role.privilegios) : (role.privilegios || {});
            const merged = getDefaultPrivs(role.is_system);

            SECCIONES_SISTEMA.forEach(sec => {
                const vKey = `view_${sec.id}`;
                if (privs[vKey] !== undefined) {
                    merged[vKey] = Boolean(privs[vKey]);
                } else if (sec.id === 'prospectos_b2b') {
                    merged[vKey] = privs.view_crm !== undefined ? Boolean(privs.view_crm) : false;
                } else if (sec.id === 'media') {
                    merged[vKey] = privs.view_campaigns !== undefined ? Boolean(privs.view_campaigns) : false;
                } else if (sec.id === 'automation') {
                    merged[vKey] = privs.view_flows !== undefined ? Boolean(privs.view_flows) : false;
                }

                if (sec.canCrud) {
                    const cKey = `create_${sec.id}`;
                    const eKey = `edit_${sec.id}`;
                    const dKey = `delete_${sec.id}`;

                    if (privs[cKey] !== undefined) merged[cKey] = Boolean(privs[cKey]);
                    else if (sec.id === 'crm') merged[cKey] = Boolean(privs.manage_contacts ?? true);
                    else if (sec.id === 'tickets') merged[cKey] = Boolean(privs.manage_tickets ?? true);
                    else if (sec.id === 'calendar') merged[cKey] = Boolean(privs.manage_calendar_events || privs.manage_calendar_meet || privs.manage_calendar_webinar);

                    if (privs[eKey] !== undefined) merged[eKey] = Boolean(privs[eKey]);
                    else if (sec.id === 'crm') merged[eKey] = Boolean(privs.manage_contacts ?? true);
                    else if (sec.id === 'tickets') merged[eKey] = Boolean(privs.manage_tickets ?? true);
                    else if (sec.id === 'calendar') merged[eKey] = Boolean(privs.manage_calendar_events);

                    if (privs[dKey] !== undefined) merged[dKey] = Boolean(privs[dKey]);
                    else if (sec.id === 'crm') merged[dKey] = Boolean(privs.manage_contacts && role.is_system);
                    else if (sec.id === 'tickets') merged[dKey] = false;
                }
            });

            // Legacy & Administrative flags
            merged.manage_calendar_webinar = privs.manage_calendar_webinar ?? false;
            merged.manage_calendar_meet = privs.manage_calendar_meet ?? false;
            merged.manage_calendar_events = privs.manage_calendar_events ?? false;
            merged.manage_contacts = privs.manage_contacts ?? false;
            merged.manage_tickets = privs.manage_tickets ?? false;
            merged.can_manage_users = privs.can_manage_users ?? false;
            merged.can_manage_roles = privs.can_manage_roles ?? false;
            merged.can_manage_social = privs.can_manage_social ?? false;
            merged.can_edit_company = privs.can_edit_company ?? false;
            merged.can_access_support_chats = privs.can_access_support_chats ?? true;
            merged.can_access_sales_chats = privs.can_access_sales_chats ?? true;

            setRoleForm({
                nombre: role.nombre,
                privilegios: merged
            });
        } else {
            setEditingRole(null);
            setRoleForm({
                nombre: '',
                privilegios: getDefaultPrivs(false)
            });
        }
        setShowRoleForm(true);
    };

    const setAllViews = (value) => {
        const updated = { ...roleForm.privilegios };
        SECCIONES_SISTEMA.forEach(sec => {
            updated[`view_${sec.id}`] = value;
            if (!value && sec.canCrud) {
                updated[`create_${sec.id}`] = false;
                updated[`edit_${sec.id}`] = false;
                updated[`delete_${sec.id}`] = false;
            }
        });
        setRoleForm(prev => ({ ...prev, privilegios: updated }));
    };

    const setAllCrud = (value) => {
        const updated = { ...roleForm.privilegios };
        SECCIONES_SISTEMA.forEach(sec => {
            if (sec.canCrud) {
                updated[`create_${sec.id}`] = value;
                updated[`edit_${sec.id}`] = value;
                updated[`delete_${sec.id}`] = value;
                if (value) updated[`view_${sec.id}`] = true;
            }
        });
        setRoleForm(prev => ({ ...prev, privilegios: updated }));
    };

    const setReadOnly = () => {
        const updated = { ...roleForm.privilegios };
        SECCIONES_SISTEMA.forEach(sec => {
            updated[`view_${sec.id}`] = true;
            if (sec.canCrud) {
                updated[`create_${sec.id}`] = false;
                updated[`edit_${sec.id}`] = false;
                updated[`delete_${sec.id}`] = false;
            }
        });
        setRoleForm(prev => ({ ...prev, privilegios: updated }));
    };

    const toggleRowView = (secId, val) => {
        const updated = { ...roleForm.privilegios };
        updated[`view_${secId}`] = val;
        if (!val) {
            updated[`create_${secId}`] = false;
            updated[`edit_${secId}`] = false;
            updated[`delete_${secId}`] = false;
        }
        setRoleForm(prev => ({ ...prev, privilegios: updated }));
    };

    const toggleRowCrud = (secId, action, val) => {
        const updated = { ...roleForm.privilegios };
        updated[`${action}_${secId}`] = val;
        if (val) {
            updated[`view_${secId}`] = true;
        }
        setRoleForm(prev => ({ ...prev, privilegios: updated }));
    };

    const toggleAllPrivs = (value) => {
        const updated = { ...roleForm.privilegios };
        SECCIONES_SISTEMA.forEach(sec => {
            updated[`view_${sec.id}`] = value;
            if (sec.canCrud) {
                updated[`create_${sec.id}`] = value;
                updated[`edit_${sec.id}`] = value;
                updated[`delete_${sec.id}`] = value;
            }
        });
        updated.can_edit_company = value;
        updated.can_manage_social = value;
        updated.can_manage_users = value;
        updated.can_manage_roles = value;
        updated.can_access_support_chats = value;
        updated.can_access_sales_chats = value;
        updated.manage_calendar_webinar = value;
        updated.manage_calendar_meet = value;
        updated.manage_calendar_events = value;
        updated.manage_contacts = value;
        updated.manage_tickets = value;
        setRoleForm(prev => ({ ...prev, privilegios: updated }));
    };

    const setOperatorMode = () => {
        const updated = { ...roleForm.privilegios };
        SECCIONES_SISTEMA.forEach(sec => {
            updated[`view_${sec.id}`] = true;
            if (sec.canCrud) {
                updated[`create_${sec.id}`] = true;
                updated[`edit_${sec.id}`] = true;
                updated[`delete_${sec.id}`] = false;
            }
        });
        updated.manage_contacts = true;
        updated.manage_tickets = true;
        updated.manage_calendar_events = true;
        setRoleForm(prev => ({ ...prev, privilegios: updated }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center mt-20 text-gray-400 gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-black" />
                <span className="text-sm font-semibold">Cargando equipo y permisos...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto mt-4 pb-16 font-sans">
            
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                {/* Header Superior */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Equipo & Roles</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    isMasterOrMain 
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                    Tu Rol: {userData?.rol_nombre || 'Usuario'}
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">
                                Control de acceso, visibilidad de módulos, permisos de calendario y auditoría en Colaboratium.
                            </p>
                        </div>
                    </div>
                    
                    {/* Selector de Pestañas */}
                    <div className="flex bg-gray-100/80 p-1.5 rounded-2xl gap-1">
                        <button 
                            onClick={() => { setActiveTab('usuarios'); setShowRoleForm(false); }} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'usuarios' ? 'bg-white shadow-sm text-gray-950 font-extrabold' : 'text-gray-600 hover:text-gray-950'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>Usuarios ({usuarios.length})</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('roles'); setShowRoleForm(false); }} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'roles' ? 'bg-white shadow-sm text-gray-950 font-extrabold' : 'text-gray-600 hover:text-gray-950'
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Roles & Vistas ({roles.length})</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('sucesos'); setShowRoleForm(false); }} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'sucesos' ? 'bg-white shadow-sm text-indigo-700 font-extrabold' : 'text-gray-600 hover:text-gray-950'
                            }`}
                        >
                            <Activity className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Sucesos Google Colaboratium</span>
                        </button>
                    </div>
                </div>

                {/* Banner de Restricción si no es Master ni Main */}
                {!isMasterOrMain && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs font-semibold">
                        <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            <span className="font-bold">Modo Consulta (Restringido):</span> Solo los usuarios con rol <span className="font-extrabold underline">Master</span> o <span className="font-extrabold underline">Main</span> tienen autorización para crear o modificar roles, ajustar las vistas del dashboard y reasignar privilegios a los miembros.
                        </div>
                    </div>
                )}

                {/* PESTAÑA 1: USUARIOS */}
                {activeTab === 'usuarios' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Miembro</th>
                                    <th className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Email Oficial</th>
                                    <th className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Rol Asignado</th>
                                    <th className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Alcance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => {
                                    const uRol = roles.find(r => r.id === u.rol_id);
                                    let privsObj = {};
                                    if (uRol?.privilegios) {
                                        privsObj = typeof uRol.privilegios === 'string' ? JSON.parse(uRol.privilegios) : uRol.privilegios;
                                    }
                                    const isLead = (uRol?.nombre || '').toLowerCase().includes('lider');
                                    const isAdv = (uRol?.nombre || '').toLowerCase().includes('asesor');
                                    const isInv = (uRol?.nombre || '').toLowerCase().includes('inversor');
                                    const isSysAdmin = ['master', 'main'].includes((uRol?.nombre || '').toLowerCase());

                                    return (
                                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                                            <td className="py-4 px-4 flex items-center gap-3">
                                                {u.image_url ? (
                                                    <img src={u.image_url} alt={u.first_name} className="w-9 h-9 rounded-2xl object-cover shadow-xs border border-gray-200" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-black text-indigo-700">
                                                        {u.first_name?.[0] || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-extrabold text-sm text-gray-900 block leading-tight">
                                                        {u.first_name} {u.last_name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-mono">ID: {String(u.clerk_id || u.id || '').slice(0, 10)}...</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-xs font-semibold text-gray-600 font-mono">{u.email}</td>
                                            <td className="py-4 px-4 min-w-[200px]">
                                                <select 
                                                    value={u.rol_id || ''} 
                                                    onChange={(e) => handleAssignRole(u.id, e.target.value)}
                                                    disabled={!isMasterOrMain || u.id === userData.id}
                                                    className={`border text-xs font-bold rounded-xl focus:ring-2 focus:ring-black outline-none block w-full p-2.5 transition shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed ${!u.rol_id ? 'border-amber-300 bg-amber-50/60 text-amber-900' : 'bg-gray-50 hover:bg-white border-gray-200 text-gray-900'}`}
                                                >
                                                    <option value="" className="text-gray-500 font-medium">-- Sin Rol Asignado (Pendiente) --</option>
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.id}>
                                                            {r.nombre} {r.is_system ? '(Sistema)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {!uRol ? (
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                                            ⚠️ Pendiente de Asignación
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {isSysAdmin && (
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-800">
                                                                    Control Total
                                                                </span>
                                                            )}
                                                            {isLead && (
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 flex items-center gap-1">
                                                                    <Calendar className="w-2.5 h-2.5" /> Webinars
                                                                </span>
                                                            )}
                                                            {isAdv && (
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800 flex items-center gap-1">
                                                                    <Video className="w-2.5 h-2.5" /> Google Meet
                                                                </span>
                                                            )}
                                                            {isInv && (
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                                                                    Inversor
                                                                </span>
                                                            )}
                                                            {!isSysAdmin && !isLead && !isAdv && !isInv && (
                                                                <span className="text-[11px] text-gray-400 italic">Operativo Estándar</span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PESTAÑA 2: ROLES & PERMISOS */}
                {activeTab === 'roles' && !showRoleForm && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Roles Registrados</h3>
                                <p className="text-xs text-gray-500">Configuración de visualización y facultades operativas por rol.</p>
                            </div>
                            {isMasterOrMain && (
                                <button 
                                    onClick={() => openRoleForm()} 
                                    className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Crear Rol
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {roles.map(rol => {
                                const privs = typeof rol.privilegios === 'string' ? JSON.parse(rol.privilegios) : (rol.privilegios || {});
                                const isSuper = ['master', 'main'].includes(rol.nombre.toLowerCase());

                                // Secciones visibles autorizadas
                                const allowedSections = SECCIONES_SISTEMA.filter(sec => {
                                    if (isSuper) return true;
                                    if (privs[`view_${sec.id}`] !== undefined) return Boolean(privs[`view_${sec.id}`]);
                                    if (sec.id === 'prospectos_b2b') return Boolean(privs.view_crm ?? true);
                                    return ['dashboard', 'messages', 'inbox', 'calendar', 'tickets', 'crm'].includes(sec.id);
                                });

                                // Conteo de permisos CRUD activos
                                const crudPermissionsCount = SECCIONES_SISTEMA.filter(sec => sec.canCrud).reduce((acc, sec) => {
                                    let c = 0;
                                    if (isSuper || privs[`create_${sec.id}`]) c++;
                                    if (isSuper || privs[`edit_${sec.id}`]) c++;
                                    if (isSuper || privs[`delete_${sec.id}`]) c++;
                                    return acc + c;
                                }, 0);
                                const maxCrudPossible = SECCIONES_SISTEMA.filter(sec => sec.canCrud).length * 3;

                                return (
                                    <div key={rol.id} className="border border-gray-200/80 rounded-3xl p-5 hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                                        isSuper ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        <Shield className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-sm text-gray-900 capitalize">{rol.nombre}</h4>
                                                        <span className="text-[10px] text-gray-400 font-bold block">
                                                            {rol.is_system ? 'Rol de Sistema (Protegido)' : 'Rol Personalizado'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isMasterOrMain && (
                                                    <div className="flex gap-1.5">
                                                        <button 
                                                            onClick={() => openRoleForm(rol)} 
                                                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition"
                                                            title="Editar Permisos"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        {!rol.is_system && (
                                                            <button 
                                                                onClick={() => handleDeleteRole(rol.id)} 
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                                                title="Eliminar Rol"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sección de Alcance Operativo */}
                                            <div className="mb-3.5">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
                                                    Alcance Operativo
                                                </span>
                                                <div className="space-y-1 text-xs">
                                                    {(isSuper || privs.manage_calendar_webinar) && (
                                                        <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50/80 px-2 py-1 rounded-lg text-[11px] font-bold">
                                                            <Check className="w-3 h-3 text-amber-600" />
                                                            <span>Crear Webinars (Líder)</span>
                                                        </div>
                                                    )}
                                                    {(isSuper || privs.manage_calendar_meet) && (
                                                        <div className="flex items-center gap-1.5 text-blue-800 bg-blue-50/80 px-2 py-1 rounded-lg text-[11px] font-bold">
                                                            <Check className="w-3 h-3 text-blue-600" />
                                                            <span>Crear Google Meet (Asesor)</span>
                                                        </div>
                                                    )}
                                                    {(isSuper || privs.manage_calendar_events) && (
                                                        <div className="flex items-center gap-1.5 text-indigo-800 bg-indigo-50/80 px-2 py-1 rounded-lg text-[11px] font-bold">
                                                            <Check className="w-3 h-3 text-indigo-600" />
                                                            <span>Administrar Calendario Completo</span>
                                                        </div>
                                                    )}
                                                    {(isSuper || privs.manage_tickets) && (
                                                        <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded-lg text-[11px] font-bold">
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                            <span>Modificar / Autorizar Tickets</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Vistas Autorizadas del Dashboard */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                        Vistas en Dashboard
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-500 font-mono">
                                                        {isSuper ? `Todas (${SECCIONES_SISTEMA.length})` : `${allowedSections.length} de ${SECCIONES_SISTEMA.length} visibles`}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {isSuper ? (
                                                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black rounded-md">
                                                            Acceso Total a las 14 Secciones
                                                        </span>
                                                    ) : allowedSections.length === 0 ? (
                                                        <span className="text-[11px] text-gray-400 italic">Sin secciones asignadas</span>
                                                    ) : (
                                                        allowedSections.map(sec => (
                                                            <span key={sec.id} className="px-1.5 py-0.5 bg-gray-100 text-gray-800 text-[10px] font-bold rounded border border-gray-200/70 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                {sec.label.split('(')[0].trim()}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                                <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-gray-500 bg-gray-50/80 px-2.5 py-1.5 rounded-xl border border-gray-100">
                                                    <span className="flex items-center gap-1 text-gray-700 font-bold">
                                                        <Zap className="w-3 h-3 text-indigo-500" />
                                                        Permisos CRUD:
                                                    </span>
                                                    <span className="font-mono font-bold text-gray-900">
                                                        {isSuper ? 'Crear, Modificar y Borrar (Full)' : `${crudPermissionsCount} / ${maxCrudPossible} activos`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                                            <span>Estado: Activo</span>
                                            {isMasterOrMain && (
                                                <button 
                                                    onClick={() => openRoleForm(rol)} 
                                                    className="font-bold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Gestionar &rarr;
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* MODAL DE EDICIÓN / CREACIÓN DE ROL */}
                {activeTab === 'roles' && showRoleForm && (
                    <div className="bg-gray-50/80 rounded-3xl p-7 border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">
                                    {editingRole ? `Editar Rol: ${editingRole.nombre}` : 'Crear Nuevo Rol'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Define el alcance operativo y qué secciones del dashboard puede ver o no este rol.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={() => toggleAllPrivs(true)} 
                                    className="px-2.5 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-[11px] font-black shadow-xs flex items-center gap-1.5 transition"
                                    title="Activar vistas y permisos CRUD en todas las secciones"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    ⚡ Full Admin (Todo)
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setAllViews(true)} 
                                    className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 shadow-2xs transition"
                                    title="Habilitar todas las vistas de menú"
                                >
                                    👁️ Todas las Vistas
                                </button>
                                <button 
                                    type="button"
                                    onClick={setOperatorMode} 
                                    className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-bold text-indigo-700 shadow-2xs transition"
                                    title="Vistas habilitadas + Crear y Modificar (sin borrar)"
                                >
                                    ✏️ Operador (Crear + Modificar)
                                </button>
                                <button 
                                    type="button"
                                    onClick={setReadOnly} 
                                    className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 shadow-2xs transition"
                                    title="Solo ver secciones sin permiso CRUD"
                                >
                                    🔒 Solo Lectura
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => toggleAllPrivs(false)} 
                                    className="px-2.5 py-1.5 bg-white hover:bg-red-50 border border-gray-200 rounded-xl text-[11px] font-bold text-red-600 transition"
                                    title="Desmarcar todas las secciones y permisos"
                                >
                                    ❌ Desmarcar
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowRoleForm(false)} 
                                    className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-500 transition ml-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Nombre */}
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                                    Nombre del Rol
                                </label>
                                <input 
                                    type="text" 
                                    value={roleForm.nombre} 
                                    onChange={e => setRoleForm({...roleForm, nombre: e.target.value})}
                                    disabled={editingRole?.is_system}
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 bg-white text-gray-950 font-black text-sm focus:ring-2 focus:ring-black focus:border-black outline-none disabled:opacity-50 shadow-xs"
                                    placeholder="Ej. Líder Regional, Asesor Inversiones, Auditor..."
                                />
                                {editingRole?.is_system && (
                                    <p className="text-[11px] text-gray-400 mt-1">El nombre de un rol de sistema no puede alterarse.</p>
                                )}
                            </div>

                            {/* 1. MATRIZ DE PERMISOS POR SECCIÓN (TODAS LAS SECCIONES CRUD) */}
                            <div className="p-6 bg-white rounded-3xl border border-gray-200/90 shadow-xs">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                                                1. Matriz de Permisos por Sección ({SECCIONES_SISTEMA.length} Módulos del Sistema)
                                            </h4>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Configura qué secciones ve el rol en el sidebar y sus facultades operativas: <b>Mostrar (Vista)</b>, <b>Crear</b>, <b>Modificar</b> y <b>Borrar</b>.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px]">
                                        <span className="text-gray-400 font-medium">Atajos rápidos:</span>
                                        <button 
                                            type="button"
                                            onClick={() => setAllCrud(true)} 
                                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg hover:bg-emerald-100 transition"
                                        >
                                            + Todo CRUD
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={setReadOnly} 
                                            className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold rounded-lg hover:bg-amber-100 transition"
                                        >
                                            Sin CRUD (Solo Ver)
                                        </button>
                                    </div>
                                </div>

                                {/* Tabla / Matriz CRUD */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-[11px] font-black text-gray-500 uppercase tracking-wider bg-gray-50/70 rounded-xl">
                                                <th className="py-3 px-4 rounded-l-xl">Módulo / Sección</th>
                                                <th className="py-3 px-3 text-center">
                                                    <div className="inline-flex items-center gap-1.5 text-indigo-700 font-black">
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Mostrar</span>
                                                    </div>
                                                </th>
                                                <th className="py-3 px-3 text-center">
                                                    <div className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>Crear</span>
                                                    </div>
                                                </th>
                                                <th className="py-3 px-3 text-center">
                                                    <div className="inline-flex items-center gap-1.5 text-amber-700 font-black">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                        <span>Modificar</span>
                                                    </div>
                                                </th>
                                                <th className="py-3 px-3 text-center rounded-r-xl">
                                                    <div className="inline-flex items-center gap-1.5 text-rose-700 font-black">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Borrar</span>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {SECCIONES_SISTEMA.map(sec => {
                                                const IconComponent = sec.icon || LayoutGrid;
                                                const isVisible = Boolean(roleForm.privilegios[`view_${sec.id}`]);
                                                const canCreate = Boolean(roleForm.privilegios[`create_${sec.id}`]);
                                                const canEdit = Boolean(roleForm.privilegios[`edit_${sec.id}`]);
                                                const canDelete = Boolean(roleForm.privilegios[`delete_${sec.id}`]);

                                                return (
                                                    <tr 
                                                        key={sec.id} 
                                                        className={`transition-colors ${
                                                            isVisible ? 'hover:bg-indigo-50/20' : 'bg-gray-50/40 opacity-70 hover:opacity-100'
                                                        }`}
                                                    >
                                                        {/* Info del Módulo */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                                                    isVisible ? sec.badgeColor : 'bg-gray-100 text-gray-400 border-gray-200'
                                                                }`}>
                                                                    <IconComponent className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-extrabold text-xs text-gray-900 block">
                                                                            {sec.label}
                                                                        </span>
                                                                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-black tracking-wide border ${sec.badgeColor}`}>
                                                                            {sec.badge}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[11px] text-gray-400 font-medium line-clamp-1">
                                                                        {sec.desc}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* 1. MOSTRAR */}
                                                        <td className="py-3.5 px-3 text-center">
                                                            <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isVisible}
                                                                    onChange={e => toggleRowView(sec.id, e.target.checked)}
                                                                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                                />
                                                            </label>
                                                        </td>

                                                        {/* 2. CREAR */}
                                                        <td className="py-3.5 px-3 text-center">
                                                            {sec.canCrud ? (
                                                                <label className={`inline-flex items-center justify-center p-1 ${
                                                                    !isVisible ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
                                                                }`}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        disabled={!isVisible}
                                                                        checked={canCreate}
                                                                        onChange={e => toggleRowCrud(sec.id, 'create', e.target.checked)}
                                                                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                                                                    />
                                                                </label>
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400 font-bold italic">—</span>
                                                            )}
                                                        </td>

                                                        {/* 3. MODIFICAR */}
                                                        <td className="py-3.5 px-3 text-center">
                                                            {sec.canCrud ? (
                                                                <label className={`inline-flex items-center justify-center p-1 ${
                                                                    !isVisible ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
                                                                }`}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        disabled={!isVisible}
                                                                        checked={canEdit}
                                                                        onChange={e => toggleRowCrud(sec.id, 'edit', e.target.checked)}
                                                                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed"
                                                                    />
                                                                </label>
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400 font-bold italic">—</span>
                                                            )}
                                                        </td>

                                                        {/* 4. BORRAR */}
                                                        <td className="py-3.5 px-3 text-center">
                                                            {sec.canCrud ? (
                                                                <label className={`inline-flex items-center justify-center p-1 ${
                                                                    !isVisible ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
                                                                }`}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        disabled={!isVisible}
                                                                        checked={canDelete}
                                                                        onChange={e => toggleRowCrud(sec.id, 'delete', e.target.checked)}
                                                                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-not-allowed"
                                                                    />
                                                                </label>
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400 font-bold italic">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 2. ALCANCE OPERATIVO ESPECÍFICO */}
                            <div className="p-5 bg-white rounded-2xl border border-gray-200/80">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-amber-600" />
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                        2. Alcance Operativo Específico de Reuniones & Inducción
                                    </h4>
                                </div>
                                <p className="text-[11px] text-gray-500 mb-3">
                                    Permisos específicos para la emisión de capacitaciones por Webinar y reuniones de Google Meet con clientes e inversores.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { key: 'manage_calendar_webinar', label: 'Crear Webinars para Capacitar Asesores (Líderes de Equipo)' },
                                        { key: 'manage_calendar_meet', label: 'Crear Reuniones Google Meet con Inversores (Asesores)' },
                                    ].map(item => (
                                        <label key={item.key} className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 cursor-pointer transition">
                                            <input 
                                                type="checkbox" 
                                                checked={roleForm.privilegios[item.key] || false}
                                                onChange={e => setRoleForm({
                                                    ...roleForm,
                                                    privilegios: { ...roleForm.privilegios, [item.key]: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-black focus:ring-black rounded border-gray-300"
                                            />
                                            <span className="text-xs font-bold text-gray-800">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 3. ADMINISTRACIÓN GENERAL */}
                            <div className="p-5 bg-white rounded-2xl border border-gray-200/80">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                        3. Facultades de Administración de Sistema
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { key: 'can_edit_company', label: 'Editar datos institucionales de la empresa' },
                                        { key: 'can_manage_social', label: 'Configurar cuentas de WhatsApp Meta Cloud API' },
                                        { key: 'can_manage_users', label: 'Invitar y administrar usuarios del equipo' },
                                        { key: 'can_manage_roles', label: 'Gestionar roles y permisos del sistema' },
                                        { key: 'can_access_support_chats', label: 'Atender chats de Soporte' },
                                        { key: 'can_access_sales_chats', label: 'Atender chats de Asesoría / Ventas' }
                                    ].map(item => (
                                        <label key={item.key} className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 cursor-pointer transition">
                                            <input 
                                                type="checkbox" 
                                                checked={roleForm.privilegios[item.key] || false}
                                                onChange={e => setRoleForm({
                                                    ...roleForm,
                                                    privilegios: { ...roleForm.privilegios, [item.key]: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-black focus:ring-black rounded border-gray-300"
                                            />
                                            <span className="text-xs font-bold text-gray-800">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Botón Guardar */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    onClick={() => setShowRoleForm(false)} 
                                    className="px-5 py-2.5 rounded-2xl bg-gray-200 hover:bg-gray-300 text-xs font-extrabold text-gray-700 transition"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSaveRole} 
                                    className="px-6 py-2.5 rounded-2xl bg-black hover:bg-gray-800 text-white text-xs font-black transition shadow-md"
                                >
                                    {editingRole ? 'Guardar Cambios' : 'Crear Rol Ahora'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PESTAÑA 3: LOG DE SUCESOS GOOGLE COLABORATIUM */}
                {activeTab === 'sucesos' && (
                    <div>
                        {/* Header Banner */}
                        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-extrabold text-white">Log de Sucesos en Ámbito Google Colaboratium</h4>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                            colaboratium@gmail.com
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Auditoría en tiempo real de creación de eventos de Google Meet, Webinars de Líderes, delegaciones y autorizaciones de tickets.
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={fetchAuditLogs} 
                                disabled={loadingLogs}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 shrink-0"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                                <span>Actualizar Sucesos</span>
                            </button>
                        </div>

                        {loadingLogs ? (
                            <div className="flex justify-center py-12 text-gray-400 gap-2 items-center">
                                <RefreshCw className="w-5 h-5 animate-spin text-black" />
                                <span className="text-xs font-bold">Cargando sucesos de auditoría...</span>
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 text-xs">
                                No hay sucesos registrados aún en el ámbito colaboratium@gmail.com.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {auditLogs.map(log => {
                                    const fecha = log.creado_en ? new Date(log.creado_en).toLocaleString('es-AR') : 'Reciente';
                                    const isCal = log.entidad === 'calendar' || log.accion?.includes('calendar');
                                    const isTicket = log.entidad === 'ticket' || log.accion?.includes('ticket');
                                    const isRole = log.entidad === 'roles' || log.accion?.includes('rol');

                                    return (
                                        <div key={log.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-gray-100/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                                    isCal ? 'bg-blue-100 text-blue-700' : isTicket ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {isCal ? <Calendar className="w-4 h-4" /> : isTicket ? <Ticket className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-extrabold text-xs text-gray-900 capitalize">
                                                            {log.accion?.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gray-200/80 text-gray-700">
                                                            {log.entidad}
                                                        </span>
                                                        {log.detalles?.includes('Tiempo') && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                ⏱️ {log.detalles.match(/Tiempo[^:.]*:?\s*[^,.]+/)?.[0] || 'Tiempo registrado'}
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-gray-400 font-mono">
                                                            {log.google_scope || 'colaboratium@gmail.com'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 font-medium">
                                                        {log.detalles}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span className="text-[11px] font-bold text-gray-800 block">
                                                    {log.usuario_nombre || 'Sistema'} {log.rol ? `(${log.rol})` : ''}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {fecha}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
