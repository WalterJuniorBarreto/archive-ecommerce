import Link from 'next/link';
import Image from 'next/image';
import { productService } from '@/services/product.service';
import { brandService } from '@/services/brand.service';
import ProductCard from '@/components/products/ProductCard';
import { Product, Brand } from '@/types/product.types';

// ⚡ DEVOPS: ISR (Incremental Static Regeneration)
// La página se regenera en el servidor cada 60 segundos.
// Esto reduce la carga a la Base de Datos en un 99% para tráfico alto.
export const revalidate = 60; 

export default async function Home() {
  
  // 1. Carga de Datos Paralela y Resiliente
  let featuredProducts: Product[] = [];
  let brands: Brand[] = [];
  let focusProduct: Product | null = null;

  try {
    const [recentData, brandsData, focusData] = await Promise.all([
        productService.getRecent(8).catch(() => []), // Si falla, retorna array vacío
        brandService.getAll().catch(() => []),
        productService.getFeatured().catch(() => null)
    ]);
    
    featuredProducts = recentData || [];
    brands = brandsData || [];
    focusProduct = focusData;

  } catch (error) {
    // En producción, esto debería ir a un log service como Sentry o Datadog
    console.error("⚠️ Error no crítico cargando Home:", error);
  }

  // Lógica Marquee: Si hay pocas marcas, las duplicamos para que el loop visual funcione
  const displayBrands = brands.length > 0 
    ? (brands.length < 10 ? Array(10).fill(brands).flat() : brands)
    : [];

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      
      {/* =========================================
          1. HERO SECTION
      ========================================= */}
      <section className="relative h-screen w-full bg-black overflow-hidden flex flex-col justify-center items-center text-center">
        {/* Fondo con Gradiente y Ruido */}
        <div className="absolute inset-0 z-0">
           <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black opacity-80"></div>
           {/* Patrón de ruido para estética 'Lo-Fi' */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>
        
        <div className="relative z-10 px-6 max-w-5xl mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-1000">
            <span className="text-zinc-400 font-medium tracking-[0.3em] uppercase text-xs md:text-sm mb-6 border border-zinc-700 px-4 py-1 rounded-full backdrop-blur-sm">
                Est. 2025 • Lima, Perú
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 leading-[0.9] tracking-tighter shadow-black drop-shadow-2xl">
                LUJO<br/>URBANO.
            </h1>
            <p className="text-zinc-300 text-lg md:text-xl mb-12 max-w-2xl font-light leading-relaxed">
                Elevando el estándar. Marcas exclusivas, cortes limitados y la elegancia del caos. Únicos en el mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                <Link href="/products" className="group bg-white text-black px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all duration-300 min-w-[200px]">
                    Comprar Ahora
                </Link>
                <Link href="#focus-del-mes" className="group bg-transparent border border-zinc-600 text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:border-white hover:bg-white hover:text-black transition-all duration-300 min-w-[200px]">
                    Ver Focus
                </Link>
            </div>
        </div>

        {/* Flecha animada */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </div>
      </section>

      {/* =========================================
          2. TICKER DE MARCAS (Marquee)
      ========================================= */}
      <div className="bg-black border-t border-zinc-800 py-6 overflow-hidden relative border-b border-zinc-800 z-20">
        <div className="flex w-max animate-marquee hover:pause group">
           {/* Renderizamos duplicado para efecto infinito */}
           {[...displayBrands, ...displayBrands].map((brand, index) => (
               <Link 
                   key={`${brand.id}-${index}`} 
                   href={`/products?search=${brand.nombre}`} 
                   className="text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 to-zinc-400 font-black mx-8 uppercase tracking-tighter italic hover:text-white transition-colors cursor-pointer"
               >
                   {brand.nombre}
               </Link>
           ))}

           {displayBrands.length === 0 && (
               <span className="text-zinc-600 text-xl tracking-widest uppercase mx-auto px-10">
                   ARCHIVE GLOBAL • EXCLUSIVE BRANDS • ARCHIVE GLOBAL • SYSTEM READY
               </span>
           )}
        </div>
      </div>

      {/* =========================================
          3. CATEGORÍAS EDITORIALES (Grid Bento)
      ========================================= */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black uppercase leading-none">
                   Selección<br/>Curada
                 </h2>
                 <Link href="/products" className="hidden md:inline-block border-b border-black pb-1 uppercase tracking-widest text-xs font-bold hover:text-zinc-600 transition">
                   Ver catálogo completo
                 </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 h-auto md:h-[600px]">
                
                {/* 1. HOODIES (PRINCIPAL) */}
                <Link href="/products?category=Hoodies" className="group relative lg:col-span-6 h-[500px] md:h-full overflow-hidden border border-zinc-200 bg-zinc-100">
                    <Image 
                        src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1000" // Placeholder pro
                        alt="Hoodies Editorial"
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        priority // Carga prioritaria para LCP
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                        <span className="text-xs font-bold uppercase tracking-widest mb-3 bg-white text-black inline-block w-fit px-3 py-1">
                            Best Seller
                        </span>
                        <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter group-hover:translate-x-2 transition-transform duration-300">
                            Street<br/>Wear
                        </h3>
                    </div>
                </Link>

                {/* COLUMNA DERECHA */}
                <div className="lg:col-span-6 grid grid-rows-2 gap-4 h-full">
                    
                    {/* 2. SNEAKERS */}
                    <Link href="/products?category=Sneakers" className="group relative overflow-hidden h-[300px] md:h-full border border-zinc-200 bg-zinc-100">
                         <Image 
                            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800"
                            alt="Sneakers Editorial" 
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                         />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter z-10 drop-shadow-lg">
                                Sneakers
                            </h3>
                         </div>
                    </Link>

                    {/* 3. BLOQUES PEQUEÑOS */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/products?category=Pants" className="group relative overflow-hidden border border-zinc-200 h-[250px] md:h-full bg-zinc-100">
                            <Image 
                                src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600"
                                alt="Pants Editorial" 
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale"
                                sizes="25vw"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <h3 className="font-black text-2xl text-white uppercase tracking-tighter">Pants</h3>
                            </div>
                        </Link>

                        <Link href="/products?category=Bags" className="group relative overflow-hidden border border-zinc-200 h-[250px] md:h-full bg-zinc-100">
                            <Image 
                                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600"
                                alt="Bags Editorial" 
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale"
                                sizes="25vw"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <h3 className="font-black text-2xl text-white uppercase tracking-tighter">Luxury</h3>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* =========================================
          4. FOCUS DEL MES (Dinámico)
      ========================================= */}
      <section id="focus-del-mes" className="py-0 border-t border-black scroll-mt-24">
         <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]">
            
            {/* FOTO PRODUCTO */}
            <div className="bg-zinc-100 relative overflow-hidden group min-h-[50vh] lg:min-h-full">
                 {focusProduct?.imagenUrl ? (
                     <Image 
                        src={focusProduct.imagenUrl} 
                        alt={focusProduct.nombre} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                     />
                 ) : (
                     <div className="absolute inset-0 flex items-center justify-center bg-zinc-200">
                        <span className="text-zinc-400 font-bold tracking-widest">PRODUCTO OCULTO</span>
                     </div>
                 )}
                 
                 {/* Overlay de información */}
                 <div className="absolute bottom-10 left-10 p-6 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 hidden md:block">
                     <p className="font-black text-4xl uppercase italic">
                        {typeof focusProduct?.brand === 'object' ? focusProduct.brand.nombre : "ARCHIVE"}
                     </p>
                     <p className="font-bold text-sm uppercase tracking-widest text-zinc-500">
                        {focusProduct?.nombre || "Coming Soon"}
                     </p>
                 </div>
            </div>

            {/* INFO PRODUCTO */}
            <div className="bg-white flex flex-col justify-center p-12 lg:p-24 relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-9xl overflow-hidden select-none pointer-events-none">
                     FOCUS
                 </div>
                 <span className="text-blue-600 font-bold tracking-[0.3em] uppercase mb-6 block text-sm">
                   — Focus del Mes
                 </span>
                 <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter leading-[0.9] text-black">
                     {focusProduct?.nombre || "New Season"}
                 </h2>
                 <p className="text-zinc-600 text-lg md:text-xl mb-12 max-w-md leading-relaxed line-clamp-4">
                     {focusProduct?.descripcion || "Prepárate para lo que viene. La nueva colección redefine los límites del diseño y la funcionalidad."}
                 </p>
                 
                 {focusProduct ? (
                     <Link href={`/products/${focusProduct.id}`} className="inline-block bg-black text-white text-center px-10 py-5 font-bold uppercase tracking-[0.2em] text-sm hover:bg-zinc-800 transition shadow-[5px_5px_0px_0px_rgba(200,200,200,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                         Comprar Ahora — S/ {focusProduct.precio}
                     </Link>
                 ) : (
                     <button disabled className="inline-block bg-zinc-200 text-zinc-400 px-10 py-5 font-bold uppercase tracking-widest text-sm cursor-not-allowed">
                         Próximamente
                     </button>
                 )}
            </div>
         </div>
      </section>

      {/* =========================================
          5. THE STANDARD (Filosofía)
      ========================================= */}
      <section className="py-24 bg-zinc-950 text-white relative overflow-hidden border-t border-zinc-900">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>

         <div className="max-w-[1400px] mx-auto px-6 relative z-10">
             <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-zinc-800 pb-8 gap-6">
                 <div>
                     <span className="text-blue-600 font-bold tracking-[0.3em] uppercase mb-4 block text-xs">Philosophy</span>
                     <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 text-white leading-none">
                         The<br/>Standard
                     </h2>
                 </div>
                 <div className="max-w-md text-zinc-400 text-sm font-medium leading-relaxed text-right md:text-left">
                     <p>Calidad sobre cantidad. Definimos el estándar moderno del lujo urbano a través de una curaduría obsesiva.</p>
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
                 {/* Tarjetas de filosofía (Simplificadas para rendimiento) */}
                 {[
                    { title: "Heavyweight Fabrics", desc: "Algodón de alto gramaje y durabilidad extrema." },
                    { title: "Limited Drops", desc: "Sin restocks masivos. Exclusividad garantizada." },
                    { title: "Engineered Fit", desc: "Cortes diseñados para la silueta contemporánea." }
                 ].map((item, i) => (
                    <div key={i} className="bg-zinc-950 p-10 group hover:bg-black transition-colors duration-500">
                        <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-wider">{item.title}</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">{item.desc}</p>
                    </div>
                 ))}
             </div>
         </div>
      </section>

      {/* =========================================
          6. PRODUCTOS TRENDING (Grid Final)
      ========================================= */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-20">
                <span className="text-zinc-400 font-bold tracking-[0.2em] uppercase text-xs block mb-4">Stock Limitado</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 text-black">Últimos Drops</h2>
                <div className="w-full h-[1px] bg-zinc-200 max-w-xs mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
                {featuredProducts.length > 0 ? (
                    featuredProducts.map((product) => (
                        <div key={product.id} className="group">
                            <ProductCard product={product} />
                        </div>
                    ))
                ) : (
                    // Skeleton Loader si la carga es lenta o no hay datos
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-zinc-100 aspect-[3/4] mb-4 w-full border border-zinc-200"></div>
                            <div className="h-4 bg-zinc-200 w-2/3 mb-2"></div>
                            <div className="h-3 bg-zinc-100 w-1/3"></div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-24 text-center">
                <Link href="/products" className="group inline-flex flex-col items-center gap-2 text-xl font-black uppercase tracking-widest hover:text-zinc-600 transition-all">
                    <span>Explorar Todo</span>
                    <span className="block h-[2px] w-full bg-black group-hover:w-1/2 transition-all duration-300"></span>
                </Link>
            </div>
        </div>
      </section>

    </div>
  );
}