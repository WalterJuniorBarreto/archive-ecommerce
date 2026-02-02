import { Metadata } from 'next'; // Importante para SEO
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import CategoryFilter from '@/components/products/CategoryFilter';
import BrandFilter from '@/components/products/BrandFilter';
import Pagination from '@/components/ui/Pagination';
import MobileFilterDrawer from '@/components/products/MobileFilterDrawer'; 

// --- 1. DEFINICIÓN DE PROPS ---
interface Props {
  searchParams: Promise<{ 
    categoryId?: string; 
    brandId?: string; 
    search?: string; 
    page?: string; 
    category?: string;
    gender?: string; 
  }>;
}

// --- 2. GENERACIÓN DE METADATOS DINÁMICOS (SEO) ---
// Esto hace que cuando compartas el link en WhatsApp o Google indexe, salga el título correcto.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const title = params.search 
    ? `Resultados para "${params.search}" | Geek Store`
    : params.category 
      ? `${params.category} | Geek Store`
      : 'Catálogo Completo | Geek Store';

  return {
    title,
    description: `Explora nuestra colección de ${params.category || 'productos'} con los mejores precios.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

// --- 3. LÓGICA DE PAGINACIÓN SEGURA (Helper) ---
// Extraemos la lógica "sucia" fuera del componente principal para testearla mejor.
const calculateTotalPages = (data: any, pageSize: number, currentListSize: number): number => {
    // Prioridad 1: Estructura Spring Boot 'Page'
    if (data?.page?.totalPages !== undefined) return Number(data.page.totalPages);
    
    // Prioridad 2: Estructura Plana
    if (data?.totalPages !== undefined) return Number(data.totalPages);
    
    // Prioridad 3: Cálculo manual (Fallback)
    const totalElements = data?.page?.totalElements || data?.totalElements || currentListSize;
    const calculated = Math.ceil(totalElements / pageSize);
    return calculated === 0 && currentListSize > 0 ? 1 : calculated;
};

export default async function ProductsPage({ searchParams }: Props) {   
  const params = await searchParams;
  
  // Parsing seguro de parámetros
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined;
  const brandId = params.brandId ? Number(params.brandId) : undefined; 
  const currentPage = Math.max(0, Number(params.page) || 0); // Evitar negativos
  const pageSize = 20; 

  let products: Product[] = [];
  let totalPages = 0;
  let errorState = false;

  try {
    const data = await productService.getAll(
        currentPage, 
        pageSize, 
        params.search || '', 
        categoryId, 
        params.gender,   
        brandId   
    );
    
    products = data.content || [];
    totalPages = calculateTotalPages(data, pageSize, products.length);

  } catch (error) {
    console.error("[ProductsPage] Error critical fetching data:", error);
    errorState = true;
    // En un sistema real, aquí enviaríamos el error a Sentry/Datadog
  }

  const pageTitle = params.search 
    ? `Resultados: "${params.search}"`
    : params.category || "Catálogo";

  // --- 4. JSON-LD (Rich Snippets para Google Shopping) ---
  // 
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: 'Catálogo de productos Geek Store',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.nombre,
        description: product.descripcion,
        image: product.imagenUrl,
        offers: {
            '@type': 'Offer',
            price: product.precio,
            priceCurrency: 'PEN'
        }
      }
    }))
  };

  return (
    <main className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white pt-10 pb-20">
      {/* Inyectamos datos estructurados para Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-10 pb-4 border-b border-zinc-200 flex justify-between items-end">
             <div className="animate-in fade-in slide-in-from-left duration-500">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Shop / Archive</span>
                 <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-2 leading-none">
                    {pageTitle}
                 </h1>
             </div>
             <div className="hidden md:block text-right">
                 <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    {products.length > 0 ? `Mostrando ${products.length} Items` : '0 Items'}
                 </span>
             </div>
        </div>

        {/* LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* SIDEBAR (Desktop) */}
            <aside className="md:col-span-3 lg:col-span-2 hidden md:block">
                <div className="sticky top-24 space-y-8"> 
                    <CategoryFilter />
                    <BrandFilter />
                </div>
            </aside>

            {/* MOBILE DRAWER */}
            <div className="md:hidden col-span-1 mb-6">
                <MobileFilterDrawer 
                    currentFilters={{ categoryId, brandId, gender: params.gender }}
                    productCount={products.length} 
                />
            </div>

            {/* PRODUCT GRID */}
            <div className="md:col-span-9 lg:col-span-10">
                
                {errorState ? (
                    <div className="p-10 border border-red-200 bg-red-50 text-center rounded">
                        <p className="text-red-600 font-bold uppercase text-xs tracking-widest">Error de conexión</p>
                        <p className="text-sm mt-2">No pudimos cargar el catálogo. Intenta recargar la página.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-4">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center opacity-50 flex flex-col items-center border-2 border-dashed border-zinc-100 rounded-lg">
                                <span className="text-4xl mb-4 grayscale">🔍</span>
                                <h3 className="text-lg font-bold uppercase tracking-tight">Sin resultados</h3>
                                <p className="text-sm mt-2 mb-6 max-w-xs mx-auto text-zinc-500">
                                    No encontramos productos con los filtros seleccionados.
                                </p>
                                <a href="/products" className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
                                    Limpiar Filtros
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* PAGINACIÓN */}
                {!errorState && products.length > 0 && totalPages > 1 && (
                    <div className="mt-20 border-t border-zinc-100 pt-10">
                        <Pagination totalPages={totalPages} currentPage={currentPage} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </main>
  );
}