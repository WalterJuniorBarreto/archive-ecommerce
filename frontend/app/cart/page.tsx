'use client';

import { useMemo } from 'react'; // <--- VITAL PARA PERFORMANCE
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { CartItem as CartItemType } from '@/context/CartContext'; // Asumiendo que exportas este tipo

// --- 1. UTILS: FORMATO MONEDA ESTÁNDAR ---
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

// --- 2. COMPONENTE: ITEM DE CARRITO (Aislado para Testabilidad) ---
interface CartItemProps {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

const CartItemRow = ({ item, onIncrease, onDecrease, onRemove }: CartItemProps) => {
  const totalPrice = item.precio * item.quantity;

  return (
    <article className="flex gap-6 border border-zinc-200 p-4 relative group transition-all hover:border-black bg-white">
      {/* IMAGEN OPTIMIZADA */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 bg-zinc-100 shrink-0 border border-zinc-200 overflow-hidden">
        {item.imagenUrl ? (
          <Image 
            src={item.imagenUrl} 
            alt={item.nombre} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-zinc-400 font-bold uppercase">No Img</div>
        )}
      </div>

      {/* INFO Y CONTROLES */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-black text-sm md:text-lg uppercase tracking-tight leading-tight max-w-[80%]">
              <Link href={`/products/${item.id}`} className="hover:underline decoration-1">
                {item.nombre}
              </Link>
            </h3>
            <span className="text-sm md:text-lg font-bold tracking-tight tabular-nums">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500">
            <span className="flex items-center gap-1.5">
               <span 
                 className="w-3 h-3 border border-zinc-300 block shadow-sm" 
                 style={{ backgroundColor: item.selectedVariant.colorHex || '#000' }}
               />
               {item.selectedVariant.color}
            </span>
            <span className="border-l border-zinc-300 pl-3">Talla: {item.selectedVariant.talla}</span>
          </div>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div className="flex items-center border border-black h-8 md:h-10">
            <button 
              onClick={onDecrease}
              className="w-8 md:w-10 h-full hover:bg-black hover:text-white transition flex items-center justify-center"
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <span className="w-10 md:w-12 h-full flex items-center justify-center text-xs md:text-sm font-black border-x border-black bg-zinc-50">
              {item.quantity}
            </span>
            <button 
              onClick={onIncrease}
              className="w-8 md:w-10 h-full hover:bg-black hover:text-white transition flex items-center justify-center"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button 
            onClick={onRemove}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 hover:bg-red-50 px-2 py-1 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
};

// --- 3. PÁGINA PRINCIPAL ---
export default function CartPage() {
  const { cart, removeFromCart, decreaseQuantity, addToCart, clearCart } = useCart();
  const router = useRouter();

  // --- OPTIMIZACIÓN: USE MEMO ---
  // Solo recalculamos si el carrito cambia. Esto ahorra procesamiento.
  const totals = useMemo(() => {
    return cart.reduce((acc, item) => {
      const originalPriceTotal = item.precio * item.quantity;
      
      // Cálculo de descuento
      const discountPercent = item.descuento || 0;
      const finalPriceUnit = discountPercent > 0 
          ? item.precio * (1 - discountPercent / 100) 
          : item.precio;
      
      const finalPriceTotal = finalPriceUnit * item.quantity;

      acc.subtotalBase += originalPriceTotal;
      acc.totalDiscount += (originalPriceTotal - finalPriceTotal);
      acc.subtotalWithDiscount += finalPriceTotal;
      acc.totalItemsCount += item.quantity;
      return acc;
    }, { subtotalBase: 0, totalDiscount: 0, subtotalWithDiscount: 0, totalItemsCount: 0 });
  }, [cart]);

  // Lógica de negocio (Hardcoded por ahora, idealmente vendría del backend)
  const SHIPPING_COST_PER_ITEM = 20;
  const totalShipping = totals.totalItemsCount * SHIPPING_COST_PER_ITEM;
  const totalToPay = totals.subtotalWithDiscount + totalShipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 font-sans animate-in fade-in zoom-in duration-500">
        <span className="text-6xl mb-4 grayscale opacity-20">🛒</span>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Tu bolsa está vacía</h2>
        <p className="text-zinc-500 mb-8 font-medium max-w-md mx-auto">
            Explora nuestra colección y encuentra piezas únicas para tu estilo.
        </p>
        <Link 
          href="/products" 
          className="bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition shadow-lg hover:-translate-y-1 transform duration-200"
        >
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-12 pb-20 px-6 max-w-[1600px] mx-auto font-sans text-black">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b-4 border-black pb-4 gap-4">
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
          Tu Bolsa <span className="text-zinc-300 block md:inline text-3xl md:text-5xl ml-0 md:ml-4 align-baseline">({totals.totalItemsCount})</span>
        </h1>
        <button 
           onClick={clearCart}
           className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 underline decoration-red-200 hover:decoration-red-700 transition-all"
        >
           Vaciar todo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LISTA DE ITEMS */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cart.map((item) => {
            const compoundId = `${item.id}-${item.selectedVariant.id}`;
            return (
              <CartItemRow 
                key={compoundId} 
                item={item} 
                onIncrease={() => addToCart(item, item.selectedVariant)}
                onDecrease={() => decreaseQuantity(compoundId)}
                onRemove={() => removeFromCart(compoundId)}
              />
            );
          })}
        </div>

        {/* RESUMEN DE ORDEN (Sticky) */}
        <div className="lg:col-span-4">
            <div className="border-2 border-black p-8 sticky top-24 bg-zinc-50">
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 border-b-2 border-black pb-4">
                    Resumen de Compra
                </h2>

                <div className="space-y-3 text-sm font-medium mb-8">
                    <div className="flex justify-between text-zinc-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(totals.subtotalBase)}</span>
                    </div>

                    {totals.totalDiscount > 0 && (
                        <div className="flex justify-between text-red-600 animate-pulse">
                            <span>Descuento Aplicado</span>
                            <span>- {formatCurrency(totals.totalDiscount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-zinc-800">
                        <span>Envío estimado <span className="text-xs text-zinc-400">(x{totals.totalItemsCount})</span></span>
                        <span className="font-bold">{formatCurrency(totalShipping)}</span>
                    </div>
                </div>

                <div className="border-t-2 border-black pt-4 mb-8">
                    <div className="flex justify-between items-end">
                        <span className="font-black uppercase tracking-widest text-lg">Total</span>
                        <span className="text-4xl font-black tracking-tighter tabular-nums">
                            {formatCurrency(totalToPay)}
                        </span>
                    </div>
                    <p className="text-[10px] text-right text-zinc-500 mt-1 uppercase font-bold tracking-wide">
                        Incluye IGV
                    </p>
                </div>

                <button 
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-transparent hover:border-black transition-all duration-200 group"
                >
                    <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                        Ir al Checkout →
                    </span>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}