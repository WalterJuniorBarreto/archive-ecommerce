'use client';

// 1. IMPORTAMOS 'use' DE REACT
import { useEffect, useState, use } from 'react';
import { categoryService } from '@/services/category.service';
import CategoryForm from '@/components/admin/CategoryForm';
import { Category } from '@/types';

// 2. DEFINIMOS EL TIPO DE PARAMS COMO PROMISE
export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 3. DESEMPAQUETAMOS LOS PARAMS USANDO EL HOOK use()
  // Esto convierte la Promesa en el objeto real
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    // 4. USAMOS LA VARIABLE 'id' QUE YA DESEMPAQUETAMOS
    categoryService.getById(Number(id))
      .then(setCategory)
      .catch((err) => {
        console.error(err);
        alert("Error cargando la categoría");
      });
  }, [id]); // Dependencia del efecto es el ID ya resuelto

  if (!category) return <div>Cargando...</div>;

  return <CategoryForm initialData={category} />;
}