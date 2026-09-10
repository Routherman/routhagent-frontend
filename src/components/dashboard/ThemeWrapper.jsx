"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeWrapper({ children }) {
    const { themeData } = useTheme();

    // Determine if the text in the Sidebar/Navigation should be dark or light 
    // based on the background color. (Using a simple check since we know our colors)
    const isLightBg = themeData.id === 'yellow';

    return (
        <div 
            className="h-screen w-full flex p-2 md:p-3 font-sans overflow-hidden transition-colors duration-500 ease-in-out"
            style={{ 
                backgroundColor: themeData.hex,
                color: isLightBg ? '#1a1c1e' : '#ffffff' 
            }}
        >
            {/* The CSS variable will help child components like Sidebar easily inherit text colors if needed */}
            <div className={`flex w-full h-full ${isLightBg ? 'theme-light' : 'theme-dark'}`}>
                {children}
            </div>
        </div>
    );
}
