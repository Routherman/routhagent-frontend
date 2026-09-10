import React from 'react';

export default function Library() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-medium text-gray-800 mb-2">Biblioteca de Respuestas</h2>
        <p className="text-gray-500 mb-6">Administra tus respuestas guardadas, plantillas y archivos multimedia.</p>
        
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <p className="text-gray-400 font-medium">Próximamente...</p>
        </div>
      </div>
    </div>
  );
}
