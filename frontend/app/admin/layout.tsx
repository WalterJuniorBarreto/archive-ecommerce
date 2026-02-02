'use client';

import { useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Para saber en qué página estamos
import { useAuth } from '@/context/AuthContext'; // Asumo que tienes esto para el logout

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth(); // Para mostrar datos del admin y cerrar sesión

  // Helper para verificar link activo
  const isActive = (path: string) => pathname === path;

  return (
    <AdminRoute>
      <div className="flex h-screen bg-zinc-50 overflow-hidden">
        
        {/* =========================================================
            SIDEBAR (BARRA LATERAL)
           ========================================================= */}
        <aside className={`
          inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* 1. LOGO AREA */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-200 bg-black text-white">
            <span className="text-lg font-black uppercase tracking-widest">
              Admin Panel
            </span>
          </div>

          {/* 2. NAVEGACIÓN */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
            
            {/* GRUPO 1: PRINCIPAL */}
            <div>
                <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Principal</p>
                <div className="space-y-1">
                    <SidebarLink href="/admin" active={isActive('/admin')} icon={<IconDashboard />}>
                        Resumen
                    </SidebarLink>
                    <SidebarLink href="/admin/orders" active={isActive('/admin/orders')} icon={<IconOrders />}>
                        Pedidos Globales
                    </SidebarLink>
                </div>
            </div>

            {/* GRUPO 2: GESTIÓN */}
            <div>
                <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Catálogo</p>
                <div className="space-y-1">
                    <SidebarLink href="/admin/products" active={isActive('/admin/products')} icon={<IconBox />}>
                        Productos
                    </SidebarLink>
                    <SidebarLink href="/admin/categories" active={isActive('/admin/categories')} icon={<IconTag />}>
                        Categorías
                    </SidebarLink>
                    <SidebarLink href="/admin/brands" active={isActive('/admin/brands')} icon={<IconStar />}>
                        Marcas
                    </SidebarLink>
                </div>
            </div>

            {/* GRUPO 3: USUARIOS Y SOPORTE */}
            <div>
                <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Personas</p>
                <div className="space-y-1">
                    <SidebarLink href="/admin/users" active={isActive('/admin/users')} icon={<IconUsers />}>
                        Usuarios
                    </SidebarLink>
                    <SidebarLink href="/admin/complaints" active={isActive('/admin/complaints')} isAlert icon={<IconMegaphone />}>
                        Reclamaciones
                    </SidebarLink>
                </div>
            </div>

             
          </nav>

          {/* 3. PERFIL ADMIN (FOOTER SIDEBAR) */}
          <div className="border-t border-zinc-200 p-4 bg-zinc-50">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center font-bold text-xs text-zinc-600">
                    AD
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black truncate">{user?.nombre || 'Administrador'}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'admin@geekstore.com'}</p>
                </div>
                <button onClick={logout} className="text-zinc-400 hover:text-red-600 transition-colors" title="Cerrar Sesión">
                    <IconLogout />
                </button>
            </div>
          </div>
        </aside>

        {/* OVERLAY MÓVIL */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* =========================================================
            CONTENIDO PRINCIPAL
           ========================================================= */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* TOPBAR (HEADER) */}
          <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {/* Botón menú móvil */}
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden text-zinc-500 hover:text-black"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                
                {/* Buscador Global (Visual) */}
                <div className="hidden md:flex items-center bg-zinc-50 border border-zinc-200 px-3 py-1.5 w-64 md:w-96 transition-colors focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="text" 
                        placeholder="Buscar orden, producto o usuario..." 
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-zinc-400 text-black"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notificaciones */}
                <button className="relative p-2 text-zinc-400 hover:text-black transition-colors">
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                    <IconBell />
                </button>
                {/* Botón ir a la tienda */}
                <Link href="/" target="_blank" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wide border border-zinc-200 px-3 py-1.5 hover:bg-black hover:text-white transition-all">
                    Ver Tienda ↗
                </Link>
            </div>
          </header>

          {/* ÁREA DE CONTENIDO (CHILDREN) */}
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </main>
        
        </div>
      </div>
    </AdminRoute>
  );
}

// --- COMPONENTE DE ENLACE DE SIDEBAR ---
function SidebarLink({ href, children, active, icon, isAlert }: any) {
    return (
        <Link 
            href={href}
            className={`
                group flex items-center px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-2
                ${active 
                    ? 'bg-zinc-100 border-black text-black' 
                    : isAlert 
                        ? 'text-red-600 border-transparent hover:bg-red-50 hover:text-red-700' 
                        : 'text-zinc-500 border-transparent hover:bg-zinc-50 hover:text-black hover:border-zinc-300'
                }
            `}
        >
            <span className={`mr-3 ${active ? 'text-black' : isAlert ? 'text-red-500' : 'text-zinc-400 group-hover:text-black'}`}>
                {icon}
            </span>
            {children}
        </Link>
    );
}

// --- ICONOS SVG (Para no instalar librerías extra) ---
const IconDashboard = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconOrders = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const IconBox = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const IconTag = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const IconStar = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconMegaphone = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
const IconSettings = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconBell = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const IconLogout = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;