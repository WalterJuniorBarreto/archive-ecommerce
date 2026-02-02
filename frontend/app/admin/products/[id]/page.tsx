'use client';

// 1. IMPORTAMOS 'use' DE REACT
import { useEffect, useState, use } from 'react';
import { productService } from '@/services/product.service';
import ProductForm from '@/components/admin/ProductForm';
import { Product } from '@/types';

// 2. DEFINIMOS EL TIPO DE PARAMS COMO PROMISE
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 3. DESEMPAQUETAMOS LOS PARAMS USANDO EL HOOK use()
  // Esto convierte la Promesa en el objeto real
  const resolvedParams = use(params);
  const id = resolvedParams.id; // Ahora sí tenemos el ID como string

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 4. USAMOS LA VARIABLE 'id' QUE YA DESEMPAQUETAMOS
    productService.getById(Number(id))
      .then(setProduct)
      .catch((err) => alert('Error al cargar producto'))
      .finally(() => setLoading(false));
  }, [id]); // La dependencia es el ID ya resuelto

  if (loading) return <div>Cargando...</div>;
  if (!product) return <div>Producto no encontrado</div>;

  return (
    <div>
      {/* Pasamos los datos existentes al formulario */}
      <ProductForm initialData={product} />
    </div>
  );
}