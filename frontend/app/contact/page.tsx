import Link from 'next/link';

// --- Configuración de tu Información de Contacto ---
const CONTACT_EMAIL = 'archiveperuofficial@gmail.com'; // ¡Reemplaza con tu correo real!


export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-black font-sans pt-12 pb-24">
      <div className="max-w-[800px] mx-auto px-6">
        
        {/* HEADER PRINCIPAL */}
        <div className="mb-20 text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
                Contacto.
            </h1>
            <p className="text-zinc-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                Estamos aquí para ayudarte. El canal más rápido para resolver cualquier duda o gestionar un reclamo es a través de nuestro correo electrónico.
            </p>
        </div>

        {/* BLOQUE PRINCIPAL DE CORREO */}
        <div className="border border-black py-12 px-6 md:px-12 text-center shadow-lg bg-zinc-50">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mb-6">
                Escríbenos directamente
            </p>
            
            <a 
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-2xl md:text-4xl font-black uppercase tracking-tight text-black hover:text-red-600 transition duration-300 break-all"
            >
                {CONTACT_EMAIL}
            </a>

            <p className="text-sm text-zinc-600 mt-6 max-w-sm mx-auto">
                Nuestro equipo de soporte responderá tu consulta en un plazo máximo de 24 horas hábiles. Por favor, incluye tu **número de pedido** si aplica.
            </p>
        </div>

     

      </div>
    </main>
  );
}