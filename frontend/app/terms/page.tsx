// src/app/terms/page.tsx
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* HEADER TIPO "DOCUMENTO OFICIAL" */}
      <header className="border-b-4 border-black py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Documento Legal</p>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                Términos y <br/>Condiciones
              </h1>
            </div>
            <div className="text-right">
              <div className="inline-block bg-black text-white px-3 py-1 text-xs font-mono mb-1">
                V.2025.1.0
              </div>
              <p className="text-xs font-bold uppercase tracking-wide">
                Actualizado: Diciembre 2025
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* BARRA LATERAL (INDICE) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="bg-zinc-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                Índice
              </h3>
              <nav className="flex flex-col gap-3 text-sm font-bold uppercase tracking-wide">
                <a href="#general" className="hover:translate-x-2 transition-transform hover:text-zinc-600">01. Generalidades</a>
                <a href="#productos" className="hover:translate-x-2 transition-transform hover:text-zinc-600">02. Productos y Precios</a>
                <a href="#pagos" className="hover:translate-x-2 transition-transform hover:text-zinc-600">03. Pagos (Yape/Tarjetas)</a>
                <a href="#envios" className="hover:translate-x-2 transition-transform hover:text-zinc-600">04. Envíos y Entregas</a>
                <a href="#devoluciones" className="hover:translate-x-2 transition-transform hover:text-zinc-600">05. Cambios y Devoluciones</a>
                <a href="#privacidad" className="hover:translate-x-2 transition-transform hover:text-zinc-600">06. Privacidad</a>
              </nav>
              
              <div className="mt-8 pt-6 border-t-2 border-dashed border-zinc-300">
                <p className="text-xs text-zinc-500 mb-4 font-normal normal-case">
                  Al comprar en ARCHIVE, aceptas automáticamente estos términos.
                </p>
                <Link href="/" className="block w-full bg-black text-white text-center py-3 text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition">
                  ← Volver a la Tienda
                </Link>
              </div>
            </div>
          </aside>

          {/* CONTENIDO DEL CONTRATO */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* SECCION 1 */}
            <section id="general" className="relative group">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-zinc-200 group-hover:bg-black transition-colors"></div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="bg-black text-white px-2 py-1 text-sm">01</span>
                Generalidades
            </h2>

            <div className="prose prose-zinc text-sm md:text-base text-zinc-700 space-y-4 text-justify">
                <p>
                Bienvenido a <strong>ARCHIVE.</strong>. Estos Términos y Condiciones regulan el uso de nuestro sitio web y la adquisición de productos a través del mismo.
                </p>

                <p>
                <strong>ARCHIVE.</strong> es una empresa distribuidora registrada en Perú, dedicada a la importación y comercialización de productos originales provenientes del extranjero, principalmente de Estados Unidos.
                </p>

                <p>
                Históricamente, nuestro modelo de negocio ha estado enfocado en la distribución de productos a tiendas físicas y comercios especializados dentro del país. Actualmente, hemos habilitado la venta directa al consumidor final a través de nuestro sitio web.
                </p>

                <p>
                Debido a la naturaleza de nuestro modelo de distribución e importación bajo pedido, algunos productos pueden requerir tiempos de procesamiento y entrega más extensos, los cuales son debidamente informados al cliente antes de realizar la compra.
                </p>

                <p>
                <strong>ARCHIVE.</strong> se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento y sin previo aviso. Es responsabilidad del usuario revisarlos periódicamente.
                </p>
            </div>
            </section>


            {/* SECCION 2 */}
            <section id="productos" className="relative group">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-zinc-200 group-hover:bg-black transition-colors"></div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="bg-black text-white px-2 py-1 text-sm">02</span>
                Productos y Precios
              </h2>
              <div className="prose prose-zinc text-sm md:text-base text-zinc-700 space-y-4 text-justify">
                <p>
                  Todos los precios mostrados están en <strong>Soles (S/)</strong> e incluyen el Impuesto General a las Ventas (IGV), salvo que se indique lo contrario.
                </p>
                <ul className="list-disc pl-5 space-y-2 marker:text-black">
                  <li>Las imágenes de los productos son referenciales y pueden variar ligeramente en color o diseño.</li>
                  <li>El stock de los productos es limitado. Si un producto se agota después de la compra, procederemos al reembolso inmediato.</li>
                  <li>Nos reservamos el derecho de corregir errores de precios evidentes en cualquier momento.</li>
                </ul>
              </div>
            </section>

            {/* SECCION 3 - CLAVE PARA TU SISTEMA YAPE */}
            <section id="pagos" className="relative group">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-zinc-200 group-hover:bg-black transition-colors"></div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="bg-black text-white px-2 py-1 text-sm">03</span>
                Métodos de Pago
              </h2>
              <div className="prose prose-zinc text-sm md:text-base text-zinc-700 space-y-4 text-justify">
                <p>Aceptamos los siguientes medios de pago:</p>
                
                <div className="bg-zinc-50 border border-zinc-200 p-4 mb-4">
                  <h4 className="font-bold uppercase text-xs tracking-widest mb-2">A. Mercado Pago (Automático)</h4>
                  <p className="text-xs">Tarjetas de crédito, débito y pago en agentes. La validación es inmediata.</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-400 p-4">
                  <h4 className="font-bold uppercase text-xs tracking-widest mb-2 text-yellow-900">B. Yape / Plin (Manual)</h4>
                  <p className="text-xs text-yellow-900 mb-2">
                    Para pagos mediante billeteras digitales, el usuario deberá escanear el QR proporcionado al finalizar la compra.
                  </p>
                  <ul className="list-decimal pl-5 text-xs text-yellow-900 space-y-1 font-medium">
                    <li>Es <strong>obligatorio</strong> adjuntar la captura de pantalla o ingresar el código de operación.</li>
                    <li>El pedido permanecerá en estado <strong>POR CONFIRMAR</strong> hasta que nuestro equipo valide el ingreso del dinero (máx. 24 horas).</li>
                    <li>Si no se valida el pago en 24 horas, la orden será cancelada y el stock liberado.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* SECCION 4 */}
            <section id="envios" className="relative group">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-zinc-200 group-hover:bg-black transition-colors"></div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="bg-black text-white px-2 py-1 text-sm">04</span>
                Envíos y Entregas
              </h2>
              <div className="prose prose-zinc text-sm md:text-base text-zinc-700 space-y-4 text-justify">
                <p> Realizamos envíos a todo el Perú. Los tiempos de entrega pueden variar según la ubicación y el proceso de importación: </p> <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase text-center my-4"> <div className="border border-zinc-300 p-3"> Lima Metropolitana <span className="block text-zinc-500 font-normal mt-1">20 – 45 días hábiles</span> </div> <div className="border border-zinc-300 p-3"> Provincias <span className="block text-zinc-500 font-normal mt-1">20 – 45 días hábiles</span> </div> </div> <p> ARCHIVE es una empresa distribuidora. Tradicionalmente, nuestro stock en Perú está destinado exclusivamente a tiendas físicas y comercios especializados. </p> <p> Actualmente, hemos decidido abrir la venta directa al público para que puedas acceder a nuestros productos originales al mismo precio de distribución. </p> <p> Debido a que los productos son importados directamente desde Estados Unidos bajo pedido, el proceso de importación, aduanas y logística internacional puede tomar entre <strong>20 y 45 días hábiles</strong>. </p> <p> Agradecemos tu comprensión. Cada pedido es gestionado de manera segura y transparente desde su origen hasta la entrega final. </p> <p className="text-sm text-zinc-500"> El cliente es responsable de proporcionar una dirección correcta y completa. ARCHIVE no se hace responsable por retrasos o entregas fallidas ocasionadas por direcciones incorrectas. </p>
              </div>
            </section>

            {/* SECCION 5 */}
            <section id="devoluciones" className="relative group">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-zinc-200 group-hover:bg-black transition-colors"></div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="bg-black text-white px-2 py-1 text-sm">05</span>
                Cambios y Devoluciones
              </h2>
              <div className="prose prose-zinc text-sm md:text-base text-zinc-700 space-y-4 text-justify">
                <p>
                  Aceptamos cambios dentro de los primeros <strong>7 días calendario</strong> tras recibir el producto, siempre que:
                </p>
                <ul className="list-disc pl-5 space-y-1 marker:text-black">
                  <li>El producto esté nuevo, sin uso y con etiquetas originales.</li>
                  <li>Se presente el comprobante de pago.</li>
                </ul>
                <p>
                  No se aceptan devoluciones de dinero salvo por fallas de fábrica comprobadas. En ese caso, el reembolso se procesará al mismo medio de pago.
                </p>
              </div>
            </section>

             {/* SECCION 6 */}
             <section id="privacidad" className="relative group">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-zinc-200 group-hover:bg-black transition-colors"></div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="bg-black text-white px-2 py-1 text-sm">06</span>
                Privacidad de Datos
              </h2>
              <div className="prose prose-zinc text-sm md:text-base text-zinc-700 space-y-4 text-justify">
                <p>
                  En cumplimiento de la Ley de Protección de Datos Personales, ARCHIVE. garantiza que tus datos (nombre, dirección, teléfono) serán utilizados únicamente para procesar tu pedido y fines logísticos. No compartimos tu información con terceros ajenos a la operación.
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* FOOTER SIMPLE PARA LA PAGINA LEGAL */}
      <footer className="border-t-4 border-black bg-zinc-50 py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
          ¿Tienes dudas adicionales?
        </p>
        <a href="mailto:archiveperuofficial@gmail.com" className="text-2xl font-black uppercase tracking-tighter hover:underline decoration-4 underline-offset-4">
          archiveperuofficial@gmail.com
        </a>
      </footer>
    </div>
  );
}