import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-white text-black font-sans pt-12 pb-24">
      
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* 1. HEADER SIMPLE */}
        <div className="mb-16 border-b border-black pb-8">
            <nav className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
                <Link href="/" className="hover:text-black transition">Home</Link>
                <span className="mx-2">/</span>
                <span>Ayuda</span>
                <span className="mx-2">/</span>
                <span className="text-black">Política de Devoluciones</span>
            </nav>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                Devoluciones<br />& Cambios.
            </h1>
        </div>

        {/* 2. CONTENIDO (TEXTO LEGAL/POLÍTICA) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Columna Izquierda: Resumen / Índice Rápido */}
            <div className="md:col-span-4 lg:col-span-3">
                <div className="sticky top-32">
                    <p className="text-xs font-bold uppercase tracking-widest mb-4">En Resumen</p>
                    <ul className="space-y-4 text-sm font-medium text-zinc-500">
                        <li className="flex items-center gap-3">
                            <span className="h-1 w-1 bg-black rounded-full"></span>
                            7 días para devoluciones
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="h-1 w-1 bg-black rounded-full"></span>
                            Artículos sin uso
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="h-1 w-1 bg-black rounded-full"></span>
                            Etiquetas originales
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="h-1 w-1 bg-black rounded-full"></span>
                            Reembolso al método original
                        </li>
                    </ul>
                    
                    <div className="mt-10 p-6 bg-zinc-50 border border-zinc-200">
                        <p className="text-xs font-bold uppercase tracking-widest mb-2">¿Dudas?</p>
                        <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                            Si tu producto llegó dañado o incorrecto, contáctanos inmediatamente.
                        </p>
                        <Link href="/contact" className="text-xs font-bold underline underline-offset-4 hover:text-zinc-600">
                            Contactar Soporte
                        </Link>
                    </div>
                </div>
            </div>

            {/* Columna Derecha: El "Harto Texto" */}
            <div className="md:col-span-8 lg:col-span-9 space-y-16">
                
                {/* SECCIÓN 1 */}
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                        <span className="text-zinc-300">01.</span> Política General
                    </h2>
                    <div className="prose prose-zinc max-w-none text-zinc-600 text-sm md:text-base leading-loose font-medium">
                        <p className="mb-4">
                            En <strong>ARCHIVE.</strong>, nuestra prioridad es que estés completamente satisfecho con tu compra. 
                            Si por alguna razón no estás conforme con el producto recibido, aceptamos devoluciones dentro de los 
                            <strong> 7 días naturales</strong> posteriores a la fecha de recepción del pedido.
                        </p>
                        <p>
                            Para ser elegible para una devolución, el artículo debe estar en las mismas condiciones en que lo recibiste: 
                            sin usar, sin lavar, con todas las etiquetas originales adheridas y en su embalaje original. 
                            Nos reservamos el derecho de rechazar devoluciones que no cumplan con estos requisitos o que muestren signos de desgaste.
                        </p>
                    </div>
                </section>

                <hr className="border-zinc-100" />

                {/* SECCIÓN 2 */}
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                        <span className="text-zinc-300">02.</span> Artículos No Retornables
                    </h2>
                    <div className="text-zinc-600 text-sm md:text-base leading-loose font-medium">
                        <p className="mb-4">
                            Por razones de higiene y exclusividad, no aceptamos devoluciones ni cambios en los siguientes artículos:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4 marker:text-black">
                            <li>Ropa interior, calcetines y trajes de baño.</li>
                            <li>Artículos marcados como "Final Sale" o "Liquidación".</li>
                            <li>Tarjetas de regalo digitales.</li>
                            <li>Productos personalizados o de edición limitada numerada (The Vault).</li>
                        </ul>
                    </div>
                </section>

                <hr className="border-zinc-100" />

                {/* SECCIÓN 3 */}
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                        <span className="text-zinc-300">03.</span> Proceso de Devolución
                    </h2>
                    <div className="text-zinc-600 text-sm md:text-base leading-loose font-medium">
                        <p className="mb-6">
                            Para iniciar una devolución, sigue estos pasos sencillos a través de nuestro portal de autogestión:
                        </p>
                        <ol className="list-decimal pl-5 space-y-4 marker:font-bold marker:text-black">
                            <li>
                                Accede a tu cuenta y ve a la sección 
                                <Link href="/profile/orders" className="text-black font-bold mx-1 underline underline-offset-2">Mis Pedidos</Link>.
                            </li>
                            <li>
                                Selecciona el pedido que contiene el artículo que deseas devolver.
                            </li>
                            <li>
                                Haz clic en el botón <strong>"Solicitar Devolución"</strong> y sigue las instrucciones para generar tu etiqueta de envío.
                            </li>
                            <li>
                                Empaqueta el producto de forma segura (puedes reutilizar nuestra caja) y pega la etiqueta de envío.
                            </li>
                            <li>
                                Lleva el paquete al punto de entrega indicado en la etiqueta.
                            </li>
                        </ol>
                    </div>
                </section>

                <hr className="border-zinc-100" />

                {/* SECCIÓN 4 */}
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                        <span className="text-zinc-300">04.</span> Reembolsos
                    </h2>
                    <div className="text-zinc-600 text-sm md:text-base leading-loose font-medium">
                        <p className="mb-4">
                            Una vez que recibamos tu devolución e inspeccionemos el artículo (generalmente dentro de 3-5 días hábiles tras su llegada a nuestro almacén), te enviaremos un correo electrónico para notificarte la aprobación o rechazo de tu reembolso.
                        </p>
                        <p>
                            Si es aprobado, el reembolso se procesará automáticamente a tu <strong>método de pago original</strong>. 
                            Ten en cuenta que tu banco o compañía de tarjeta de crédito puede tardar entre 5 y 10 días hábiles adicionales en reflejar el saldo en tu cuenta.
                        </p>
                        <p className="mt-4 text-xs uppercase tracking-widest text-zinc-400">
                            * Los costos de envío originales no son reembolsables.
                        </p>
                    </div>
                </section>

            </div>
        </div>

      </div>
    </main>
  );
}