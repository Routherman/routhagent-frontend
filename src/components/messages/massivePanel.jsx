"use client";

import React, { useState } from 'react';

const steps = [
  { id: 1, name: "Datos de envío" },
  { id: 2, name: "Mensaje" },
  { id: 3, name: "Configuración" },
  { id: 4, name: "Iniciar envío" }
];

export default function MassivePanel({ contacts = [], onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);

  // States for Step 1
  const [selectedContacts, setSelectedContacts] = useState([]);

  // States for Step 2
  const [messageType, setMessageType] = useState(''); // 'meta', 'own', 'custom'
  const [customMessage, setCustomMessage] = useState('');

  // States for Step 3
  const [onReply, setOnReply] = useState('');
  const [onNoReply, setOnNoReply] = useState('');

  const toggleContact = (id) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#eae8e1] relative rounded-[32px] overflow-hidden text-gray-800 font-sans p-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold tracking-tight">Envío Masivo</h2>
        </div>

        {/* Pill Tabs */}
        <div className="hidden md:flex bg-white/50 backdrop-blur-md rounded-full p-1 shadow-sm gap-1">
          {steps.map(step => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                currentStep === step.id 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {step.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* STEP 1: Datos de Envío */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-4">
                <h3 className="text-xl font-bold">¿A quién le enviamos el mensaje?</h3>
                <p className="text-gray-500 text-sm">Selecciona los destinatarios de tu campaña.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Contact Selection Card */}
                <div className="md:col-span-2 bg-white rounded-[24px] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">Contactos Activos</h4>
                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-lg">{selectedContacts.length} seleccionados</span>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {contacts.map(c => (
                      <label key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedContacts.includes(c.id)}
                          onChange={() => toggleContact(c.id)}
                          className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                        />
                        <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-gray-400">Último mensaje: {c.time}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Other Actions Card */}
                <div className="space-y-4">
                  <button className="w-full bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all text-left group">
                    <div className="w-12 h-12 bg-[#c6f432] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900">Agregar manualmente</h4>
                    <p className="text-xs text-gray-500 mt-1">Ingresa números de teléfono de forma manual.</p>
                  </button>

                  <button className="w-full bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all text-left group">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900">Cargar un Excel</h4>
                    <p className="text-xs text-gray-500 mt-1">La IA extraerá los números automáticamente.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Mensaje */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-4">
                <h3 className="text-xl font-bold">¿Qué le enviamos?</h3>
                <p className="text-gray-500 text-sm">Configura el contenido de tu mensaje masivo.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button 
                  onClick={() => setMessageType('meta')}
                  className={`p-6 rounded-[24px] text-left transition-all border-2 ${messageType === 'meta' ? 'bg-white border-black shadow-md' : 'bg-white/50 border-transparent hover:bg-white'}`}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Plantillas Meta Suits</h4>
                  <p className="text-xs text-gray-500">Usa plantillas oficiales pre-aprobadas.</p>
                </button>
                <button 
                  onClick={() => setMessageType('own')}
                  className={`p-6 rounded-[24px] text-left transition-all border-2 ${messageType === 'own' ? 'bg-white border-black shadow-md' : 'bg-white/50 border-transparent hover:bg-white'}`}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Plantillas Propias</h4>
                  <p className="text-xs text-gray-500">Usa tus plantillas guardadas en el sistema.</p>
                </button>
                <button 
                  onClick={() => setMessageType('custom')}
                  className={`p-6 rounded-[24px] text-left transition-all border-2 ${messageType === 'custom' ? 'bg-white border-black shadow-md' : 'bg-white/50 border-transparent hover:bg-white'}`}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Personalizado</h4>
                  <p className="text-xs text-gray-500">Redacta un nuevo mensaje ahora mismo.</p>
                </button>
              </div>

              {messageType === 'custom' && (
                <div className="bg-white rounded-[24px] p-6 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                  <textarea 
                    rows="6"
                    placeholder="Escribe tu mensaje aquí... Puedes usar variables como {{nombre}}"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                  ></textarea>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Configuración */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-4">
                <h3 className="text-xl font-bold">Automatizaciones</h3>
                <p className="text-gray-500 text-sm">Define el comportamiento tras el envío.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-[24px] p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#c6f432] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>
                    </span>
                    ¿Qué hacer en caso de respuesta?
                  </h4>
                  <select 
                    value={onReply}
                    onChange={(e) => setOnReply(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="">Selecciona una acción...</option>
                    <option value="bot">Asignar a Chatbot</option>
                    <option value="agent">Asignar a Agente Humano</option>
                    <option value="tag">Etiquetar contacto</option>
                  </select>
                </div>

                <div className="bg-white rounded-[24px] p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-500"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" /></svg>
                    </span>
                    ¿Qué hacer en caso de NO respuesta?
                  </h4>
                  <select 
                    value={onNoReply}
                    onChange={(e) => setOnNoReply(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="">Selecciona una acción...</option>
                    <option value="wait_24h">Enviar recordatorio en 24h</option>
                    <option value="archive">Archivar chat</option>
                    <option value="nothing">No hacer nada</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Preview y Envío */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-4">
                <h3 className="text-xl font-bold">Resumen de Envío</h3>
                <p className="text-gray-500 text-sm">Verifica los datos antes de lanzar la campaña.</p>
              </div>

              <div className="bg-white rounded-[24px] p-8 shadow-sm">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Destinatarios</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedContacts.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Tipo de Mensaje</p>
                    <p className="text-lg font-medium text-gray-900">
                      {messageType === 'meta' ? 'Plantilla Meta Suits' : messageType === 'own' ? 'Plantilla Propia' : messageType === 'custom' ? 'Personalizado' : 'Sin seleccionar'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-8">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Vista previa del mensaje</p>
                  <p className="text-sm text-gray-700 italic">
                    {messageType === 'custom' && customMessage ? `"${customMessage}"` : "El mensaje se generará basado en la plantilla seleccionada."}
                  </p>
                </div>

                <button 
                  onClick={() => alert('¡Envío masivo iniciado!')}
                  className="w-full bg-black text-[#c6f432] font-semibold text-lg py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Iniciar Envío Masivo
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      {/* Footer Navigation Buttons */}
      <div className="mt-6 flex justify-between items-center max-w-4xl mx-auto w-full pt-4 border-t border-gray-200/50">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-600 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Atrás
        </button>
        
        {currentStep < 4 ? (
          <button 
            onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
            className="px-6 py-2.5 rounded-full text-sm font-medium text-black bg-[#c6f432] shadow-sm hover:bg-[#b0d92b] transition-all"
          >
            Siguiente Paso
          </button>
        ) : (
          <div className="w-[100px]"></div> // Spacer for alignment
        )}
      </div>

    </div>
  );
}
