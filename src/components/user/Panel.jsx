"use client";
import React, { useState, useEffect } from 'react';
import { Settings, Share2, Search, X, Building, Users } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Configurations from './configurations';
import SocialAccounts from './social_accounts';
import Empresa from './empresa';
import Equipo from './equipo'; // We will create this
import { API_URL } from '@/config/api';

export default function UserPanel() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('config'); // 'config' | 'social' | 'empresa' | 'equipo'
    const [userData, setUserData] = useState(null);
    const [privilegios, setPrivilegios] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab && ['config', 'social', 'empresa', 'equipo'].includes(tab)) {
                setActiveTab(tab);
            }
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        const fetchUserData = async () => {
            try {
                const res = await fetch(`${API_URL}/users/me/${user.id}`, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                const data = await res.json();
                setUserData(data);
                
                let privs = {};
                if (data && data.rol_privilegios) {
                    try {
                        privs = typeof data.rol_privilegios === 'string' ? JSON.parse(data.rol_privilegios) : data.rol_privilegios;
                    } catch (e) {
                        console.error("Error parsing privileges", e);
                    }
                }
                setPrivilegios(privs);
            } catch (err) {
                console.error("Error fetching user data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    const allTabs = [
        { id: 'config', label: 'Configuraciones', icon: Settings },
        { id: 'social', label: 'Cuentas Sociales', icon: Share2, requiredPrivilege: 'can_manage_social' },
        { id: 'empresa', label: 'Empresa', icon: Building },
        { id: 'equipo', label: 'Equipo y Roles', icon: Users, requiredPrivilege: 'can_manage_users' }
    ];

    const isSuperAdmin = !userData?.rol_nombre || ['master', 'main', 'admin', 'gerencia', 'director'].includes((userData?.rol_nombre || '').toLowerCase());

    const tabs = allTabs.filter(tab => {
        if (isSuperAdmin) return true;
        if (!tab.requiredPrivilege) return true;
        if (!privilegios) return false;
        return privilegios[tab.requiredPrivilege] === true;
    });

    if (loading) {
        return <div className="w-full h-full bg-[#EAE8E3] flex items-center justify-center text-gray-500">Cargando...</div>;
    }

    return (
        <div className="w-full h-full bg-[#EAE8E3] dark:bg-[#070b14] flex flex-col relative font-sans text-gray-800 dark:text-white transition-colors">
            {/* Top Header Area */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Usuario</h1>
                </div>

                <div className="flex bg-white/50 dark:bg-slate-900/90 backdrop-blur-md rounded-full p-1.5 shadow-sm items-center gap-1 border border-transparent dark:border-white/10">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                    ? 'bg-white dark:bg-slate-800 shadow-sm text-gray-800 dark:text-white font-bold'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {activeTab === 'config' && <Configurations />}
                {activeTab === 'social' && <SocialAccounts />}
                {activeTab === 'empresa' && <Empresa privilegios={privilegios} />}
                {activeTab === 'equipo' && <Equipo userData={userData} privilegios={privilegios} />}
            </div>
        </div>
    );
}
