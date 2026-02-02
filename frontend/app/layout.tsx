import './globals.css';
import { Inter } from 'next/font/google';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import ClientLayout from '@/components/layout/ClientLayout'; 

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap' 
});

export const metadata = {
  title: {
    template: '%s | ARCHIVE.',
    default: 'ARCHIVE — Lujo Urbano & Rarezas',
  },
  description: 'La tienda definitiva de coleccionables, streetwear y tecnología en Perú. Marcas exclusivas y drops limitados.',
  keywords: ['streetwear', 'geek', 'store', 'peru', 'zapatillas', 'coleccionables'],
  openGraph: {
    title: 'ARCHIVE. — Lujo Urbano',
    description: 'Elevando el estándar. Marcas exclusivas y la elegancia del caos.',
    type: 'website',
    locale: 'es_PE',
    url: 'https://tu-dominio-geek-store.com', // Cambiar en producción
    siteName: 'Geek Store',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} antialiased text-black bg-white`}>
        
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider> 
                  
                  <ClientLayout>
                      {children}
                  </ClientLayout>

              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
        
        <Toaster 
          position="bottom-center" 
          reverseOrder={false} 
          toastOptions={{
            style: {
              background: '#000',
              color: '#fff',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 'bold',
            },
          }}
        />
      </body>
    </html>
  );
}