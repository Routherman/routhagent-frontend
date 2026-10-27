"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themeOptions = {
  dark: { id: 'dark', hex: '#080C16', name: 'Oscuro', isDark: true },
  yellow: { id: 'yellow', hex: '#DBDF1F', name: 'Amarillo Lima', isDark: false },
  blue: { id: 'blue', hex: '#0B132B', name: 'Azul Noche', isDark: true },
  purple: { id: 'purple', hex: '#140D24', name: 'Púrpura Oscuro', isDark: true },
};

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState('dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme && themeOptions[savedTheme]) {
      setActiveTheme(savedTheme);
    }
  }, []);

  // Sync dark class on document.documentElement whenever activeTheme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isDark = activeTheme !== 'yellow';
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      }
    }
  }, [activeTheme]);

  const changeTheme = (themeId) => {
    if (themeOptions[themeId]) {
      setActiveTheme(themeId);
      localStorage.setItem('app_theme', themeId);
    }
  };

  const isDark = activeTheme !== 'yellow';

  return (
    <ThemeContext.Provider value={{ 
      activeTheme, 
      themeData: themeOptions[activeTheme] || themeOptions.dark,
      changeTheme,
      isDark,
      allThemes: Object.values(themeOptions)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
