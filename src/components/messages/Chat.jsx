import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '@/config/api';
import { toast } from 'sonner';
import { Sparkles, Plus, Zap, MessageSquare, Trash2, X, Send, Check } from 'lucide-react';

export default function Chat({ messages = [], contact, onHeaderClick, onSendMessage, onToggleBot }) {
  const [inputValue, setInputValue] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const messagesEndRef = useRef(null);

  // States for Operator Quick Responses and Intelligent Statistical Suggestions
  const [customResponses, setCustomResponses] = useState([]);
  const [showNewResponseModal, setShowNewResponseModal] = useState(false);
  const [newResponseTitle, setNewResponseTitle] = useState('');
  const [newResponseText, setNewResponseText] = useState('');
  const [newResponseActivateBot, setNewResponseActivateBot] = useState(false);
  const [calendarSlots, setCalendarSlots] = useState([]);

  // Cargar slots de calendario oficiales desde la base de datos de la empresa
  useEffect(() => {
    const empCode = contact?.codigo_empresa || 'KRZMJI';
    fetch(`${API_URL}/empresas/${empCode}/calendar/slots`, { 
      headers: { 'ngrok-skip-browser-warning': 'true' } 
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.slots)) {
          setCalendarSlots(data.slots);
        }
      })
      .catch(err => console.warn('Chat calendar slots:', err));
  }, [contact?.codigo_empresa]);

  // Cargar respuestas rápidas guardadas del operador desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('routh_operator_quick_responses');
      if (saved) {
        setCustomResponses(JSON.parse(saved));
      } else {
        const initial = [
          { id: '1', title: 'Saludo Inicial', text: '¡Hola! Gracias por comunicarte con Colaboratium. ¿En qué podemos ayudarte hoy?', activateBot: false },
          { id: '2', title: 'Derivación Asesor', text: 'Te estamos derivando con un asesor comercial senior de Colaboratium para darte atención inmediata.', activateBot: false },
          { id: '3', title: 'Cierre y Gracias', text: '¡Muchas gracias por tu tiempo! Quedamos a tu entera disposición ante cualquier otra inquietud.', activateBot: false }
        ];
        setCustomResponses(initial);
        localStorage.setItem('routh_operator_quick_responses', JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Error cargando respuestas rápidas:', e);
    }
  }, []);

  const handleSaveCustomResponse = (e) => {
    e.preventDefault();
    if (!newResponseTitle.trim() || !newResponseText.trim()) {
      toast.error('Completa el título y texto de la respuesta');
      return;
    }
    const updated = [
      ...customResponses,
      { 
        id: Date.now().toString(), 
        title: newResponseTitle.trim(), 
        text: newResponseText.trim(),
        activateBot: newResponseActivateBot
      }
    ];
    setCustomResponses(updated);
    localStorage.setItem('routh_operator_quick_responses', JSON.stringify(updated));
    setNewResponseTitle('');
    setNewResponseText('');
    setNewResponseActivateBot(false);
    setShowNewResponseModal(false);
    toast.success('Respuesta rápida guardada con éxito');
  };

  const handleDeleteCustomResponse = (id, e) => {
    e.stopPropagation();
    const updated = customResponses.filter(r => r.id !== id);
    setCustomResponses(updated);
    localStorage.setItem('routh_operator_quick_responses', JSON.stringify(updated));
    toast.success('Respuesta eliminada');
  };

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
      const diffMs = Math.max(0, now - lastIncomingTime);
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (diffMs < hours24) {
        isWithin24Hours = true;
        const remainingMs = Math.min(hours24, Math.max(0, hours24 - diffMs));
        const rHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const rMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        remainingTimeStr = `Ventana de 24h abierta (quedan ${rHours}h ${rMins}m)`;
      }
    }
  }

  // Generación dinámica de la respuesta de eventos con datos reales de la base de calendario
  let dynamicCalendarText = 'El próximo Webinar Informativo para Asesores Comerciales es este Lunes a las 10:30 hs vía Google Meet. Te enviaremos el enlace directo 15 minutos antes del inicio.';
  if (calendarSlots.length > 0) {
    const isLider = contact?.grupo === 'LIDERES' || contact?.rol_asignado === 'Lideres';
    const filteredSlots = calendarSlots
      .filter(s => isLider ? (s.categoria === 'LIDERES' || s.categoria === 'all') : (s.categoria !== 'LIDERES'))
      .slice(0, 3);
    const chosenSlots = filteredSlots.length > 0 ? filteredSlots : calendarSlots.slice(0, 3);
    const optionsText = chosenSlots.map((s, idx) => 
      `• *Opción ${idx + 1}:* ${s.titulo} - ${s.fechaStr} a las ${s.horarioStr} (${s.modalidad === 'PRESENCIAL' ? 'Presencial: ' + (s.ubicacion || 'Vicente López') : 'Virtual Google Meet'})`
    ).join('\n');
    dynamicCalendarText = `¡Hola! Te compartimos los próximos encuentros y capacitaciones oficiales de Colaboratium:\n\n${optionsText}\n\nPor favor respondé con el *número de opción (1, 2 o 3)* y tu *correo electrónico* para registrarte y enviarte el acceso directo.`;
  }

  // Sugerencias Inteligentes por Estadísticas de Consultas Frecuentes
  const defaultKnowledgeSuggestions = [
    {
      id: 'login_caps',
      keywords: ['loguearme', 'login', 'contraseña', 'clave', 'bloq', 'caps', 'entrar', 'ingresar', 'acceso', 'cuenta', 'usuario', 'no puedo ingresar'],
      title: '🔑 Problema de Login / Bloq Mayús',
      text: 'Hola! Verificá si tenés activada la tecla Bloq Mayús (Caps Lock) en tu teclado o si tu navegador autocompletó un espacio al final de tu correo. Podés restablecer tu clave oficial desde: https://colaboratium.com.ar/recuperar'
    },
    {
      id: 'comisiones',
      keywords: ['comision', 'comisiones', 'cobro', 'pago', 'honorarios', 'porcentaje', 'ganancia', 'liquidacion', 'cuanto gano'],
      title: '💼 Esquema de Comisiones & Cobro',
      text: 'Las comisiones comerciales se liquidan quincenalmente contra factura B/C con acreditación inmediata en Banco BIND / Coinag. Contás con escala incremental del 3% al 6% según producción.'
    },
    {
      id: 'webinar_meet',
      keywords: ['webinar', 'capacitacion', 'meet', 'reunion', 'horario', 'virtual', 'cuando es', 'charla', 'induccion'],
      title: '📅 Próximo Webinar & Meet Virtual',
      text: dynamicCalendarText
    },
    {
      id: 'inversiones',
      keywords: ['inversion', 'inversiones', 'plazo', 'rendimiento', 'simulador', 'interes', 'tasa', 'invertir'],
      title: '📈 Simulador Oficial de Inversiones',
      text: 'Podés calcular tu colocación en nuestro simulador oficial: https://colaboratium.com.ar/inversiones.php#simulador para operar con calce inmediato y respaldo institucional.'
    },
    {
      id: 'banco_cbu',
      keywords: ['cbu', 'alias', 'banco', 'transferencia', 'cuenta', 'deposito', 'donde transfiero'],
      title: '🏦 Datos Bancarios Oficiales',
      text: 'Nuestra cuenta institucional de custodia es: Banco BIND • CBU: 0000003100019283748291 • Alias: colab.valle.asesor (Global Loan S.A. BCRA Nº 40.015).'
    },
    {
      id: 'requisitos_alta',
      keywords: ['dni', 'requisito', 'requisitos', 'papeles', 'alta', 'monotributo', 'cuit', 'documentacion'],
      title: '📄 Requisitos & Expediente 360°',
      text: 'Para completar tu alta en Colaboratium necesitamos: Foto de DNI (frente y dorso), constancia de CUIT/Monotributo y comprobante de CBU a tu nombre.'
    }
  ];

  const lastIncoming = [...messages].reverse().find(m => !m.isMine);
  const lastIncomingText = (lastIncoming?.text || lastIncoming?.audio?.transcription || '').toLowerCase();

  const matchedSuggestion = defaultKnowledgeSuggestions.find(s => 
    s.keywords.some(kw => lastIncomingText.includes(kw))
  );

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
    <div className="flex-1 flex flex-col bg-[#f8f9fa] dark:bg-[#080d19] border-l border-r border-gray-100 dark:border-white/10 min-w-0 relative">
      {/* Chat Header */}
      <div 
        className="min-h-[76px] py-2 flex flex-col md:flex-row md:items-center justify-between px-6 border-b border-gray-100 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors gap-2"
        onClick={onHeaderClick}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-bold text-[15px] text-gray-900 dark:text-white">{contact?.name || 'Desconocido'} ({contact?.telefono || ''})</h2>
            {contact?.categoria && contact?.categoria !== 'general' && (
              <span className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {contact.categoria}
              </span>
            )}
            {contact?.estado_resolucion === 'PENDIENTE' && (
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider border border-amber-300 dark:border-amber-700/50">
                ⚠️ Pendiente
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {contact?.estado_bot === 'ACTIVO' ? (
               <span className="w-1.5 h-1.5 bg-[#4cd964] rounded-full"></span>
            ) : (
               <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            )}
            <span className="text-[12px] text-gray-500 dark:text-slate-400">{contact?.estado_bot === 'ACTIVO' ? 'IA Respondiendo' : 'Pausado (Modo Humano)'}</span>
            {isWithin24Hours && (
              <span className="ml-2 text-[11px] font-medium text-green-600 dark:text-emerald-300 bg-green-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-green-100 dark:border-emerald-800/40">
                {remainingTimeStr}
              </span>
            )}
            {!isWithin24Hours && messages.length > 0 && (
              <span className="ml-2 text-[11px] font-medium text-red-500 dark:text-rose-300 bg-red-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-red-100 dark:border-rose-800/40">
                Fuera de la ventana de 24h
              </span>
            )}
          </div>

          {/* Banner de Derivación y Resumen de Necesidad del Cliente */}
          {(contact?.derivado_desde || contact?.resumen_necesidad || contact?.nota_pendiente) && (
            <div className="flex items-center gap-2 mt-1.5 px-2.5 py-1 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-[11px] text-indigo-950 dark:text-indigo-200 animate-in fade-in duration-150">
              <span className="font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 shrink-0 flex items-center gap-1">
                ↪️ Derivado desde: {contact.derivado_desde || 'Soporte Técnico'}
              </span>
              <span className="text-gray-300 dark:text-gray-600 shrink-0">•</span>
              <span className="font-semibold truncate">
                <strong className="text-indigo-800 dark:text-indigo-300">Necesidad:</strong> {contact.resumen_necesidad || contact.nota_pendiente || 'Atención personalizada requerida'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-gray-500 dark:text-slate-400">
           {/* Botón para activar/desactivar la IA */}
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleBot(contact); }}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${contact?.estado_bot === 'ACTIVO' ? 'bg-red-50 text-red-600 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-red-100 dark:hover:bg-rose-900/50' : 'bg-green-50 text-green-600 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-green-100 dark:hover:bg-emerald-900/50'}`}
           >
             {contact?.estado_bot === 'ACTIVO' ? 'Desactivar IA' : 'Activar IA'}
           </button>
           
           <button className="hover:text-gray-800 dark:hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
           </button>
           <button className="hover:text-gray-800 dark:hover:text-white transition-colors">
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
              <div className={`p-4 rounded-[20px] ${m.isMine ? 'bg-sky-600 dark:bg-sky-500 text-white rounded-tr-sm shadow-sm' : 'bg-white dark:bg-[#11192a] border border-gray-100 dark:border-white/10 shadow-sm text-gray-700 dark:text-slate-100 rounded-tl-sm'}`}>
                
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
                  <div className="flex flex-col gap-2 min-w-[260px] max-w-[320px]">
                    {m.audio.url ? (
                      <div className="flex flex-col gap-2">
                        <audio 
                          controls 
                          preload="auto"
                          className="w-full h-10 rounded-lg"
                        >
                          <source src={m.audio.url} type="audio/ogg; codecs=opus" />
                          <source src={m.audio.url} type="audio/ogg" />
                          <source src={m.audio.url} type="audio/mpeg" />
                          Tu navegador no soporta reproducción de audio.
                        </audio>
                        {(m.text || m.audio.transcription) && (
                          <div className="bg-black/5 rounded-xl p-2.5 border border-black/5 text-[12px] text-gray-800 leading-relaxed">
                            <span className="font-extrabold text-[10px] uppercase text-emerald-700 tracking-wider block mb-0.5">
                              🎙️ Transcripción IA:
                            </span>
                            "{m.text || m.audio.transcription}"
                          </div>
                        )}
                      </div>
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
      
      {/* Quick Suggestions & Operator Responses Toolbar */}
      <div className="px-6 mb-2 flex flex-col gap-2">
        {/* Sugerencia Inteligente según consulta del cliente (IA / Calendario / Estadísticas) */}
        {matchedSuggestion && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-xs">
            <span className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sugerencia Inteligente IA:</span>
            </span>
            <span className="font-semibold text-gray-800 dark:text-slate-200 truncate flex-1">
              {matchedSuggestion.title}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setInputValue(matchedSuggestion.text);
                  toast.success('Respuesta sugerida insertada en el mensaje');
                }}
                className="px-2.5 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-extrabold text-[11px] shadow-xs transition"
              >
                Insertar Respuesta
              </button>
              <button
                onClick={() => {
                  onSendMessage(matchedSuggestion.text);
                  if (contact?.estado_bot !== 'ACTIVO' && onToggleBot) {
                    onToggleBot(contact);
                  }
                  toast.success('Opciones de calendario enviadas y bot activado');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[11px] shadow-xs transition flex items-center gap-1"
                title="Envía la respuesta con los eventos y activa la IA para continuar la inscripción"
              >
                <Sparkles className="w-3 h-3 text-black" />
                <span>Enviar y Activar IA</span>
              </button>
            </div>
          </div>
        )}

        {/* Barra de Respuestas Rápidas del Operador */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Respuestas Rápidas:</span>
          </span>

          {customResponses.map((r) => (
            <div
              key={r.id}
              onClick={() => {
                setInputValue(r.text);
                if (r.activateBot && contact?.estado_bot !== 'ACTIVO' && onToggleBot) {
                  onToggleBot(contact);
                  toast.success(`Respuesta "${r.title}" cargada y bot activado`);
                } else {
                  toast.success(`Respuesta "${r.title}" cargada`);
                }
              }}
              className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-transparent dark:border-white/10 shrink-0 cursor-pointer transition select-none"
              title={`${r.text}${r.activateBot ? ' (Activa IA al usar)' : ''}`}
            >
              {r.activateBot && (
                <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0 animate-pulse" />
              )}
              <span className="font-bold text-[11px]">{r.title}</span>
              <button
                onClick={(e) => handleDeleteCustomResponse(r.id, e)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-0.5"
                title="Eliminar respuesta rápida"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          <button
            onClick={() => setShowNewResponseModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-bold shrink-0 transition"
          >
            <Plus className="w-3 h-3" />
            <span>+ Crear Respuesta</span>
          </button>
        </div>
      </div>

      {/* Input Area */}
      {isWithin24Hours || messages.length === 0 ? (
        <div className="p-4 mx-6 mb-6 bg-white dark:bg-[#0d1322] border border-gray-200 dark:border-white/10 rounded-[20px] shadow-sm flex flex-col gap-3">
           <input 
              type="text" 
              placeholder="Enter to send, Shift + Enter to add new line" 
              className="w-full outline-none text-[14px] text-gray-700 dark:text-slate-100 bg-transparent placeholder-gray-400 dark:placeholder-slate-500"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
           />
           <div className="flex justify-between items-center text-gray-400 dark:text-slate-400 pt-3 border-t border-gray-50 dark:border-white/10 mt-1">
              <div className="flex gap-4 items-center">
                <span className="font-serif font-bold text-[15px] cursor-pointer hover:text-gray-600 dark:hover:text-white transition-colors">B</span>
                <span className="font-serif italic text-[15px] cursor-pointer hover:text-gray-600 dark:hover:text-white transition-colors">I</span>
                <span className="font-serif underline text-[15px] cursor-pointer hover:text-gray-600 dark:hover:text-white transition-colors">U</span>
                <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1"></div>
                <svg className="w-[18px] h-[18px] cursor-pointer hover:text-gray-600 dark:hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                <svg className="w-[18px] h-[18px] cursor-pointer hover:text-gray-600 dark:hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </div>
              <div className="flex gap-4 items-center">
                <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 dark:hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 dark:hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
           </div>
        </div>
      ) : (
        <div className="p-4 mx-6 mb-6">
          {templateSent ? (
            <div className="w-full py-5 px-6 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2 text-green-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-sm">Plantilla enviada</span>
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-xs">Esperando respuesta del cliente para reabrir la conversación.</p>
            </div>
          ) : (
            <button 
              onClick={handleOpenTemplates}
              className="w-full py-4 bg-gray-900 dark:bg-sky-600 hover:dark:bg-sky-500 text-white font-bold rounded-2xl hover:bg-black transition-colors flex items-center justify-center gap-2 border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Iniciar conversación devuelta (Usar Plantilla)
            </button>
          )}
        </div>
      )}

      {/* Modal: Crear Nueva Respuesta Rápida del Operador */}
      {showNewResponseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0d1322] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-white/10 text-gray-950 dark:text-white flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-gray-950 dark:text-white">Nueva Respuesta Rápida</h3>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Guarda una respuesta automática para tus chats</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNewResponseModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomResponse} className="space-y-4 py-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-gray-700 dark:text-slate-300 mb-1">
                  Título / Atajo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Acceso Bloq Mayús, Comisiones..."
                  value={newResponseTitle}
                  onChange={(e) => setNewResponseTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-gray-50 dark:bg-slate-900 text-gray-950 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-gray-700 dark:text-slate-300 mb-1">
                  Texto de la Respuesta
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escribe el texto que se insertará al hacer clic en este botón..."
                  value={newResponseText}
                  onChange={(e) => setNewResponseText(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 dark:bg-slate-900 text-gray-950 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Trigger opcional: Activar IA automáticamente al enviar esta respuesta */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-slate-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <input
                  type="checkbox"
                  checked={newResponseActivateBot}
                  onChange={(e) => setNewResponseActivateBot(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Activar IA automáticamente al enviar esta respuesta
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Al seleccionar esta respuesta rápida, reactivará el bot (estado ACTIVO) para que la IA continúe atendiendo al cliente.
                  </span>
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewResponseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition"
                >
                  Guardar Respuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal (Reabrir ventana 24h) */}
      {showTemplateModal && (
        <div className="absolute inset-0 bg-white dark:bg-[#070b14] z-50 flex flex-col">
          {/* Header del modal */}
          <div className="h-[76px] min-h-[76px] flex items-center justify-between px-6 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#0d1322]">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Seleccionar Plantilla de Meta</h3>
              <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">Debes seleccionar una plantilla aprobada para reabrir la ventana.</p>
            </div>
            <button 
              onClick={() => setShowTemplateModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-6 bg-[#f8f9fa] dark:bg-[#070b14]">
            <div className="bg-yellow-50 dark:bg-amber-950/40 border-l-4 border-yellow-400 dark:border-amber-400 p-4 mb-6 rounded-r-xl flex items-start gap-3 shadow-sm shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-yellow-800 dark:text-amber-300 text-sm">ATENCIÓN</p>
                <p className="text-yellow-700 dark:text-amber-400/90 text-sm mt-1">SEPA QUE INICIAR ESTA CONVERSACION TIENE UN COSTO. ASEGURESE DE ESTAR EN EL CHAT CORRECTO ANTES DE CONFIRMAR.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              {loadingTemplates ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="w-8 h-8 border-4 border-gray-200 dark:border-slate-700 border-t-black dark:border-t-[#c6f432] rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Cargando plantillas de Meta...</p>
                  </div>
              ) : templateError ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-500/20">
                      <p className="text-red-500 dark:text-red-400 text-sm font-bold">{templateError}</p>
                      <p className="text-gray-500 dark:text-slate-400 text-xs mt-2 max-w-md">Asegúrate de agregar WAPP_BUSINESS_ACCOUNT_ID en el .env del backend y reiniciarlo.</p>
                  </div>
              ) : templates.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500 text-sm font-medium">
                      No se encontraron plantillas aprobadas en Meta.
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map(t => (
                      <button 
                          key={t.id} 
                          onClick={() => setSelectedTemplate(t)}
                          className={`text-left p-5 rounded-2xl border transition-all focus:outline-none ${
                            selectedTemplate?.id === t.id 
                              ? 'border-gray-900 dark:border-[#c6f432] bg-white dark:bg-[#131f38] shadow-md ring-2 ring-gray-900 dark:ring-[#c6f432]/40 scale-[1.01]' 
                              : 'bg-white dark:bg-[#0e1628] border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 hover:shadow-sm'
                          }`}
                      >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                            <span className="text-green-700 dark:text-emerald-400 bg-green-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-green-200 dark:border-emerald-500/30">
                              {t.language}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-slate-300 text-sm mt-2 bg-[#f8f9fa] dark:bg-[#090e1c] p-3 rounded-xl font-mono leading-relaxed h-[80px] overflow-hidden text-ellipsis border border-transparent dark:border-white/10">
                              {t.components?.find(c => c.type === 'BODY')?.text || 'Sin contenido principal'}
                          </p>
                      </button>
                    ))}
                  </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#0d1322] flex justify-end gap-3 shrink-0">
            <button 
              onClick={() => setShowTemplateModal(false)}
              className="px-6 py-3 rounded-xl text-gray-600 dark:text-slate-300 font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
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
              className="px-8 py-3 rounded-xl bg-gray-900 dark:bg-[#c6f432] text-white dark:text-black font-extrabold hover:bg-black dark:hover:bg-[#b5e02c] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              Enviar Plantilla Seleccionada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
