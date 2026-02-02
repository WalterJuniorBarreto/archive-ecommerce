'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categoryService, CategoryFormData } from '@/services/category.service';
import { Category } from '@/types/product.types'; // Asegura la ruta correcta de tipos
import { toast } from 'react-hot-toast';

interface Props {
  initialData?: Category;
}

export default function CategoryForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. VALIDACIONES
    if (!formData.nombre.trim() || !formData.descripcion.trim()) {
        toast.error("Todos los campos son obligatorios.");
        return;
    }

    setLoading(true);
    const toastId = toast.loading("Guardando categoría...");

    try {
      // 2. SANITIZACIÓN
      const payload: CategoryFormData = {
          nombre: formData.nombre.trim().toUpperCase(), // Estandarizar nombres
          descripcion: formData.descripcion.trim()
      };

      if (initialData) {
        await categoryService.update(initialData.id, payload);
        toast.success('Categoría actualizada correctamente', { id: toastId });
      } else {
        await categoryService.create(payload);
        toast.success('Categoría creada correctamente', { id: toastId });
      }
      
      router.refresh(); // Actualiza la lista en el servidor
      router.push('/admin/categories'); // Redirige

    } catch (error: any) {
      console.error("Category Form Error:", error);
      
      // Manejo de duplicados (ej: Nombre ya existe)
      if (error?.response?.status === 409 || error?.response?.status === 400) {
          toast.error("Ya existe una categoría con ese nombre.", { id: toastId });
      } else {
          toast.error("Error al guardar. Intenta nuevamente.", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ENCABEZADO */}
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white ${initialData ? 'bg-zinc-800' : 'bg-black'}`}>
                    {initialData ? 'EDICIÓN' : 'NUEVA'}
                </span>
            </div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter">
                {initialData ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
                {initialData ? `Modificando ID #${initialData.id}` : 'Define una nueva agrupación para el catálogo.'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>

            <div className="p-8 md:p-10 space-y-8">
                
                {/* Nombre */}
                <div className="group">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 group-focus-within:text-black transition-colors">
                        Nombre de la Categoría
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 uppercase font-bold"
                        placeholder="EJ: STREETWEAR"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                </div>

                {/* Descripción */}
                <div className="group">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 group-focus-within:text-black transition-colors">
                        Descripción
                    </label>
                    <textarea
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 resize-none text-sm"
                        placeholder="Describe brevemente el tipo de productos..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                </div>

            </div>

            {/* FOOTER DE ACCIONES */}
            <div className="bg-zinc-50 px-8 py-6 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full md:w-auto px-6 py-3 border border-zinc-300 text-zinc-600 font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black hover:border-black transition-all duration-300"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full md:w-auto px-8 py-3 bg-black text-white font-black text-xs uppercase tracking-[0.15em] hover:bg-zinc-800 transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Guardando...
                        </>
                    ) : (
                        initialData ? 'Guardar Cambios' : 'Crear Categoría'
                    )}
                </button>
            </div>
        </form>
    </div>
  );
}