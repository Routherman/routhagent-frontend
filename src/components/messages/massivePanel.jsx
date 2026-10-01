"use client";

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:8080/api';

const steps = [
  { id: 1, name: "Contactos" },
  { id: 2, name: "Mensaje" },
  { id: 3, name: "Parámetros" },
  { id: 4, name: "Revisión" }
];

export default function MassivePanel({ contacts = [], onCancel, codigoEmpresa, onCampaignStarted }) {
  const [currentStep, setCurrentStep] = useState(1);

  // States for Step 1
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [manualNumbers, setManualNumbers] = useState("");
  const [importing, setImporting] = useState(false);

  // States for Step 2
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // States for Step 3
  const [campaignName, setCampaignName] = useState('');
  const [messagesPerMinute, setMessagesPerMinute] = useState(10);
  
  // Loading state for submission
  const [sending, setSending] = useState(false);

  useEffect(() => {
      if (currentStep === 2 && templates.length === 0) {
          fetchTemplates();
      }
  }, [currentStep]);

  const fetchTemplates = async () => {
      if (!codigoEmpresa) return;
      setLoadingTemplates(true);
      try {
          const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/templates`);
          const data = await res.json();
          if (Array.isArray(data)) {
              // Filtrar solo las aprobadas
              setTemplates(data.filter(t => t.status === 'APPROVED'));
          }
      } catch(err) {
          console.error(err);
      } finally {
          setLoadingTemplates(false);
      }
  };

  const toggleContact = (id) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleImportManual = async () => {
      if (!manualNumbers.trim()) return;
      const nums = manualNumbers.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
      await importNumbers(nums);
      setManualNumbers("");
  };

  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
          const text = evt.target.result;
          const nums = text.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
          await importNumbers(nums);
      };
      reader.readAsText(file);
      e.target.value = "";
  };

  const importNumbers = async (nums) => {
      if (!codigoEmpresa || nums.length === 0) return;
      setImporting(true);
      try {
          const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/import-contacts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ numbers: nums })
          });
          const data = await res.json();
          if (data.success && data.importedIds) {
              setSelectedContacts(prev => [...new Set([...prev, ...data.importedIds])]);
              alert(`${data.importedIds.length} contactos importados/seleccionados con éxito.`);
          }
      } catch (err) {
          console.error(err);
          alert('Error al importar contactos');
      } finally {
          setImporting(false);
      }
  };

  const goToNextStep = () => {
      if (currentStep === 1 && selectedContacts.length === 0) {
          alert('Debes seleccionar o cargar contactos antes de continuar.');
          return;
      }
      if (currentStep === 2 && !selectedTemplate) {
          alert('Debes seleccionar una plantilla.');
          return;
      }
      if (currentStep === 3 && !campaignName.trim()) {
          alert('Debes asignarle un nombre a la campaña.');
          return;
      }
      if (currentStep < 4) setCurrentStep(c => c + 1);
  };

  const startCampaign = async () => {
      setSending(true);
      try {
          const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/massive`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  contactIds: selectedContacts,
                  templateName: selectedTemplate.name,
                  languageCode: selectedTemplate.language,
                  campaignName,
                  messagesPerMinute
              })
          });
          const data = await res.json();
          if (data.success) {
              alert('Campaña iniciada con éxito!');
              if (onCampaignStarted) onCampaignStarted();
              onCancel(); // Close panel
          } else {
              alert(data.error || 'Error al iniciar campaña');
          }
      } catch (err) {
          console.error(err);
          alert('Error de conexión');
      } finally {
          setSending(false);
      }
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
              onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                currentStep === step.id 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900'
              } ${step.id > currentStep ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={step.id > currentStep}
            >
              {step.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          
          {/* STEP 1: Contactos */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-4">
                <h3 className="text-xl font-bold">¿A quién le enviamos el mensaje?</h3>
                <p className="text-gray-500 text-sm">Selecciona o importa los destinatarios de tu campaña.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Contact Selection Card */}
                <div className="md:col-span-2 bg-white rounded-[24px] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">Contactos Activos</h4>
                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-lg">{selectedContacts.length} seleccionados</span>
                  </div>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                    {contacts.map(c => (
                      <label key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedContacts.includes(c.id)}
                          onChange={() => toggleContact(c.id)}
                          className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                        />
                        <img src={c.avatar || `https://ui-avatars.com/api/?name=${c.name}`} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.telefono}</p>
                        </div>
                      </label>
                    ))}
                    {contacts.length === 0 && <p className="text-gray-400 text-sm py-4 text-center">No hay contactos disponibles.</p>}
                  </div>
                </div>

                {/* Import Actions Card */}
                <div className="space-y-4">
                  <div className="bg-white rounded-[24px] p-6 shadow-sm">
                    <div className="w-10 h-10 bg-[#c6f432] rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900">Agregar manualmente</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-3">Ingresa números separados por coma o salto de línea.</p>
                    <textarea 
                       className="w-full text-sm border-gray-200 rounded-lg p-2 focus:ring-black focus:border-black mb-2" 
                       rows="3" 
                       placeholder="Ej: 549112345678, 549119876543"
                       value={manualNumbers}
                       onChange={(e) => setManualNumbers(e.target.value)}
                    ></textarea>
                    <button 
                       onClick={handleImportManual}
                       disabled={importing || !manualNumbers.trim()}
                       className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
                    >
                       {importing ? 'Importando...' : 'Importar Números'}
                    </button>
                  </div>

                  <div className="bg-white rounded-[24px] p-6 shadow-sm">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900">Cargar Excel / CSV</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-3">Sube un archivo .csv o .txt con una columna de números.</p>
                    <label className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg py-2 text-sm font-medium flex items-center justify-center cursor-pointer transition-colors text-center">
                       {importing ? 'Importando...' : 'Seleccionar Archivo'}
                       <input type="file" accept=".csv, .txt" className="hidden" onChange={handleFileUpload} disabled={importing} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Mensaje (Plantillas Meta) */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-4">
                <h3 className="text-xl font-bold">Selecciona una Plantilla</h3>
                <p className="text-gray-500 text-sm">Elige una plantilla aprobada por Meta WhatsApp.</p>
              </div>

              {loadingTemplates ? (
                  <p className="text-center py-10 text-gray-500">Cargando plantillas de Meta...</p>
              ) : templates.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 bg-white rounded-xl">No tienes plantillas aprobadas disponibles en tu cuenta de WhatsApp.</p>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {templates.map((tpl) => (
                      <button 
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl)}
                        className={`p-6 rounded-[24px] text-left transition-all border-2 ${selectedTemplate?.id === tpl.id ? 'bg-white border-black shadow-md' : 'bg-white/50 border-transparent hover:bg-white'}`}
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{tpl.name} <span className="text-xs font-normal text-gray-400">({tpl.language})</span></h4>
                        <div className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {tpl.components.find(c => c.type === 'BODY')?.text || 'Sin cuerpo de texto'}
                        </div>
                      </button>
                    ))}
                  </div>
              )}
            </div>
          )}

          {/* STEP 3: Parámetros */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-4">
                <h3 className="text-xl font-bold">Parámetros</h3>
                <p className="text-gray-500 text-sm">Configura la velocidad y detalles de la campaña.</p>
              </div>

              <div className="space-y-6 max-w-xl mx-auto">
                <div className="bg-white rounded-[24px] p-6 shadow-sm">
                  <label className="block font-semibold text-gray-900 mb-2">Nombre de la campaña</label>
                  <input 
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ej. Promoción Verano 2024"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="bg-white rounded-[24px] p-6 shadow-sm">
                  <label className="block font-semibold text-gray-900 mb-2">Mensajes por minuto</label>
                  <p className="text-xs text-gray-500 mb-4">Ajusta la velocidad para evitar bloqueos por parte de Meta.</p>
                  <input 
                    type="range"
                    min="1"
                    max="60"
                    value={messagesPerMinute}
                    onChange={(e) => setMessagesPerMinute(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2 accent-black"
                  />
                  <div className="text-center font-bold text-lg">{messagesPerMinute} msj/min</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Revisión y Envío */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-4">
                <h3 className="text-xl font-bold">Resumen de Campaña</h3>
                <p className="text-gray-500 text-sm">Verifica los datos antes de lanzar el envío masivo.</p>
              </div>

              <div className="bg-white rounded-[24px] p-8 shadow-sm">
                <h3 className="text-2xl font-bold mb-6">{campaignName}</h3>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Destinatarios</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedContacts.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Velocidad</p>
                    <p className="text-xl font-medium text-gray-900">{messagesPerMinute} msj/min</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-8">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Plantilla Seleccionada</p>
                  <p className="text-sm text-gray-700 font-medium">
                    {selectedTemplate ? `${selectedTemplate.name} (${selectedTemplate.language})` : "Ninguna seleccionada"}
                  </p>
                  <div className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {selectedTemplate?.components.find(c => c.type === 'BODY')?.text || ''}
                  </div>
                </div>

                <button 
                  onClick={startCampaign}
                  disabled={sending}
                  className="w-full bg-black text-[#c6f432] font-semibold text-lg py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {sending ? 'Iniciando...' : 'Iniciar Envío Masivo'}
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
            onClick={goToNextStep}
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
