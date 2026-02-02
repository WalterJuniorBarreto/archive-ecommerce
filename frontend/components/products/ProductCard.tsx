'use client';

import { useState, useEffect } from 'react'; // <--- IMPORTAR useEffect
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product.types';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { checkInWishlist, toggleWishlist } = useWishlist();
  const [imageError, setImageError] = useState(false);

  // --- CORRECCIÓN CLAVE: ESTADO LOCAL PARA RESPUESTA INSTANTÁNEA ---
  // Inicializamos con lo que diga el contexto, pero permitimos cambio manual
  const isInContext = checkInWishlist(product.id);
  const [localIsLiked, setLocalIsLiked] = useState(isInContext);

  // Sincronizar: Si el contexto termina de cargar datos más tarde, actualizamos el local
  useEffect(() => {
    setLocalIsLiked(isInContext);
  }, [isInContext]);

  const totalStock = product.variantes?.reduce((acc, v) => acc + v.stock, 0) || 0;
  const isSoldOut = (product.variantes?.length ? totalStock : product.stock) === 0;
  const displayBrand = product.brandName || "ARCHIVE";
  const displayCategory = product.categoryName || "Streetwear";
  const discount = product.descuento || 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount
      ? product.precio * (1 - discount / 100)
      : product.precio;

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (!user) {
      toast.error("Inicia sesión para guardar favoritos");
      router.push('/login');
      return;
    }

    // 1. UI OPTIMISTA: Cambiamos el color INMEDIATAMENTE
    const previousState = localIsLiked;
    setLocalIsLiked(!previousState); 

    try {
        // 2. Llamamos al backend en segundo plano
        await toggleWishlist(product.id);
        
        // Opcional: Mostrar feedback sutil
        if (!previousState) {
            toast.success("Agregado a favoritos", { duration: 1500, position: 'bottom-center' });
        }
    } catch (error) {
        // 3. SI FALLA: Revertimos el cambio visual (Rollback)
        setLocalIsLiked(previousState);
        toast.error("No se pudo actualizar favoritos");
        console.error(error);
    }
  };

  return (
    <article className="group relative flex flex-col w-full h-full bg-white">
      
      <Link 
        href={`/products/${product.id}`} 
        className="absolute inset-0 z-10"
        aria-label={`Ver detalles de ${product.nombre}`}
      />

      {/* IMAGEN */}
      <div className="relative w-full aspect-[3/4] bg-zinc-100 overflow-hidden border border-transparent group-hover:border-black transition-all duration-300 ease-out">
        
        <div className="absolute top-0 left-0 z-20 flex flex-col items-start gap-1">
            {isSoldOut && (
                <span className="bg-black text-white text-[9px] font-black px-2 py-1 uppercase tracking-[0.2em]">
                    Sold Out
                </span>
            )}
            {!isSoldOut && hasDiscount && (
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-1 uppercase tracking-[0.1em]">
                    -{discount}%
                </span>
            )}
        </div>

        {/* Wishlist Button - AHORA USA localIsLiked */}
        <button 
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-30 p-2 focus:outline-none group/heart transition-transform active:scale-90 hover:bg-white/50 rounded-full"
        >
          {localIsLiked ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600 drop-shadow-sm"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-black/40 group-hover/heart:text-black transition-colors"><path strokeLinecap="square" strokeLinejoin="miter" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
          )}
        </button>

        {product.imagenUrl && !imageError ? (
          <Image 
            src={product.imagenUrl} 
            alt={product.nombre} 
            fill 
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" 
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 text-zinc-300">
            <span className="text-4xl font-black opacity-20">IMG</span>
          </div>
        )}
        
        {!isSoldOut && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
        )}
      </div>

      {/* INFO */}
      <div className="flex flex-col mt-3 px-1 space-y-1 pointer-events-none"> 
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest line-clamp-1">
            {displayBrand}
        </span>

        <div className="flex justify-between items-start gap-3">
          <h2 className="text-sm font-black text-black uppercase tracking-tight leading-tight line-clamp-2 group-hover:underline underline-offset-4 decoration-1">
            {product.nombre}
          </h2>
          
          <div className="flex flex-col items-end shrink-0">
            {hasDiscount ? (
                <>
                    <span className="text-[10px] line-through text-zinc-400 font-medium">S/ {product.precio.toFixed(2)}</span>
                    <span className="text-sm font-bold text-red-600 tabular-nums whitespace-nowrap">S/ {finalPrice.toFixed(2)}</span>
                </>
            ) : (
                <span className="text-sm font-bold text-black tabular-nums whitespace-nowrap">S/ {product.precio.toFixed(2)}</span>
            )}
          </div>
        </div>
        
        <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider line-clamp-1">
          {displayCategory}
        </span>
      </div>

    </article>
  );
}