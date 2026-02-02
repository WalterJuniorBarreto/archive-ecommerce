import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear(); // Año dinámico

  return (
    <footer className="bg-black text-white border-t border-zinc-800 pt-20 pb-10" role="contentinfo">
      <div className="max-w-[1400px] mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Columna 1: Marca e Identidad */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase">ARCHIVE.</h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Redefiniendo el lujo urbano. Tu destino exclusivo para moda streetwear, casacas de colección y piezas de archivo.
            </p>
          </div>

          {/* Columna 2: Shop (Navegación) */}
          <nav aria-label="Enlaces rápidos de marcas">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">Marcas Top</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/products" className="hover:text-zinc-400 transition block w-fit">
                  Ver todas
                </Link>
              </li>
              <li>
                <Link href="/products?search=Dior" className="hover:text-zinc-400 transition block w-fit">
                  Dior
                </Link>
              </li>
              <li>
                <Link href="/products?search=Supreme" className="hover:text-zinc-400 transition block w-fit">
                  Supreme
                </Link>
              </li>
              <li>
                <Link href="/products?search=Nike" className="hover:text-zinc-400 transition block w-fit">
                  Nike
                </Link>
              </li>
              <li>
                <Link href="/products?search=Amiri" className="text-red-500 hover:text-red-400 transition block w-fit font-bold">
                  Amiri 🔥
                </Link>
              </li>
            </ul>
          </nav>

          {/* Columna 3: Soporte (Navegación) */}
          <nav aria-label="Soporte y ayuda">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">Asistencia</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/profile/orders" className="hover:text-zinc-400 transition block w-fit">
                    Envíos y Seguimiento
                </Link>
              </li>
              <li>
                <Link href="/help/returns" className="hover:text-zinc-400 transition block w-fit">
                    Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/help/complaints-book" className="hover:text-zinc-400 transition flex items-center gap-2 w-fit">
                    <span role="img" aria-label="libro">📖</span> Libro de Reclamaciones
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-zinc-400 transition block w-fit">
                    Contacto
                </Link>
              </li>
            </ul>
          </nav>

          {/* Columna 4: Pagos y Seguridad */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Métodos de Pago</h3>
            <div className="flex flex-wrap gap-3 text-zinc-500 text-xs font-bold tracking-widest">
                <span className="border border-zinc-800 px-2 py-1 rounded hover:text-white hover:border-white transition-colors cursor-default">VISA</span>
                <span className="border border-zinc-800 px-2 py-1 rounded hover:text-white hover:border-white transition-colors cursor-default">MASTERCARD</span>
                <span className="border border-zinc-800 px-2 py-1 rounded hover:text-white hover:border-white transition-colors cursor-default">YAPE</span>
                <span className="border border-zinc-800 px-2 py-1 rounded hover:text-white hover:border-white transition-colors cursor-default">PLIN</span>
            </div>
            
            <div className="mt-8">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Compra 100% Segura</p>
                <div className="h-0.5 w-10 bg-green-900 mt-2"></div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-600 uppercase tracking-wider gap-4">
          <p>&copy; {currentYear} ARCHIVE PERÚ. LIMA, PERÚ.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-zinc-400 transition">Privacidad</Link>
            <Link href="/terms" className="hover:text-zinc-400 transition">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}