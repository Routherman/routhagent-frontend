'use client';
import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function Equipo({ userData, privilegios }) {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'roles'
    
    // Role form state
    const [showRoleForm, setShowRoleForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleForm, setRoleForm] = useState({
        nombre: '',
        privilegios: {
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
            
            setUsuarios(usersData);
            setRoles(rolesData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRole = async (userId, rolId) => {
        try {
            await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/users/${userId}/role`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ rolId })
            });
            fetchData();
        } catch (error) {
            console.error("Error assigning role:", error);
        }
    };

    const handleSaveRole = async () => {
        try {
            if (editingRole) {
                await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/roles/${editingRole.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(roleForm)
                });
            } else {
                await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/roles`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(roleForm)
                });
            }
            setShowRoleForm(false);
            setEditingRole(null);
            setRoleForm({ nombre: '', privilegios: { can_manage_users: false, can_manage_roles: false, can_manage_social: false, can_edit_company: false, can_access_support_chats: true, can_access_sales_chats: true }});
            fetchData();
        } catch (error) {
            console.error("Error saving role:", error);
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!confirm('¿Estás seguro de eliminar este rol? Los usuarios con este rol pasarán a ser main.')) return;
        try {
            await fetch(`${API_URL}/empresas/${userData.codigo_empresa}/roles/${roleId}`, {
                method: 'DELETE',
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            fetchData();
        } catch (error) {
            console.error("Error deleting role:", error);
        }
    };

    const openRoleForm = (role = null) => {
        if (role) {
            setEditingRole(role);
            setRoleForm({
                nombre: role.nombre,
                privilegios: typeof role.privilegios === 'string' ? JSON.parse(role.privilegios) : role.privilegios
            });
        } else {
            setEditingRole(null);
            setRoleForm({
                nombre: '',
                privilegios: {
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

    if (loading) {
        return <div className="flex justify-center mt-20 text-gray-400">Cargando equipo...</div>;
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto mt-6 pb-12">
            
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Equipo y Roles</h2>
                            <p className="text-gray-500 text-sm mt-1">Gestiona los miembros de tu empresa y sus permisos.</p>
                        </div>
                    </div>
                    
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button 
                            onClick={() => setActiveTab('usuarios')} 
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'usuarios' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Usuarios
                        </button>
                        <button 
                            onClick={() => setActiveTab('roles')} 
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'roles' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Roles
                        </button>
                    </div>
                </div>

                {activeTab === 'usuarios' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Usuario</th>
                                    <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Email</th>
                                    <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Rol Asignado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => (
                                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-4 flex items-center gap-3">
                                            {u.image_url ? (
                                                <img src={u.image_url} alt={u.first_name} className="w-8 h-8 rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {u.first_name?.[0]}
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-900">{u.first_name} {u.last_name}</span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600">{u.email}</td>
                                        <td className="py-4 px-4">
                                            {/* Only allow changing if we have privileges, and don't allow changing one's own role (maybe) or if it's the master changing it */}
                                            <select 
                                                value={u.rol_id || ''} 
                                                onChange={(e) => handleAssignRole(u.id, e.target.value)}
                                                disabled={!privilegios?.can_manage_roles || u.id === userData.id}
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-black focus:border-black block w-full p-2.5 disabled:opacity-50"
                                            >
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.nombre}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'roles' && !showRoleForm && (
                    <div>
                        {privilegios?.can_manage_roles && (
                            <div className="flex justify-end mb-4">
                                <button onClick={() => openRoleForm()} className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                                    <Plus className="w-4 h-4" /> Crear Rol
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {roles.map(rol => (
                                <div key={rol.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-gray-50/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-gray-400" />
                                            <h3 className="font-bold text-gray-900 capitalize">{rol.nombre}</h3>
                                        </div>
                                        {privilegios?.can_manage_roles && (
                                            <div className="flex gap-2">
                                                <button onClick={() => openRoleForm(rol)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-lg border border-gray-200 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {!rol.is_system && (
                                                    <button onClick={() => handleDeleteRole(rol.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-lg border border-gray-200 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {/* Parse privileges for display */}
                                        {(() => {
                                            const privs = typeof rol.privilegios === 'string' ? JSON.parse(rol.privilegios) : rol.privilegios;
                                            const features = [
                                                { key: 'can_edit_company', label: 'Editar Empresa' },
                                                { key: 'can_manage_social', label: 'Cuentas Sociales' },
                                                { key: 'can_manage_users', label: 'Gestionar Usuarios' },
                                                { key: 'can_manage_roles', label: 'Gestionar Roles' },
                                                { key: 'can_access_support_chats', label: 'Chats de Soporte' },
                                                { key: 'can_access_sales_chats', label: 'Chats de Ventas' }
                                            ];
                                            return features.map(f => (
                                                <div key={f.key} className="flex items-center gap-2 text-xs text-gray-600">
                                                    {privs[f.key] ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-red-500" />}
                                                    <span>{f.label}</span>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'roles' && showRoleForm && (
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</h3>
                            <button onClick={() => setShowRoleForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Rol</label>
                                <input 
                                    type="text" 
                                    value={roleForm.nombre} 
                                    onChange={e => setRoleForm({...roleForm, nombre: e.target.value})}
                                    disabled={editingRole?.is_system}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none disabled:opacity-50"
                                    placeholder="Ej. Asesor de Ventas"
                                />
                                {editingRole?.is_system && <p className="text-xs text-gray-500 mt-1">El nombre de un rol de sistema no puede cambiarse.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-4">Privilegios</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: 'can_edit_company', label: 'Editar datos de la empresa' },
                                        { key: 'can_manage_social', label: 'Configurar cuentas sociales' },
                                        { key: 'can_manage_users', label: 'Gestionar usuarios del equipo' },
                                        { key: 'can_manage_roles', label: 'Gestionar roles y permisos' },
                                        { key: 'can_access_support_chats', label: 'Acceder a chats de Soporte Técnico' },
                                        { key: 'can_access_sales_chats', label: 'Acceder a chats de Ventas/Asesoría' }
                                    ].map(priv => (
                                        <label key={priv.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={roleForm.privilegios[priv.key] || false}
                                                onChange={e => setRoleForm({
                                                    ...roleForm, 
                                                    privilegios: {
                                                        ...roleForm.privilegios,
                                                        [priv.key]: e.target.checked
                                                    }
                                                })}
                                                className="w-4 h-4 text-black focus:ring-black rounded border-gray-300"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{priv.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button onClick={handleSaveRole} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                                    {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
