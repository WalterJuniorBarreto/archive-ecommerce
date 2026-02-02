'use client'; 

import Link from "next/link";
import { useAuth } from '@/context/AuthContext'; 
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import GoogleButton from './GoogleButton'; 

export default function LoginForm() {
    const { login } = useAuth(); 
    const router = useRouter();
    
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ✅ MEJORA 1: Limpiamos el error SOLO cuando el usuario escribe para corregirlo
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); // Solo limpia si ya había un error visible
    };

    const handleSubmit = async (e: React.FormEvent) => {
        // ✅ MEJORA 2: Lo primero es prevenir el comportamiento por defecto
        e.preventDefault();
        
        // Limpiamos estados previos
        setError('');
        
        // ✅ MEJORA 3: Validación Manual (Frontend)
        // Esto evita que salga "Error inesperado" si envías campos vacíos
        if (!formData.email.trim()) {
            setError('Por favor, completa el correo electrónico.');
            return; // Detenemos la función aquí. No se envía nada al server.
        }

        if (!formData.password) {
            setError('Por favor, ingresa tu contraseña.');
            return; // Detenemos la función aquí.
        }

        // Si pasa las validaciones, activamos carga
        setLoading(true);

        try {
            await login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });
            // Si todo sale bien, el AuthContext redirigirá.
            
        } catch (err: any) {
            console.error("Login Error:", err);
            
            // ✅ MEJORA 4: Mensajes de error específicos y persistentes
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setError('Correo o contraseña incorrectos.');
            } else if (err?.code === 'ERR_NETWORK') {
                setError('No hay conexión con el servidor.');
            } else {
                setError('Ocurrió un error inesperado. Inténtalo más tarde.');
            }
        } finally {
            // ✅ MEJORA 5: El finally asegura que el loading se quite SIEMPRE,
            // pero el error se queda visible hasta que el usuario escriba.
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto bg-white p-8 md:p-10 border border-zinc-200 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>

            <h2 className="text-3xl font-black text-center mb-2 text-black uppercase tracking-tighter">
                Bienvenido
            </h2>
            <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">
                Ingresa a tu cuenta
            </p>
            
            {/* Caja de Error: Se mantendrá visible gracias a la lógica del handleSubmit */}
            {error && (
                <div 
                    className="bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-3 mb-6 text-xs font-bold uppercase tracking-wide flex items-center gap-2 animate-pulse"
                    role="alert"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Agregamos noValidate para desactivar los globos del navegador y usar nuestras alertas rojas */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                
                {/* Email */}
                <div className="group">
                    <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 group-focus-within:text-black transition-colors">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        name="email" // Importante para el handleChange
                        className={`w-full px-4 py-3 bg-zinc-50 border text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:ring-1 transition-all duration-300 ${
                            error && !formData.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-200 focus:border-black focus:ring-black'
                        }`}
                        placeholder="nombre@ejemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                {/* Contraseña */}
                <div className="group">
                    <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 group-focus-within:text-black transition-colors">
                        Contraseña
                    </label>
                    
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password" // Importante para el handleChange
                            className={`w-full px-4 py-3 bg-zinc-50 border text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:ring-1 transition-all duration-300 pr-12 ${
                                error && !formData.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-200 focus:border-black focus:ring-black'
                            }`}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black focus:outline-none transition-colors p-1"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            )}
                        </button>
                    </div>

                    <div className="flex justify-end mt-2">
                         <Link href="/auth/forgot-password" className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider hover:text-black hover:underline transition-colors">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-black text-white font-black py-4 px-4 uppercase tracking-[0.2em] text-xs transition-all duration-300 transform active:scale-[0.98] shadow-md hover:shadow-lg ${
                        loading ? 'opacity-70 cursor-wait' : 'hover:bg-zinc-800'
                    }`}
                >
                    {loading ? 'Validando...' : 'Iniciar Sesión'}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white text-zinc-400 font-bold uppercase tracking-widest">
                        O continúa con
                    </span>
                </div>
            </div>

            <div className="mb-8">
                <GoogleButton />
            </div>

            <div className="mt-6 pt-6 border-t border-dashed border-zinc-200 text-center">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                    ¿No tienes cuenta?{' '}
                    <Link href="/register" className="text-black font-black hover:underline ml-1 transition-colors">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}