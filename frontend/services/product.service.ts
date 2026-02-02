import api from '@/lib/axios';
import { Brand } from '@/types';
import { Page, Product, Category} from '@/types/product.types'; 
import { Genero } from '@/types/product.types';
export interface ProductFormData {
    nombre: string;
    descripcion: string;
    precio: number;
    imagenUrl: string;
    genero: Genero;
    categoryId: number;
    brandId?: number; 
    featured?: boolean;
    descuento?: number; 
    variantes: {
        color: string;
        colorHex: string;
        talla: string;
        stock: number;
    }[];
}

export const productService = {
    
    getAll: async (
        page: number = 0, 
        size: number = 10, 
        keyword: string = '',
        categoryId?: number, 
        gender?: string,
        brandId?: number
    ): Promise<Page<Product>> => {
        
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        
        if (keyword) params.append('keyword', keyword);
        if (categoryId) params.append('categoryId', categoryId.toString());
        if (gender) params.append('gender', gender);
        if (brandId) params.append('brandId', brandId.toString());

        const { data } = await api.get<Page<Product>>(`/products?${params.toString()}`);
        return data;
    },


    getById: async (id: number): Promise<Product> => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    getFeatured: async (): Promise<Product | null> => {
        try {
            const { data } = await api.get<Product>('/products/featured');
            return data;
        } catch (error) {
            return null;
        }
    },

    create: async (productData: ProductFormData): Promise<Product> => {
        const { data } = await api.post<Product>('/products', productData);
        return data;
    },

    update: async (id: number, data: ProductFormData): Promise<Product> => {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/products/${id}`);
    },
    
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },

    getBrands: async (): Promise<Brand[]> => {
        const response = await api.get<Brand[]>('/brands');
        return response.data;
    },
    
    getByCategory: async (categoryId: number, brandId?: number): Promise<Product[]> => {
        const params = new URLSearchParams();
        if (brandId) params.append('brandId', brandId.toString());

        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        const { data } = await api.get<Product[]>(`/products/category/${categoryId}${queryString}`);
        return data;
    },

    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<{ url: string }>('/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.url;
    },

    getRecent: async (limit: number = 8): Promise<Product[]> => {
        const params = new URLSearchParams();
        params.append('page', '0');
        params.append('size', limit.toString());
        params.append('sort', 'id,desc'); 

        const { data } = await api.get<Page<Product>>(`/products?${params.toString()}`);
        return data.content;
    }
};