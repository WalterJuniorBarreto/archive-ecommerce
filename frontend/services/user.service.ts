import api from '@/lib/axios';
import { Page, UserProfile, ChangePasswordRequest, AdminUserFormData, UserProfileUpdateRequest } from '@/types';

export const userService = {
    
    getMe: async (): Promise<UserProfile> => {
        const { data } = await api.get<UserProfile>('/users/me');
        return data;
    },

    updateProfile: async (data: UserProfileUpdateRequest): Promise<UserProfile> => {
        const { data: res } = await api.put<UserProfile>('/users/me', data);
        return res;
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await api.put('/users/me/password', data);
    },

  
    getAll: async (page: number = 0, size: number = 10): Promise<Page<UserProfile>> => {
        const { data } = await api.get<Page<UserProfile>>(`/admin/users?page=${page}&size=${size}`);
        return data;
    },

    getById: async (id: number): Promise<UserProfile> => {
        const { data } = await api.get<UserProfile>(`/admin/users/${id}`);
        return data;
    },

    create: async (data: AdminUserFormData): Promise<UserProfile> => {
        const { data: res } = await api.post<UserProfile>('/admin/users', data);
        return res;
    },

    update: async (id: number, data: AdminUserFormData): Promise<UserProfile> => {
        const { data: res } = await api.put<UserProfile>(`/admin/users/${id}`, data);
        return res;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    }
};