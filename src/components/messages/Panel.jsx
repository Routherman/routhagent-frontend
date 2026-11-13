"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import ListContacts from './listChats';
import Chat from './Chat';
import InfoContact from './infoContact';
import MassivePanel from './massivePanel';
import { API_URL, BASE_URL } from '@/config/api';

export default function MessagesPanel() {
  const { user, isLoaded } = useUser();
  const [view, setView] = useState('chat'); // 'chat' or 'massive'
  const [showInfo, setShowInfo] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [codigoEmpresa, setCodigoEmpresa] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('codigoEmpresa') || 'KRZMJI';
    }
    return 'KRZMJI';
  });
  const [loading, setLoading] = useState(true);

  const [currentUserData, setCurrentUserData] = useState(null);

  // 1. Get user from DB to know their codigo_empresa
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => {
          if (data && data.codigo_empresa) {
            setCodigoEmpresa(data.codigo_empresa);
            setCurrentUserData(data);
            if (typeof window !== 'undefined') {
              localStorage.setItem('codigoEmpresa', data.codigo_empresa);
            }
          }
        })
        .catch(err => console.error("Error fetching user data:", err));
    }
  }, [isLoaded, user]);

  // 2. Poll contacts for this enterprise (solo con mensajes reales intercambiados)
  const fetchContacts = async () => {
    const targetEmpresa = codigoEmpresa || (typeof window !== 'undefined' ? localStorage.getItem('codigoEmpresa') : null) || 'KRZMJI';
    try {
      const clerkParam = user?.id ? `clerkId=${encodeURIComponent(user.id)}&` : '';
      const roleParam = currentUserData?.rol_nombre ? `&role=${encodeURIComponent(currentUserData.rol_nombre)}&user_id=${currentUserData.id}` : '';
      const res = await fetch(`${API_URL}/contacts/${targetEmpresa}?${clerkParam}onlyWithMessages=true${roleParam}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      
      // Formatear datos para el frontend
      const formatted = Array.isArray(data) ? data.map(c => ({
        id: c.id,
        name: c.nombre || 'Desconocido',
        telefono: c.telefono,
        email: c.email,
        grupo: c.grupo,
        estado_bot: c.estado_bot,
        categoria: c.rol_asignado || c.grupo || 'General',
        usuario_asignado_id: c.usuario_asignado_id,
        estado_resolucion: c.estado_resolucion || 'RESUELTO',
        nota_pendiente: c.nota_pendiente || null,
        derivado_desde: c.derivado_desde || null,
        resumen_necesidad: c.resumen_necesidad || null,
        lider_id: c.lider_id || null,
        asesor_id: c.asesor_id || null,
        linea_wa: c.linea_wa || null,
        canal: c.canal || null,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nombre || 'Usuario')}`,
        time: c.last_message_time ? new Date(c.last_message_time).toLocaleDateString('es-AR') : new Date(c.creado_en).toLocaleDateString('es-AR'),
        lastMessageTime: c.last_message_time ? new Date(c.last_message_time) : new Date(c.creado_en),
        lastMessage: c.last_message ? (typeof c.last_message === 'string' && c.last_message.startsWith('{') ? '📎 Archivo multimedia' : c.last_message) : (c.telefono || 'Sin mensajes'),
        unread: c.unread_count || 0,
        online: c.estado_bot === 'ACTIVO',
      })) : [];
      
      setContacts(formatted);
      if (activeContact) {
        const updatedActive = formatted.find(c => c.id === activeContact.id);
        if (updatedActive) setActiveContact(updatedActive);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    const intervalId = setInterval(fetchContacts, 3000);
    // Timeout failsafe para evitar que se quede cargando infinitamente bajo ninguna circunstancia
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => {
      clearInterval(intervalId);
      clearTimeout(safetyTimer);
    };
  }, [codigoEmpresa, user?.id, currentUserData?.rol_nombre]);

  // 2b. Auto-seleccionar conversación si viene con query param contactId o phone desde CRM
  const handledParamRef = React.useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || handledParamRef.current) return;
    const urlParams = new URLSearchParams(window.location.search);
    const targetContactId = urlParams.get('contactId');
    const targetPhone = urlParams.get('phone');
    const targetName = urlParams.get('name');

    if (!targetContactId && !targetPhone) return;

    // Buscar en la lista de contactos existentes
    const matched = contacts.find(c => 
      (targetContactId && String(c.id) === String(targetContactId)) || 
      (targetPhone && c.telefono && c.telefono.replace(/\D/g, '') === targetPhone.replace(/\D/g, ''))
    );

    if (matched) {
      setActiveContact(matched);
      handledParamRef.current = true;
    } else if (contacts.length > 0 || !loading) {
      // Si el contacto aún no tiene mensajes intercambiados, creamos el contacto en la vista activa
      const cleanPhone = (targetPhone || '').replace(/\D/g, '');
      const placeholder = {
        id: targetContactId ? parseInt(targetContactId, 10) : Date.now(),
        name: targetName || 'Contacto CRM',
        telefono: targetPhone || cleanPhone,
        email: '',
        grupo: 'CRM',
        estado_bot: 'ACTIVO',
        categoria: 'General',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(targetName || 'Usuario')}`,
        time: 'Ahora',
        lastMessageTime: new Date(),
        lastMessage: 'Nueva conversación iniciada desde CRM',
        unread: 0,
        online: true
      };
      setContacts(prev => [placeholder, ...prev.filter(p => p.id !== placeholder.id)]);
      setActiveContact(placeholder);
      handledParamRef.current = true;
    }
  }, [contacts, loading, codigoEmpresa]);

  // 3. Poll messages for active contact
  useEffect(() => {
    if (!activeContact) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/contacts/${activeContact.id}/messages`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const data = await res.json();
        
        const formattedMessages = data.map(m => {
          let textData = m.contenido || '';
          let parsedMedia = null;
          
          if (m.tipo !== 'text' && m.contenido && m.contenido.startsWith('{')) {
             try {
                 parsedMedia = JSON.parse(m.contenido);
                 textData = parsedMedia.caption || '';
             } catch(e) {
                 textData = m.contenido;
             }
          }

          let msgObj = {
            id: m.id,
            text: textData,
            time: new Date(m.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: m.creado_en,
            isMine: m.direccion === 'SALIENTE',
            status: m.estado_entrega
          };

          // Construimos la URL completa para el frontend asegurando compatibilidad con ngrok y localhost
          let fullMediaUrl = null;
          if (parsedMedia && parsedMedia.url) {
            let u = parsedMedia.url;
            if (u.startsWith('http://') || u.startsWith('https://')) {
              fullMediaUrl = u.includes('ngrok') && !u.includes('ngrok-skip-browser-warning')
                ? (u.includes('?') ? `${u}&ngrok-skip-browser-warning=true` : `${u}?ngrok-skip-browser-warning=true`)
                : u;
            } else {
              const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
              const domain = isLocal ? 'http://localhost:8080' : BASE_URL;
              const full = `${domain}${u}`;
              fullMediaUrl = full.includes('ngrok') ? `${full}${full.includes('?') ? '&' : '?'}ngrok-skip-browser-warning=true` : full;
            }
          }

          const transcriptionText = parsedMedia?.transcription || (m.tipo === 'audio' ? parsedMedia?.caption : '') || '';

          if (m.tipo === 'audio') {
             msgObj.audio = { 
               url: fullMediaUrl,
               transcription: transcriptionText
             };
             if (!msgObj.text && transcriptionText) {
               msgObj.text = transcriptionText;
             }
          } else if (m.tipo === 'image') {
             msgObj.image = { url: fullMediaUrl };
          } else if (m.tipo === 'document' || m.tipo === 'file' || m.tipo === 'pdf') {
             msgObj.file = { name: 'Documento adjunto', url: fullMediaUrl };
          }
          return msgObj;
        });
        setMessages(formattedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 3000);
    return () => clearInterval(intervalId);
  }, [activeContact]);

  const handleSendMessage = async (text) => {
    if (!text || !activeContact || !codigoEmpresa) return;

    // Optimistic UI
    const tempMsg = { id: Date.now(), text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMine: true, status: 'Sending...' };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetch(`${API_URL}/messages/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          contactId: activeContact.id,
          telefono: activeContact.telefono,
          codigoEmpresa: codigoEmpresa,
          text: text
        })
      });
      // El polling actualizará con el estado real
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  const handleToggleBot = async (contactToToggle) => {
    const newState = contactToToggle.estado_bot === 'ACTIVO' ? 'HANDOFF' : 'ACTIVO';
    try {
       await fetch(`${API_URL}/contacts/${contactToToggle.id}/bot`, {
         method: 'PUT',
         headers: { 
           'Content-Type': 'application/json',
           'ngrok-skip-browser-warning': 'true'
         },
         body: JSON.stringify({ estado: newState })
       });
       // Actualizar optimistamente
       setActiveContact(prev => prev.id === contactToToggle.id ? { ...prev, estado_bot: newState } : prev);
    } catch (error) {
       console.error("Error toggling bot", error);
    }
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-white dark:bg-[#070b14] rounded-[32px]">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-white/20 border-t-[#c2dce0] dark:border-t-sky-400 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Cargando bandeja de entrada...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-[#070b14] rounded-[32px] shadow-sm relative">
      {view === 'massive' ? (
        <MassivePanel contacts={contacts} onCancel={() => setView('chat')} codigoEmpresa={codigoEmpresa} />
      ) : (
        <>
          <ListContacts 
             contacts={contacts} 
             onStartMassive={() => setView('massive')} 
             onSelectContact={(c) => setActiveContact(c)}
             activeContact={activeContact}
             codigoEmpresa={codigoEmpresa}
             currentUser={currentUserData || user}
             onRefreshContacts={fetchContacts}
          />

          {activeContact ? (
            <Chat
              messages={messages}
              contact={activeContact}
              onHeaderClick={() => {
                  if(activeContact) setShowInfo(!showInfo);
              }}
              onSendMessage={handleSendMessage}
              onToggleBot={handleToggleBot}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-[#090e1a] border-l border-r border-gray-100 dark:border-white/10">
              <div className="w-16 h-16 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-white">No hay chats activos</h3>
              <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm text-center max-w-sm">
                Cuando tu bot de WhatsApp reciba un mensaje, aparecerá aquí automáticamente.
              </p>
            </div>
          )}

          {showInfo && activeContact && <InfoContact contact={activeContact} codigoEmpresa={codigoEmpresa} />}
        </>
      )}
    </div>
  );
}
