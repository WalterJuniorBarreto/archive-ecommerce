import api from '@/lib/axios';
import { Category, CategoryFormData } from '@/types';



export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get<Category[]>('/categories');
        return data;
    },

    getById: async (id: number): Promise<Category> => {
        
        const { data } = await api.get<Category>(`/categories/${id}`); 
        return data;
    },

    create: async (data: CategoryFormData): Promise<Category> => {
        const { data: res } = await api.post<Category>('/categories', data);
        return res;
    },

    update: async (id: number, data: CategoryFormData): Promise<Category> => {
        const { data: res } = await api.put<Category>(`/categories/${id}`, data);
        return res;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/categories/${id}`);
    }
};