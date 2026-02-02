import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad | ARCHIVE.',
  description: 'Conoce cómo protegemos y gestionamos tus datos personales.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-black font-sans pt-12 pb-24">
      
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* --- HEADER --- */}
        <div className="mb-16 border-b border-black pb-8">
            <nav className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
                <Link href="/" className="hover:text-black transition">Home</Link>
                <span className="mx-2">/</span>
                <span>Legal</span>
                <span className="mx-2">/</span>
                <span className="text-black">Privacidad</span>
            </nav>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                Política de<br />Privacidad.
            </h1>
            <p className="mt-6 text-sm text-zinc-500 font-medium max-w-2xl">
                Última actualización: 11 de Diciembre, 2025.
            </p>
        </div>

        {/* --- CONTENIDO LEGAL --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Columna Izquierda: Introducción Sticky */}
            <div className="md:col-span-4 lg:col-span-3">
                <div className="sticky top-32">
                    <p className="text-xs font-bold uppercase tracking-widest mb-4">Compromiso</p>
                    <p className="text-sm text-zinc-500 leading-relaxed font-medium mb-8">
                        En <strong>ARCHIVE.</strong>, nos tomamos tu privacidad tan en serio como la calidad de nuestros productos. Tus datos están seguros y se utilizan estrictamente para mejorar tu experiencia de compra.
                    </p>
                    <div className="p-6 bg-zinc-50 border border-zinc-200">
                        <p className="text-xs font-bold uppercase tracking-widest mb-2">Contacto DPO</p>
                        <p className="text-xs text-zinc-500 mb-4">
                            Delegado de Protección de Datos
                        </p>
                        <a href="mailto:privacy@archive-geek.com" className="text-xs font-bold underline underline-offset-4 hover:text-zinc-600">
                            archiveperuofficial@gmail.com
                        </a>
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Cláusulas */}
            <div className="md:col-span-8 lg:col-span-9 space-y-16">
                
                {/* 1. INFORMACIÓN RECOPILADA */}
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                        <span className="text-zinc-300">01.</span> Información que Recopilamos
                    </h2>
                    <div className="text-zinc-600 text-sm md:text-base leading-loose font-medium space-y-4">
                        <p>
                            Recopilamos información personal que tú nos proporcionas directamente cuando realizas una compra, te registras en nuestra tienda o te suscribes a nuestro newsletter. Esto incluye:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-black">
                            <li><strong>Identificación:</strong> Nombre completo, DNI/CE.</li>
                            <li><strong>Contacto:</strong> Dirección de correo electrónico, número de teléfono.</li>
                            <li><strong>Envío y Facturación:</strong> Dirección de entrega y datos fiscales.</li>
                            <li><strong>Transaccional:</strong> Historial de pedidos y detalles de pago (procesados de forma segura mediante pasarelas encriptadas).</li>
                        </ul>
                    </div>
                </section>

                <hr className="border-zinc-100" />

                {/* 2. USO DE LA INFORMACIÓN */}
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                        <span className="text-zinc-300">02.</span> Uso de tus Datos
                    </h2>
                    <div className="text-zinc-600 text-sm md:text-base leading-loose font-medium">
                        <p className="mb-4">
                            Utilizamos tu información principalmente para procesar y entregar tus pedidos ("Drops"). Además, usamos los datos para:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-black">
                            <li>Gestionar tu cuenta de usuario y brindarte soporte técnico.</li>
                            <li>Enviarte notificaciones sobre el estado de tu pedido.</li>
                            <li>Prevenir fraudes y asegurar la seguridad de las transacciones.</li>
                            <li>Comunicarte lanzamientos exclusivos (solo si has aceptado recibir marketing).</li>
                        </ul>
                    </div>
                </section>

                <hr className="border-zinc-100" />

                {/* 3. COOKIES & TRACKING */}
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                        <span className="text-zinc-300">03.</span> Cookies
                    </h2>
                    <div className="text-zinc-600 text-sm md:text-base leading-loose font-medium">
                        <p>
                            Nuestro sitio utiliza cookies esenciales para mantener tu sesión activa y recordar los productos en tu carrito. También utilizamos cookies analíticas (Google Analytics) para entender cómo interactúas con la tienda y mejorar nuestra interfaz. Puedes gestionar tus preferencias de cookies desde la configuración de tu navegador.
                        </p>
                    </div>
                </section>

                <hr className="border-zinc-100" />

                {/* 4. DERECHOS ARCO */}
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                        <span className="text-zinc-300">04.</span> Tus Derechos (ARCO)
                    </h2>
                    <div className="text-zinc-600 text-sm md:text-base leading-loose font-medium">
                        <p className="mb-4">
                            Conforme a la Ley de Protección de Datos Personales, tienes derecho a:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <div className="bg-zinc-50 p-4 border border-zinc-100">
                                <span className="font-bold text-black uppercase text-xs block mb-1">Acceso</span>
                                <span className="text-xs">Solicitar qué datos tenemos sobre ti.</span>
                            </div>
                            <div className="bg-zinc-50 p-4 border border-zinc-100">
                                <span className="font-bold text-black uppercase text-xs block mb-1">Rectificación</span>
                                <span className="text-xs">Corregir datos inexactos.</span>
                            </div>
                            <div className="bg-zinc-50 p-4 border border-zinc-100">
                                <span className="font-bold text-black uppercase text-xs block mb-1">Cancelación</span>
                                <span className="text-xs">Eliminar tus datos de nuestra base.</span>
                            </div>
                            <div className="bg-zinc-50 p-4 border border-zinc-100">
                                <span className="font-bold text-black uppercase text-xs block mb-1">Oposición</span>
                                <span className="text-xs">Oponerte al uso para fines específicos.</span>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-zinc-100" />

                {/* 5. SEGURIDAD */}
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                        <span className="text-zinc-300">05.</span> Seguridad
                    </h2>
                    <div className="text-zinc-600 text-sm md:text-base leading-loose font-medium">
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas (encriptación SSL, firewalls, control de acceso) para proteger tus datos contra acceso no autorizado, pérdida o alteración. Sin embargo, ninguna transmisión por Internet es 100% segura, por lo que te recomendamos mantener confidencial tu contraseña de acceso.
                        </p>
                    </div>
                </section>

            </div>
        </div>

      </div>
    </main>
  );
}