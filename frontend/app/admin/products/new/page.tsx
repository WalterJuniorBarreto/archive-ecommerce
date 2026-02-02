import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      {/* Reutilizamos el formulario sin datos iniciales */}
      <ProductForm />
    </div>
  );
}