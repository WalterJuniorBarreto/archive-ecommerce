'use client';

import { useEffect, useState } from 'react';
import { brandService } from '@/services/brand.service';
import { Brand } from '@/types/product.types'; // Asegúrate de la ruta correcta
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await brandService.getAll();
      setBrands(data);
      setFilteredBrands(data);
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión al cargar marcas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtro en tiempo real
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = brands.filter(brand => 
      (brand.nombre || "").toLowerCase().includes(term) ||
      brand.id.toString().includes(term)
    );
    setFilteredBrands(results);
  }, [searchTerm, brands]);

  // 🗑️ FUNCIÓN DE ELIMINAR OPTIMIZADA
  const handleDelete = async (id: number) => {
    // Usamos confirm nativo por rapidez, pero idealmente sería un Modal
    if (!confirm('¿Estás seguro? Esta acción es irreversible.')) return;

    const toastId = toast.loading("Eliminando marca...");

    try {
      await brandService.delete(id);
      
      // Actualización optimista o recarga
      setBrands(prev => prev.filter(b => b.id !== id));
      toast.success("Marca eliminada correctamente", { id: toastId });
      
    } catch (error: any) {
      console.error("Delete Error:", error);
      
      // 🚨 MANEJO DE INTEGRIDAD REFERENCIAL
      // Si el backend devuelve 409 (Conflict) o 500 (Internal Server Error por SQL Constraint)
      if (error?.response?.status === 409 || error?.response?.status === 500) {
          toast.error("⛔ No se puede eliminar: Esta marca tiene productos asociados.", { id: toastId, duration: 5000 });
      } else {
          toast.error("Error al eliminar la marca.", { id: toastId });
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Cargando catálogo...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-6">
        <div>
            <h1 className="text-3xl font-black text-black uppercase tracking-tighter mb-2">Marcas</h1>
            <p className="text-sm text-zinc-500 font-medium">Gestión de fabricantes y sellos asociados.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right">
                <span className="block text-2xl font-black tabular-nums leading-none">{brands.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Registros</span>
            </div>
        </div>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-zinc-200 shadow-sm">
        {/* Buscador */}
        <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-zinc-200 leading-5 bg-zinc-50 text-black placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black sm:text-sm transition-all"
                placeholder="Buscar marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Botón Crear */}
        <Link 
            href="/admin/brands/new" 
            className="w-full md:w-auto bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
            <span>+</span> Nueva Marca
        </Link>
      </div>

      {/* 3. TABLA */}
      <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden max-w-4xl mx-auto md:mx-0">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
                <tr>
                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-24">ID</th>
                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nombre de la Marca</th>
                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Acciones</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
                {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-zinc-50 transition-colors group">
                        
                        {/* ID */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400 font-mono">
                            #{brand.id.toString().padStart(3, '0')}
                        </td>

                        {/* Nombre */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-black text-black uppercase tracking-wide">
                                {brand.nombre}
                            </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Link href={`/admin/brands/${brand.id}`} className="text-zinc-400 hover:text-black transition-colors" title="Editar">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                </Link>
                                <button 
                                    onClick={() => handleDelete(brand.id)} 
                                    className="text-zinc-400 hover:text-red-600 transition-colors" 
                                    title="Eliminar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 text-sm">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-2xl">📂</span>
                                <span>No se encontraron marcas.</span>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
        
        {/* Footer simple */}
        <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-200 flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">
                Visualizando {filteredBrands.length} registros
            </span>
        </div>
      </div>
    </div>
  );
}