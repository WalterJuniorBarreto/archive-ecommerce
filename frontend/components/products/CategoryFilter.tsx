'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { Category } from '@/types/product.types'; // Asegúrate que el import sea correcto

// 1. SKELETON LOADER (Evita saltos visuales CLS)
const FilterSkeleton = () => (
  <div className="w-full animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 w-1/2 rounded" />
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-3 bg-gray-100 w-3/4 rounded" />
      ))}
    </div>
  </div>
);

function CategoryFilterContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentCategoryId = searchParams.get('categoryId');
  const currentGender = searchParams.get('gender'); 

  // Carga de datos
  useEffect(() => {
    const fetchCats = async () => {
        try {
            const data = await productService.getCategories();
            // Aseguramos tipado
            setCategories(data as unknown as Category[]);
        } catch (error) {
            console.error("Error cargando categorías:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchCats();
  }, []);

  // 2. GENERADOR DE URLS (Conserva otros filtros)
  const createCategoryUrl = useCallback((id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Si seleccionamos una categoría...
    if (id === null) {
      params.delete('categoryId'); 
    } else {
      params.set('categoryId', id.toString());
    }

    // IMPORTANTE: Resetear paginación a 1
    params.delete('page');

    params.delete('search'); // <--- ¡Adiós búsqueda antigua!
    params.delete('page');

    return `/products?${params.toString()}`;
  }, [searchParams]);

  if (loading) return <FilterSkeleton />;

  return (
    <div className="w-full">
      <h3 className="font-black uppercase tracking-widest text-xs mb-6 border-b border-black pb-2">
        Categorías {currentGender && <span className="text-zinc-500">({currentGender})</span>}
      </h3>
      
      <nav className="flex flex-col gap-3 items-start" aria-label="Filtro de categorías">
        {/* Opción VER TODO */}
        <Link
          href={createCategoryUrl(null)}
          scroll={false} // Evita el salto brusco al inicio de la página
          className={`text-xs uppercase tracking-wider font-bold transition-all duration-200 hover:translate-x-1 ${
            !currentCategoryId 
                ? 'text-black underline decoration-2 underline-offset-4 pointer-events-none' 
                : 'text-zinc-500 hover:text-black'
          }`}
        >
          Ver Todo
        </Link>

        {/* Lista de Categorías */}
        {categories.map((cat) => {
            const isActive = currentCategoryId === String(cat.id);
            return (
                <Link
                    key={cat.id}
                    href={createCategoryUrl(cat.id)}
                    scroll={false}
                    className={`text-xs uppercase tracking-wider font-bold transition-all duration-200 hover:translate-x-1 text-left ${
                        isActive
                            ? 'text-black underline decoration-2 underline-offset-4 pointer-events-none'
                            : 'text-zinc-500 hover:text-black'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                >
                    {cat.nombre}
                </Link>
            );
        })}
      </nav>
    </div>
  );
}

// 3. SUSPENSE WRAPPER (Obligatorio para evitar errores de Build)
export default function CategoryFilter() {
  return (
    <Suspense fallback={<FilterSkeleton />}>
      <CategoryFilterContent />
    </Suspense>
  );
}