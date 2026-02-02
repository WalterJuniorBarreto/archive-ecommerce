'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { brandService } from '@/services/brand.service';
import { Brand } from '@/types/product.types';
import { toast } from 'react-hot-toast';

interface Props {
  initialData?: Brand;
}

export default function BrandForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [nombre, setNombre] = useState(initialData?.nombre || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
        toast.error("El nombre de la marca es obligatorio.");
        return;
    }

    setLoading(true);
    const toastId = toast.loading("Guardando marca...");

    try {
      const finalName = nombre.trim().toUpperCase();
      
      // 🚨 AQUÍ ESTABA EL ERROR: Debemos enviar un objeto, no un string suelto.
      const payload = { nombre: finalName };

      if (initialData) {
        await brandService.update(initialData.id, payload);
        toast.success('Marca actualizada correctamente', { id: toastId });
      } else {
        await brandService.create(payload);
        toast.success('Marca creada correctamente', { id: toastId });
      }
      
      router.refresh(); 
      router.push('/admin/brands'); 

    } catch (error: any) {
      console.error("Brand Form Error:", error);
      if (error?.response?.status === 409) {
          toast.error("Ya existe una marca con ese nombre.", { id: toastId });
      } else {
          toast.error("Error al guardar marca.", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
             <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white ${initialData ? 'bg-zinc-800' : 'bg-black'}`}>
                    {initialData ? 'EDICIÓN' : 'NUEVA'}
                </span>
            </div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter">
                {initialData ? 'Editar Marca' : 'Nueva Marca'}
            </h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>

            <div className="p-8 md:p-10 space-y-8">
                <div className="group">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 group-focus-within:text-black transition-colors">
                        Nombre de la Marca
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 font-bold uppercase"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="EJ: NIKE"
                    />
                </div>
            </div>

            <div className="bg-zinc-50 px-8 py-6 border-t border-zinc-200 flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-zinc-300 font-bold text-xs uppercase hover:bg-white transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-black text-white font-bold text-xs uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50">
                    {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    </div>
  );
}