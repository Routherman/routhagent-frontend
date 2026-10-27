"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import FloatingCopilot from './FloatingCopilot';

export default function ThemeWrapper({ children }) {
    const { activeTheme, themeData, isDark } = useTheme();
    const isLightBg = activeTheme === 'yellow';

    return (
        <div 
            className={`h-screen w-full flex p-2 md:p-3 font-sans overflow-hidden transition-colors duration-300 ease-in-out relative ${isDark ? 'dark bg-[#060911]' : 'bg-[#DBDF1F]'}`}
            style={{ 
                backgroundColor: themeData?.hex || (isDark ? '#060911' : '#DBDF1F'),
                color: isLightBg ? '#1a1c1e' : '#f8fafc' 
            }}
        >
            {/* The CSS classes ensure child components easily inherit text and dark styles */}
            <div className={`flex w-full h-full ${isLightBg ? 'theme-light' : 'theme-dark dark'}`}>
                {children}
            </div>

            {/* Copiloto Flotante Inteligente presente en todas las secciones */}
            <FloatingCopilot />
        </div>
    );
}
