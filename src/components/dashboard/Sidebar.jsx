"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { 
  LayoutGrid, 
  MessageSquare, 
  Ticket, 
  Users, 
  Cpu, 
  BarChart3, 
  Zap, 
  GitFork, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Mail,
  Calendar
} from 'lucide-react';
import { API_URL } from '@/config/api';

// Global variable to persist known handoffs across Sidebar remounts during navigation
let globalHandoffs = new Set();

export default function Sidebar() {
  const pathname = usePathname();
  const { themeData } = useTheme();
  const { user, isLoaded } = useUser();
  const [hasHandoffs, setHasHandoffs] = useState(false);
  const [empresaCode, setEmpresaCode] = useState('');

  const [userRole, setUserRole] = useState('master');
  const [userPrivs, setUserPrivs] = useState(null);

  // if background is yellow (light), icons should be darker.
  const isLightBg = themeData?.id === 'yellow';

  const defaultColor = isLightBg ? 'text-gray-600' : 'text-white/70';
  const hoverColor = isLightBg ? 'hover:text-gray-950 hover:bg-black/5' : 'hover:text-white hover:bg-white/10';
  const activeBg = isLightBg ? 'bg-black/10' : 'bg-white/15 backdrop-blur-md shadow-sm';
  const activeColor = isLightBg ? 'text-gray-950 font-bold' : 'text-white font-bold';

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio API error", e);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;

    let intervalId;

    fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(userData => {
        const codigoEmpresa = userData.codigo_empresa;
        if (userData.rol_nombre) setUserRole(userData.rol_nombre.toLowerCase());
        let privs = userData.rol_privilegios;
        if (typeof privs === 'string') {
          try { privs = JSON.parse(privs); } catch(e) {}
        }
        if (privs) setUserPrivs(privs);

        if (codigoEmpresa) {
          setEmpresaCode(codigoEmpresa);
          const pollContacts = async () => {
            try {
              const res = await fetch(`${API_URL}/contacts/${codigoEmpresa}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
              const data = await res.json();

              let currentHandoffs = 0;
              data.forEach(c => {
                if (c.estado_bot === 'HANDOFF') {
                  currentHandoffs++;
                  if (!globalHandoffs.has(c.id)) {
                    globalHandoffs.add(c.id);
                    playAlertSound();
                    toast.error('Atención: se desactivó la IA en un chat. Requiere intervención humana.', {
                      duration: 8000,
                    });
                  }
                } else {
                  if (globalHandoffs.has(c.id)) {
                    globalHandoffs.delete(c.id);
                  }
                }
              });

              setHasHandoffs(currentHandoffs > 0);
            } catch (err) {
              console.error(err);
            }
          };

          pollContacts();
          intervalId = setInterval(pollContacts, 3000);
        }
      })
      .catch(err => console.error(err));

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoaded, user]);

  const rawNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, exact: true, permission: 'view_dashboard' },
    { label: 'Mensajes', href: '/dashboard/messages', icon: MessageSquare, badge: hasHandoffs, permission: 'view_messages' },
    { label: 'Inbox Gmail', href: '/dashboard/inbox', icon: Mail, permission: 'view_inbox' },
    { label: 'Calendario & Meet', href: '/dashboard/calendar', icon: Calendar, permission: 'view_calendar' },
    { label: 'Tickets Helpdesk', href: '/dashboard/tickets', icon: Ticket, permission: 'view_tickets' },
    { label: 'Agenda CRM', href: '/dashboard/crm', icon: Users, permission: 'view_crm' },
    { label: 'Equipo & Roles', href: '/dashboard/roles', icon: ShieldCheck, permission: 'view_roles' },
    { label: 'Router Multi-IA', href: '/dashboard/models', icon: Cpu, permission: 'view_models' },
    { label: 'Campañas', href: '/dashboard/campaigns', icon: BarChart3, permission: 'view_campaigns' },
    { label: 'Automatización', href: '/dashboard/automation', icon: Zap, permission: 'view_flows' },
    { label: 'Flujos Bot', href: '/dashboard/flows', icon: GitFork, permission: 'view_flows' },
    { label: 'Configuración', href: '/dashboard/user', icon: Settings, permission: 'view_settings' },
  ];

  // Master, Main, Admin y creadores de empresa ven todo. Otros roles ven según privilegios explícitos.
  const isSuperAdmin = !userRole || ['master', 'main', 'admin', 'gerencia', 'director'].includes(userRole);
  const navItems = rawNavItems.filter(item => {
    if (isSuperAdmin) return true;
    if (!userPrivs) return true;
    return userPrivs[item.permission] !== false;
  });

  return (
    <aside 
      className="group w-20 hover:w-64 flex flex-col justify-between py-6 px-3.5 transition-all duration-300 ease-in-out shrink-0 select-none z-30"
      style={{ willChange: 'width' }}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3.5 px-1 overflow-hidden">
          <div className="w-11 h-11 min-w-[44px] bg-[#f4ebd0] rounded-2xl flex items-center justify-center shadow-md cursor-pointer transition-transform group-hover:scale-105">
            <img src="/icono.svg" alt="Routh Logo" className="w-7 h-7 rounded-lg object-contain" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <h1 className="text-sm font-extrabold tracking-wider uppercase text-white font-mono">
              ROUTH AGENT
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-semibold tracking-wide">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{empresaCode ? `Empresa: ${empresaCode}` : 'Colaboratium'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center h-11 px-3 rounded-2xl transition-all duration-200 group/item ${
                  isActive 
                    ? `${activeBg} ${activeColor}` 
                    : `${defaultColor} ${hoverColor}`
                }`}
                title={item.label}
              >
                {/* Active indicator bar on left */}
                {isActive && (
                  <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                )}

                {/* Icon wrapper */}
                <div className="w-5 h-5 min-w-[20px] flex items-center justify-center relative">
                  <Icon className="w-5 h-5 transition-transform group-hover/item:scale-110" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-black animate-pulse shadow-sm" />
                  )}
                </div>

                {/* Label displayed on sidebar hover */}
                <span className="ml-3.5 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0 overflow-hidden">
                  {item.label}
                </span>

                {/* Active Arrow indicator when expanded */}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity duration-200" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="flex flex-col gap-2 pt-4 border-t border-white/10 w-full">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl overflow-hidden">
            <div className="w-7 h-7 min-w-[28px] rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 text-slate-900 font-black text-xs flex items-center justify-center shadow">
              {(user.firstName?.[0] || user.primaryEmailAddress?.emailAddress?.[0] || 'U').toUpperCase()}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden text-left">
              <p className="text-xs font-bold text-white truncate max-w-[140px]">
                {user.fullName || user.primaryEmailAddress?.emailAddress?.split('@')[0]}
              </p>
              <p className="text-[10px] text-white/50 truncate max-w-[140px]">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        )}

        <SignOutButton>
          <button 
            className={`flex items-center h-10 px-3 rounded-2xl w-full transition-all duration-200 ${defaultColor} hover:text-rose-400 hover:bg-rose-500/10`}
            title="Cerrar Sesión"
          >
            <div className="w-5 h-5 min-w-[20px] flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="ml-3.5 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0 overflow-hidden">
              Cerrar Sesión
            </span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
