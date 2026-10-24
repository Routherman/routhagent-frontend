'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('Error no controlado en Dashboard:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-gray-200/80 shadow-sm m-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-black text-gray-900 mb-2">
        Hubo un problema temporal al cargar esta sección
      </h2>
      <p className="text-sm text-gray-500 max-w-md mb-6 font-medium">
        {error?.message || 'Los datos de la sección se están sincronizando con el servidor. Puedes reintentar o regresar al inicio.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-black text-white hover:bg-gray-800 text-xs font-bold transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar Carga</span>
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold transition"
        >
          <Home className="w-4 h-4" />
          <span>Volver al Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
