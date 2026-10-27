"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function Panel({ children }) {
  const { isDark } = useTheme();

  return (
    <main className={`flex-1 rounded-[32px] overflow-hidden flex flex-col h-full shadow-sm relative transition-colors duration-200 border ${
      isDark 
        ? 'bg-[#070b14] text-slate-100 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' 
        : 'bg-white text-slate-900 border-gray-100'
    }`}>
      {children}
    </main>
  );
}
