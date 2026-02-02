'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { CartItem, Product, ProductVariant } from '@/types/product.types';
import { toast } from 'react-hot-toast';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, variant: ProductVariant) => void;
    removeFromCart: (compoundId: string) => void;
    decreaseQuantity: (compoundId: string) => void;
    clearCart: () => void;
    total: number;
    count: number;
    isBouncing: boolean;
    triggerCartBounce: () => void;
    isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper puro
const getCompoundId = (productId: number, variantId: number) => `${productId}-${variantId}`;

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isBouncing, setIsBouncing] = useState(false);

    // 1. Carga Inicial
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedCart = localStorage.getItem('cart');
                if (savedCart) setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error("Error carrito", error);
            } finally {
                setIsLoaded(true);
            }
        }
    }, []);

    // 2. Persistencia
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    // 3. UI Helpers
    const showToast = useCallback((type: 'success' | 'error', title: string, message: string) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex pointer-events-auto`}>
                <div className={`w-2 flex-shrink-0 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} />
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="ml-3 flex-1">
                            <p className={`text-xs font-black uppercase tracking-widest ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                {title}
                            </p>
                            <p className="mt-1 text-sm text-black font-bold leading-tight">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l-2 border-black">
                    <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent p-4 flex items-center justify-center text-sm font-medium text-black hover:bg-zinc-100">
                        ✕
                    </button>
                </div>
            </div>
        ), { duration: 3000 });
    }, []);

    const triggerCartBounce = useCallback(() => {
        if (isBouncing) return;
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 500);
    }, [isBouncing]);

    // Agrega 'cart' a las dependencias del useCallback para leer el estado actual
    const addToCart = useCallback((product: Product, variant: ProductVariant) => {
        if (!product || !variant) return;

        // 1. Validación Rápida de Stock (Fail Fast)
        if (variant.stock <= 0) {
            showToast('error', 'Agotado', `No hay stock de ${product.nombre}`);
            return;
        }

        // 2. Buscamos si ya existe usando el estado ACTUAL 'cart'
        const compoundId = getCompoundId(product.id, variant.id);
        const existingItem = cart.find((item) => 
            getCompoundId(item.id, item.selectedVariant.id) === compoundId
        );

        if (existingItem) {
            // --- CASO A: YA EXISTE ---
            
            // Validación de Stock Máximo
            if (existingItem.quantity >= variant.stock) {
                showToast('error', 'Stock Máximo', 'No puedes agregar más unidades.');
                return; // Cortamos aquí, no se ejecuta setCart
            }
            
            // Notificación (UNA SOLA VEZ)
            showToast('success', 'Actualizado', `+1 ${product.nombre} (${variant.talla})`);
            triggerCartBounce();

            // Actualización de Estado (Pura)
            setCart((prev) => prev.map((item) =>
                getCompoundId(item.id, item.selectedVariant.id) === compoundId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));

        } else {
            // --- CASO B: NUEVO ITEM ---

            // Notificación (UNA SOLA VEZ)
            showToast('success', 'Agregado', `${product.nombre} • ${variant.color} / ${variant.talla}`);
            triggerCartBounce();

            // Preparar Item
            const precioFinalCalculado = product.descuento 
                ? product.precio * (1 - product.descuento / 100) 
                : product.precio;

            const imgUrl = (product.images && product.images.length > 0) 
                ? product.images[0] 
                : (product.imagenUrl || '');

            const newItem: CartItem = {
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                precioFinal: precioFinalCalculado,
                imagenUrl: imgUrl,
                quantity: 1,
                selectedVariant: variant
            };

            // Actualización de Estado (Pura)
            setCart((prev) => [...prev, newItem]);
        }
    }, [cart, showToast, triggerCartBounce]); // 👈 IMPORTANTE: Agregamos 'cart' aquí

    // 5. RESTO DE FUNCIONES
    const decreaseQuantity = useCallback((compoundId: string) => {
        setCart((prev) => prev.map((item) => {
            const currentId = getCompoundId(item.id, item.selectedVariant.id);
            if (currentId === compoundId) {
                return { ...item, quantity: Math.max(0, item.quantity - 1) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    }, []);

    const removeFromCart = useCallback((compoundId: string) => {
        setCart((prev) => prev.filter((item) => 
            getCompoundId(item.id, item.selectedVariant.id) !== compoundId
        ));
        setTimeout(() => showToast('error', 'Eliminado', 'Producto eliminado de la bolsa.'), 0);
    }, [showToast]);

    const clearCart = useCallback(() => {
        setCart([]);
        localStorage.removeItem('cart');
        setTimeout(() => showToast('success', 'Limpieza', 'Bolsa vacía.'), 0);
    }, [showToast]);

    const total = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.precioFinal * item.quantity), 0);
    }, [cart]);

    const count = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.quantity, 0);
    }, [cart]);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            decreaseQuantity,
            clearCart,
            total,
            count,
            isBouncing,
            triggerCartBounce,
            isLoaded
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
    return context;
};