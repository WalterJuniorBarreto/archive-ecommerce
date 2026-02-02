'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { productService, ProductFormData } from '@/services/product.service';
import { Product, Category, Brand } from '@/types/product.types';
import { toast } from 'react-hot-toast';

interface Props {
  initialData?: Product;
}

interface VariantFormState {
    color: string;
    colorHex: string;
    talla: string;
    stock: number;
}

export default function ProductForm({ initialData }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]); 
  
  // 1. ESTADO DE VARIANTES (Inicialización segura)
  const [variants, setVariants] = useState<VariantFormState[]>(
      initialData?.variantes?.map(v => ({ 
          color: v.color, 
          colorHex: v.colorHex || '#000000', 
          talla: v.talla, 
          stock: v.stock 
      })) || []
  );

  // 2. ESTADO DE IMÁGENES
  const [imageUrls, setImageUrls] = useState<string[]>(
      initialData?.images && initialData.images.length > 0 
          ? initialData.images 
          : initialData?.imagenUrl ? [initialData.imagenUrl] : []
  );

  // 3. ESTADO DEL FORMULARIO
  const [formData, setFormData] = useState<Omit<ProductFormData, 'variantes' | 'images'>>({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    precio: initialData?.precio || 0,
    imagenUrl: '', // Se llena al enviar
    categoryId: initialData?.category?.id || 0,
    genero: initialData?.genero || 'UNISEX',
    brandId: initialData?.brandId || 0,
    featured: initialData?.featured || false,
    descuento: initialData?.descuento || 0,
  });

  // CARGA DE DATOS MAESTROS (Categorías y Marcas)
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [catsData, brandsData] = await Promise.all([
                productService.getCategories(),
                productService.getBrands()
            ]);
            setCategories(catsData as unknown as Category[]);
            setBrands(brandsData);
        } catch (error) {
            console.error("Error loading master data:", error);
            toast.error("No se pudieron cargar categorías o marcas.");
        }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numberFields = ['precio', 'categoryId', 'brandId', 'descuento']; 

    setFormData(prev => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value
    }));
  };
    
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.checked
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      const toastId = toast.loading("Subiendo imágenes...");
      
      try {
        const uploadPromises = Array.from(e.target.files).map(file => 
            productService.uploadImage(file)
        );
        const newUrls = await Promise.all(uploadPromises);
        setImageUrls(prev => [...prev, ...newUrls]);
        toast.success("Imágenes subidas", { id: toastId });
      } catch (error) {
        console.error(error);
        toast.error("Error al subir imágenes", { id: toastId });
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
      if (confirm("¿Eliminar esta imagen?")) {
          setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
      }
  };

  // --- LÓGICA DE VARIANTES ---

  const addVariant = () => {
      setVariants([...variants, { color: '', colorHex: '#000000', talla: '', stock: 0 }]);
  };

  const removeVariant = (index: number) => {
      if (variants.length > 1 && !confirm("¿Eliminar variante?")) return;
      setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantFormState, value: string | number) => {
      const updatedVariants = variants.map((v, i) => 
          i === index ? { ...v, [field]: value } : v
      );
      setVariants(updatedVariants);
  };

  // --- SUBMIT ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. VALIDACIONES DE NEGOCIO
    if (!formData.nombre.trim() || !formData.descripcion.trim()) {
        toast.error("Nombre y descripción son obligatorios");
        return;
    }
    
    if (imageUrls.length === 0) {
        toast.error("Debes subir al menos una imagen principal");
        return;
    }

    if (variants.length === 0) {
        toast.error("Debes agregar al menos una variante (Talla/Color)");
        return;
    }

    for (const v of variants) {
        if (!v.color.trim() || !v.talla.trim()) {
            toast.error("Todas las variantes deben tener Color y Talla completos");
            return;
        }
        if (v.stock < 0) {
            toast.error("El stock no puede ser negativo");
            return;
        }
    }

    setLoading(true);
    const toastId = toast.loading("Guardando producto...");

    const finalData: ProductFormData = {
        ...formData,
        imagenUrl: imageUrls[0], // La primera es la principal por defecto
        images: imageUrls, 
        variantes: variants
    };

    try {
      if (initialData) {
        await productService.update(initialData.id, finalData);
        toast.success("Producto actualizado correctamente", { id: toastId });
      } else {
        await productService.create(finalData);
        toast.success("Producto creado correctamente", { id: toastId });
      }
      
      router.refresh(); 
      router.push('/admin/products'); 

    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el producto", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- ESTILOS REUTILIZABLES ---
  const inputClass = "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-none text-sm font-medium";
  const labelClass = "block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 group-focus-within:text-black transition-colors";
  const cardClass = "bg-white border border-zinc-200 shadow-sm p-6 relative overflow-hidden";

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white ${initialData ? 'bg-zinc-800' : 'bg-black'}`}>
                    {initialData ? 'EDICIÓN' : 'NUEVO'}
                </span>
            </div>
            <h2 className="text-4xl font-black text-black uppercase tracking-tighter">
                {initialData ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">Gestión de catálogo e inventario.</p>
        </div>
        <div className="flex gap-3">
            <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-zinc-300 text-zinc-600 font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black hover:border-black transition-all"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={loading || uploading}
                className="px-8 py-3 bg-black text-white font-black text-xs uppercase tracking-[0.15em] hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Guardando...
                    </>
                ) : 'Guardar Cambios'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === COLUMNA IZQUIERDA (Info + Variantes) === */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* 1. INFORMACIÓN BÁSICA */}
            <div className={cardClass}>
                <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-zinc-100 pb-2">Información Básica</h3>
                
                <div className="space-y-6">
                    <div className="group">
                        <label className={labelClass}>Nombre del Producto</label>
                        <input
                            name="nombre"
                            type="text"
                            required
                            className={inputClass}
                            placeholder="Ej: Polera Oversize Heavyweight"
                            value={formData.nombre}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="group">
                        <label className={labelClass}>Descripción</label>
                        <textarea
                            name="descripcion"
                            required
                            rows={6}
                            className={inputClass}
                            placeholder="Detalles del material, corte y diseño..."
                            value={formData.descripcion}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* 2. VARIANTES */}
            <div className={cardClass}>
                <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Variantes (SKUs)</h3>
                    <button type="button" onClick={addVariant} className="text-[10px] bg-black text-white px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors">
                        + Agregar Variante
                    </button>
                </div>

                <div className="space-y-3">
                    {variants.map((variant, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-end bg-zinc-50 p-4 border border-zinc-200 group hover:border-black transition-colors relative">
                            {/* Eliminar Variante (X) */}
                            <button 
                                type="button" 
                                onClick={() => removeVariant(index)}
                                className="absolute top-2 right-2 text-zinc-300 hover:text-red-500 transition-colors"
                                title="Eliminar variante"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                            </button>

                            {/* Color */}
                            <div className="col-span-4 md:col-span-3">
                                <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Color</label>
                                <input 
                                    type="text" 
                                    placeholder="Nombre" 
                                    className="w-full p-2 bg-white border border-zinc-300 text-xs font-bold uppercase focus:border-black focus:outline-none"
                                    value={variant.color}
                                    onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                />
                            </div>

                            {/* Hex & Talla */}
                            <div className="col-span-3 md:col-span-2">
                                <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Hex</label>
                                <div className="flex h-[34px] border border-zinc-300 bg-white p-1 gap-1">
                                    <input 
                                        type="color" 
                                        className="h-full w-8 p-0 border-0 cursor-pointer"
                                        value={variant.colorHex}
                                        onChange={(e) => handleVariantChange(index, 'colorHex', e.target.value)}
                                    />
                                    <input 
                                        type="text" 
                                        className="w-full h-full text-[10px] font-mono border-none focus:ring-0 p-0 text-zinc-600 uppercase"
                                        value={variant.colorHex}
                                        maxLength={7}
                                        onChange={(e) => handleVariantChange(index, 'colorHex', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-span-3 md:col-span-3">
                                <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Talla</label>
                                <input 
                                    type="text" 
                                    placeholder="S, M..." 
                                    className="w-full p-2 bg-white border border-zinc-300 text-xs font-bold uppercase focus:border-black focus:outline-none"
                                    value={variant.talla}
                                    onChange={(e) => handleVariantChange(index, 'talla', e.target.value)}
                                />
                            </div>

                            <div className="col-span-2 md:col-span-2">
                                <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Stock</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full p-2 bg-white border border-zinc-300 text-xs font-mono focus:border-black focus:outline-none"
                                    value={variant.stock}
                                    onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    ))}
                    {variants.length === 0 && (
                        <div className="text-center py-8 bg-zinc-50 border border-dashed border-zinc-300 text-zinc-400 text-xs uppercase animate-pulse">
                            Debes agregar al menos una variante para vender.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* === COLUMNA DERECHA === */}
        <div className="space-y-8">
            
            {/* 3. ESTADO */}
            <div className={cardClass}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-zinc-100 pb-2">Visibilidad</h3>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200">
                    <input
                        type="checkbox"
                        name="featured"
                        id="featured"
                        className="w-5 h-5 accent-black cursor-pointer mt-0.5"
                        checked={formData.featured || false} 
                        onChange={handleCheckboxChange}
                    />
                    <div>
                        <label htmlFor="featured" className="block text-xs font-bold uppercase tracking-wide cursor-pointer text-black">
                            Producto Destacado
                        </label>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-snug">
                            Se mostrará en la portada de la tienda.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. MULTIMEDIA */}
            <div className={cardClass}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-zinc-100 pb-2">Galería</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {imageUrls.map((url, index) => (
                        <div key={index} className={`relative group aspect-square border ${index === 0 ? 'border-black ring-2 ring-black' : 'border-zinc-200'} bg-zinc-50 overflow-hidden`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            
                            {index === 0 && (
                                <span className="absolute bottom-0 left-0 w-full bg-black/80 text-white text-[8px] font-bold text-center py-1 uppercase tracking-wider backdrop-blur-sm">
                                    Principal
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-white text-black border border-black p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500"
                                title="Eliminar imagen"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    
                    {/* Botón Subir */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className={`aspect-square border-2 border-dashed transition flex flex-col items-center justify-center gap-2 ${
                            uploading ? 'border-zinc-300 bg-zinc-100 cursor-wait' : 'border-zinc-300 hover:border-black hover:bg-zinc-50 text-zinc-400 hover:text-black'
                        }`}
                    >
                        {uploading ? (
                            <svg className="animate-spin h-6 w-6 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <span className="text-3xl font-light">+</span>
                        )}
                        <span className="text-[9px] font-bold uppercase">{uploading ? 'Subiendo...' : 'Agregar'}</span>
                    </button>
                </div>
                
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* 5. ORGANIZACIÓN */}
            <div className={cardClass}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-zinc-100 pb-2">Clasificación</h3>
                <div className="space-y-5">
                    <div className="group">
                        <label className={labelClass}>Categoría</label>
                        <select
                            name="categoryId"
                            className={inputClass}
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                        >
                            <option value={0} disabled>-- Seleccionar --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="group">
                        <label className={labelClass}>Marca</label>
                        <select
                            name="brandId"
                            className={inputClass}
                            value={formData.brandId || 0}
                            onChange={handleChange}
                        >
                            <option value={0}>-- General / Sin Marca --</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="group">
                        <label className={labelClass}>Género</label>
                        <select
                            name="genero"
                            className={inputClass}
                            value={formData.genero}
                            onChange={handleChange}
                        >
                            <option value="HOMBRE">HOMBRE</option>
                            <option value="MUJER">MUJER</option>
                            <option value="UNISEX">UNISEX</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 6. PRECIOS */}
            <div className={cardClass}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-zinc-100 pb-2">Precios</h3>
                <div className="space-y-5">
                    <div className="group">
                        <label className={labelClass}>Precio Regular (PEN)</label>
                        <input
                            name="precio"
                            type="number"
                            step="0.01"
                            required
                            className={inputClass}
                            value={formData.precio}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="group">
                        <label className={labelClass}>Descuento (%)</label>
                        <div className="flex gap-2">
                            <input
                                name="descuento"
                                type="number"
                                min="0"
                                max="100"
                                className={inputClass}
                                value={formData.descuento || 0}
                                onChange={handleChange}
                            />
                            <div className="w-20 bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs">
                                % OFF
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-2 text-right">
                            Precio final: <span className="text-black font-bold">S/ {(formData.precio * (1 - (formData.descuento || 0) / 100)).toFixed(2)}</span>
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </form>
  );
}