import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '@/config/api';

export default function Chat({ messages = [], contact, onHeaderClick, onSendMessage, onToggleBot }) {
  const [inputValue, setInputValue] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSendMessage(inputValue);
        setInputValue('');
      }
    }
  };

  // Determine if within 24h window
  let isWithin24Hours = false;
  let remainingTimeStr = '';
  
  if (messages.length > 0) {
    // Find last incoming message
    const lastIncoming = [...messages].reverse().find(m => !m.isMine);
    if (lastIncoming && lastIncoming.timestamp) {
      const lastIncomingTime = new Date(lastIncoming.timestamp).getTime();
      const now = Date.now();
      const diffMs = now - lastIncomingTime;
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (diffMs < hours24) {
        isWithin24Hours = true;
        const remainingMs = hours24 - diffMs;
        const rHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const rMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        remainingTimeStr = `Ventana de 24h abierta (quedan ${rHours}h ${rMins}m)`;
      }
    }
  }

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateSent, setTemplateSent] = useState(false);

  // Reset templateSent when contact changes or when the 24h window opens again (client replied)
  useEffect(() => {
    setTemplateSent(false);
  }, [contact?.id]);

  useEffect(() => {
    if (isWithin24Hours) {
      setTemplateSent(false);
    }
  }, [isWithin24Hours]);

  const handleOpenTemplates = async () => {
    setShowTemplateModal(true);
    setLoadingTemplates(true);
    setTemplateError('');
    setSelectedTemplate(null);
    try {
        const res = await fetch(`${API_URL}/templates`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const data = await res.json();
        if (data.error) {
            setTemplateError(data.error);
        } else {
            setTemplates(data);
        }
    } catch (err) {
        setTemplateError('No se pudo conectar con el servidor.');
    } finally {
        setLoadingTemplates(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] border-l border-r border-gray-100 min-w-0 relative">
      {/* Chat Header */}
      <div 
        className="h-[76px] min-h-[76px] flex items-center justify-between px-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onHeaderClick}
      >
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-[15px] text-gray-900">{contact?.name || 'Desconocido'} ({contact?.telefono || ''})</h2>
            {contact?.categoria && contact?.categoria !== 'general' && (
              <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {contact.categoria}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {contact?.estado_bot === 'ACTIVO' ? (
               <span className="w-1.5 h-1.5 bg-[#4cd964] rounded-full"></span>
            ) : (
               <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            )}
            <span className="text-[12px] text-gray-500">{contact?.estado_bot === 'ACTIVO' ? 'IA Respondiendo' : 'Pausado (Modo Humano)'}</span>
            {isWithin24Hours && (
              <span className="ml-2 text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                {remainingTimeStr}
              </span>
            )}
            {!isWithin24Hours && messages.length > 0 && (
              <span className="ml-2 text-[11px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                Fuera de la ventana de 24h
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
           {/* Botón para activar/desactivar la IA */}
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleBot(contact); }}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${contact?.estado_bot === 'ACTIVO' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
           >
             {contact?.estado_bot === 'ACTIVO' ? 'Desactivar IA' : 'Activar IA'}
           </button>
           
           <button className="hover:text-gray-800 transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
           </button>
           <button className="hover:text-gray-800 transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
           </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex flex-col gap-5">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col max-w-[80%] ${m.isMine ? 'self-end items-end' : 'self-start items-start'}`}>
              
              {/* Message Bubble */}
              <div className={`p-4 rounded-[20px] ${m.isMine ? 'bg-[#c2dce0] text-gray-800 rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm text-gray-600 rounded-tl-sm'}`}>
                
                {m.image && (
                  <div className="flex flex-col items-center">
                    {m.image.url ? (
                        <img src={m.image.url} alt="Adjunto" className="w-full h-auto max-h-[300px] object-cover rounded-xl mb-2" />
                    ) : (
                        <div className="w-full min-w-[200px] h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm font-semibold mb-2">
                           📷 Descargando imagen...
                        </div>
                    )}
                    {m.text && <p className="text-[14px] leading-relaxed w-full">{m.text}</p>}
                  </div>
                )}

                {m.file && (
                  <a href={m.file.url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white p-3 rounded-xl mb-1 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-[#e8f5e9] rounded-lg flex items-center justify-center text-[#4caf50] text-[10px] font-bold tracking-wider">DOC</div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-800">{m.file.name || 'Documento adjunto'}</p>
                      {m.text ? <p className="text-[12px] text-gray-500 mt-0.5">{m.text}</p> : <p className="text-[11px] text-[#4caf50] font-semibold mt-0.5">Click para abrir</p>}
                    </div>
                  </a>
                )}
                
                {m.audio && (
                  <div className="flex flex-col gap-2 min-w-[240px]">
                    {m.audio.url ? (
                        <audio controls src={m.audio.url} className="w-full h-10" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">Descargando audio...</span>
                        </div>
                    )}
                  </div>
                )}
                
                {!m.file && !m.audio && !m.image && (
                  <p className="text-[14px] leading-relaxed">{m.text}</p>
                )}
              </div>
              
              {/* Message Time/Status */}
              <span className="text-[11px] font-medium text-gray-400 mt-1.5 px-1 flex items-center gap-1">
                {m.status === 'Read' && <span className="italic">{m.status}</span>}
                {m.status === 'Delivered' && <span className="italic">{m.status}</span>}
                {!m.status && m.isMine && <span className="italic">Sent</span>}
                {m.time}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      {isWithin24Hours || messages.length === 0 ? (
        <div className="p-4 mx-6 mb-6 bg-white border border-gray-200 rounded-[20px] shadow-sm flex flex-col gap-3">
           <input 
              type="text" 
              placeholder="Enter to send, Shift + Enter to add new line" 
              className="w-full outline-none text-[14px] text-gray-700 bg-transparent placeholder-gray-300"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
           />
           <div className="flex justify-between items-center text-gray-400 pt-3 border-t border-gray-50 mt-1">
              <div className="flex gap-4 items-center">
                <span className="font-serif font-bold text-[15px] cursor-pointer hover:text-gray-600 transition-colors">B</span>
                <span className="font-serif italic text-[15px] cursor-pointer hover:text-gray-600 transition-colors">I</span>
                <span className="font-serif underline text-[15px] cursor-pointer hover:text-gray-600 transition-colors">U</span>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <svg className="w-[18px] h-[18px] cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                <svg className="w-[18px] h-[18px] cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </div>
              <div className="flex gap-4 items-center">
                <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
           </div>
        </div>
      ) : (
        <div className="p-4 mx-6 mb-6">
          {templateSent ? (
            <div className="w-full py-5 px-6 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-sm">Plantilla enviada</span>
              </div>
              <p className="text-gray-500 text-xs">Esperando respuesta del cliente para reabrir la conversación.</p>
            </div>
          ) : (
            <button 
              onClick={handleOpenTemplates}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Iniciar conversación devuelta (Usar Plantilla)
            </button>
          )}
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          {/* Header del modal */}
          <div className="h-[76px] min-h-[76px] flex items-center justify-between px-6 border-b border-gray-100 bg-white">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Seleccionar Plantilla de Meta</h3>
              <p className="text-gray-500 text-xs mt-0.5">Debes seleccionar una plantilla aprobada para reabrir la ventana.</p>
            </div>
            <button 
              onClick={() => setShowTemplateModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-6 bg-[#f8f9fa]">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl flex items-start gap-3 shadow-sm shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-yellow-800 text-sm">ATENCIÓN</p>
                <p className="text-yellow-700 text-sm mt-1">SEPA QUE INICIAR ESTA CONVERSACION TIENE UN COSTO. ASEGURESE DE ESTAR EN EL CHAT CORRECTO ANTES DE CONFIRMAR.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              {loadingTemplates ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-gray-500">Cargando plantillas de Meta...</p>
                  </div>
              ) : templateError ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                      <p className="text-red-500 text-sm font-bold">{templateError}</p>
                      <p className="text-gray-500 text-xs mt-2 max-w-md">Asegúrate de agregar WAPP_BUSINESS_ACCOUNT_ID en el .env del backend y reiniciarlo.</p>
                  </div>
              ) : templates.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">
                      No se encontraron plantillas aprobadas en Meta.
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map(t => (
                      <button 
                          key={t.id} 
                          onClick={() => setSelectedTemplate(t)}
                          className={`text-left p-5 rounded-2xl border bg-white transition-all focus:outline-none ${selectedTemplate?.id === t.id ? 'border-gray-900 shadow-md ring-2 ring-gray-900 scale-[1.02]' : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'}`}
                      >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-gray-900">{t.name}</p>
                            <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{t.language}</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-2 bg-[#f8f9fa] p-3 rounded-xl font-mono leading-relaxed h-[80px] overflow-hidden text-ellipsis">
                              {t.components?.find(c => c.type === 'BODY')?.text || 'Sin contenido principal'}
                          </p>
                      </button>
                    ))}
                  </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
            <button 
              onClick={() => setShowTemplateModal(false)}
              className="px-6 py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={async () => {
                if (!selectedTemplate) return;
                
                try {
                  setLoadingTemplates(true);
                  const bodyText = selectedTemplate.components?.find(c => c.type === 'BODY')?.text || '';
                  const res = await fetch(`${API_URL}/contacts/${contact.id}/template`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({
                      templateName: selectedTemplate.name,
                      languageCode: selectedTemplate.language,
                      bodyText: bodyText
                    })
                  });
                  
                  if (res.ok) {
                    toast.success('Plantilla enviada exitosamente');
                    setTemplateSent(true);
                    setShowTemplateModal(false);
                  } else {
                    const errData = await res.json();
                    toast.error(errData.error || 'Error al enviar plantilla');
                  }
                } catch (err) {
                  toast.error('Error de red al enviar plantilla');
                } finally {
                  setLoadingTemplates(false);
                }
              }}
              disabled={loadingTemplates || !!templateError || templates.length === 0 || !selectedTemplate}
              className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              Enviar Plantilla Seleccionada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
