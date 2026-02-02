'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { categoryService } from '@/services/category.service';
import { brandService } from '@/services/brand.service';
import { Category, Brand } from '@/types/product.types';

// --- SUB-COMPONENTE: MENÚ MÓVIL (Separado para limpieza) ---
// Al ser memoizado, no se re-renderiza si el padre cambia cosas irrelevantes
interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    brands: Brand[];
    user: any;
    logout: () => void;
}

type MobileStage = 'MAIN' | 'HOMBRE' | 'MUJER' | 'MARCAS';

const MobileMenu = memo(({ isOpen, onClose, categories, brands, user, logout }: MobileMenuProps) => {
    const [stage, setStage] = useState<MobileStage>('MAIN');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    // Resetear stage cuando se abre/cierra
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setStage('MAIN');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
            onClose();
            setSearchTerm('');
        }
    };

    const navigate = (href: string) => {
        router.push(href);
        onClose();
    };

    const getGenderParam = (s: MobileStage) => s === 'HOMBRE' ? 'Men' : 'Women';

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm md:hidden" onClick={onClose} />
            <aside className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-black">
                    {stage !== 'MAIN' ? (
                        <button onClick={() => setStage('MAIN')} className="flex items-center text-black p-2 -ml-2 font-bold uppercase cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="square" strokeLinejoin="miter" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                        </button>
                    ) : (
                        <span className="text-2xl font-black tracking-tighter uppercase">MENU</span>
                    )}
                    
                    {stage !== 'MAIN' && (
                        <span className="absolute left-1/2 -translate-x-1/2 text-2xl font-black tracking-tighter uppercase">{stage}</span>
                    )}

                    <button onClick={onClose} className="p-2 cursor-pointer ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Buscador */}
                <div className="p-6 border-b border-zinc-100">
                    <form onSubmit={handleSearch} className="relative">
                        <input type="text" placeholder="BUSCAR..." className="w-full bg-zinc-100 py-3 px-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button type="submit" className="absolute right-3 top-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
                    </form>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain">
                    {stage === 'MAIN' ? (
                        <nav className="space-y-8 pb-24">
                            <Link href="/" onClick={() => navigate('/')} className="block text-2xl font-black uppercase tracking-tighter">Inicio</Link>
                            <button onClick={() => setStage('HOMBRE')} className="w-full text-left text-2xl font-black uppercase tracking-tighter">Hombre &gt;</button>
                            <button onClick={() => setStage('MUJER')} className="w-full text-left text-2xl font-black uppercase tracking-tighter">Mujer &gt;</button>
                            <button onClick={() => setStage('MARCAS')} className="w-full text-left text-2xl font-black uppercase tracking-tighter">Marcas &gt;</button>
                        </nav>
                    ) : (
                        <div className="space-y-4">
                            {(stage === 'MARCAS' ? brands : categories).map((item) => (
                                <button 
                                    key={item.id} 
                                    onClick={() => navigate(stage === 'MARCAS' ? `/products?brandId=${item.id}` : `/products?categoryId=${item.id}&gender=${getGenderParam(stage)}`)} 
                                    className="block w-full text-left text-xl font-black uppercase tracking-tight hover:text-zinc-600"
                                >
                                    {item.nombre || item.name}
                                </button>
                            ))}
                            <div className="pt-6 border-t border-zinc-100">
                                <button onClick={() => navigate(stage === 'MARCAS' ? '/products' : `/products?gender=${getGenderParam(stage)}`)} className="block w-full text-left text-sm font-bold uppercase tracking-widest underline decoration-2 underline-offset-4">
                                    Ver Todo
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Login */}
                {stage === 'MAIN' && (
                    <div className="p-6 border-t border-black bg-zinc-50">
                        {user ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-black text-white flex items-center justify-center text-sm font-bold border border-black uppercase rounded-full">{user.nombre?.charAt(0) || 'U'}</div>
                                    <div className="flex flex-col"><span className="font-bold uppercase text-sm">{user.nombre}</span><span className="text-[10px] text-zinc-500 truncate">{user.email}</span></div>
                                </div>
                                <div className="flex flex-col gap-3 pl-2">
                                    <Link href="/profile" onClick={onClose} className="text-sm font-bold uppercase">Mi Perfil</Link>
                                    <Link href="/profile/orders" onClick={onClose} className="text-sm font-bold uppercase">Mis Pedidos</Link>
                                    {user.rol === 'ROLE_ADMIN' && <Link href="/admin/products" onClick={onClose} className="text-sm font-bold uppercase text-red-600">⚡ Admin Panel</Link>}
                                </div>
                                <button onClick={() => { logout(); onClose(); router.push('/'); }} className="mt-2 text-xs font-bold uppercase underline text-zinc-400 text-left">Cerrar Sesión</button>
                            </div>
                        ) : (
                            <Link href="/login" onClick={onClose} className="block w-full bg-black text-white text-center py-4 font-bold uppercase tracking-widest hover:bg-zinc-800">Iniciar Sesión</Link>
                        )}
                    </div>
                )}
            </aside>
        </>
    );
});
MobileMenu.displayName = 'MobileMenu';


// --- COMPONENTE PRINCIPAL: NAVBAR ---
export default function Navbar() {
    const { user, logout } = useAuth();
    const { wishlistCount } = useWishlist();
    const { count, isBouncing } = useCart();
    const router = useRouter();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Cache de datos en el cliente
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Carga de datos optimizada (con Promise.allSettled para robustez)
    useEffect(() => {
        const loadMenuData = async () => {
            const results = await Promise.allSettled([
                categoryService.getAll(),
                brandService.getAll()
            ]);
            
            if (results[0].status === 'fulfilled') setCategories(results[0].value);
            if (results[1].status === 'fulfilled') setBrands(results[1].value);
        };
        loadMenuData();
    }, []);

    // Cierre de menús al navegar
    useEffect(() => {
        setActiveCategory(null);
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    }, [router]);

    // Click outside para menú de usuario
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
        }
    }, [searchTerm, router]);

    const handleUserClick = useCallback(() => {
        if (user) setIsUserMenuOpen(prev => !prev);
        else router.push('/login');
    }, [user, router]);

    return (
        <>
            <nav className="bg-white border-b border-black sticky top-0 z-50 transition-all duration-300" onMouseLeave={() => setActiveCategory(null)}>
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        
                        {/* Hamburger */}
                        <div className="flex items-center md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(true)} className="text-black p-2 -ml-2 cursor-pointer" aria-label="Abrir menú">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="square" strokeLinejoin="miter" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                            </button>
                        </div>

                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none" onMouseEnter={() => setActiveCategory(null)}>
                            <Link href="/" className="text-3xl font-black tracking-tighter text-black uppercase hover:opacity-70 transition-opacity">ARCHIVE.</Link>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex space-x-10 items-center h-full">
                            <Link href="/" onMouseEnter={() => setActiveCategory(null)} className="nav-link-desktop">Inicio</Link>
                            <Link href="/products?gender=Men" onMouseEnter={() => setActiveCategory('HOMBRE')} className={`nav-link-desktop ${activeCategory === 'HOMBRE' ? 'border-black' : 'border-transparent'}`}>Hombre</Link>
                            <Link href="/products?gender=Women" onMouseEnter={() => setActiveCategory('MUJER')} className={`nav-link-desktop ${activeCategory === 'MUJER' ? 'border-black' : 'border-transparent'}`}>Mujer</Link>
                            <Link href="/products" onMouseEnter={() => setActiveCategory('MARCAS')} className={`nav-link-desktop ${activeCategory === 'MARCAS' ? 'border-black' : 'border-transparent'}`}>Marcas</Link>
                        </div>

                        {/* Icons & Search */}
                        <div className="flex items-center gap-4 md:gap-8" onMouseEnter={() => setActiveCategory(null)}>
                            <form onSubmit={handleSearch} className="hidden lg:flex items-center group">
                                <button type="submit" className="text-black group-hover:text-zinc-600 transition"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
                                <input type="text" placeholder="BUSCAR..." className="bg-transparent border-b border-transparent group-hover:border-black outline-none text-sm ml-3 w-24 focus:w-48 transition-all duration-500 text-black placeholder-zinc-400 font-bold uppercase tracking-wider h-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </form>

                            <div className="flex items-center gap-4 md:gap-6">
                                <Link href="/profile/wishlist" className="relative text-black hover:text-zinc-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="square" strokeLinejoin="miter" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                    {wishlistCount > 0 && <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">{wishlistCount}</span>}
                                </Link>

                                <button onClick={() => router.push('/cart')} className={`relative text-black hover:text-zinc-500 ${isBouncing ? 'animate-bounce-in' : ''}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="square" strokeLinejoin="miter" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    {count > 0 && <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">{count}</span>}
                                </button>

                                <div className="relative hidden md:block" ref={dropdownRef}>
                                    <button onClick={handleUserClick} className="flex items-center focus:outline-none">
                                        {user ? (
                                            <div className="h-8 w-8 bg-black text-white flex items-center justify-center text-xs font-bold border border-black uppercase rounded-full">{user.nombre?.charAt(0) || 'U'}</div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="square" strokeLinejoin="miter" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        )}
                                    </button>
                                    
                                    {isUserMenuOpen && user && (
                                        <div className="absolute right-0 mt-6 w-64 bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 animate-in fade-in zoom-in duration-200">
                                            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                                <p className="text-xs font-bold text-black uppercase tracking-wider">HOLA</p>
                                                <p className="text-sm font-medium text-zinc-600 truncate">{user.nombre}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link href="/profile" className="block px-6 py-3 text-sm text-black hover:bg-black hover:text-white transition font-medium uppercase tracking-wide">Mi Perfil</Link>
                                                <Link href="/profile/orders" className="block px-6 py-3 text-sm text-black hover:bg-black hover:text-white transition font-medium uppercase tracking-wide">Mis Pedidos</Link>
                                                {user.rol === 'ROLE_ADMIN' && <Link href="/admin/products" className="block px-6 py-3 text-sm text-red-600 hover:bg-red-600 hover:text-white font-bold transition uppercase tracking-wide">⚡ Admin</Link>}
                                            </div>
                                            <div className="border-t border-black">
                                                <button onClick={() => { setIsUserMenuOpen(false); logout(); router.push('/'); }} className="w-full text-left px-6 py-4 text-sm text-zinc-500 hover:text-black hover:bg-zinc-100 transition font-bold uppercase tracking-wide">Cerrar Sesión</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MEGA MENU DESKTOP */}
                <div className={`absolute top-full left-0 w-full bg-white border-b border-black overflow-hidden transition-all duration-300 ease-in-out ${activeCategory ? 'max-h-[500px] py-12 opacity-100 shadow-xl' : 'max-h-0 py-0 opacity-0'}`} onMouseEnter={() => {}} onMouseLeave={() => setActiveCategory(null)}>
                    <div className="max-w-[1600px] mx-auto px-6">
                        <div className="grid grid-cols-4 gap-12">
                            <div className="col-span-1 border-r border-zinc-100">
                                <h2 className="text-6xl font-black uppercase tracking-tighter text-black mb-4">{activeCategory}</h2>
                                <Link href={activeCategory === 'MARCAS' ? '/products' : `/products?gender=${activeCategory === 'HOMBRE' ? 'Men' : 'Women'}`} className="text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-zinc-500" onClick={() => setActiveCategory(null)}>
                                    {activeCategory === 'MARCAS' ? 'Ver Todas las Marcas' : `Ver Todo ${activeCategory}`}
                                </Link>
                            </div>
                            <div className="col-span-3 grid grid-cols-3 gap-8">
                                {(activeCategory === 'MARCAS' ? brands : categories).map((item) => (
                                    <Link key={item.id} href={activeCategory === 'MARCAS' ? `/products?brandId=${item.id}` : `/products?categoryId=${item.id}&gender=${activeCategory === 'HOMBRE' ? 'Men' : 'Women'}`} className="group block" onClick={() => setActiveCategory(null)}>
                                        <h3 className="text-xl font-bold uppercase tracking-tight group-hover:translate-x-2 transition-transform duration-300">{item.nombre || item.name}</h3>
                                        <span className="block h-[1px] w-12 bg-zinc-200 mt-2 group-hover:w-full group-hover:bg-black transition-all duration-500"></span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
                categories={categories} 
                brands={brands} 
                user={user} 
                logout={logout} 
            />
        </>
    );
}