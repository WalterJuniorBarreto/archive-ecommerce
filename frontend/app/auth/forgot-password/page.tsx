'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import Link from 'next/link';
import { AxiosError } from 'axios';

// --- COMPONENTE VISUAL: INPUT CON OJO ---
const PasswordInput = ({ placeholder, value, onChange, show, setShow }: any) => (
  <div className="relative group">
    <input 
      type={show ? "text" : "password"} 
      required 
      minLength={8}
      placeholder={placeholder}
      className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all pr-12 font-medium placeholder-gray-400"
      value={value}
      onChange={onChange}
    />
    <button
      type="button"
      onClick={() => setShow(!show)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors p-1"
      tabIndex={-1}
    >
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  </div>
);

// --- PÁGINA PRINCIPAL ---
function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromProfile = searchParams.get('from') === 'profile';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [step, timeLeft]);

  // Limpiar mensajes
  useEffect(() => {
    setError('');
    setSuccessMessage('');
  }, [step]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.sendRecoveryCode(email);
      setStep(2);
      setTimeLeft(30);
    } catch (err: unknown) {
      const error = err as AxiosError;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const msg = (error.response?.data as any)?.message || 'Error al enviar código.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await authService.sendRecoveryCode(email);
      setTimeLeft(30);
      setSuccessMessage("¡Nuevo código enviado con éxito!");
    } catch {
      setError('Error al reenviar código.');
    } finally {
      setLoading(false);
    }
  };

  // --- AQUÍ ESTÁ LA CORRECCIÓN CLAVE ---
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
        setError('El código debe tener 6 dígitos');
        return;
    }
    
    setLoading(true); // Activamos carga
    setError('');

    try {
        // VALIDAMOS CON EL BACKEND ANTES DE PASAR
        await authService.verifyRecoveryCode(email, code);
        setStep(3);
    } catch (err: unknown) {
        const error = err as AxiosError;
        // Si el código está mal, el backend lanza error y lo mostramos aquí
        const msg = (error.response?.data as any)?.message || 'El código es incorrecto o ha expirado.';
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
    }
    setLoading(true);
    setError('');
    
    try {
        await authService.resetPassword(email, code, newPassword);
        setSuccessMessage('¡Contraseña actualizada correctamente!');
        
        setTimeout(() => {
            if (fromProfile) {
                router.push('/profile/seguridad');
            } else {
                router.push('/login');
            }
        }, 1500);

    } catch {
        setError('Ocurrió un error al cambiar la contraseña. Intenta de nuevo.');
        // No regresamos al paso 2 automáticamente para no frustrar al usuario, 
        // pero el botón de backend fallará si el código ya expiró.
    } finally {
        setLoading(false);
    }
  };
  
  return (
      <div className="max-w-md w-full bg-white p-8 md:p-10 border border-zinc-200 shadow-xl rounded-none relative">
        
        {/* HEADER */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-black">
                Recuperar<br/>Acceso
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                {step === 1 && "Ingresa tu email para continuar"}
                {step === 2 && "Verifica tu identidad"}
                {step === 3 && "Protege tu cuenta"}
            </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 animate-fade-in">
                <span className="text-red-500 font-bold">✕</span>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{error}</p>
            </div>
        )}

        {/* ÉXITO */}
        {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 flex items-center gap-3 animate-fade-in">
                <span className="text-green-500 font-bold">✓</span>
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide">{successMessage}</p>
            </div>
        )}

        {/* --- PASO 1 --- */}
        {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Registrado</label>
                    <input 
                        type="email" 
                        required 
                        placeholder="Correo electronico"
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm font-medium focus:outline-none focus:border-black focus:bg-white transition-all placeholder-zinc-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all disabled:opacity-50 hover:-translate-y-1 shadow-lg cursor-pointer">
                    {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
            </form>
        )}

        {/* --- PASO 2 --- */}
        {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-8">
                <div className="text-center">
                    <p className="text-sm text-zinc-600 mb-4">
                        Enviamos un código a <span className="font-bold text-black">{email}</span>
                    </p>
                    <input 
                        type="text" 
                        required 
                        maxLength={6}
                        placeholder="000000"
                        className="w-full border-b-2 border-zinc-200 py-2 text-center text-4xl font-black tracking-[0.5em] focus:outline-none focus:border-black transition-colors bg-transparent placeholder-zinc-200"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} 
                    />
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-lg cursor-pointer disabled:opacity-50">
                    {loading ? 'Verificando...' : 'Verificar Código'}
                </button>
                
                <div className="text-center">
                    {timeLeft > 0 ? (
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Reenviar en {timeLeft}s
                        </p>
                    ) : (
                        <button 
                            type="button" 
                            onClick={handleResendCode}
                            disabled={loading}
                            className="text-xs font-bold text-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4 cursor-pointer"
                        >
                            Reenviar Código
                        </button>
                    )}
                </div>
                
                <button type="button" onClick={() => setStep(1)} className="block w-full text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors cursor-pointer">
                    Cambiar Correo
                </button>
            </form>
        )}

        {/* --- PASO 3 --- */}
        {step === 3 && (
            <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Nueva Contraseña</label>
                        <PasswordInput 
                            placeholder="Nueva Contraseña"
                            value={newPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                            show={showPassword}
                            setShow={setShowPassword}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Confirmar</label>
                        <PasswordInput 
                            placeholder="Confirmar Contraseña"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            show={showConfirmPassword}
                            setShow={setShowConfirmPassword}
                        />
                    </div>
                </div>

                <div className="text-xs text-zinc-400 leading-relaxed font-medium">
                    * Usa una combinación de letras mayúsculas, minúsculas y números para mayor seguridad.
                </div>

                <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all disabled:opacity-50 hover:-translate-y-1 shadow-lg cursor-pointer">
                    {loading ? 'Procesando...' : 'Cambiar Contraseña'}
                </button>
            </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            {fromProfile ? (
                 <Link href="/profile/seguridad" className="text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-black transition-colors">
                    ← Volver a Seguridad
                 </Link>
            ) : (
                 <Link href="/login" className="text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-black transition-colors">
                    ← Volver al Login
                 </Link>
            )}
        </div>

      </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <Suspense fallback={<div>Cargando...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    </div>
  );
}