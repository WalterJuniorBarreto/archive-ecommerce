'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Suspense, useCallback } from 'react';

interface Props {
  totalPages: number;
  currentPage: number; 
}

function PaginationContent({ totalPages, currentPage }: Props) {
  
  const router = useRouter();
  const pathname = usePathname(); 
  const searchParams = useSearchParams();

  const isFirstPage = currentPage <= 0;
  const isLastPage = currentPage >= totalPages - 1;

  
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return; 

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    
 
    router.push(`${pathname}?${params.toString()}`);
  }, [totalPages, searchParams, pathname, router]);

  if (totalPages <= 1) return null;

  return (
    <nav 
        className="flex justify-center items-center gap-8 md:gap-12 mt-8 select-none"
        aria-label="Navegación de páginas"
    >
      
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={isFirstPage}
        aria-label="Ir a página anterior"
        aria-disabled={isFirstPage}
        className={`group flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all duration-300
          ${isFirstPage 
            ? 'opacity-20 cursor-not-allowed text-zinc-400' 
            : 'hover:text-zinc-500 cursor-pointer text-black'
          }`}
      >
        <span 
            className={`text-lg leading-none pb-1 transition-transform duration-300 ${!isFirstPage && 'group-hover:-translate-x-1'}`}
            aria-hidden="true" 
        >
            ←
        </span>
        <span className="hidden md:inline">Anterior</span>
      </button>

      <div className="flex items-baseline gap-2 text-sm font-black tabular-nums">
        <span className="text-black text-lg">{currentPage + 1}</span>
        <span className="text-zinc-300 font-light text-xl">/</span>
        <span className="text-zinc-400">{totalPages}</span>
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={isLastPage}
        aria-label="Ir a página siguiente"
        aria-disabled={isLastPage}
        className={`group flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all duration-300
          ${isLastPage 
            ? 'opacity-20 cursor-not-allowed text-zinc-400' 
            : 'hover:text-zinc-500 cursor-pointer text-black'
          }`}
      >
        <span className="hidden md:inline">Siguiente</span>
        <span 
            className={`text-lg leading-none pb-1 transition-transform duration-300 ${!isLastPage && 'group-hover:translate-x-1'}`}
            aria-hidden="true"
        >
            →
        </span>
      </button>

    </nav>
  );
}


export default function Pagination(props: Props) {
  return (
    <Suspense fallback={null}>
      <PaginationContent {...props} />
    </Suspense>
  );
}