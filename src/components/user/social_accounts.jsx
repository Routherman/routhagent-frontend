"use client";
import React, { useState } from 'react';
import { CheckCircle2, Plus, X } from 'lucide-react';

// Using simple SVG for TikTok since Lucide doesn't have it natively sometimes
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isMetaSuccess, setIsMetaSuccess] = useState(false);

  const [networks, setNetworks] = useState([
    { id: 'meta', name: 'Ecosistema Meta', icon: FacebookIcon, color: 'text-blue-600', desc: 'Conecta Facebook, Instagram y WhatsApp Business', connected: false },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'text-black', desc: 'Gestiona tu presencia y mensajes en TikTok', connected: false },
    { id: 'x', name: 'X (Twitter)', icon: XIcon, color: 'text-black', desc: 'Integra tus DMs y menciones de X', connected: false },
    { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: 'text-red-600', desc: 'Administra los comentarios de tus videos', connected: false },
  ]);

  const handleMetaLogin = () => {
    if (typeof window === 'undefined' || !window.FB) {
      console.error('Facebook SDK not loaded yet.');
      return;
    }
    
    window.FB.login(function(response) {
      if (response.authResponse) {
        const code = response.authResponse.code;
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/meta`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        })
        .then(res => res.json())
        .then(data => {
          console.log('Backend response:', data);
          setIsMetaSuccess(true);
        })
        .catch(err => console.error('Error sending code to backend:', err));
      } else {
        console.log('Usuario canceló login');
      }
    }, {
      config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      scope: ''
    });
  };


  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-8 relative">
      
      {/* Header card */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-gray-800 mb-2">Cuentas Sociales</h2>
          <p className="text-gray-500 max-w-xl">
            Vincula tus redes sociales para centralizar todos los mensajes, comentarios y menciones en un solo lugar.
          </p>
        </div>
        <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Añadir cuenta
        </button>
      </div>

      {/* Grid of networks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {networks.map((network) => (
          <div key={network.id} className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-full border border-gray-100/50 hover:shadow-md transition-shadow">
            
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center ${network.color}`}>
                <network.icon className="w-8 h-8" />
              </div>
              
              {network.connected ? (
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-green-100">
                  <CheckCircle2 className="w-4 h-4" />
                  Conectado
                </div>
              ) : (
                <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold">
                  Sin conectar
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-1">{network.name}</h3>
              <p className="text-gray-500 text-sm mb-6">{network.desc}</p>
              
              {network.connected ? (
                <button className="w-full py-3 rounded-xl border-2 border-gray-100 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Configurar
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (network.id === 'meta') setIsMetaModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-[#E8F0FE] text-blue-700 font-medium hover:bg-[#D2E3FC] transition-colors"
                >
                  Vincular
                </button>
              )}
            </div>
            
          </div>
        ))}
      </div>
      {/* Meta Modal */}
      {isMetaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setIsMetaModalOpen(false); setIsMetaSuccess(false); }}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {!isMetaSuccess ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 pr-8">Antes de conectar, verifica tu Centro de Cuentas</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Para vincular WhatsApp, Instagram, Messenger y Threads en 1 clic, todo debe estar unificado en el mismo Portafolio.
                </p>

                <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
                      Facebook como admin
                    </h4>
                    <p className="text-xs text-gray-600 ml-8 mb-2"><span className="font-semibold text-orange-600">IMPORTANTE:</span> Usá el Facebook que es Administrador en business.facebook.com</p>
                    <a href="https://accountscenter.facebook.com/" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline ml-8">
                      accountscenter.facebook.com
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs">2</span>
                      Instagram Profesional
                    </h4>
                    <p className="text-xs text-gray-600 ml-8">Cuenta de Empresa vinculada a una Página de Facebook</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs">3</span>
                      Página de Facebook
                    </h4>
                    <p className="text-xs text-gray-600 ml-8">Debe estar conectada a tu IG y con mensajería activa</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs">4</span>
                      WhatsApp Business
                    </h4>
                    <p className="text-xs text-gray-600 ml-8">Tu WABA debe estar en el mismo Portafolio Comercial que tu Página</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs">5</span>
                      Threads
                    </h4>
                    <p className="text-xs text-gray-600 ml-8">Creado desde esa misma cuenta de Instagram</p>
                  </div>

                </div>

                <button 
                  onClick={handleMetaLogin}
                  className="w-full bg-[#0866FF] hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Continuar con Facebook
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Conexión Exitosa!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Las siguientes cuentas han sido vinculadas a tu ecosistema:
                </p>
                
                <div className="flex flex-col gap-2 w-full mb-8">
                   <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm font-medium text-gray-700 flex items-center justify-center">
                     WhatsApp Business
                   </div>
                   <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm font-medium text-gray-700 flex items-center justify-center">
                     Instagram Profesional
                   </div>
                   <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm font-medium text-gray-700 flex items-center justify-center">
                     Messenger
                   </div>
                   <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm font-medium text-gray-700 flex items-center justify-center">
                     Threads
                   </div>
                </div>

                <button 
                  onClick={() => {
                    setNetworks(prev => prev.map(n => n.id === 'meta' ? { ...n, connected: true } : n));
                    setIsMetaModalOpen(false);
                    setIsMetaSuccess(false);
                  }}
                  className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm"
                >
                  Guardar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
