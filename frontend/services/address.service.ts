import api from '@/lib/axios';
import { Address, AddressFormData } from '@/types/address.types';

export const addressService = {
    
    getAll: async (): Promise<Address[]> => {
        const { data } = await api.get<Address[]>('/users/me/addresses');
        return data;
    },


    create: async (data: AddressFormData): Promise<Address> => {
        const { data: res } = await api.post<Address>('/users/me/addresses', data);
        return res;
    },

   

    update: async (id: number, data: AddressFormData): Promise<Address> => {
        const { data: res } = await api.put<Address>(`/users/me/addresses/${id}`, data);
        return res;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/users/me/addresses/${id}`);
    }
};
