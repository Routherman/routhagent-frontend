"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Panel from "@/components/dashboard/Panel";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:8080/api';

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [team, setTeam] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchData = async () => {
            try {
                // 1. Get user and enterprise code
                const userRes = await fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                const userData = await userRes.json();
                const codigoEmpresa = userData.codigo_empresa;

                if (!codigoEmpresa) {
                    setError('No tienes una empresa asignada.');
                    setLoading(false);
                    return;
                }

                // 2. Get contacts
                const contactsRes = await fetch(`${API_URL}/contacts/${codigoEmpresa}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                const contactsData = await contactsRes.json();
                setContacts(contactsData);

                // 3. Get team members
                const teamRes = await fetch(`${API_URL}/empresas/${codigoEmpresa}/usuarios`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                const teamData = await teamRes.json();
                setTeam(teamData);

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError('Error al cargar la información.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Option: we could set an interval here if we want live updates, but home can be relatively static.
    }, [isLoaded, user]);

    const handoffChats = contacts.filter(c => c.estado_bot === 'HANDOFF');

    return (
        <>
            <Sidebar />
            <Panel>
                <Header />
                <div className="px-8 pb-8 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="flex h-full items-center justify-center text-red-500">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            
                            {/* Stats Card: Total Chats */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="text-gray-500 font-medium text-sm mb-1">Total de Chats</h3>
                                    <div className="text-4xl font-bold text-gray-800">{contacts.length}</div>
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                    </svg>
                                    <span>Base de clientes</span>
                                </div>
                            </div>

                            {/* Attention Required Card (Handoffs) */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                                        Chats requieren atención ({handoffChats.length})
                                    </h3>
                                    <Link href="/dashboard/messages" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        Ver bandeja →
                                    </Link>
                                </div>
                                <div className="flex-1 overflow-y-auto max-h-40 pr-2">
                                    {handoffChats.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                            Todo en orden, la IA está gestionando todo.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {handoffChats.map(c => (
                                                <Link href="/dashboard/messages" key={c.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <img src={`https://ui-avatars.com/api/?name=${c.nombre || 'Desconocido'}&background=random`} alt="avatar" className="w-10 h-10 rounded-full" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">{c.nombre || c.telefono}</p>
                                                            <p className="text-xs text-red-500">Esperando agente humano</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium">
                                                        {new Date(c.creado_en).toLocaleDateString()}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Team Card */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-3 hover:shadow-md transition-shadow">
                                <h3 className="text-gray-800 font-bold text-lg mb-4">Tu Equipo</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {team.map(member => (
                                        <div key={member.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group">
                                            <img src={member.image_url || `https://ui-avatars.com/api/?name=${member.first_name || 'U'}&background=random`} alt="avatar" className="w-12 h-12 rounded-full shadow-sm" />
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                            </div>
                                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </Panel>
        </>
    );
}