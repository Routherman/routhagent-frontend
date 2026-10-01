"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:8080/api';

// Global variable to persist known handoffs across Sidebar remounts during navigation
let globalHandoffs = new Set();

export default function Sidebar() {
  const pathname = usePathname();
  const { themeData } = useTheme();
  const { user, isLoaded } = useUser();
  const [hasHandoffs, setHasHandoffs] = useState(false);

  // if background is yellow (light), icons should be darker.
  const isLightBg = themeData?.id === 'yellow';

  const defaultIconColor = isLightBg ? 'text-gray-600' : 'text-white/70';
  const hoverIconColor = isLightBg ? 'hover:text-gray-900' : 'hover:text-white';
  const activeBg = isLightBg ? 'bg-black/10' : 'bg-white/20';
  const activeText = isLightBg ? 'text-gray-900' : 'text-white';

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
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

    // 1. Get enterprise code
    fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(userData => {
        const codigoEmpresa = userData.codigo_empresa;
        if (codigoEmpresa) {
          // 2. Poll contacts
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
                    toast.error('Ingresa a la bandeja de chats, se desactivo la IA en un chat. Revisalo', {
                      duration: 8000,
                    });
                  }
                } else {
                  // Si se vuelve a activar, lo removemos para alertar si vuelve a caer
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

  return (
    <aside className="w-20 md:w-24 flex flex-col items-center justify-between py-6 transition-colors duration-500">
      <div className="flex flex-col items-center gap-8 w-full">
        {/* Logo */}
        <div className="w-12 h-12 bg-[#f4ebd0] rounded-xl flex items-center justify-center cursor-pointer shadow-sm">
          <img src="/icono.svg" alt="icono" className='rounded-xl' />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4 w-full px-4">
          <Link
            href="/dashboard"
            className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors ${pathname === '/dashboard'
              ? `${activeBg} ${activeText}`
              : `${defaultIconColor} ${hoverIconColor}`
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </Link>

          <Link
            href="/dashboard/messages"
            className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors relative ${pathname === '/dashboard/messages'
              ? `${activeBg} ${activeText}`
              : `${defaultIconColor} ${hoverIconColor}`
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
            {hasHandoffs && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a1a1c] shadow-sm animate-pulse"></span>
            )}
          </Link>

          <Link
            href="/dashboard/campaigns"
            className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors ${pathname === '/dashboard/campaigns'
              ? `${activeBg} ${activeText}`
              : `${defaultIconColor} ${hoverIconColor}`
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </Link>

          <Link
            href="/dashboard/automation"
            className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors ${pathname === '/dashboard/automation'
              ? `${activeBg} ${activeText}`
              : `${defaultIconColor} ${hoverIconColor}`
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </Link>

          <Link
            href="/dashboard/flows"
            className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors ${pathname === '/dashboard/flows' || pathname.startsWith('/dashboard/flows/')
              ? `${activeBg} ${activeText}`
              : `${defaultIconColor} ${hoverIconColor}`
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
          </Link>

          <Link
            href="/dashboard/user"
            className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors ${pathname === '/dashboard/user'
              ? `${activeBg} ${activeText}`
              : `${defaultIconColor} ${hoverIconColor}`
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <button className={`w-12 h-12 flex items-center justify-center transition-colors ${defaultIconColor} ${hoverIconColor}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      </button>
    </aside>
  );
}
