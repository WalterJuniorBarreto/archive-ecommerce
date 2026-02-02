'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';
import { UserProfile, AdminUserFormData } from '@/types/product.types';
import { toast } from 'react-hot-toast';

interface Props {
  initialData?: UserProfile;
}

export default function UserForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 👁️ ESTADO PARA VER LA CONTRASEÑA
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<AdminUserFormData>({
    nombre: initialData?.nombre || '',
    apellido: initialData?.apellido || '',
    email: initialData?.email || '',
    password: '', 
    // 🧠 LÓGICA INTELEGENTE: Si viene de la BD como 'ROLE_ADMIN', lo convertimos a 'ADMIN' para el select
    rol: initialData?.rol ? initialData.rol.replace('ROLE_', '') : 'USER'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. VALIDACIONES
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
        toast.error("Nombre, Apellido y Email son obligatorios.");
        return;
    }

    // Validar contraseña solo si es CREACIÓN o si el usuario escribió algo en EDICIÓN
    if (!initialData && (!formData.password || formData.password.length < 6)) {
        toast.error("La contraseña es obligatoria y debe tener mín. 6 caracteres.");
        return;
    }
    if (initialData && formData.password && formData.password.length < 6) {
        toast.error("La nueva contraseña debe tener mín. 6 caracteres.");
        return;
    }

    setLoading(true);
    const toastId = toast.loading("Procesando solicitud...");

    try {
      // 2. PREPARAR DATOS (Payload)
      const payload = {
        ...formData,
        nombre: formData.nombre.trim().toUpperCase(),
        apellido: formData.apellido.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password || undefined, // Si está vacío, no se envía
        authProvider: 'LOCAL' // 👈 ESTO EVITA EL ERROR DE SQL
      };

      console.log("Enviando Payload:", payload);

      if (initialData) {
        await userService.update(initialData.id, payload);
        toast.success('Usuario actualizado correctamente', { id: toastId });
      } else {
        await userService.create(payload);
        toast.success('Usuario creado correctamente', { id: toastId });
      }

      router.refresh(); 
      router.push('/admin/users'); 

    } catch (error: any) {
      console.error("User Form Error:", error);
      if (error?.response?.status === 409) {
          toast.error("El correo electrónico ya está registrado.", { id: toastId });
      } else {
          toast.error("Error al guardar. Verifica los datos.", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ENCABEZADO */}
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white ${initialData ? 'bg-zinc-800' : 'bg-black'}`}>
                    {initialData ? 'EDICIÓN' : 'NUEVO REGISTRO'}
                </span>
            </div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter">
                {initialData ? 'Editar Usuario' : 'Crear Usuario'}
            </h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>

            <div className="p-8 md:p-10 space-y-10">
                
                {/* DATOS PERSONALES */}
                <div>
                    <h3 className="text-xs font-bold text-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-6">
                        Información Personal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Nombre</label>
                            <input 
                                name="nombre" 
                                type="text" 
                                required 
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-black uppercase transition-colors"
                                placeholder="EJ. CARLOS"
                                value={formData.nombre} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="group">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Apellido</label>
                            <input 
                                name="apellido" 
                                type="text" 
                                required 
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-black uppercase transition-colors"
                                placeholder="EJ. SÁNCHEZ"
                                value={formData.apellido} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>
                </div>

                {/* ACCESO */}
                <div>
                    <h3 className="text-xs font-bold text-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-6">
                        Credenciales de Acceso
                    </h3>
                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Email</label>
                            <input 
                                name="email" 
                                type="email" 
                                required 
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-black transition-colors"
                                placeholder="usuario@ejemplo.com"
                                value={formData.email} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* 👁️ CONTRASEÑA CON OJO */}
                            <div className="group relative">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                                    {initialData ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                                </label>
                                <div className="relative">
                                    <input 
                                        name="password" 
                                        // CAMBIO DE TIPO DINÁMICO
                                        type={showPassword ? "text" : "password"} 
                                        required={!initialData} 
                                        minLength={6}
                                        className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-black transition-colors pr-10"
                                        placeholder={initialData ? "••••••••" : "Mínimo 6 caracteres"}
                                        value={formData.password} 
                                        onChange={handleChange} 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        )}
                                    </button>
                                </div>
                                {initialData && <p className="text-[9px] text-zinc-400 mt-1">* Dejar vacío para mantener la actual.</p>}
                            </div>

                            <div className="group">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Rol de Sistema</label>
                                <div className="relative">
                                    <select 
                                        name="rol" 
                                        className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-black appearance-none cursor-pointer"
                                        value={formData.rol} 
                                        onChange={handleChange}
                                    >
                                        <option value="USER">CLIENTE / USUARIO</option>
                                        <option value="ADMIN">ADMINISTRADOR</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="bg-zinc-50 px-8 py-6 border-t border-zinc-200 flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-zinc-300 font-bold text-xs uppercase hover:bg-white transition-colors">
                    Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-black text-white font-bold text-xs uppercase hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Guardando...
                        </>
                    ) : (
                        initialData ? 'Guardar Cambios' : 'Crear Usuario'
                    )}
                </button>
            </div>
        </form>
    </div>
  );
}