'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { API_URL } from '@/config/api';
import { 
  AlertCircle, 
  Upload, 
  X, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  Camera, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportProblemModal({ isOpen, onClose, codigoEmpresa = 'KRZMJI' }) {
  const { user } = useUser();
  const pathname = usePathname();
  
  const [sector, setSector] = useState('Soporte');
  const [urgencia, setUrgencia] = useState('alta');
  const [descripcion, setDescripcion] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  
  const fileInputRef = useRef(null);

  // Cargar sectores/roles disponibles de la empresa
  useEffect(() => {
    if (!isOpen || !codigoEmpresa) return;
    fetch(`${API_URL}/empresas/${codigoEmpresa}/roles`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRoles(data);
        }
      })
      .catch(() => {});
  }, [isOpen, codigoEmpresa]);

  // Manejar captura de imagen desde input o portapapeles
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen (PNG, JPG, WEBP).');
        return;
      }
      setScreenshotFile(file);
      const url = URL.createObjectURL(file);
      setScreenshotPreview(url);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            setScreenshotFile(blob);
            setScreenshotPreview(URL.createObjectURL(blob));
            toast.info('Captura pegada desde el portapapeles');
            break;
          }
        }
      }
    }
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      toast.error('Por favor escribe una breve descripción del problema');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('sector', sector);
      formData.append('descripcion', descripcion.trim());
      formData.append('urgencia', urgencia);
      formData.append('user_name', user?.fullName || user?.firstName || 'Usuario');
      formData.append('user_email', user?.primaryEmailAddress?.emailAddress || '');
      formData.append('clerk_id', user?.id || '');
      formData.append('path_origen', pathname || '/dashboard');

      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await fetch(`${API_URL}/empresas/${codigoEmpresa}/tickets/report-problem`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Ticket #${data.ticketId} creado y derivado a ${sector} con urgencia ${urgencia.toUpperCase()}`);
        setDescripcion('');
        removeScreenshot();
        onClose();
      } else {
        toast.error(data.error || 'Ocurrió un error al reportar el problema');
      }
    } catch (err) {
      console.error('Error reporting problem:', err);
      toast.error('Error de conexión al enviar el reporte');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const defaultSectors = ['Soporte', 'Creditos', 'Asesores', 'Lideres', 'Inversores', 'TEAM', 'Master / Admin'];
  const sectorOptions = roles.length > 0 
    ? Array.from(new Set([...roles.map(r => r.nombre), ...defaultSectors]))
    : defaultSectors;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onPaste={handlePaste}
    >
      <div 
        className="w-full max-w-lg bg-gray-950 border border-white/15 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-950/60 via-gray-900 to-gray-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Reportar Problema / Ticket
              </h3>
              <p className="text-xs text-gray-400">
                Se abrirá un ticket con tu trazabilidad de usuario
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Trazabilidad info */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs text-gray-300">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Solicitante</span>
              <span className="font-semibold text-white">{user?.fullName || user?.firstName || 'Usuario Actual'}</span>
              <span className="text-gray-400 block text-[11px] font-mono">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Origen</span>
              <span className="font-mono text-[11px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md">
                {pathname || '/dashboard'}
              </span>
            </div>
          </div>

          {/* Sector al cual se delega */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">
              Sector al que se delega el ticket <span className="text-rose-400">*</span>
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/15 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-rose-500 transition"
            >
              {sectorOptions.map((s, idx) => (
                <option key={idx} value={s} className="bg-gray-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Nivel de Urgencia */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">
              Nivel de Urgencia <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'baja', label: 'Baja', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
                { id: 'media', label: 'Media', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
                { id: 'alta', label: 'Alta', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
                { id: 'urgente', label: 'Urgente', color: 'border-rose-500/40 text-rose-400 bg-rose-500/20' }
              ].map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUrgencia(u.id)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-black border transition-all ${
                    urgencia === u.id
                      ? `${u.color} ring-2 ring-white/30 scale-102 shadow-sm`
                      : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-white'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción corta */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">
              Descripción corta del problema <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explica qué ocurrió, qué falló o qué se requiere resolver..."
              className="w-full bg-white/[0.06] border border-white/15 rounded-2xl p-3.5 text-xs text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-rose-500 transition resize-none font-medium"
            />
          </div>

          {/* Subir Captura de Pantalla */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-rose-400" />
                Subir captura o pegar (Ctrl + V)
              </label>
              <span className="text-[10px] text-gray-400">Opcional</span>
            </div>

            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!screenshotPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/15 hover:border-rose-500/50 rounded-2xl p-4 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-rose-500/20 text-gray-300 group-hover:text-rose-400 flex items-center justify-center transition">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-200">Hacé clic para adjuntar imagen o captura</p>
                  <p className="text-[10px] text-gray-400">o presiona Ctrl+V para pegar directamente</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-white/20 bg-white/[0.05] p-2 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img 
                    src={screenshotPreview} 
                    alt="Preview" 
                    className="w-14 h-14 rounded-xl object-cover border border-white/20 shrink-0" 
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate max-w-[200px]">
                      {screenshotFile?.name || 'Captura de pantalla'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {screenshotFile?.size ? `${Math.round(screenshotFile.size / 1024)} KB` : 'Imagen adjunta'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Quitar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !descripcion.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando y abriendo ticket...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Enviar Reporte y Abrir Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
