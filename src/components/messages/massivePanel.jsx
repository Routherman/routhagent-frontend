"use client";

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';
import { toast } from 'sonner';

const steps = [
  { id: 1, name: "Contactos" },
  { id: 2, name: "Mensaje" },
  { id: 3, name: "Parámetros" },
  { id: 4, name: "Revisión" }
];

export default function MassivePanel({ contacts = [], onCancel, codigoEmpresa, onCampaignStarted }) {
  const [currentStep, setCurrentStep] = useState(1);

  // States for Step 1
  const [allContacts, setAllContacts] = useState(contacts);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [manualNumbers, setManualNumbers] = useState("");
  const [importing, setImporting] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);

  // States for Step 2
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [useContactName, setUseContactName] = useState(true);

  // States for Step 3
  const [campaignName, setCampaignName] = useState('');
  const [messagesPerMinute, setMessagesPerMinute] = useState(10);
  
  // Loading state for submission
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setAllContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    if (currentStep === 2 && templates.length === 0) {
      fetchTemplates();
    }
  }, [currentStep]);

  const fetchTemplates = async () => {
    if (!codigoEmpresa) return;
    setLoadingTemplates(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/templates`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
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

  const selectAll = () => {
    if (selectedContacts.length === allContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(allContacts.map(c => c.id));
    }
  };

  const handleImportManual = async () => {
    if (!manualNumbers.trim()) return;
    const nums = manualNumbers.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    setImporting(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/import-contacts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ numbers: nums })
      });
      const data = await res.json();
      if (data.success && data.importedIds) {
        setSelectedContacts(prev => [...new Set([...prev, ...data.importedIds])]);
        toast.success(`🎉 ${data.importedIds.length} números importados y seleccionados con éxito.`);
        setManualNumbers("");
      }
    } catch (err) {
      toast.error('Error importando números');
    } finally {
      setImporting(false);
    }
  };

  // Carga de Excel / CSV procesada con IA
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !codigoEmpresa) return;

    setUploadingExcel(true);
    setAiAnalysisResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/upload-contacts-excel`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData
      });
      const data = await res.json();

      if (data.success && data.contacts) {
        setAiAnalysisResult({
          mapping: data.mappingDetected,
          total: data.totalRows,
          valid: data.validCount,
          invalid: data.invalidCount
        });

        // Formatear para la lista local
        const newFormatted = data.contacts.map(c => ({
          id: c.id,
          name: c.nombre,
          telefono: c.telefono,
          email: c.email
        }));

        // Actualizar lista de contactos
        setAllContacts(prev => {
          const map = new Map();
          [...newFormatted, ...prev].forEach(item => map.set(item.id, item));
          return Array.from(map.values());
        });

        // Marcar todos los importados como seleccionados
        setSelectedContacts(prev => [...new Set([...prev, ...newFormatted.map(c => c.id)])]);
        toast.success(`✅ ${newFormatted.length} contactos procesados correctamente desde Excel.`);
      } else {
        toast.error(data.error || 'Error al procesar el archivo Excel.');
      }
    } catch (err) {
      console.error('Error subiendo archivo:', err);
      toast.error('Error de conexión al subir el archivo Excel.');
    } finally {
      setUploadingExcel(false);
      e.target.value = "";
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1 && selectedContacts.length === 0) {
      toast.warning('Debes seleccionar o cargar al menos un contacto antes de continuar.');
      return;
    }
    if (currentStep === 2 && !selectedTemplate) {
      toast.warning('Debes seleccionar una plantilla.');
      return;
    }
    if (currentStep === 3 && !campaignName.trim()) {
      toast.warning('Debes asignarle un nombre a la campaña.');
      return;
    }
    if (currentStep < 4) setCurrentStep(c => c + 1);
  };

  const startCampaign = async () => {
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/massive`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          contactIds: selectedContacts,
          templateName: selectedTemplate.name,
          languageCode: selectedTemplate.language,
          campaignName,
          messagesPerMinute,
          useContactName
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('🚀 ¡Campaña iniciada con éxito! Los mensajes se están enviando dosificados en segundo plano.', {
          duration: 5000
        });
        if (onCampaignStarted) onCampaignStarted();
        onCancel();
      } else {
        toast.error(data.error || 'Error al iniciar campaña');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión con el servidor.');
    } finally {
      setSending(false);
    }
  };

  const templateHasVariables = selectedTemplate?.components?.some(
    c => c.type === 'BODY' && /\{\{\d+\}\}/.test(c.text)
  );

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    const hasVars = tpl?.components?.some(
      c => c.type === 'BODY' && /\{\{\d+\}\}/.test(c.text)
    );
    setUseContactName(Boolean(hasVars));
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#eae8e1] dark:bg-[#080d1a] relative rounded-[32px] overflow-hidden text-gray-800 dark:text-slate-100 font-sans p-6 transition-colors">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="w-10 h-10 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600 dark:text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Envío Masivo</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Campañas con IA y dosificación anti-bloqueo</p>
          </div>
        </div>

        {/* Pill Tabs */}
        <div className="hidden md:flex bg-white/70 dark:bg-slate-900/90 backdrop-blur-md rounded-full p-1 shadow-sm gap-1 border border-transparent dark:border-white/10">
          {steps.map(step => (
            <button
              key={step.id}
              onClick={() => {
                if (step.id < currentStep) setCurrentStep(step.id);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                currentStep === step.id 
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-gray-900 dark:text-white font-bold' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
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
              <div className="mb-4 flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Destinatarios de la Campaña</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Sube tu Excel o selecciona de tus contactos guardados.</p>
                </div>
                {allContacts.length > 0 && (
                  <button 
                    onClick={selectAll} 
                    className="text-xs font-semibold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 border border-transparent dark:border-white/10"
                  >
                    {selectedContacts.length === allContacts.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                )}
              </div>

              {/* Banner de resultado de IA si se subió Excel */}
              {aiAnalysisResult && (
                <div className="mb-6 bg-white dark:bg-[#0e1628] border border-[#c6f432] p-4 rounded-[20px] shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#c6f432] flex items-center justify-center shrink-0 text-black font-bold text-sm">
                    ✨
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Excel analizado con IA con éxito ({aiAnalysisResult.mapping?.detectedBy || 'Groq'})
                    </p>
                    <p className="text-gray-600 dark:text-slate-300 text-xs mt-0.5">
                      Columnas detectadas: <strong>Teléfono</strong> ({aiAnalysisResult.mapping?.telefono})
                      {aiAnalysisResult.mapping?.nombre ? `, Nombre (${aiAnalysisResult.mapping?.nombre})` : ''}
                      {aiAnalysisResult.mapping?.email ? `, Email (${aiAnalysisResult.mapping?.email})` : ''}.
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">
                      ✅ {aiAnalysisResult.valid} contactos válidos importados y normalizados. 
                      {aiAnalysisResult.invalid > 0 && ` (${aiAnalysisResult.invalid} filas ignoradas por formato incorrecto).`}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Contact Selection Card */}
                <div className="md:col-span-2 bg-white dark:bg-[#0e1628] rounded-[24px] p-6 shadow-sm border border-transparent dark:border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Contactos Disponibles</h4>
                    <span className="text-xs font-medium bg-black dark:bg-[#c6f432] text-white dark:text-black font-bold px-2.5 py-1 rounded-full">
                      {selectedContacts.length} seleccionados
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2">
                    {allContacts.map(c => (
                      <label key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedContacts.includes(c.id)}
                          onChange={() => toggleContact(c.id)}
                          className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black accent-[#c6f432] cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-bold text-gray-700 dark:text-slate-200 text-sm">
                          {(c.name || c.nombre || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{c.name || c.nombre}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-400">
                            <span>{c.telefono}</span>
                            {c.email && <span className="truncate">· {c.email}</span>}
                          </div>
                        </div>
                      </label>
                    ))}
                    {allContacts.length === 0 && (
                      <div className="text-center py-10 text-gray-400 dark:text-slate-500">
                        <p className="text-sm font-medium">Aún no hay contactos cargados.</p>
                        <p className="text-xs mt-1">Sube un Excel a la derecha para importar tu lista.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Import Actions Card */}
                <div className="space-y-4">
                  {/* Excel Upload with AI Card */}
                  <div className="bg-white dark:bg-[#0e1628] rounded-[24px] p-6 shadow-sm border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-black dark:hover:border-white/30 transition-all">
                    <div className="w-10 h-10 bg-black dark:bg-[#c6f432] text-white dark:text-black rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Cargar Excel / CSV</h4>
                      <span className="text-[10px] bg-[#c6f432] text-black font-bold px-1.5 py-0.5 rounded-md">IA</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-4">
                      Sube tu archivo (.xlsx, .xls, .csv). La IA detectará automáticamente nombres, teléfonos y correos.
                    </p>
                    
                    <label className={`w-full ${uploadingExcel ? 'bg-gray-200 dark:bg-slate-800' : 'bg-black hover:bg-gray-800 dark:bg-[#c6f432] dark:hover:bg-[#b5e02c] text-[#c6f432] dark:text-black'} rounded-xl py-3 text-sm font-semibold flex items-center justify-center cursor-pointer transition-all text-center shadow-sm`}>
                      {uploadingExcel ? (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                          <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Analizando con IA...</span>
                        </div>
                      ) : (
                        <span>Seleccionar Archivo Excel</span>
                      )}
                      <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv, .txt" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        disabled={uploadingExcel} 
                      />
                    </label>
                  </div>

                  {/* Manual entry card */}
                  <div className="bg-white dark:bg-[#0e1628] rounded-[24px] p-6 shadow-sm border border-transparent dark:border-white/10">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Ingreso manual rápido</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-2">Pega teléfonos separados por comas o saltos de línea:</p>
                    <textarea 
                      className="w-full text-xs border border-gray-200 dark:border-white/10 dark:bg-slate-900 dark:text-white rounded-xl p-3 focus:ring-1 focus:ring-black dark:focus:ring-[#c6f432] focus:border-black mb-2" 
                      rows="3" 
                      placeholder="Ej: 1123456789, 5491198765432"
                      value={manualNumbers}
                      onChange={(e) => setManualNumbers(e.target.value)}
                    ></textarea>
                    <button 
                      onClick={handleImportManual}
                      disabled={importing || !manualNumbers.trim()}
                      className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl py-2 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      {importing ? 'Normalizando...' : 'Agregar a la lista'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Mensaje (Plantillas Meta) */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Selecciona una Plantilla Aprobada</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Elige la plantilla oficial de WhatsApp para este envío.</p>
              </div>

              {loadingTemplates ? (
                <div className="text-center py-12 bg-white dark:bg-[#0e1628] rounded-[24px] border border-transparent dark:border-white/10">
                  <div className="w-8 h-8 border-4 border-black dark:border-[#c6f432] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Cargando plantillas de Meta WhatsApp...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#0e1628] rounded-[24px] border border-transparent dark:border-white/10">
                  <p className="text-gray-600 dark:text-slate-300 font-medium">No se encontraron plantillas aprobadas en tu Business Account.</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Crea y aprueba una plantilla en el Administrador de WhatsApp de Meta para usarla aquí.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((tpl) => {
                    const hasVars = tpl.components?.some(c => c.type === 'BODY' && /\{\{\d+\}\}/.test(c.text));
                    const isSelected = selectedTemplate?.id === tpl.id;
                    return (
                      <button 
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`p-6 rounded-[24px] text-left transition-all border-2 ${
                          isSelected 
                            ? 'bg-white dark:bg-[#131f38] border-black dark:border-[#c6f432] ring-2 ring-black/10 dark:ring-[#c6f432]/30 shadow-lg scale-[1.01]' 
                            : 'bg-white/80 dark:bg-[#0e1628] border-transparent dark:border-white/10 hover:bg-white dark:hover:bg-[#131c30] shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white">{tpl.name}</h4>
                          <div className="flex gap-1.5 items-center">
                            {hasVars && (
                              <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30">
                                {"{{1}}"} Dinámico
                              </span>
                            )}
                            <span className="text-[10px] bg-green-100 dark:bg-emerald-500/20 text-green-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase border border-green-200 dark:border-emerald-500/30">
                              {tpl.language}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 dark:text-slate-200 line-clamp-3 bg-gray-50 dark:bg-[#090e1c] p-3 rounded-xl border border-gray-100 dark:border-white/10 font-mono">
                          {tpl.components?.find(c => c.type === 'BODY')?.text || 'Sin texto'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Personalización con Variables */}
              {selectedTemplate && (
                <div className={`p-5 rounded-[24px] shadow-sm flex items-center justify-between border transition-all ${
                  templateHasVariables 
                    ? 'bg-white dark:bg-[#0e1628] border-gray-200 dark:border-white/10' 
                    : 'bg-gray-50 dark:bg-[#0e1628]/60 border-gray-200 dark:border-white/10 opacity-90'
                }`}>
                  <div className="pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">Personalizar con Nombre del Contacto</p>
                      {templateHasVariables ? (
                        <span className="text-[10px] bg-[#c6f432] text-black font-bold px-2 py-0.5 rounded-md">
                          Admite Variables
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded-md">
                          Plantilla fija (sin variables)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {templateHasVariables 
                        ? 'Se sustituirá automáticamente el parámetro {{1}} con el nombre del cliente extraído por la IA.' 
                        : 'Esta plantilla no contiene {{1}} en Meta. Se enviará de forma segura con el texto estándar predefinido.'}
                    </p>
                  </div>
                  <label className={`relative inline-flex items-center ${templateHasVariables ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'} shrink-0`}>
                    <input 
                      type="checkbox" 
                      checked={useContactName && templateHasVariables} 
                      disabled={!templateHasVariables}
                      onChange={(e) => setUseContactName(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-[#c6f432]"></div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Parámetros */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Parámetros de la Campaña</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Controla el nombre y la velocidad para proteger tu línea contra baneos.</p>
              </div>

              <div className="space-y-6 max-w-xl mx-auto">
                <div className="bg-white dark:bg-[#0e1628] rounded-[24px] p-6 shadow-sm border border-transparent dark:border-white/10">
                  <label className="block font-semibold text-gray-900 dark:text-white mb-2">Nombre de la Campaña</label>
                  <input 
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ej. Promoción 100 Clientes Octubre"
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl p-4 text-sm focus:outline-none focus:border-black dark:focus:border-[#c6f432] focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="bg-white dark:bg-[#0e1628] rounded-[24px] p-6 shadow-sm border border-transparent dark:border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-gray-900 dark:text-white">Velocidad de Envío (Anti-Bloqueo)</label>
                    <span className="font-bold text-base bg-[#c6f432] text-black px-2.5 py-0.5 rounded-lg">
                      {messagesPerMinute} msjs / min
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                    La cola espaciará los envíos automáticamente para simular un comportamiento humano y seguro.
                  </p>
                  <input 
                    type="range"
                    min="2"
                    max="60"
                    value={messagesPerMinute}
                    onChange={(e) => setMessagesPerMinute(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mb-2 accent-black dark:accent-[#c6f432]"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 dark:text-slate-400 font-medium">
                    <span>2/min (Ultraseguro)</span>
                    <span>10-20/min (Recomendado)</span>
                    <span>60/min (Rápido)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Revisión y Envío */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resumen de la Campaña</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Verifica la configuración antes de encolar los envíos.</p>
              </div>

              <div className="bg-white dark:bg-[#0e1628] rounded-[28px] p-8 shadow-sm border border-transparent dark:border-white/10">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{campaignName}</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Destinatarios</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{selectedContacts.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Velocidad</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{messagesPerMinute} msj/min</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Tiempo Estimado</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ~{Math.max(1, Math.ceil(selectedContacts.length / messagesPerMinute))} min
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900/60 rounded-2xl p-5 mb-8 border border-gray-100 dark:border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Plantilla Meta</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white">
                      Personalización: {useContactName ? 'Activada (Nombre)' : 'Desactivada'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white font-bold mb-1">
                    {selectedTemplate ? `${selectedTemplate.name} (${selectedTemplate.language})` : "Ninguna seleccionada"}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-slate-200 font-mono bg-white dark:bg-[#090e1c] p-3 rounded-xl border border-gray-100 dark:border-white/10">
                    {selectedTemplate?.components?.find(c => c.type === 'BODY')?.text || ''}
                  </p>
                </div>

                <button 
                  onClick={startCampaign}
                  disabled={sending}
                  className="w-full bg-black hover:bg-gray-800 dark:bg-[#c6f432] dark:hover:bg-[#b5e02c] text-[#c6f432] dark:text-black font-extrabold text-lg py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {sending ? 'Encolando envíos...' : `Iniciar Campaña (${selectedContacts.length} mensajes)`}
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      {/* Footer Navigation Buttons */}
      <div className="mt-4 flex justify-between items-center max-w-4xl mx-auto w-full pt-4 border-t border-gray-200/50 dark:border-white/10">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-transparent dark:border-white/10"
        >
          Atrás
        </button>
        
        {currentStep < 4 ? (
          <button 
            onClick={goToNextStep}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-[#c6f432] shadow-sm hover:bg-[#b0d92b] transition-all"
          >
            Siguiente Paso
          </button>
        ) : (
          <div className="w-[100px]"></div>
        )}
      </div>

    </div>
  );
}
