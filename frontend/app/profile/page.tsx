'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/user.service';
import { UserProfileUpdateRequest } from '@/types/product.types'; // Asegura ruta de tipos
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<UserProfileUpdateRequest>({
    nombre: '', apellido: '', dni: '', telefono: '', genero: '', fechaNacimiento: ''
  });

  // 1. LÓGICA DE FECHA (Extremadamente limpia)
  // Calcula la fecha máxima permitida (hace 18 años exactos desde hoy)
  const maxDateAllowed = new Date(new Date().setFullYear(new Date().getFullYear() - 18))
    .toISOString()
    .split('T')[0];

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        dni: user.dni || '',
        telefono: user.telefono || '',
        genero: user.genero || '',
        fechaNacimiento: user.fechaNacimiento || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Toast de carga (UX Profesional)
    const toastId = toast.loading("Actualizando perfil...");

    try {
      // 2. SANITIZACIÓN DE DATOS (DevOps Standard)
      // Antes de enviar, limpiamos espacios y forzamos formato (ej: mayúsculas)
      const payload: UserProfileUpdateRequest = {
          ...formData,
          nombre: formData.nombre?.trim().toUpperCase(),
          apellido: formData.apellido?.trim().toUpperCase(),
          dni: formData.dni?.trim(),
          telefono: formData.telefono?.trim()
      };

      await userService.updateProfile(payload);
      
      toast.success('Perfil actualizado correctamente', { id: toastId });

    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar. Verifica tus datos.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // 3. ESTILOS REUTILIZABLES (DRY - Mantenibilidad)
  const labelClass = "text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block";
  const inputClass = "w-full bg-white border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-none";

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex items-center justify-between mb-10 border-b border-zinc-200 pb-6">
          <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Mi Perfil</h2>
              <p className="text-sm text-zinc-500 mt-1 font-medium">Gestiona tu identidad y datos de contacto.</p>
          </div>
          
          {/* Avatar con iniciales */}
          <div className="hidden sm:flex h-16 w-16 bg-black text-white rounded-full items-center justify-center border-4 border-zinc-100 shadow-sm">
              <span className="text-2xl font-black uppercase tracking-tighter">
                  {user?.nombre?.charAt(0) || 'U'}
              </span>
          </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* GRUPO 1: IDENTIDAD */}
        <div className="bg-zinc-50 p-8 border border-zinc-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span> Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nombre */}
                <div>
                    <label className={labelClass}>Nombre</label>
                    <input 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        className={`${inputClass} uppercase`}
                    />
                </div>

                {/* Apellido */}
                <div>
                    <label className={labelClass}>Apellido</label>
                    <input 
                        name="apellido" 
                        value={formData.apellido} 
                        onChange={handleChange} 
                        className={`${inputClass} uppercase`}
                    />
                </div>

                {/* Email (Read Only) */}
                <div className="md:col-span-2">
                    <label className={labelClass}>Correo Electrónico</label>
                    <div className="relative">
                        <input 
                            value={user?.email || ''} 
                            disabled 
                            className="w-full bg-zinc-200 border border-zinc-300 px-4 py-3 text-sm text-zinc-500 cursor-not-allowed font-medium"
                        />
                        <span className="absolute right-4 top-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-400 px-2 py-0.5 rounded">
                            Protegido
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* GRUPO 2: DETALLES */}
        <div className="bg-white p-8 border border-zinc-200 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-zinc-300 rounded-full"></span> Datos Adicionales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* DNI */}
                <div>
                    <label className={labelClass}>DNI / Documento</label>
                    <input 
                        name="dni" 
                        value={formData.dni} 
                        onChange={handleChange} 
                        className={inputClass}
                        placeholder="Ej: 77123456" 
                    />
                </div>

                {/* Teléfono */}
                <div>
                    <label className={labelClass}>Teléfono</label>
                    <input 
                        name="telefono" 
                        value={formData.telefono} 
                        onChange={handleChange} 
                        className={inputClass}
                        placeholder="Ej: 987 654 321" 
                    />
                </div>

                {/* Género */}
                <div>
                    <label className={labelClass}>Género</label>
                    <div className="relative">
                        <select 
                            name="genero" 
                            value={formData.genero} 
                            onChange={handleChange} 
                            className={`${inputClass} appearance-none cursor-pointer`}
                        >
                            <option value="">-- Seleccionar --</option>
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMENINO">Femenino</option>
                            <option value="OTRO">Otro</option>
                        </select>
                        <div className="absolute right-4 top-3.5 pointer-events-none">
                            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Fecha Nacimiento */}
                <div>
                    <label className={labelClass}>Fecha de Nacimiento</label>
                    <input 
                        type="date" 
                        name="fechaNacimiento" 
                        max={maxDateAllowed} 
                        value={formData.fechaNacimiento} 
                        onChange={handleChange} 
                        className={inputClass} 
                    />
                    <p className="text-[9px] text-zinc-400 uppercase tracking-wide mt-1">* Requisito: +18 Años.</p>
                </div>

            </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end pt-4">
            <button 
                type="submit" 
                disabled={loading}
                className="bg-black text-white px-10 py-4 font-black uppercase tracking-[0.15em] text-xs hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
            >
                {loading ? (
                    <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Procesando...
                    </>
                ) : 'Guardar Cambios'}
            </button>
        </div>

      </form>
    </div>
  );
}