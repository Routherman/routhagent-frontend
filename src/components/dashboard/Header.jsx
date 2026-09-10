"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';

export default function Header() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between pt-8 pb-4 px-8 relative">
      <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Routh Agent</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-[10px] right-[10px] w-1.5 h-1.5 bg-[#ff4a4a] rounded-full"></span>
        </button>

        {/* Profile Custom Dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 rounded-full pl-1.5 pr-4 py-1.5 cursor-pointer transition-colors"
          >
            {user ? (
              <>
                <img
                  src={user.imageUrl}
                  alt={user.firstName || 'Usuario'}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-[13px] font-semibold text-gray-700">
                  {user.firstName || 'Usuario'}
                </span>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </>
            )}
            
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5} 
              stroke="currentColor" 
              className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
              <Link 
                href="/dashboard/user" 
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Configuraciones
              </Link>
              <button 
                onClick={() => signOut({ redirectUrl: '/' })}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
