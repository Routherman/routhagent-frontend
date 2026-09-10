"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themeOptions = {
  yellow: { id: 'yellow', hex: '#DBDF1F', name: 'Amarillo Lima' },
  dark: { id: 'dark', hex: '#1a1c1e', name: 'Oscuro' },
  blue: { id: 'blue', hex: '#3B82F6', name: 'Azul' },
  purple: { id: 'purple', hex: '#8B5CF6', name: 'Púrpura' },
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

  const changeTheme = (themeId) => {
    if (themeOptions[themeId]) {
      setActiveTheme(themeId);
      localStorage.setItem('app_theme', themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      activeTheme, 
      themeData: themeOptions[activeTheme],
      changeTheme,
      allThemes: Object.values(themeOptions)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
