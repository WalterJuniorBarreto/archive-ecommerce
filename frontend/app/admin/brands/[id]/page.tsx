'use client';

import { useEffect, useState, use } from 'react';
import { brandService } from '@/services/brand.service';
import BrandForm from '@/components/admin/BrandForm';
import { Brand } from '@/types';

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  
  // Desempaquetamos los params
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [brand, setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    // Convertimos el string id a number
    brandService.getById(Number(id))
      .then(setBrand)
      .catch((err) => {
        console.error(err);
        alert("Error cargando la marca");
      });
  }, [id]);

  if (!brand) return <div>Cargando...</div>;

  return <BrandForm initialData={brand} />;
}