'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Validación segura: Si pathname es null (raro pero posible en test), asumimos false
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar solo en tienda pública */}
      {!isAdmin && <Navbar />}
      
      {/* flex-grow: Ocupa todo el espacio disponible.
         Esto empuja el Footer hacia abajo si el contenido es corto.
      */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer solo en tienda pública */}
      {!isAdmin && <Footer />}
    </div>
  );
}