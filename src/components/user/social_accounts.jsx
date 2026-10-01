'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { CheckCircle2, Plus, X, MessageCircle, Save } from 'lucide-react';

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

export default function SocialAccounts() {
  const { user } = useUser();
  const [empresa, setEmpresa] = useState(null);
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const [isWpModalOpen, setIsWpModalOpen] = useState(false);
  const [isWpSuccess, setIsWpSuccess] = useState(false);
  const [savingWp, setSavingWp] = useState(false);
  const [wpError, setWpError] = useState(null);

  // WhatsApp form state
  const [webhookToken, setWebhookToken] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Fetch local user and then the enterprise
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const resUser = await fetch(`http://localhost:8080/api/users/me/${user.id}`);
        const dataUser = await resUser.json();
        
        if (dataUser && dataUser.codigo_empresa) {
          setCodigoEmpresa(dataUser.codigo_empresa);
          const resEmpresa = await fetch(`http://localhost:8080/api/empresas/${dataUser.codigo_empresa}`);
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
  }

  const networks = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50', desc: 'Conecta tu API de WhatsApp Cloud', connected: wpConnected },
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

      const res = await fetch(`http://localhost:8080/api/empresas/${codigoEmpresa}/social`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuentasVinculadas: updatedCuentas })
      });
      if (res.ok) {
        setIsWpSuccess(true);
        // update local state
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

  if (loadingData) {
    return <div className="flex justify-center mt-20 text-gray-400">Cargando cuentas sociales...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-8 relative pb-12">
      
      {/* Header card */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Cuentas Sociales</h2>
          <p className="text-gray-500 max-w-xl text-sm">
            Vincula tus redes sociales para centralizar todos los mensajes, comentarios y menciones en un solo lugar.
          </p>
        </div>
        <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Añadir cuenta
        </button>
      </div>

      {/* Grid of networks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {networks.map((network) => (
          <div key={network.id} className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col justify-between h-full border border-gray-50 hover:border-gray-200 hover:shadow-md transition-all duration-300">
            
            <div className="flex items-start justify-between mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${network.bg} ${network.color}`}>
                <network.icon className="w-8 h-8" />
              </div>
              
              {network.connected ? (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-100">
                  <CheckCircle2 className="w-4 h-4" />
                  Conectado
                </div>
              ) : (
                <div className="bg-gray-50 text-gray-500 px-4 py-2 rounded-full text-xs font-bold border border-gray-100">
                  Sin conectar
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{network.name}</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">{network.desc}</p>
              
              {network.connected ? (
                <button 
                  onClick={() => {
                    if (network.id === 'whatsapp') setIsWpModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl border-2 border-gray-100 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Configurar
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (network.id === 'whatsapp') setIsWpModalOpen(true);
                  }}
                  className={`w-full py-3.5 rounded-2xl font-bold transition-colors ${
                    network.id === 'whatsapp' 
                      ? 'bg-green-50 text-green-700 hover:bg-green-100' 
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
                    <h3 className="text-2xl font-bold text-gray-900">Vincular WhatsApp</h3>
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
                            {savingWp ? 'Conectando...' : 'Conectar WhatsApp'}
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

    </div>
  );
}
