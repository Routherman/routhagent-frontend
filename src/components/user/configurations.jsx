"use client";
import React, { useState } from 'react';
import { UserProfile } from '@clerk/nextjs';
import { Palette, Bell, ShieldUser, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Configurations() {
  const { activeTheme, allThemes, changeTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto mt-6 pb-12">
      
      {/* Apariencia */}
      <div className="bg-white dark:bg-[#0c1222] rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Apariencia</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Personaliza el tema, contraste y colores del sistema.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {allThemes.map((color) => (
            <button
              key={color.id}
              onClick={() => changeTheme(color.id)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                activeTheme === color.id 
                  ? 'border-gray-900 dark:border-sky-400 shadow-lg bg-black/5 dark:bg-sky-500/10' 
                  : 'border-gray-100 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/50 dark:bg-white/[0.02]'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-full mb-3 shadow-inner border border-white/20 flex items-center justify-center"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs font-bold text-gray-800 dark:text-white text-center">{color.name}</span>
              {activeTheme === color.id && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-gray-900 dark:bg-sky-500 rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-white dark:bg-[#0c1222] rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Notificaciones</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Decide qué alertas deseas recibir en tu cuenta.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900/40">
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">Correos electrónicos</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Recibe resúmenes de mensajes no leídos.</p>
            </div>
            <button 
              onClick={() => toggleNotification('email')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications.email ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900/40">
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">Notificaciones Push</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Alertas en tiempo real en tu navegador.</p>
            </div>
            <button 
              onClick={() => toggleNotification('push')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.push ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications.push ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900/40">
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">Actualizaciones de producto</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Nuevas funciones y mejoras del agente.</p>
            </div>
            <button 
              onClick={() => toggleNotification('updates')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.updates ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications.updates ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Configuraciones de cuenta: Clerk */}
      <div className="bg-white dark:bg-[#0c1222] rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <ShieldUser className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Seguridad y Cuenta</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Gestiona tu contraseña, correos y dispositivos conectados.</p>
          </div>
        </div>

        {/* Clerk UserProfile component embedded */}
        <div className="w-full overflow-hidden flex justify-center [&_.cl-rootBox]:w-full [&_.cl-card]:w-full [&_.cl-card]:shadow-none [&_.cl-card]:border [&_.cl-card]:border-gray-100 dark:[&_.cl-card]:border-white/10 [&_.cl-card]:rounded-2xl">
          <UserProfile routing="hash" />
        </div>
      </div>

    </div>
  );
}
