'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { authService } from '@/services/auth.service';

export default function RegisterForm() {
  // 1. Estados
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  // 2. Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Limpiar error al escribir mejora la UX
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones Locales
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    if (!acceptedTerms) {
      setError('Debes aceptar los Términos y Condiciones.');
      return;
    }

    setStatus('loading');

    try {
      // 3. Sanitización básica
      await authService.register({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(), // Normalizar emails
        password: formData.password
      });
      
      setStatus('success');
      
    } catch (error: unknown) {
      const err = error as AxiosError;
      // Manejo robusto de errores del backend
      if (err.response) {
          if (err.response.status === 409) {
             setError('Este correo ya está registrado.');
          } else if (err.response.status === 400) {
             setError('Datos inválidos. Revisa la información.');
          } else {
             setError('Error del servidor. Intenta más tarde.');
          }
      } else {
        setError('Error de conexión. Verifica tu internet.');
      }
      setStatus('idle');
    }
  };

  // --- VISTA DE ÉXITO ---
  if (status === 'success') {
    return (
      <div className="max-w-md w-full mx-auto bg-white p-10 border border-zinc-200 shadow-xl relative overflow-hidden text-center animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
        
        <div className="mb-6 flex justify-center">
           <div className="w-20 h-20 bg-black text-white flex items-center justify-center rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
           </div>
        </div>
        <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-4">¡Registro Exitoso!</h2>
        <p className="text-zinc-500 font-medium text-sm mb-8 leading-relaxed">
          Hemos enviado un correo de confirmación a <br/>
          <strong className="text-black bg-zinc-100 px-2 py-1 rounded">{formData.email}</strong>. <br/><br/>
          Revisa tu bandeja de entrada (y spam) para activar tu cuenta.
        </p>
        <Link 
            href="/login" 
            className="inline-block w-full bg-black text-white font-black py-4 px-4 uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  // --- VISTA FORMULARIO ---
  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 md:p-10 border border-zinc-200 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>

      <h2 className="text-3xl font-black text-center mb-2 text-black uppercase tracking-tighter">
          Crear Cuenta
      </h2>
      <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">
          Únete a la comunidad Archive
      </p>
      
      {/* Mensaje de Error Accesible */}
      {error && (
        <div 
            role="alert" 
            aria-live="assertive"
            className="bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-3 mb-6 text-xs font-bold uppercase tracking-wide flex items-center gap-2 animate-pulse"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        
        {/* Nombres y Apellidos */}
        <div className="grid grid-cols-2 gap-4">
            <div className="group">
                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1 block group-focus-within:text-black transition-colors">
                    Nombre
                </label>
                <input
                    name="nombre"
                    type="text"
                    required
                    className="form-input w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                />
            </div>
            <div className="group">
                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1 block group-focus-within:text-black transition-colors">
                    Apellido
                </label>
                <input
                    name="apellido"
                    type="text"
                    required
                    className="form-input w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                />
            </div>
        </div>

        {/* Email */}
        <div className="group">
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1 block group-focus-within:text-black transition-colors">
            Correo Electrónico
          </label>
          <input
            name="email"
            type="email"
            required
            className="form-input w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Contraseña */}
        <div className="group relative">
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1 block group-focus-within:text-black transition-colors">
            Contraseña
          </label>
          <div className="relative">
            <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="form-input w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all pr-12"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black focus:outline-none transition-colors p-1"
                tabIndex={-1} // Evitar tab en este botón para fluidez
            >
                {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
            </button>
          </div>
        </div>

        {/* Confirmar Contraseña */}
        <div className="group relative">
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1 block group-focus-within:text-black transition-colors">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className={`w-full px-4 py-3 bg-zinc-50 border placeholder-zinc-300 focus:outline-none focus:bg-white focus:ring-1 transition-all pr-12 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                    ? 'border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500' 
                    : 'border-zinc-200 text-black focus:border-black focus:ring-black'
                }`}
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
            />
             <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black focus:outline-none transition-colors p-1"
                tabIndex={-1}
            >
                {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
            </button>
          </div>
        </div>

        {/* Checkbox Términos */}
        <div className="flex items-start pt-2">
            <div className="flex items-center h-5">
                <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 border border-zinc-300 rounded bg-zinc-50 focus:ring-3 focus:ring-black/20 checked:bg-black checked:border-black cursor-pointer transition-all"
                />
            </div>
            <label htmlFor="terms" className="ml-3 text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer select-none">
                He leído y acepto los <Link href="/terms" className="text-black font-bold hover:underline">Términos y Condiciones</Link>
            </label>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className={`w-full bg-black text-white font-black py-4 px-4 uppercase tracking-[0.2em] text-xs transition-all duration-300 transform active:scale-[0.99] shadow-md hover:shadow-lg ${
            status === 'loading' ? 'opacity-70 cursor-wait' : 'hover:bg-zinc-800'
          }`}
        >
          {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
              </span>
          ) : 'Crear Cuenta'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-dashed border-zinc-200 text-center">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-black font-black hover:underline ml-1 transition-colors">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}