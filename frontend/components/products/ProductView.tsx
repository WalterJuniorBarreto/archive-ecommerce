'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types/product.types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

// --- TIPOS ---
interface Props {
    product: Product;
}

interface UniqueColor {
    name: string;
    hex: string;
}

// --- HOOK: LÓGICA DE NEGOCIO ---
const useProductVariants = (product: Product) => {
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const availableColors: UniqueColor[] = useMemo(() => {
        const uniqueColorsMap = new Map<string, string>();
        product.variantes.forEach(v => {
            if (v.stock > 0 && v.color) {
                const hex = v.colorHex && /^#([0-9A-F]{3}){1,2}$/i.test(v.colorHex) ? v.colorHex : '#808080';
                uniqueColorsMap.set(v.color, hex);
            }
        });
        return Array.from(uniqueColorsMap).map(([name, hex]) => ({ name, hex }));
    }, [product.variantes]);

    const availableSizes = useMemo(() => {
        if (!selectedColor) return [];
        return product.variantes
            .filter(v => v.color === selectedColor && v.stock > 0)
            .map(v => v.talla)
            .filter((value, index, self) => self.indexOf(value) === index);
    }, [product.variantes, selectedColor]);

    const selectedVariant: ProductVariant | undefined = useMemo(() => {
        if (!selectedColor || !selectedSize) return undefined;
        return product.variantes.find(v => v.color === selectedColor && v.talla === selectedSize);
    }, [product.variantes, selectedColor, selectedSize]);

    const selectColor = (color: string) => {
        setSelectedColor(color);
        setSelectedSize(null);
    };

    return {
        availableColors,
        availableSizes,
        selectedColor,
        selectedSize,
        selectColor,
        selectSize: setSelectedSize,
        selectedVariant
    };
};

// --- COMPONENTE PRINCIPAL ---
export default function ProductView({ product }: Props) {
    const router = useRouter();
    const { addToCart } = useCart();
    const { checkInWishlist, toggleWishlist } = useWishlist();
    const { user } = useAuth();

    const { 
        availableColors, availableSizes, selectedColor, selectedSize, 
        selectColor, selectSize, selectedVariant 
    } = useProductVariants(product);

    const [loading, setLoading] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // --- 1. LÓGICA ROBUSTA PARA TEXTOS (FIXED) ---
    const displayBrand = product.brandName || "ARCHIVE";
    const displayCategory = product.categoryName || "Colección";

    // --- IMÁGENES ---
    const allImages = useMemo(() => {
        if (!product) return [];
        const rawImages = (product.images && product.images.length > 0) 
            ? product.images 
            : (product.imagenUrl ? [product.imagenUrl] : []);
        return rawImages.filter(url => url && url.trim().length > 0);
    }, [product]);

    useEffect(() => {
        if (!isAutoPlaying || allImages.length <= 1) return;
        const interval = setInterval(() => {
            setActiveImageIndex((prev) => (prev + 1) % allImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, allImages.length]);

    // --- PRECIOS Y STOCK ---
    const discount = product.descuento || 0;
    const finalPrice = discount > 0 ? product.precio * (1 - discount / 100) : product.precio;
    const totalStock = product.variantes?.reduce((acc, v) => acc + v.stock, 0) || 0;
    const isTotalSoldOut = (product.variantes?.length ? totalStock : product.stock) === 0;
    const isLiked = checkInWishlist(product.id);

    // --- HANDLERS ---
    const handleAddToCart = useCallback(() => {
        if (!selectedColor) {
            toast.error("Por favor, selecciona un color.");
            return;
        }
        if (!selectedSize) {
            toast.error("Por favor, selecciona una talla.");
            return;
        }
        if (!selectedVariant || selectedVariant.stock === 0) {
            toast.error("Variante no disponible.");
            return;
        }

        setLoading(true);
        // Add to cart es síncrono en el contexto, el feedback visual es inmediato
        addToCart(product, selectedVariant);
        setTimeout(() => setLoading(false), 500);
    }, [selectedColor, selectedSize, selectedVariant, product, addToCart]);

    const handleWishlist = async () => {
        if (!user) {
            toast.error('Inicia sesión para guardar favoritos');
            router.push('/login');
            return;
        }
        await toggleWishlist(product.id);
    };

    const showPlaceholder = allImages.length === 0;
    const canAddToCart = !!selectedVariant && selectedVariant.stock > 0 && !loading;

    return (
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-6 lg:pt-12 items-start">

            {/* --- GALERÍA (IZQUIERDA) --- */}
            <section className="lg:col-span-8 w-full flex flex-col-reverse lg:flex-row gap-4 relative lg:sticky lg:top-24">
                {/* Thumbnails */}
                {allImages.length > 1 && (
                    <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] scrollbar-hide shrink-0 py-2 lg:py-0 px-1 lg:px-0">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setActiveImageIndex(idx); setIsAutoPlaying(false); }}
                                aria-label={`Ver imagen ${idx + 1}`}
                                className={`relative w-16 h-16 lg:w-20 lg:h-20 border transition-all duration-300 shrink-0 ${activeImageIndex === idx ? 'border-black ring-1 ring-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Image */}
                <div 
                    className="relative flex-1 bg-zinc-50 border border-zinc-100 overflow-hidden group w-full aspect-[4/5] lg:aspect-auto lg:h-[600px]"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    {isTotalSoldOut && (
                        <span className="absolute top-0 left-0 bg-black text-white text-xs font-black px-4 py-2 z-20 uppercase tracking-[0.2em]">Sold Out</span>
                    )}
                    {discount > 0 && !isTotalSoldOut && (
                        <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 z-20 uppercase tracking-widest shadow-sm">-{discount}%</span>
                    )}
                    
                    {!showPlaceholder ? (
                        <Image
                            src={allImages[activeImageIndex]}
                            alt={product.nombre}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                            className={`object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 ${isTotalSoldOut ? 'grayscale opacity-50' : ''}`}
                            priority // LCP Optimization
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-zinc-300">
                            <span className="text-4xl font-black opacity-20">NO IMG</span>
                        </div>
                    )}
                </div>
            </section>

            {/* --- INFO (DERECHA) --- */}
            <section className="lg:col-span-4 flex flex-col h-full px-1 lg:px-0">
                <div className="mb-8 border-b border-black pb-8">
                    <div className="flex justify-between items-center mb-4">
                        {/* MARCA */}
                        <span className="text-xs font-bold uppercase tracking-[0.2em] bg-black text-white px-2 py-1">
                            {displayBrand}
                        </span>
                        {/* CATEGORÍA */}
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                            {displayCategory}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-black mb-6">
                        {product.nombre}
                    </h1>

                    <div className="flex flex-col items-start gap-1">
                        {discount > 0 ? (
                            <div>
                                <span className="text-lg line-through font-bold text-zinc-400 decoration-2">S/ {product.precio.toFixed(2)}</span>
                                <span className="text-3xl lg:text-4xl font-black text-red-600 ml-3">S/ {finalPrice.toFixed(2)}</span>
                            </div>
                        ) : (
                            <span className="text-3xl lg:text-4xl font-black text-black">S/ {product.precio.toFixed(2)}</span>
                        )}
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Impuestos incluidos</span>
                    </div>
                </div>

                {/* SELECTORES DE VARIANTE */}
                <div className="space-y-8 mb-10">
                    {/* Color */}
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 block">
                            Color: <span className="text-black">{selectedColor || 'Selecciona'}</span>
                        </span>
                        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Seleccionar color">
                            {availableColors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => selectColor(color.name)}
                                    aria-checked={selectedColor === color.name}
                                    role="radio"
                                    aria-label={`Color ${color.name}`}
                                    style={{ backgroundColor: color.hex }}
                                    className={`w-8 h-8 rounded-full transition-all duration-200 ring-2 ring-offset-2 ${selectedColor === color.name ? 'ring-black scale-110' : 'ring-transparent hover:scale-110'} ${color.hex.toLowerCase() === '#ffffff' ? 'border border-zinc-200' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Talla */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                Talla {selectedVariant && <span className="text-black">({selectedVariant.stock} disp.)</span>}
                            </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Seleccionar talla">
                            {availableSizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => selectSize(size)}
                                    disabled={!selectedColor}
                                    aria-checked={selectedSize === size}
                                    role="radio"
                                    className={`h-12 border text-sm font-bold transition-all duration-200 uppercase ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-zinc-200 hover:border-black'} ${!selectedColor ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {size}
                                </button>
                            ))}
                            {!selectedColor && product.variantes.length > 0 && (
                                <p className="col-span-4 text-[10px] text-zinc-400 italic mt-1">Selecciona un color primero.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Detalles</h3>
                    <p className="text-sm leading-relaxed text-zinc-600 font-medium">{product.descripcion}</p>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="mt-auto flex gap-4">
                    <button
                        onClick={handleAddToCart}
                        disabled={!canAddToCart}
                        className={`flex-1 h-14 flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 border border-black relative overflow-hidden group ${!canAddToCart ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed' : 'bg-black text-white'}`}
                    >
                        {canAddToCart && <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out mix-blend-difference" />}
                        <span className="relative z-10">
                            {loading ? 'Procesando...' : isTotalSoldOut ? 'Agotado' : (!selectedColor || !selectedSize) ? 'Selecciona Opciones' : 'Añadir a la Bolsa'}
                        </span>
                    </button>

                    <button
                        onClick={handleWishlist}
                        className="w-14 h-14 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
                        title={isLiked ? "Quitar de favoritos" : "Guardar en favoritos"}
                    >
                        {isLiked ? (
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="square" strokeLinejoin="miter" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                        )}
                    </button>
                </div>
            </section>
        </article>
    );
}