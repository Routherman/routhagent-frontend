"use client";
import React, { useState } from 'react';
import { Settings, Share2, Search, X } from 'lucide-react';
import Configurations from './configurations';
import SocialAccounts from './social_accounts';

export default function UserPanel() {
    const [activeTab, setActiveTab] = useState('config'); // 'config' | 'social'

    const tabs = [
        { id: 'config', label: 'Configuraciones', icon: Settings },
        { id: 'social', label: 'Cuentas Sociales', icon: Share2 },
    ];

    return (
        <div className="w-full h-full bg-[#EAE8E3] flex flex-col relative font-sans">

            {/* Top Header Area */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
                {/* Left side: Back/Close button + Title */}
                <div className="flex items-center gap-4">

                    <h1 className="text-3xl font-medium text-gray-800 tracking-tight">Usuario</h1>
                </div>

                {/* Right side: Dynamic Navigation Pills */}
                <div className="flex bg-white/50 backdrop-blur-md rounded-full p-1.5 shadow-sm items-center gap-1">
                    {/* Dynamic tabs */}
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                    ? 'bg-white shadow-sm text-gray-800'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
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
            </div>

        </div>
    );
}
