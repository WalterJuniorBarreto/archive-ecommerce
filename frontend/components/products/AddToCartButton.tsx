'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types/product.types'; // Asegura la ruta correcta
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

interface Props {
  product: Product;
  selectedVariant?: ProductVariant | null; // Opcional: Si no viene, asumimos modo "Ver Detalles"
}

export default function AddToCartButton({ product, selectedVariant }: Props) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1. LÓGICA DE STOCK INTELIGENTE
  // Si hay variante seleccionada, miramos su stock. Si no, miramos el stock total del producto.
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock; // O product.totalStock si lo tienes calculado
  const isSoldOut = currentStock === 0;

  const handleAction = () => {
    // CASO A: Estamos en una Grid (Tarjeta) y no se ha seleccionado variante
    if (!selectedVariant) {
        // Redirigimos al usuario para que elija talla/color
        router.push(`/products/${product.id}`);
        return;
    }

    // CASO B: Estamos en Detalle y hay variante, pero es stock 0
    if (isSoldOut) {
        toast.error("Producto agotado");
        return;
    }

    // CASO C: Añadir al carrito
    setLoading(true);
    
    // Pequeño delay artificial para feedback visual (opcional)
    try {
        // ✅ CORRECCIÓN CRÍTICA: Pasamos ambos argumentos
        addToCart(product, selectedVariant); 
        
        // Redirección inmediata (UX solicitada)
        router.push('/cart');
    } catch (error) {
        console.error(error);
        setLoading(false);
        toast.error("Error al añadir al carrito");
    }
  };

  // Texto dinámico del botón
  const buttonText = () => {
    if (loading) return 'Procesando...';
    if (isSoldOut) return 'Agotado';
    if (!selectedVariant) return 'Seleccionar Opciones'; // Modo Grid
    return 'Comprar Ahora'; // Modo Detalle (Directo al checkout/carrito)
  };

  return (
    <button
      onClick={handleAction}
      disabled={isSoldOut || loading}
      className={`w-full py-4 px-8 font-bold text-sm uppercase tracking-widest transition-all duration-200 border border-black
        ${isSoldOut 
            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-200' 
            : 'bg-black text-white hover:bg-white hover:text-black'
        }
      `}
    >
      {buttonText()}
    </button>
  );
}