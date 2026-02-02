import { notFound } from 'next/navigation';
import { productService } from '@/services/product.service';
import ProductView from '@/components/products/ProductView';
import { Metadata } from 'next';
import { cache } from 'react'; // <--- LA CLAVE DEL RENDIMIENTO

interface Props {
    params: Promise<{ id: string }>;
}

// --- 1. OPTIMIZACIÓN DEVOPS: REQUEST MEMOIZATION ---
// Esto "cachea" la petición durante el ciclo de vida de UN request.
// Aunque la llamemos en metadata y en el componente, el fetch solo se ejecuta 1 vez.
const getProduct = cache(async (id: number) => {
    try {
        return await productService.getById(id);
    } catch (error) {
        return null;
    }
});

// --- 2. SEO AVANZADO (Metadata + OpenGraph) ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(Number(id));

    if (!product) {
        return {
            title: 'Producto no encontrado | ARCHIVE.',
            robots: { index: false } // No indexar páginas de error
        };
    }

    return {
        title: `${product.nombre} | ARCHIVE.`,
        description: product.descripcion?.substring(0, 160) || `Compra ${product.nombre} al mejor precio.`,
        openGraph: { // Para que se vea bonito al compartir en WhatsApp/Twitter
            title: product.nombre,
            description: product.descripcion,
            images: [
                {
                    url: product.imagenUrl || '/placeholder.jpg',
                    width: 800,
                    height: 600,
                    alt: product.nombre,
                },
            ],
            type: 'website',
        },
    };
}

// --- 3. SERVER COMPONENT ---
export default async function ProductDetailPage({ params }: Props) {
    const { id } = await params;
    
    // Llamamos a la función cacheada (no hace fetch de nuevo si ya se hizo en metadata)
    const product = await getProduct(Number(id));

    if (!product) {
        return notFound();
    }

    // --- JSON-LD para Google Shopping ---
    // Esto le dice a Google: "Oye, esto es un producto, cuesta tanto y hay stock".
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.nombre,
        image: [product.imagenUrl],
        description: product.descripcion,
        brand: {
            '@type': 'Brand',
            name: product.brand?.nombre || 'Geek Store'
        },
        offers: {
            '@type': 'Offer',
            price: product.precio,
            priceCurrency: 'PEN',
            // Lógica simple de stock: si stock > 0 está "InStock"
            availability: (product.stock > 0 || (product.variantes && product.variantes.length > 0))
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.id}`
        }
    };

    return (
        <main className="min-h-screen bg-white text-black font-sans pb-20">
            {/* Inyectamos datos estructurados invisibles */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="max-w-[1400px] mx-auto px-6 animate-in fade-in duration-500">
                
                {/* Breadcrumb Semántico (Mejor Accesibilidad) */}
                <nav aria-label="Breadcrumb" className="py-6">
                    <ol className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex gap-2 list-none p-0 m-0">
                        <li>
                            <a href="/products" className="hover:text-black transition-colors">Shop</a>
                        </li>
                        <li>/</li>
                        <li>
                            {product.category ? (
                                <a href={`/products?categoryId=${product.category.id}`} className="hover:text-black transition-colors">
                                    {product.category.nombre}
                                </a>
                            ) : (
                                <span>General</span>
                            )}
                        </li>
                        <li>/</li>
                        <li className="text-black line-clamp-1" aria-current="page">
                            {product.nombre}
                        </li>
                    </ol>
                </nav>

                {/* Vista Interactiva (Client Component) */}
                <ProductView product={product} />
            
            </div>
        </main>
    );
}