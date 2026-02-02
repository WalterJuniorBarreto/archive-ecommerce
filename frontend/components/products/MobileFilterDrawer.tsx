'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CategoryFilter from './CategoryFilter';
import BrandFilter from './BrandFilter';

interface CurrentFilters {
    categoryId?: number;
    brandId?: number;
    gender?: string;
}

interface Props {
    currentFilters: CurrentFilters;
    productCount: number;
}

export default function MobileFilterDrawer({ currentFilters, productCount }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const hasActiveFilters = Object.values(currentFilters).some(value => value !== undefined);

   
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') setIsOpen(false);
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                window.removeEventListener('keydown', handleEsc);
                document.body.style.overflow = 'unset';
            };
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleClearFilters = useCallback(() => {
        router.push('/products');
        setIsOpen(false);
    }, [router]);

    return (
        <>
            {/* --- TRIGGER BUTTON (Solo Móvil) --- */}
            <div className="lg:hidden flex justify-between items-center mb-6">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-3 font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition shadow-lg active:scale-95"
                    aria-label="Abrir filtros"
                    aria-expanded={isOpen}
                    aria-controls="filter-drawer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M3.75 18H7.5m3-6h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M3.75 12H7.5" />
                    </svg>
                    Filtros
                    {hasActiveFilters && (
                        <span className="ml-2 bg-white text-black h-5 w-5 flex items-center justify-center text-[10px] rounded-full font-extrabold animate-pulse">
                            !
                        </span>
                    )}
                </button>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    {productCount} Productos
                </span>
            </div>

           
            <div 
                className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)} 
                aria-hidden="true"
            />

            {/* --- DRAWER --- */}
            <aside 
                id="filter-drawer"
                className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col lg:hidden
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-label="Filtros de productos"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-zinc-100">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Filtros</h2>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 -mr-2 text-zinc-400 hover:text-black transition-colors"
                        aria-label="Cerrar filtros"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 overscroll-contain">
                    <section aria-label="Filtros por categoría">
                        <CategoryFilter />
                    </section>
                    <section aria-label="Filtros por marca">
                        <BrandFilter />
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-zinc-100 bg-zinc-50 space-y-4">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition active:scale-[0.98]"
                    >
                        Ver {productCount} Resultados
                    </button>

                    {hasActiveFilters && (
                         <button
                            onClick={handleClearFilters}
                            className="w-full text-center text-xs font-bold uppercase underline cursor-pointer text-zinc-400 hover:text-black transition-colors"
                        >
                            Limpiar Todo
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}