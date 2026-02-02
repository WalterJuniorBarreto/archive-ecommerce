'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast'; // Importante para feedback

// 1. MEJORA DE RENDIMIENTO: Constante estática fuera del ciclo de render
const MENU_ITEMS = [
  { name: 'Mi Perfil', path: '/profile' },
  { name: 'Mis Pedidos', path: '/profile/orders' },
  { name: 'Direcciones', path: '/profile/addresses' },
  { name: 'Wishlist', path: '/profile/wishlist' },
  { name: 'Seguridad', path: '/profile/security' },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 2. SEGURIDAD: Protección de ruta cliente
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
      logout();
      toast.success("Sesión cerrada correctamente"); // Feedback visual
      router.push('/login');
  };

  // 3. UX: Loader elegante alineado a la marca
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <span className="text-4xl font-black">G</span>
            <span className="font-bold tracking-[0.3em] text-[10px] uppercase text-zinc-400">Verificando Credenciales...</span>
        </div>
      </div>
    );
  }

  // Evita renderizar contenido si no hay usuario (protección visual extra)
  if (!user) return null;

  const currentRouteName = MENU_ITEMS.find(item => item.path === pathname)?.name || 'Cuenta';

  return (
    <div className="min-h-screen bg-white">
      
      {/* HEADER DE BIENVENIDA (Estilo Industrial) */}
      <div className="bg-zinc-50 border-b border-zinc-200">
          <div className="max-w-[1400px] mx-auto px-6 py-10 md:py-14">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Panel de Control</span>
                      <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
                          {user.nombre?.split(' ')[0]}
                      </h1>
                  </div>
                  <p className="text-zinc-500 text-xs font-medium tracking-wide uppercase border-l-2 border-zinc-300 pl-4">
                      Miembro desde {new Date().getFullYear()}
                  </p>
              </div>
          </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
          
          {/* --- SIDEBAR DE NAVEGACIÓN --- */}
          <aside className="w-full md:w-64 flex-shrink-0 sticky top-24">
            
            {/* VERSIÓN MÓVIL (Dropdown) */}
            <div className="md:hidden mb-8 relative z-20">
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-full bg-black text-white px-6 py-4 flex justify-between items-center font-bold uppercase tracking-widest text-xs shadow-lg"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span>{currentRouteName}</span>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
                        className={`w-4 h-4 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                <div className={`absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out bg-white border-x border-b border-zinc-200 shadow-xl ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <nav className="flex flex-col">
                        {MENU_ITEMS.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b border-zinc-100 hover:bg-zinc-50 ${
                                    pathname === item.path ? 'bg-zinc-50 text-black border-l-4 border-l-black' : 'text-zinc-500'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <button onClick={handleLogout} className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-600 text-left hover:bg-red-50">
                            Salir
                        </button>
                    </nav>
                </div>
            </div>

            {/* VERSIÓN DESKTOP (Lista Lateral) */}
            <div className="hidden md:block">
                <nav className="flex flex-col space-y-1">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`group flex items-center justify-between px-0 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 border-b border-zinc-100 ${
                                    isActive 
                                    ? 'text-black pl-4 border-black' 
                                    : 'text-zinc-400 hover:text-black hover:pl-2 hover:border-zinc-300'
                                }`}
                            >
                                {item.name}
                                {isActive && <span className="w-1.5 h-1.5 bg-black rounded-full"></span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-12 pt-6 border-t border-zinc-200">
                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors w-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12" />
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
          </aside>

          {/* --- CONTENIDO PRINCIPAL --- */}
          {/* Añadimos 'animate-in' para suavizar la entrada de cada página del perfil */}
          <main className="flex-1 w-full min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}