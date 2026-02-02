'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { wishlistService } from '@/services/wishlist.service';
import { Product } from '@/types/product.types'; // Asegúrate que esta ruta es correcta
import ProductCard from '@/components/products/ProductCard'; // Tu tarjeta de producto
import { toast } from 'react-hot-toast';

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Estado local para los productos COMPLETOS (no solo IDs)
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Si no hay usuario y terminó de cargar auth, mandar al login
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // 2. Cargar productos frescos del backend
    const loadWishlist = async () => {
      try {
        setLoading(true);
        // Llamamos al backend: GET /wishlist
        const data = await wishlistService.getMyWishlist();
        setProducts(data);
      } catch (error) {
        console.error("Error cargando wishlist:", error);
        toast.error("No se pudo cargar tu lista de deseos");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadWishlist();
    }
  }, [user, authLoading, router]);

  // Renderizado de carga
  if (authLoading || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Renderizado Vacio (Lo que ves ahora)
  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Wishlist</h1>
        <p className="text-gray-500 mb-12">Colección personal de 0 items.</p>
        
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 border border-gray-100 rounded-lg">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
             <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-2">Tu lista está vacía</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md">
            Guarda aquí lo que te gusta para no perderlo de vista cuando vuelvas.
          </p>
          <button 
            onClick={() => router.push('/products')}
            className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Explorar Catálogo
          </button>
        </div>
      </div>
    );
  }

  // Renderizado CON PRODUCTOS (Lo que queremos ver)
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Wishlist</h1>
      <p className="text-gray-500 mb-8">Colección personal de {products.length} items.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((product) => (
          <div key={product.id} className="w-full h-[450px]"> {/* Altura fija o ajustada a tu diseño */}
             <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}