'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SearchBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTerm = searchParams.get('search') || '';

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const term = formData.get('search')?.toString().trim();

    if (term) {
      router.push(`/search?search=${encodeURIComponent(term)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <form 
        onSubmit={handleSearch} 
        className="w-full max-w-md group relative" 
        role="search"
    >
      <div className="relative flex items-center">
        <input
         
          key={initialTerm} 
          
          type="search" 
          name="search"
          
         
          defaultValue={initialTerm}
          
          placeholder="SEARCH ARCHIVE..."
          autoComplete="off"
          className="w-full bg-transparent border-b border-zinc-300 py-3 text-sm font-bold uppercase tracking-widest text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors rounded-none pr-16 appearance-none"
          aria-label="Buscar productos"
        />
        
        <button 
            type="submit" 
            className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition uppercase text-[10px] font-black tracking-widest px-2"
        >
            [ ENTER ]
        </button>
      </div>
    </form>
  );
}

export default function SearchBar() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-10 bg-zinc-100 animate-pulse" />}>
      <SearchBarContent />
    </Suspense>
  );
}