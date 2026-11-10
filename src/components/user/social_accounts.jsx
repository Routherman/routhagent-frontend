'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { CheckCircle2, Plus, X, MessageCircle, Save, ExternalLink, Lock, Radio, Copy, Check, ShieldAlert } from 'lucide-react';
import { API_URL } from '@/config/api';

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function SocialAccounts() {
  const { user } = useUser();
  const [empresa, setEmpresa] = useState(null);
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // WhatsApp Business modal state (WA_B)
  const [isWpModalOpen, setIsWpModalOpen] = useState(false);
  const [isWpSuccess, setIsWpSuccess] = useState(false);
  const [savingWp, setSavingWp] = useState(false);
  const [wpError, setWpError] = useState(null);

  const [webhookToken, setWebhookToken] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // WASender API modal state (WA_S***5239)
  const [isWasModalOpen, setIsWasModalOpen] = useState(false);
  const [isWasSuccess, setIsWasSuccess] = useState(false);
  const [savingWas, setSavingWas] = useState(false);
  const [wasError, setWasError] = useState(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const [wasSessionName, setWasSessionName] = useState('Colab');
  const [wasPhoneNumber, setWasPhoneNumber] = useState('+54 11 7825 5239');
  const [wasApiKey, setWasApiKey] = useState('');
  const [wasWebhookSecret, setWasWebhookSecret] = useState('');
  const [wasBlockOutgoing, setWasBlockOutgoing] = useState(true);

  // Instagram modal state (Global Loan)
  const [isIgModalOpen, setIsIgModalOpen] = useState(false);
  const [isIgSuccess, setIsIgSuccess] = useState(false);
  const [savingIg, setSavingIg] = useState(false);
  const [igError, setIgError] = useState(null);

  const [igUsername, setIgUsername] = useState('@colaboratium');
  const [igPageId, setIgPageId] = useState('');
  const [igAccessToken, setIgAccessToken] = useState('');

  // Fetch local user and then the enterprise
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const resUser = await fetch(`${API_URL}/users/me/${user.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const dataUser = await resUser.json();
        
        if (dataUser && dataUser.codigo_empresa) {
          setCodigoEmpresa(dataUser.codigo_empresa);
          const resEmpresa = await fetch(`${API_URL}/empresas/${dataUser.codigo_empresa}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
          const dataEmpresa = await resEmpresa.json();
          if (resEmpresa.ok) {
            setEmpresa(dataEmpresa);
            
            // Populate if already connected
            let cv = dataEmpresa.cuentas_vinculadas;
            if (typeof cv === 'string') {
              try { cv = JSON.parse(cv); } catch(e){}
            }
            if (cv && cv.whatsapp) {
                setWebhookToken(cv.whatsapp.webhook_token || '');
                setPhoneId(cv.whatsapp.phone_id || '');
                setAccessToken(cv.whatsapp.access_token || '');
            }
            if (cv && cv.wasender) {
                setWasSessionName(cv.wasender.session_name || 'Colab');
                setWasPhoneNumber(cv.wasender.phone_number || '+54 9 11 2473 5062');
                setWasApiKey(cv.wasender.api_key || '');
                setWasWebhookSecret(cv.wasender.webhook_secret || '');
                setWasBlockOutgoing(cv.wasender.block_outgoing ?? false);
            }
            if (cv && cv.instagram) {
                setIgUsername(cv.instagram.username || cv.instagram.handle || '@colaboratium');
                setIgPageId(cv.instagram.meta_page_id || '');
                setIgAccessToken(cv.instagram.access_token || '');
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  let wpConnected = false;
  let wasConnected = false;
  let igConnected = false;
  let currentCuentas = {};
  if (empresa && empresa.cuentas_vinculadas) {
    let cv = empresa.cuentas_vinculadas;
    if (typeof cv === 'string') {
      try { cv = JSON.parse(cv); } catch(e){}
    }
    currentCuentas = cv || {};
    if (currentCuentas.whatsapp && currentCuentas.whatsapp.access_token) {
        wpConnected = true;
    }
    if (currentCuentas.wasender && (currentCuentas.wasender.connected || currentCuentas.wasender.phone_number)) {
        wasConnected = true;
    }
    if (currentCuentas.instagram && (currentCuentas.instagram.connected || currentCuentas.instagram.username)) {
        igConnected = true;
    }
  }

  // Código visual de la línea WASender: WA_S***XXXX (últimos 4 dígitos)
  const cleanWasPhone = (wasPhoneNumber || '5239').replace(/\D/g, '');
  const wasLast4 = cleanWasPhone.length >= 4 ? cleanWasPhone.slice(-4) : '5239';
  const wasLineCode = `WA_S***${wasLast4}`;

  const networks = [
    { 
      id: 'whatsapp', 
      name: 'WhatsApp Business', 
      lineCode: 'WA_B',
      icon: MessageCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      desc: 'Línea Oficial Meta Cloud API para campañas y flujos maestros de Colaboratium', 
      connected: wpConnected 
    },
    { 
      id: 'wasender', 
      name: 'WASender API', 
      lineCode: wasLineCode,
      icon: MessageCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      desc: `Conexión QR / Sesión Colab (${wasPhoneNumber}) vinculada a Global Loan para agentes RE/MAX y publicidad en redes.`, 
      connected: wasConnected,
      badge: wasLineCode
    },
    { 
      id: 'instagram', 
      name: 'Instagram (@colaboratium)', 
      icon: InstagramIcon, 
      color: 'text-pink-600', 
      bg: 'bg-pink-50', 
      desc: 'Cuenta oficial de Colaboratium vía Meta Graph API para captar leads desde historias, DMs y reels', 
      connected: igConnected,
      url: `https://www.instagram.com/${(igUsername || 'colaboratium').replace('@', '')}/`
    },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'text-black', bg: 'bg-gray-100', desc: 'Gestiona tu presencia y mensajes en TikTok', connected: false },
    { id: 'x', name: 'X (Twitter)', icon: XIcon, color: 'text-black', bg: 'bg-gray-100', desc: 'Integra tus DMs y menciones de X', connected: false },
    { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: 'text-red-600', bg: 'bg-red-50', desc: 'Administra los comentarios de tus videos', connected: false },
  ];

  const handleSaveWhatsApp = async (e) => {
    e.preventDefault();
    if (!codigoEmpresa) return;
    setSavingWp(true);
    setWpError(null);

    try {
      const updatedCuentas = {
        ...currentCuentas,
        whatsapp: {
            webhook_token: webhookToken,
            phone_id: phoneId,
            access_token: accessToken,
            line_code: 'WA_B'
        }
      };

      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/social`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ cuentasVinculadas: updatedCuentas })
      });
      if (res.ok) {
        setIsWpSuccess(true);
        setEmpresa({ ...empresa, cuentas_vinculadas: updatedCuentas });
      } else {
        const data = await res.json();
        setWpError(data.error || 'Error al guardar los datos');
      }
    } catch (err) {
      setWpError('Error de conexión.');
    } finally {
      setSavingWp(false);
    }
  };

  const handleSaveWasender = async (e) => {
    e.preventDefault();
    if (!codigoEmpresa) return;
    setSavingWas(true);
    setWasError(null);

    try {
      const cleanPhone = (wasPhoneNumber || '').replace(/\D/g, '');
      const last4 = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : '5239';
      const updatedCuentas = {
        ...currentCuentas,
        wasender: {
          session_name: wasSessionName || 'Colab',
          phone_number: wasPhoneNumber,
          phone_raw: cleanPhone,
          phone_last4: last4,
          line_code: `WA_S***${last4}`,
          api_key: wasApiKey || 'wasender_live_token_globalloan',
          webhook_url: `${API_URL}/wasender/webhook`,
          webhook_secret: wasWebhookSecret || 'colab_webhook_secret_wasender',
          connected: true,
          connected_at: new Date().toISOString(),
          status: 'connected',
          assigned_flow: 'Flujo WA_S: Agentes RE/MAX y Pauta Redes',
          block_outgoing: wasBlockOutgoing
        }
      };

      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/social`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ cuentasVinculadas: updatedCuentas })
      });
      if (res.ok) {
        setIsWasSuccess(true);
        setEmpresa({ ...empresa, cuentas_vinculadas: updatedCuentas });
      } else {
        const data = await res.json();
        setWasError(data.error || 'Error al guardar configuración de WASender');
      }
    } catch (err) {
      setWasError('Error de conexión con el servidor.');
    } finally {
      setSavingWas(false);
    }
  };

  const handleSaveInstagram = async (e) => {
    e.preventDefault();
    if (!codigoEmpresa) return;
    setSavingIg(true);
    setIgError(null);

    try {
      const cleanUsername = igUsername.startsWith('@') ? igUsername : `@${igUsername}`;
      const updatedCuentas = {
        ...currentCuentas,
        instagram: {
            username: cleanUsername,
            name: 'Global Loan S.A.',
            account_id: 'globalloan',
            profile_url: `https://www.instagram.com/${cleanUsername.replace('@', '')}/`,
            meta_page_id: igPageId || 'globalloan_meta_page',
            access_token: igAccessToken || undefined,
            connected: true,
            updated_at: new Date().toISOString()
        }
      };

      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/social`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ cuentasVinculadas: updatedCuentas })
      });
      if (res.ok) {
        setIsIgSuccess(true);
        setEmpresa({ ...empresa, cuentas_vinculadas: updatedCuentas });
      } else {
        const data = await res.json();
        setIgError(data.error || 'Error al guardar configuración de Instagram');
      }
    } catch (err) {
      setIgError('Error de conexión con el servidor.');
    } finally {
      setSavingIg(false);
    }
  };

  if (loadingData) {
    return <div className="flex justify-center mt-20 text-gray-400">Cargando cuentas sociales...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-8 relative pb-12">
      
      {/* Header card */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Cuentas Sociales & Canales de Mensajería</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            Gestiona tus líneas oficiales: <span className="font-bold text-gray-900">WA_B</span> (WhatsApp Business Meta), <span className="font-bold text-gray-900">{wasLineCode}</span> (WASender API vinculada a Global Loan) e <span className="font-bold text-gray-900">Instagram (@colaboratium)</span>.
          </p>
        </div>
      </div>

      {/* Grid of networks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {networks.map((network) => (
          <div key={network.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${network.bg} ${network.color}`}>
                  <network.icon className="w-7 h-7" />
                </div>
                {network.lineCode && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-gray-950 text-white tracking-wider font-mono shadow-xs">
                    {network.lineCode}
                  </span>
                )}
              </div>

              {network.connected ? (
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold border border-green-100">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Conectado
                </div>
              ) : (
                <div className="bg-gray-50 text-gray-500 px-4 py-2 rounded-full text-xs font-bold border border-gray-100">
                  Sin conectar
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{network.name}</h3>
                {network.url && (
                  <a href={network.url} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1">
                    Ver perfil <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">{network.desc}</p>
              
              {network.connected ? (
                <button 
                  onClick={() => {
                    if (network.id === 'whatsapp') setIsWpModalOpen(true);
                    if (network.id === 'wasender') setIsWasModalOpen(true);
                    if (network.id === 'instagram') setIsIgModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl border-2 border-gray-100 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Configurar
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (network.id === 'whatsapp') setIsWpModalOpen(true);
                    if (network.id === 'wasender') setIsWasModalOpen(true);
                    if (network.id === 'instagram') setIsIgModalOpen(true);
                  }}
                  className={`w-full py-3.5 rounded-2xl font-bold transition-colors ${
                    network.id === 'whatsapp' 
                      ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                      : network.id === 'wasender'
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : network.id === 'instagram'
                      ? 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                      : 'bg-[#E8F0FE] text-blue-700 hover:bg-[#D2E3FC]'
                  }`}
                >
                  Vincular
                </button>
              )}
            </div>
            
          </div>
        ))}
      </div>

      {/* WhatsApp Business Modal (WA_B) */}
      {isWpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setIsWpModalOpen(false); setIsWpSuccess(false); }}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {!isWpSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-6 pr-10">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Vincular WhatsApp Business</h3>
                      <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-green-100 text-green-800">Línea Oficial: WA_B</span>
                    </div>
                </div>
                
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Ingresa las credenciales de tu API de WhatsApp Cloud (Meta para Desarrolladores) para la línea oficial <strong className="text-gray-900">WA_B</strong>.
                </p>

                {wpError && <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">{wpError}</div>}

                <form onSubmit={handleSaveWhatsApp} className="space-y-5 mb-2">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Webhook Token</label>
                        <input required type="text" value={webhookToken} onChange={e => setWebhookToken(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium" placeholder="WASA132" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Phone ID</label>
                        <input required type="text" value={phoneId} onChange={e => setPhoneId(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium" placeholder="1298699639985346" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Access Token</label>
                        <input required type="text" value={accessToken} onChange={e => setAccessToken(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium" placeholder="EAAe7..." />
                    </div>
                    
                    <div className="pt-4">
                        <button 
                        disabled={savingWp}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {savingWp ? 'Conectando...' : 'Guardar y Conectar WhatsApp (WA_B)'}
                        </button>
                    </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Conexión Exitosa (WA_B)!</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-sm">
                  Línea WA_B enlazada a la plataforma para el motor de campañas y flujos.
                </p>
                <button 
                  onClick={() => { setIsWpModalOpen(false); setIsWpSuccess(false); }}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-colors shadow-sm"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WASender API Modal (WA_S***5239) */}
      {isWasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => { setIsWasModalOpen(false); setIsWasSuccess(false); }}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {!isWasSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-6 pr-10">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                        <Radio className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Vincular WASender API</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {wasLineCode}
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold">wasenderapi.com</span>
                      </div>
                    </div>
                </div>
                
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  Conexión multi-dispositivo vinculada a la cuenta de Global Loan (<strong className="text-gray-900">{wasPhoneNumber}</strong>) para prospectar agentes RE/MAX y recibir publicidad de redes.
                </p>

                {wasError && <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">{wasError}</div>}

                <form onSubmit={handleSaveWasender} className="space-y-4 mb-2">
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-950 leading-relaxed">
                        <strong className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                          📱 Pasos para conectar en wasenderapi.com:
                        </strong>
                        <ol className="list-decimal pl-4 space-y-1 text-emerald-900">
                          <li>En la sesión <strong>Colab</strong>, presiona el botón <strong>"Link with QR"</strong> en el recuadro de la derecha.</li>
                          <li>Desde el WhatsApp de tu celular (<strong>{wasPhoneNumber}</strong>), ve a <em>Dispositivos vinculados &gt; Vincular un dispositivo</em> y escanea el código.</li>
                          <li>Al vincularse, el recuadro <em>Credentials Locked</em> se desbloquea mostrando tu <strong>API Key</strong>.</li>
                        </ol>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 pl-1">Nombre de la Sesión</label>
                        <input required type="text" value={wasSessionName} onChange={e => setWasSessionName(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-sm" placeholder="Colab" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 pl-1">Número de Teléfono Vinculado</label>
                        <input required type="text" value={wasPhoneNumber} onChange={e => setWasPhoneNumber(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold text-sm" placeholder="+54 11 7825 5239" />
                        <p className="text-[11px] text-gray-400 pl-1 mt-1">Se identificará en todas las secciones como: <strong className="text-gray-900 font-mono">{wasLineCode}</strong></p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 pl-1">API Key / Token Bearer</label>
                        <input type="password" value={wasApiKey} onChange={e => setWasApiKey(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm" placeholder="wasender_api_token..." />
                    </div>

                    {/* Webhook Endpoint Informativo */}
                    <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl">
                        <label className="block text-[11px] font-black uppercase text-gray-500 mb-1">URL de Webhook para WASender Dashboard:</label>
                        <div className="flex items-center gap-2">
                            <input 
                              readOnly 
                              value={`https://routhagent.vercel.app/api/wasender/webhook`} 
                              className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-mono font-bold" 
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('https://routhagent.vercel.app/api/wasender/webhook');
                                setCopiedWebhook(true);
                                setTimeout(() => setCopiedWebhook(false), 2000);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold shrink-0 flex items-center gap-1"
                            >
                              {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedWebhook ? 'Copiado' : 'Copiar'}</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Ingresa esta URL en tu sesión de wasenderapi.com en el campo Webhook URL (POST).</p>
                    </div>

                    {/* Bloqueo de salida en periodo de prueba */}
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                                <Lock className="w-4 h-4 text-amber-600" />
                                <span>Modo de Prueba: Bloquear Comunicación Saliente</span>
                            </span>
                            <input 
                                type="checkbox"
                                checked={wasBlockOutgoing}
                                onChange={e => setWasBlockOutgoing(e.target.checked)}
                                className="w-4 h-4 accent-amber-600 cursor-pointer"
                            />
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                            Con esta casilla activa, se bloquean todos los envíos salientes manuales o de campañas en <strong className="font-mono">{wasLineCode}</strong>. La línea solo recibe mensajes entrantes de publicidad y el bot responde automáticamente.
                        </p>
                    </div>
                    
                    <div className="pt-2">
                        <button 
                        disabled={savingWas}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {savingWas ? 'Guardando...' : `Guardar y Activar ${wasLineCode}`}
                        </button>
                    </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Línea {wasLineCode} Conectada!</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-sm">
                  WASender API vinculada con éxito. Los mensajes entrantes en esta línea serán procesados por el flujo de agentes RE/MAX y publicidad.
                </p>
                <button 
                  onClick={() => { setIsWasModalOpen(false); setIsWasSuccess(false); }}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-colors shadow-sm"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instagram Modal (Global Loan) */}
      {isIgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setIsIgModalOpen(false); setIsIgSuccess(false); }}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {!isIgSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-6 pr-10">
                    <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                        <InstagramIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Vincular Instagram</h3>
                      <p className="text-xs text-pink-600 font-bold">@globalloan • Global Loan S.A.</p>
                    </div>
                </div>
                
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Conecta la cuenta oficial de Instagram de <strong className="text-gray-900">Global Loan S.A.</strong> (<strong className="text-pink-600">{igUsername}</strong>) para canalizar leads de publicidad y redes hacia el CRM.
                </p>

                {igError && <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">{igError}</div>}

                <form onSubmit={handleSaveInstagram} className="space-y-4 mb-2">
                    <div className="p-3.5 bg-pink-50/70 border border-pink-100 rounded-2xl text-xs text-pink-900 leading-relaxed">
                        <strong className="font-bold flex items-center gap-1.5 text-pink-700 mb-1">
                          💡 Conexión Inmediata:
                        </strong>
                        Solo necesitas confirmar el <strong>Usuario de Instagram</strong> y presionar el botón de abajo. Los campos de <em>Page ID</em> y <em>Token</em> son <strong>opcionales</strong> (solo requeridos si deseas que el Bot de IA responda automáticamente los mensajes directos/DMs mediante Meta for Developers).
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5 pl-1">Usuario de Instagram Oficial</label>
                        <input required type="text" value={igUsername} onChange={e => setIgUsername(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all font-medium" placeholder="@colaboratium o @globalloan" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5 pl-1">
                          <label className="text-xs font-semibold text-gray-600">Facebook Page ID / Instagram ID</label>
                          <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-full">Opcional</span>
                        </div>
                        <input type="text" value={igPageId} onChange={e => setIgPageId(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-xs font-mono" placeholder="Ej: 102938475610293 (Meta Business Suite)" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5 pl-1">
                          <label className="text-xs font-semibold text-gray-600">Meta Access Token para DMs</label>
                          <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-full">Opcional</span>
                        </div>
                        <input type="password" value={igAccessToken} onChange={e => setIgAccessToken(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-xs font-mono" placeholder="Token Meta Developers (instagram_manage_messages)" />
                    </div>
                    
                    <div className="pt-2">
                        <button 
                          disabled={savingIg}
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-pink-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {savingIg ? 'Guardando...' : `Conectar Instagram ${igUsername}`}
                        </button>
                    </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Instagram Conectado!</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-sm">
                  La cuenta oficial <strong className="text-gray-900">{igUsername}</strong> de Global Loan S.A. ha quedado vinculada exitosamente.
                </p>
                <button 
                  onClick={() => { setIsIgModalOpen(false); setIsIgSuccess(false); }}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-colors shadow-sm"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
