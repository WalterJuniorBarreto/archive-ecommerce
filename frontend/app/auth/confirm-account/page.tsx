'use client';

import { AxiosError } from 'axios';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('PROCESANDO SOLICITUD...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('TOKEN NO ENCONTRADO O URL INCOMPLETA.');
        return;
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Pequeño delay estético
        await authService.confirmAccount(token);
        setStatus('success');
        setMessage('TU CUENTA HA SIDO ACTIVADA CORRECTAMENTE.');
      } catch (error: unknown) {
        setStatus('error');
        const err = error as AxiosError;
        const data = err.response?.data;
        
        let errorMsg = 'EL ENLACE ES INVÁLIDO O HA EXPIRADO.';
        
        if (typeof data === 'string') {
            errorMsg = data;
        } else if (data && typeof data === 'object' && 'message' in data) {
            errorMsg = (data as { message: string }).message; 
        } else if (data) {
             errorMsg = JSON.stringify(data);
        }

        setMessage(errorMsg.toUpperCase());
      }
    };

    verifyToken();
  }, [token]);

  return (
    // CAJA PRINCIPAL ESTILO BRUTALISTA
    <div className="w-full max-w-lg bg-white p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
      
      {/* --- ESTADO DE CARGA --- */}
      {status === 'loading' && (
        <div className="flex flex-col items-center py-8">
           {/* Spinner Industrial */}
          <div className="w-16 h-16 border-8 border-zinc-200 border-t-black rounded-full animate-spin mb-8"></div>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">VERIFICANDO...</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            NO CIERRES ESTA PESTAÑA
          </p>
        </div>
      )}

      {/* --- ESTADO DE ÉXITO --- */}
      {status === 'success' && (
        <div className="py-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="mx-auto flex items-center justify-center h-20 w-20 bg-black text-white mb-6 border-2 border-black">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter leading-none mb-6">
            CUENTA<br/>ACTIVADA
          </h2>
          
          <div className="bg-zinc-50 border-l-4 border-black p-4 mb-8 text-left">
            <p className="text-sm font-bold uppercase text-zinc-800">
              {message}
            </p>
          </div>

          <Link 
              href="/login"
              className="block w-full py-4 bg-black text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-zinc-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all active:translate-y-1"
          >
              Iniciar Sesión
          </Link>
        </div>
      )}

      {/* --- ESTADO DE ERROR --- */}
      {status === 'error' && (
        <div className="py-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="mx-auto flex items-center justify-center h-20 w-20 border-4 border-black text-black mb-6">
            <span className="text-4xl font-black">!</span>
          </div>

          <h2 className="text-3xl font-black text-black uppercase tracking-tighter leading-none mb-6">
            ERROR DE<br/>VERIFICACIÓN
          </h2>

          <div className="bg-zinc-50 border border-black p-4 mb-8 text-left relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
            <p className="text-xs font-mono font-bold uppercase text-red-600">
              {message}
            </p>
          </div>

          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-8">
            EL ENLACE PODRÍA HABER CADUCADO.
          </p>

          <Link 
              href="/register"
              className="inline-block border-b-2 border-black pb-1 text-sm font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
              ← Volver a registrarse
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ConfirmAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative">
      {/* Fondo decorativo simple */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <Suspense fallback={
        <div className="text-xs font-bold uppercase tracking-widest border-2 border-black p-4 bg-white">
            Cargando...
        </div>
      }>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}