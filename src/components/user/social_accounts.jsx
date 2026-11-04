'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { CheckCircle2, Plus, X, MessageCircle, Save, ExternalLink } from 'lucide-react';
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

  // WhatsApp modal state
  const [isWpModalOpen, setIsWpModalOpen] = useState(false);
  const [isWpSuccess, setIsWpSuccess] = useState(false);
  const [savingWp, setSavingWp] = useState(false);
  const [wpError, setWpError] = useState(null);

  const [webhookToken, setWebhookToken] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Instagram modal state
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
            if (cv && cv.instagram) {
                setIgUsername(cv.instagram.username || '@colaboratium');
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
    if (currentCuentas.instagram && (currentCuentas.instagram.connected || currentCuentas.instagram.username)) {
        igConnected = true;
    }
  }

  const networks = [
    { 
      id: 'whatsapp', 
      name: 'WhatsApp Business', 
      icon: MessageCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      desc: 'Conecta tu API de WhatsApp Cloud de Meta para mensajes y bots', 
      connected: wpConnected 
    },
    { 
      id: 'instagram', 
      name: 'Instagram (@colaboratium)', 
      icon: InstagramIcon, 
      color: 'text-pink-600', 
      bg: 'bg-pink-50', 
      desc: 'Vincula la cuenta oficial @colaboratium vía Meta Graph API', 
      connected: igConnected,
      url: 'https://www.instagram.com/colaboratium/'
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
            access_token: accessToken
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
            account_id: 'colaboratium',
            profile_url: `https://www.instagram.com/${cleanUsername.replace('@', '')}/`,
            meta_page_id: igPageId || 'colaboratium_meta_page',
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Cuentas Sociales & Redes</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            Vincula tus canales oficiales de Meta (WhatsApp Cloud API e Instagram @colaboratium) para centralizar la prospección, mensajes y métricas del CRM.
          </p>
        </div>
      </div>

      {/* Grid of networks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {networks.map((network) => (
          <div key={network.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            
            <div className="flex items-center justify-between mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${network.bg} ${network.color}`}>
                <network.icon className="w-7 h-7" />
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
                    if (network.id === 'instagram') setIsIgModalOpen(true);
                  }}
                  className={`w-full py-3.5 rounded-2xl font-bold transition-colors ${
                    network.id === 'whatsapp' 
                      ? 'bg-green-50 text-green-700 hover:bg-green-100' 
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

      {/* WhatsApp Modal */}
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
                    <h3 className="text-2xl font-bold text-gray-900">Vincular WhatsApp Business</h3>
                </div>
                
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Ingresa las credenciales de tu API de WhatsApp Cloud (Meta para Desarrolladores) para conectar tu línea con la plataforma.
                </p>

                {wpError && <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">{wpError}</div>}

                <form onSubmit={handleSaveWhatsApp} className="space-y-5 mb-2">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Webhook Token</label>
                        <input required type="text" value={webhookToken} onChange={e => setWebhookToken(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium" placeholder="Token secreto para el Webhook" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Phone ID</label>
                        <input required type="text" value={phoneId} onChange={e => setPhoneId(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium" placeholder="Identificador del número de teléfono" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Access Token</label>
                        <input required type="text" value={accessToken} onChange={e => setAccessToken(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium" placeholder="Token de acceso (Permanente o temporal)" />
                    </div>
                    
                    <div className="pt-4">
                        <button 
                        disabled={savingWp}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {savingWp ? 'Conectando...' : 'Guardar y Conectar WhatsApp'}
                        </button>
                    </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Conexión Exitosa!</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-sm">
                  Tus credenciales han sido guardadas. Ahora tu plataforma puede enviar y recibir mensajes de WhatsApp a través del bot.
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

      {/* Instagram Modal */}
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
                      <p className="text-xs text-pink-600 font-bold">@colaboratium • Meta Graph API</p>
                    </div>
                </div>
                
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Conecta la cuenta de Instagram de <strong className="text-gray-900">@colaboratium</strong> para captar leads desde historias, mensajes directos (DMs) y reels con la IA.
                </p>

                {igError && <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">{igError}</div>}

                <form onSubmit={handleSaveInstagram} className="space-y-5 mb-2">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Usuario de Instagram</label>
                        <input required type="text" value={igUsername} onChange={e => setIgUsername(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all font-medium" placeholder="@colaboratium" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Meta Facebook Page ID / Instagram Account ID</label>
                        <input type="text" value={igPageId} onChange={e => setIgPageId(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all font-medium" placeholder="ID de la Página o Instagram Business" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Meta Access Token (Opcional si usa el de WhatsApp)</label>
                        <input type="text" value={igAccessToken} onChange={e => setIgAccessToken(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all font-medium" placeholder="Token con permisos instagram_manage_messages" />
                    </div>
                    
                    <div className="pt-4">
                        <button 
                          disabled={savingIg}
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {savingIg ? 'Guardando...' : 'Conectar Instagram @colaboratium'}
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
                  La cuenta <strong className="text-gray-900">@colaboratium</strong> ha quedado registrada en Colaboratium.
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
