'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Estado local para evitar "flickering" (parpadeo) del contenido protegido
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Esperamos a que AuthContext termine de verificar el token
    if (!loading) {
      
      // CASO 1: No hay usuario (No logueado)
      if (!user) {
        // No mostramos toast aquí para no saturar, simplemente redirigimos
        router.replace('/login'); 
        return;
      }

      // CASO 2: Hay usuario, pero NO es Admin
      if (user.rol !== 'ROLE_ADMIN') {
        toast.error('⛔ Acceso restringido a Administradores');
        router.replace('/'); // Lo mandamos al Home
        return;
      }

      // CASO 3: Es Admin Legítimo
      setIsAuthorized(true);
    }
  }, [user, loading, router]);

  // MIENTRAS CARGA O VERIFICA PERMISOS:
  // Mostramos un Loader coherente con tu marca (Blanco y Negro)
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white">
        <div className="relative w-16 h-16">
            {/* Spinner Brutalista */}
            <div className="absolute top-0 left-0 w-full h-full border-4 border-zinc-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-black rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 animate-pulse">
            Verificando Credenciales...
        </p>
      </div>
    );
  }

  // Si llegamos aquí, es Admin seguro
  return <>{children}</>;
}