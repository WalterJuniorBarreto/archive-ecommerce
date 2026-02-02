import api from '@/lib/axios';
import { Brand, BrandFormData } from '@/types';



export const brandService = {
    getAll: async (): Promise<Brand[]> => {
        const { data } = await api.get<Brand[]>('/brands');
        return data;
    },

   
    getById: async (id: number): Promise<Brand> => {
        const { data } = await api.get<Brand>(`/brands/${id}`);
        return data;
    },

    create: async (data: BrandFormData): Promise<Brand> => {
        const { data: res } = await api.post<Brand>('/brands', data);
        return res;
    },

    update: async (id: number, data: BrandFormData): Promise<Brand> => {
        const { data: res } = await api.put<Brand>(`/brands/${id}`, data);
        return res;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/brands/${id}`);
    }
};