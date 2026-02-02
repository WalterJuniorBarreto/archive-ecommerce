'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { Brand } from '@/types/product.types';

// 1. SKELETON LOADER (Visualmente consistente)
const FilterSkeleton = () => (
  <div className="w-full mt-10 pt-10 border-t border-zinc-100 animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 w-1/2 rounded" />
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-3 bg-gray-100 w-2/3 rounded" />
      ))}
    </div>
  </div>
);

function BrandFilterContent() {
  const searchParams = useSearchParams();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentBrandId = searchParams.get('brandId');

  // Carga de datos
  useEffect(() => {
    const fetchBrands = async () => {
        try {
            // Asegúrate de tener este método en tu service
            const data = await productService.getBrands(); 
            setBrands(data);
        } catch (error) {
            console.error("Error cargando marcas:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchBrands();
  }, []);

  // 2. HELPER URL INTELIGENTE
  // Clona los parámetros actuales para NO perder la Categoría ni el Género seleccionados
  const createBrandUrl = useCallback((id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Gestión de Marca
    if (id === null) {
      params.delete('brandId');
    } else {
      params.set('brandId', id.toString());
    }

    // Siempre reseteamos a página 1 al cambiar filtros
    params.delete('page');

    params.delete('search'); // <--- ¡Adiós búsqueda antigua!
    params.delete('page');

    return `/products?${params.toString()}`;
  }, [searchParams]);

  if (loading) return <FilterSkeleton />;

  // Si no hay marcas, no mostramos nada para mantener el diseño limpio
  if (brands.length === 0) return null;

  return (
    <div className="w-full mt-10 pt-10 border-t border-zinc-100">
      <h3 className="font-black uppercase tracking-widest text-xs mb-6 border-b border-black pb-2">
        Marcas
      </h3>
      
      <nav className="flex flex-col gap-3 items-start" aria-label="Filtro de marcas">
        {/* Opción TODO */}
        <Link
          href={createBrandUrl(null)}
          scroll={false}
          className={`text-xs uppercase tracking-wider font-bold transition-all duration-200 hover:translate-x-1 ${
            !currentBrandId 
                ? 'text-black underline decoration-2 underline-offset-4 pointer-events-none' 
                : 'text-zinc-500 hover:text-black'
          }`}
        >
          Todas
        </Link>

        {/* Lista de Marcas */}
        {brands.map((brand) => {
            const isActive = currentBrandId === String(brand.id);
            // Usamos 'name' (inglés) o 'nombre' (español) según venga del backend
            const displayName = brand.name || brand.nombre || 'Sin Nombre';

            return (
                <Link
                    key={brand.id}
                    href={createBrandUrl(brand.id)}
                    scroll={false}
                    className={`text-xs uppercase tracking-wider font-bold transition-all duration-200 hover:translate-x-1 text-left ${
                        isActive
                            ? 'text-black underline decoration-2 underline-offset-4 pointer-events-none'
                            : 'text-zinc-500 hover:text-black'
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                >
                    {displayName}
                </Link>
            );
        })}
      </nav>
    </div>
  );
}

// 3. SUSPENSE WRAPPER (Build Safety)
export default function BrandFilter() {
  return (
    <Suspense fallback={<FilterSkeleton />}>
      <BrandFilterContent />
    </Suspense>
  );
}