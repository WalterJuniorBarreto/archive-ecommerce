'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; 
import { wishlistService } from '@/services/wishlist.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast'; 

interface WishlistContextType {
  wishlistCount: number;
  wishlistIds: number[];
  toggleWishlist: (productId: number | string) => Promise<void>; // Aceptamos ambos
  checkInWishlist: (productId: number | string) => boolean;      // Aceptamos ambos
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. CARGA INICIAL (CON SANITIZACIÓN DE TIPOS)
  useEffect(() => {
    let isMounted = true; 

    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        console.log("🔍 INTENTANDO CARGAR WISHLIST...");
        console.log("👤 Usuario actual:", user);
        
        const products = await wishlistService.getMyWishlist();
        
        console.log("📦 RESPUESTA CRUDA DEL BACKEND:", products); // <--- ESTO ES LO QUE NECESITO VER

        if (isMounted) {
          const ids = products.map((p: any) => Number(p.id));
          console.log("✅ IDs extraídos:", ids);
          setWishlistIds(ids);
        }
      } catch (err) {
        console.error("❌ ERROR CRÍTICO EN FETCH:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (user) {
      fetchWishlist();
    } else {
      setWishlistIds([]); 
    }

    return () => { isMounted = false; };
  }, [user]); 

  // 2. CHECK ROBUSTO
  const checkInWishlist = useCallback((productId: number | string) => {
    // Comparamos siempre números con números
    return wishlistIds.includes(Number(productId));
  }, [wishlistIds]);

  // 3. TOGGLE OPTIMISTA MEJORADO
  const toggleWishlist = useCallback(async (productIdInput: number | string) => {
    if (!user) {
        toast.error("Inicia sesión para guardar favoritos");
        router.push('/login'); 
        return;
    }

    const productId = Number(productIdInput); // Aseguramos número

    // A. Miramos si ya lo tiene (Usando la versión numérica)
    const wasLiked = wishlistIds.includes(productId);

    // B. Actualización Visual Inmediata
    setWishlistIds((prevIds) => {
        if (wasLiked) {
            return prevIds.filter(id => id !== productId); // Quitar
        } else {
            return [...prevIds, productId]; // Poner
        }
    });

    // C. Llamada al Backend
    try {
        await wishlistService.toggle(productId);
        
        // Opcional: Toast sutil
        if (!wasLiked) toast.success("Añadido a favoritos", { id: 'wish-action' });
        else toast.success("Eliminado", { id: 'wish-action' });

    } catch (error) {
        console.error("Fallo al guardar en BD", error);
        toast.error("Error de conexión");

        // D. ROLLBACK
        setWishlistIds((currentIds) => {
             if (wasLiked) return [...currentIds, productId]; // Lo devolvemos
             else return currentIds.filter(id => id !== productId); // Lo quitamos de nuevo
        });
    }
  }, [user, router, wishlistIds]); 

  return (
    <WishlistContext.Provider value={{ 
        wishlistCount: wishlistIds.length, 
        wishlistIds, 
        toggleWishlist, 
        checkInWishlist,
        isLoading
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist debe usarse dentro de WishlistProvider');
  return context;
};