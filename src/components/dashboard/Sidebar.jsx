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
  Calendar,
  FolderOpen,
  ChevronDown,
  Layers,
  Building2,
  ExternalLink
} from 'lucide-react';
import { API_URL } from '@/config/api';

// Global variable to persist known handoffs across Sidebar remounts during navigation
let globalHandoffs = new Set();

export default function Sidebar() {
  const rawPath = usePathname();
  const pathname = rawPath || "";
  const { themeData } = useTheme();
  const { user, isLoaded } = useUser();
  const [hasHandoffs, setHasHandoffs] = useState(false);
  const [empresaCode, setEmpresaCode] = useState('');

  const [userRole, setUserRole] = useState('master');
  const [userPrivs, setUserPrivs] = useState(null);
  const [chatsAttentionCount, setChatsAttentionCount] = useState(0);
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);

  // if background is light, icons should be darker.
  const isLightBg = themeData?.isDark === false;

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
          const pollStatus = async () => {
            try {
              // 1. Polling de contactos y handoffs (solo los que tienen mensajes)
              const res = await fetch(`${API_URL}/contacts/${codigoEmpresa}?onlyWithMessages=true`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
              const data = await res.json();

              let currentHandoffs = 0;
              let attentionCount = 0;
              if (Array.isArray(data)) {
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

                  // Solo mostrar los que están en pendiente o de atención humana (HANDOFF)
                  if (c.estado_bot === 'HANDOFF' || c.estado_resolucion === 'PENDIENTE') {
                    attentionCount++;
                  }
                });
                setChatsAttentionCount(attentionCount);
              }

              setHasHandoffs(currentHandoffs > 0);

              // 2. Polling de tickets pendientes
              const roleParam = (userData.rol_nombre ? `&role=${encodeURIComponent(userData.rol_nombre)}&user_id=${userData.id}` : '') + `&clerkId=${user.id}`;
              const tRes = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets?status=open,pending_auth${roleParam}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
              const tData = await tRes.json();
              if (tData.success && Array.isArray(tData.tickets)) {
                setPendingTicketsCount(tData.tickets.length);
              }
            } catch (err) {
              console.warn("Sidebar pollStatus:", err.message || err);
            }
          };

          pollStatus();
          intervalId = setInterval(pollStatus, 3500);
        }
      })
      .catch(err => console.warn("Sidebar fetch user:", err.message || err));

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoaded, user]);

  // Sub-items que van en la sección colapsable solicitada:
  // {equipo y roles + router multi ia + biblioteca de medios + automatizacion + flujos}
  const rawOpsItems = [
    { label: 'Equipo & Roles', href: '/dashboard/roles', icon: ShieldCheck, permission: 'view_roles' },
    { label: 'Router Multi-IA', href: '/dashboard/models', icon: Cpu, permission: 'view_models' },
    { label: 'Biblioteca de Medios', href: '/dashboard/campaigns?tab=media', icon: FolderOpen, permission: 'view_campaigns' },
    { label: 'Automatización', href: '/dashboard/automation', icon: Zap, permission: 'view_flows' },
    { label: 'Flujos Bot', href: '/dashboard/flows', icon: GitFork, permission: 'view_flows' },
  ];

  const rawMainItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, exact: true, permission: 'view_dashboard' },
    { label: 'Mensajes', href: '/dashboard/messages', icon: MessageSquare, count: chatsAttentionCount, badge: hasHandoffs, permission: 'view_messages' },
    { label: 'Inbox Gmail', href: '/dashboard/inbox', icon: Mail, permission: 'view_inbox' },
    { label: 'Calendario & Meet', href: '/dashboard/calendar', icon: Calendar, permission: 'view_calendar' },
    { label: 'Tickets Helpdesk', href: '/dashboard/tickets', icon: Ticket, count: pendingTicketsCount, permission: 'view_tickets' },
    { label: 'Agenda CRM', href: '/dashboard/crm', icon: Users, permission: 'view_crm' },
    { label: 'Campañas (Meta & Mail)', href: '/dashboard/campaigns', icon: BarChart3, permission: 'view_campaigns' },
    { label: 'Prospectos B2B', href: '/dashboard/prospectos-b2b', icon: Building2, target: '_blank', badgeText: 'B2B', permission: 'view_crm' },
  ];

  const rawConfigItem = { label: 'Configuración', href: '/dashboard/user', icon: Settings, permission: 'view_settings' };

  // Detectar si alguna ruta interna del grupo colapsable está activa
  const isOpsActive = [
    '/dashboard/roles',
    '/dashboard/models',
    '/dashboard/automation',
    '/dashboard/flows'
  ].some(route => pathname.startsWith(route)) || (pathname.startsWith('/dashboard/campaigns') && pathname.includes('tab=media'));

  const [isOpsOpen, setIsOpsOpen] = useState(isOpsActive);

  useEffect(() => {
    if (isOpsActive) {
      setIsOpsOpen(true);
    }
  }, [isOpsActive]);

  // Master, Main, Admin y creadores de empresa ven todo. Otros roles ven según privilegios explícitos.
  const isSuperAdmin = !userRole || ['master', 'main', 'admin', 'gerencia', 'director'].includes(userRole);
  
  const filterPerm = (item) => {
    if (isSuperAdmin) return true;
    if (!userPrivs) return true;
    return userPrivs[item.permission] !== false;
  };

  const mainNavItems = rawMainItems.filter(filterPerm);
  const opsNavItems = rawOpsItems.filter(filterPerm);
  const showConfig = filterPerm(rawConfigItem);

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
            <h1 className={`text-sm font-extrabold tracking-wider uppercase font-mono ${isLightBg ? 'text-gray-900' : 'text-white'}`}>
              ROUTH AGENT
            </h1>
            <div className={`flex items-center gap-1.5 text-[10px] font-semibold tracking-wide ${isLightBg ? 'text-amber-800' : 'text-amber-300'}`}>
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>{empresaCode ? `Empresa: ${empresaCode}` : 'Colaboratium'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 w-full">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.target || undefined}
                rel={item.target ? "noopener noreferrer" : undefined}
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
                  {item.count > 0 ? (
                    <span className="absolute -top-1.5 -right-2 min-w-[17px] h-4 px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-black/40 shadow-md animate-pulse">
                      {item.count > 99 ? '99+' : item.count}
                    </span>
                  ) : item.badge ? (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-black animate-pulse shadow-sm" />
                  ) : null}
                </div>

                {/* Label displayed on sidebar hover */}
                <span className="ml-3.5 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0 overflow-hidden flex items-center gap-2 w-full">
                  <span>{item.label}</span>
                  {item.badgeText && (
                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md flex items-center gap-1 shadow-sm">
                      <span>{item.badgeText}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {item.count > 0 && (
                    <span className="ml-auto px-1.5 py-0.2 text-[10px] font-black bg-red-600 text-white rounded-full shadow-sm">
                      {item.count}
                    </span>
                  )}
                </span>

                {/* Active Arrow indicator when expanded */}
                {isActive && !item.count && !item.badgeText && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity duration-200" />
                )}
              </Link>
            );
          })}

          {/* Sección Agrupada y Desplegable: Sistema & Flujos */}
          {opsNavItems.length > 0 && (
            <div className="flex flex-col mt-1">
              <button
                type="button"
                onClick={() => setIsOpsOpen(!isOpsOpen)}
                className={`relative flex items-center h-11 px-3 rounded-2xl transition-all duration-200 group/item w-full text-left ${
                  isOpsActive && !isOpsOpen 
                    ? `${activeBg} ${activeColor}` 
                    : `${defaultColor} ${hoverColor}`
                }`}
                title="Sistema & Flujos"
              >
                {isOpsActive && (
                  <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                )}

                <div className="w-5 h-5 min-w-[20px] flex items-center justify-center relative">
                  <Layers className="w-5 h-5 transition-transform group-hover/item:scale-110 text-amber-400/90" />
                </div>

                <span className="ml-3.5 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0 overflow-hidden flex items-center justify-between w-full">
                  <span className="font-bold tracking-tight">Sistema & Flujos</span>
                  {isOpsOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 transition-transform duration-200" />
                  )}
                </span>
              </button>

              {/* Submenú desplegable con indentación y estilo elegante */}
              {isOpsOpen && (
                <div className="flex flex-col gap-1 pl-2.5 my-1 border-l-2 border-amber-500/20 ml-5 transition-all duration-200">
                  {opsNavItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = subItem.href.includes('?') 
                      ? (pathname + (typeof window !== 'undefined' ? window.location.search : '')).includes(subItem.href.split('/dashboard/')[1] || '')
                      : pathname === subItem.href || pathname.startsWith(subItem.href + '/');

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`relative flex items-center h-9 px-2.5 rounded-xl transition-all duration-200 group/sub ${
                          isSubActive
                            ? `${activeBg} ${activeColor}`
                            : `${defaultColor} ${hoverColor}`
                        }`}
                        title={subItem.label}
                      >
                        <div className="w-4 h-4 min-w-[16px] flex items-center justify-center">
                          <SubIcon className="w-4 h-4 transition-transform group-hover/sub:scale-110" />
                        </div>
                        <span className="ml-2.5 text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 overflow-hidden">
                          {subItem.label}
                        </span>
                        {isSubActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-auto opacity-0 group-hover:opacity-100" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Configuración */}
          {showConfig && (
            <Link
              href={rawConfigItem.href}
              className={`relative flex items-center h-11 px-3 rounded-2xl transition-all duration-200 group/item mt-1 ${
                pathname === rawConfigItem.href 
                  ? `${activeBg} ${activeColor}` 
                  : `${defaultColor} ${hoverColor}`
              }`}
              title={rawConfigItem.label}
            >
              {pathname === rawConfigItem.href && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
              <div className="w-5 h-5 min-w-[20px] flex items-center justify-center relative">
                <Settings className="w-5 h-5 transition-transform group-hover/item:scale-110" />
              </div>
              <span className="ml-3.5 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0 overflow-hidden flex items-center gap-2 w-full">
                <span>{rawConfigItem.label}</span>
              </span>
            </Link>
          )}
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
