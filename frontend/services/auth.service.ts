import api from '@/lib/axios';
import { AuthResponse, LoginRequest, RegisterRequest, User, UserResponse } from '@/types';

export const authService = {
    
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials);
        return data;
    },



    register: async (userData: RegisterRequest): Promise<UserResponse> => {
        const { data } = await api.post<UserResponse>('/auth/register', userData);
        return data;
    },


    setToken: (token: string) => {
        if (typeof window !== 'undefined') { 
            localStorage.setItem('token', token);
        }
    },

    getToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    },

  
    confirmAccount: async (token: string): Promise<string> => {
        const { data } = await api.get<string>(`/auth/confirm?token=${token}`);
        return data;
    },



    sendRecoveryCode: async (email: string): Promise<void> => {
        await api.post('/auth/password/recover', { email });
    },

 
    resetPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
        await api.post('/auth/password/reset', { email, code, newPassword });
    },



    loginWithGoogle: async (token: string): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>('/auth/google', { token });
        return data;
    },

  
    verifyRecoveryCode: async (email: string, code: string): Promise<boolean> => {
        const { data } = await api.post<boolean>('/auth/verify-recovery-code', { email, code });
        return data;
    },
};