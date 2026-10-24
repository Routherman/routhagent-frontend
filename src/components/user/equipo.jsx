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
    Zap
} from 'lucide-react';
import { API_URL } from '@/config/api';
import { toast } from 'sonner';

export default function Equipo({ userData, privilegios }) {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'roles' | 'sucesos'
    
    // Verificación estricta: solo Master y Main pueden modificar vistas y permisos
    const userRole = (userData?.rol_nombre || '').toLowerCase();
    const isMasterOrMain = userRole === 'master' || userRole === 'main';

    // Role form state
    const [showRoleForm, setShowRoleForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleForm, setRoleForm] = useState({
        nombre: '',
        privilegios: {
            // Vistas del Dashboard
            view_dashboard: true,
            view_messages: true,
            view_inbox: true,
            view_calendar: true,
            view_tickets: true,
            view_crm: true,
            view_models: false,
            view_campaigns: false,
            view_flows: false,
            view_roles: false,
            view_settings: true,
            // Alcance Operativo
            manage_calendar_webinar: false,
            manage_calendar_meet: false,
            manage_calendar_events: false,
            manage_contacts: true,
            manage_tickets: true,
            // Gestión de Sistema
            can_manage_users: false,
            can_manage_roles: false,
            can_manage_social: false,
            can_edit_company: false,
            can_access_support_chats: true,
            can_access_sales_chats: true
        }
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
                body: JSON.stringify({ rolId })
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
            let res;
            if (editingRole) {
                res = await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/roles/${editingRole.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(roleForm)
                });
            } else {
                res = await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/roles`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(roleForm)
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
            setRoleForm({
                nombre: role.nombre,
                privilegios: {
                    view_dashboard: privs.view_dashboard ?? true,
                    view_messages: privs.view_messages ?? true,
                    view_inbox: privs.view_inbox ?? true,
                    view_calendar: privs.view_calendar ?? true,
                    view_tickets: privs.view_tickets ?? true,
                    view_crm: privs.view_crm ?? true,
                    view_models: privs.view_models ?? false,
                    view_campaigns: privs.view_campaigns ?? false,
                    view_flows: privs.view_flows ?? false,
                    view_roles: privs.view_roles ?? false,
                    view_settings: privs.view_settings ?? true,
                    manage_calendar_webinar: privs.manage_calendar_webinar ?? false,
                    manage_calendar_meet: privs.manage_calendar_meet ?? false,
                    manage_calendar_events: privs.manage_calendar_events ?? false,
                    manage_contacts: privs.manage_contacts ?? true,
                    manage_tickets: privs.manage_tickets ?? true,
                    can_manage_users: privs.can_manage_users ?? false,
                    can_manage_roles: privs.can_manage_roles ?? false,
                    can_manage_social: privs.can_manage_social ?? false,
                    can_edit_company: privs.can_edit_company ?? false,
                    can_access_support_chats: privs.can_access_support_chats ?? true,
                    can_access_sales_chats: privs.can_access_sales_chats ?? true,
                }
            });
        } else {
            setEditingRole(null);
            setRoleForm({
                nombre: '',
                privilegios: {
                    view_dashboard: true,
                    view_messages: true,
                    view_inbox: true,
                    view_calendar: true,
                    view_tickets: true,
                    view_crm: true,
                    view_models: false,
                    view_campaigns: false,
                    view_flows: false,
                    view_roles: false,
                    view_settings: true,
                    manage_calendar_webinar: false,
                    manage_calendar_meet: false,
                    manage_calendar_events: false,
                    manage_contacts: true,
                    manage_tickets: true,
                    can_manage_users: false,
                    can_manage_roles: false,
                    can_manage_social: false,
                    can_edit_company: false,
                    can_access_support_chats: true,
                    can_access_sales_chats: true
                }
            });
        }
        setShowRoleForm(true);
    };

    const toggleAllPrivs = (value) => {
        const updated = {};
        Object.keys(roleForm.privilegios).forEach(k => {
            updated[k] = value;
        });
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
                                                    <span className="text-[10px] text-gray-400 font-mono">ID: {u.id?.slice(0, 10)}...</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-xs font-semibold text-gray-600 font-mono">{u.email}</td>
                                            <td className="py-4 px-4 min-w-[200px]">
                                                <select 
                                                    value={u.rol_id || ''} 
                                                    onChange={(e) => handleAssignRole(u.id, e.target.value)}
                                                    disabled={!isMasterOrMain || u.id === userData.id}
                                                    className="bg-gray-50 hover:bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-xl focus:ring-2 focus:ring-black outline-none block w-full p-2.5 transition shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.id}>
                                                            {r.nombre} {r.is_system ? '(Sistema)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap gap-1">
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

                                // Contar vistas autorizadas
                                const viewKeys = ['view_dashboard', 'view_messages', 'view_inbox', 'view_calendar', 'view_tickets', 'view_crm', 'view_models', 'view_campaigns', 'view_flows', 'view_settings'];
                                const allowedViews = viewKeys.filter(k => isSuper || privs[k] === true);

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
                                                        {isSuper ? 'Todas (10)' : `${allowedViews.length} visibles`}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {isSuper ? (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-[10px] font-bold rounded-md">
                                                            Acceso a Todas las Secciones
                                                        </span>
                                                    ) : allowedViews.length === 0 ? (
                                                        <span className="text-[11px] text-gray-400 italic">Sin secciones asignadas</span>
                                                    ) : (
                                                        allowedViews.map(k => (
                                                            <span key={k} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-bold rounded">
                                                                {k.replace('view_', '')}
                                                            </span>
                                                        ))
                                                    )}
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
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => toggleAllPrivs(true)} 
                                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700"
                                >
                                    Marcar Todo
                                </button>
                                <button 
                                    onClick={() => toggleAllPrivs(false)} 
                                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700"
                                >
                                    Desmarcar
                                </button>
                                <button 
                                    onClick={() => setShowRoleForm(false)} 
                                    className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-500 transition"
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
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white font-bold text-sm focus:ring-2 focus:ring-black outline-none disabled:opacity-50"
                                    placeholder="Ej. Líder Regional, Asesor Inversiones, Auditor..."
                                />
                                {editingRole?.is_system && (
                                    <p className="text-[11px] text-gray-400 mt-1">El nombre de un rol de sistema no puede alterarse.</p>
                                )}
                            </div>

                            {/* 1. SECCIONES VISIBLES DEL DASHBOARD */}
                            <div className="p-5 bg-white rounded-2xl border border-gray-200/80">
                                <div className="flex items-center gap-2 mb-3">
                                    <Eye className="w-4 h-4 text-indigo-600" />
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                        1. Vistas Autorizadas del Dashboard (Ver o NO cada sección)
                                    </h4>
                                </div>
                                <p className="text-[11px] text-gray-500 mb-4">
                                    Las secciones desmarcadas quedarán ocultas en el sidebar para los usuarios asignados a este rol.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {[
                                        { key: 'view_dashboard', label: 'Dashboard / Métricas' },
                                        { key: 'view_messages', label: 'Chats & Conversaciones' },
                                        { key: 'view_inbox', label: 'Bandeja de Entrada (Gmail)' },
                                        { key: 'view_calendar', label: 'Calendario & Google Meet' },
                                        { key: 'view_tickets', label: 'Tickets Helpdesk' },
                                        { key: 'view_crm', label: 'Agenda CRM (Contactos)' },
                                        { key: 'view_models', label: 'Router Multi-IA' },
                                        { key: 'view_campaigns', label: 'Campañas Masivas' },
                                        { key: 'view_flows', label: 'Flujos del Bot' },
                                        { key: 'view_settings', label: 'Configuración General' },
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

                            {/* 2. ALCANCE OPERATIVO */}
                            <div className="p-5 bg-white rounded-2xl border border-gray-200/80">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-amber-600" />
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                        2. Alcance Operativo & Acciones de Calendario / CRM
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { key: 'manage_calendar_webinar', label: 'Crear Webinars para Capacitar Asesores (Líderes de Equipo)' },
                                        { key: 'manage_calendar_meet', label: 'Crear Reuniones Google Meet con Inversores (Asesores)' },
                                        { key: 'manage_calendar_events', label: 'Crear, Modificar y Borrar Eventos de Calendario' },
                                        { key: 'manage_contacts', label: 'Crear, Modificar y Borrar Contactos (Agenda CRM)' },
                                        { key: 'manage_tickets', label: 'Modificar, Autorizar y Delegar Tickets Helpdesk' },
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
