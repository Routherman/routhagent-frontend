"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from "@/components/dashboard/Sidebar";
import Panel from "@/components/dashboard/Panel";
import Header from "@/components/dashboard/Header";
import Equipo from "@/components/user/equipo";
import { API_URL } from '@/config/api';

export default function RolesPage() {
    const { user, isLoaded } = useUser();
    const [userData, setUserData] = useState(null);
    const [privilegios, setPrivilegios] = useState(null);

    useEffect(() => {
        if (isLoaded && user) {
            fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
                .then(res => res.json())
                .then(data => {
                    setUserData(data);
                    if (data && data.rol_privilegios) {
                        try {
                            const p = typeof data.rol_privilegios === 'string' ? JSON.parse(data.rol_privilegios) : data.rol_privilegios;
                            setPrivilegios(p);
                        } catch(e) {}
                    }
                })
                .catch(console.error);
        }
    }, [isLoaded, user]);

    return (
        <>
            <Sidebar />
            <Panel>
                <Header />
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <Equipo userData={userData} privilegios={privilegios} />
                </div>
            </Panel>
        </>
    );
}
