'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, LoginRequest } from '@/types';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { toast } from 'react-hot-toast'; 
import { AxiosError } from 'axios';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean; 
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await userService.getMe();
        setUser(userData);
      } catch (error) {
        console.error("Sesión inválida o expirada:", error);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      
      authService.setToken(response.token);
      
      const userData = await userService.getMe();
      setUser(userData);

      toast.success(`Bienvenido, ${userData.nombre}`);
      
      if (userData.rol === 'ADMIN') {
        router.push('/admin'); 
      } else {
        router.push('/');
      }

    } catch (error) {
      let errorMessage = "Error al iniciar sesión";

      if (error instanceof AxiosError) {
       
        errorMessage = error.response?.data?.message || error.message;
        
        console.error("Error Backend:", error.response?.status, errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      
      throw error;
    }
  };


  const loginWithGoogle = async (googleToken: string) => {
    try {
        const response = await authService.loginWithGoogle(googleToken);
        
        authService.setToken(response.token);
        
        const userData = await userService.getMe();
        setUser(userData);
        
        toast.success("Autenticado con Google exitosamente");
        router.push('/');

    } catch (error) {
        console.error("Fallo Google Login:", error);
        toast.error("No se pudo iniciar sesión con Google.");
        throw error;
    }
  };


  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('cart'); 
    setUser(null);
    router.push('/login');
    router.refresh(); 
  }, [router]);

  const isAdmin = user?.rol === 'ADMIN';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
        user, 
        login, 
        loginWithGoogle, 
        logout, 
        loading,
        isAuthenticated,
        isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};