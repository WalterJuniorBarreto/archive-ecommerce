'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/user.service';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast'; // Usamos toast en lugar de mensajes locales para consistencia

// --- 1. SCHEMAS DE VALIDACIÓN (DevOps: Lógica centralizada y testeable) ---
const passwordSchema = z.object({
  oldPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[0-9]/, "Debe tener al menos un número"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

// --- 2. COMPONENTE REUTILIZABLE (Tipado estricto) ---
interface PasswordInputProps {
  label: string;
  placeholder?: string;
  error?: string;
  registration: any; // Props de react-hook-form
}

const PasswordInput = ({ label, placeholder, error, registration }: PasswordInputProps) => {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    className={`w-full bg-white border px-4 py-3 rounded-md text-sm focus:outline-none transition-all pr-10
                        ${error 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-black focus:ring-1 focus:ring-black'
                        }`}
                    {...registration}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none p-1"
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} // A11y para Lighthouse
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
            {/* Feedback de error inmediato */}
            {error && <span className="text-xs text-red-500 font-medium animate-pulse">{error}</span>}
        </div>
    );
};

// --- 3. COMPONENTE PRINCIPAL ---
export default function ChangePasswordForm() {
  const { user } = useAuth();
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange' // Validación en tiempo real (Mejor UX)
  });

  // CASO GOOGLE
  if (user?.authProvider === 'GOOGLE') {
      return (
        <div className="max-w-2xl animate-fade-in">
            <div className="mb-8 border-b pb-4">
                <h2 className="text-xl font-black uppercase tracking-tighter text-black">Seguridad</h2>
                <p className="text-sm text-gray-500 mt-1">Gestión de credenciales.</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-10 flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-6 border border-zinc-100">
                    <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.449 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                    </svg>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-black mb-3">Cuenta de Google</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed mb-6">Tu seguridad es gestionada directamente por Google.</p>
            </div>
        </div>
      );
  }

  // LOGICA DE ENVIO
  const onSubmit = async (data: PasswordFormData) => {
    try {
      await userService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });

      toast.success('¡Contraseña actualizada!', { duration: 4000 });
      reset(); // Limpia el formulario automáticamente
      
    } catch (error: any) {
      // Manejo de errores defensivo para producción
      const msg = error.response?.data?.message || 'Error al actualizar credenciales';
      toast.error(msg);
      console.error("[Security] Password update failed:", error); // Log interno para monitoreo
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
        <div className="mb-8 border-b pb-4">
            <h2 className="text-xl font-black uppercase tracking-tighter text-black">Seguridad</h2>
            <p className="text-sm text-gray-500 mt-1">Protege tu cuenta actualizando tu contraseña periódicamente.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Paso 1: Verificación</h3>
                
                <PasswordInput 
                    label="Contraseña Actual"
                    placeholder="••••••••"
                    registration={register('oldPassword')}
                    error={errors.oldPassword?.message}
                />
                
                <div className="mt-2 text-right">
                    <Link 
                        href="/auth/forgot-password?from=profile" 
                        className="text-xs text-zinc-500 hover:text-black underline underline-offset-2 transition-colors"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Paso 2: Nueva Contraseña</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PasswordInput 
                        label="Nueva Contraseña"
                        placeholder="Mínimo 8 caracteres"
                        registration={register('newPassword')}
                        error={errors.newPassword?.message}
                    />

                    <PasswordInput 
                        label="Confirmar Contraseña"
                        placeholder="Repite la contraseña"
                        registration={register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                    />
                </div>
                
                {/* Visual Aid para UX */}
                <div className="mt-4 text-xs text-gray-400 leading-relaxed flex gap-2 items-center">
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Seguridad: Incluye mayúsculas, minúsculas y números.
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black text-white px-8 py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2"
                >
                    {isSubmitting && (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    )}
                    {isSubmitting ? 'Guardando...' : 'Actualizar Contraseña'}
                </button>
            </div>
        </form>
    </div>
  );
}