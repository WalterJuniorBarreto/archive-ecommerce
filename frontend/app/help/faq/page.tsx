'use client';

import { useState } from 'react';
import Link from 'next/link';

// Definimos los datos aquí (o podrían venir de una API/JSON)
const faqData = [
  {
    category: "Envíos & Entregas",
    items: [
      {
        q: "¿Realizan envíos a todo el Perú?",
        a: "Sí, realizamos envíos a nivel nacional a través de nuestros partners logísticos Olva Courier. El tiempo de entrega varía según la provincia, generalmente entre 20 - 45 días hábiles."
      },
      {
        q: "¿Cuánto cuesta el envío?",
        a: "Todo producto su envio tiene el costo de 20 soles, sin importar el tamaño o el precio por unidad 20 soles."
      },
      {
        q: "¿Puedo recoger mi pedido en tienda?",
        a: "Actualmente operamos como una tienda 100% online (Archive Model), por lo que no contamos con puntos de recojo físico. Todo se envía directamente a tu domicilio."
      }
    ]
  },
  {
    category: "Productos & Stock",
    items: [
      {
        q: "¿Los productos son originales?",
        a: "Absolutamente. Todos nuestros artículos son 100% auténticos. Trabajamos directamente con distribuidores autorizados o mediante un proceso de curaduría riguroso para piezas de archivo."
      },
      {
        q: "¿Van a reponer stock de un producto agotado?",
        a: "Nuestra filosofía se basa en 'Limited Drops'. Generalmente, una vez que un artículo se agota, no vuelve a ingresar (Deadstock). Te recomendamos estar atento a nuestros lanzamientos en Instagram."
      },
      {
        q: "¿Cómo sé cuál es mi talla?",
        a: "En cada página de producto encontrarás una 'Guía de Tallas' detallada con medidas en centímetros. Si tienes dudas específicas sobre el fit (Boxy, Oversized, Slim), contáctanos."
      }
    ]
  },
  {
    category: "Pagos & Seguridad",
    items: [
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, Amex, Diners), Yape, Plin y Transferencia Bancaria Directa."
      },
      {
        q: "¿Es seguro comprar en la web?",
        a: "Totalmente. Nuestra pasarela de pagos utiliza encriptación SSL de grado bancario. Nosotros no almacenamos los datos de tu tarjeta."
      }
    ]
  }
];

export default function FAQPage() {
  // Estado para controlar qué pregunta está abierta
  // Guardamos un string tipo "categoriaIndex-preguntaIndex" (ej: "0-1")
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans pt-12 pb-24">
      <div className="max-w-[900px] mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-20 text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
                FAQ.
            </h1>
            <p className="text-zinc-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                Respuestas a las dudas más comunes sobre nuestra operativa, productos y filosofía.
            </p>
        </div>

        {/* LISTA DE FAQs */}
        <div className="space-y-16">
            {faqData.map((section, catIndex) => (
                <div key={catIndex}>
                    {/* Título de Categoría */}
                    <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8 border-b border-black pb-2">
                        {section.category}
                    </h2>

                    {/* Acordeón */}
                    <div className="space-y-4">
                        {section.items.map((item, itemIndex) => {
                            const id = `${catIndex}-${itemIndex}`;
                            const isOpen = openItem === id;

                            return (
                                <div key={itemIndex} className="border border-zinc-200 hover:border-black transition-colors bg-white group">
                                    <button 
                                        onClick={() => toggleItem(id)}
                                        className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                                    >
                                        <span className={`text-sm md:text-base font-bold uppercase tracking-tight transition-colors ${isOpen ? 'text-black' : 'text-zinc-800'}`}>
                                            {item.q}
                                        </span>
                                        <span className="text-xl font-light ml-4">
                                            {isOpen ? '−' : '+'}
                                        </span>
                                    </button>
                                    
                                    {/* Respuesta con animación simple */}
                                    <div 
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="px-6 pb-6 text-sm text-zinc-500 leading-loose font-medium">
                                            {item.a}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>

        {/* FOOTER DE AYUDA */}
        <div className="mt-24 pt-12 border-t border-zinc-100 text-center">
            <p className="text-sm font-bold text-black mb-4">¿No encontraste lo que buscabas?</p>
            <div className="flex justify-center gap-6">
                <Link href="/contact" className="text-xs uppercase tracking-widest border-b border-black pb-1 hover:text-zinc-500 transition">
                    Contactar Soporte
                </Link>
                <Link href="/help/returns" className="text-xs uppercase tracking-widest border-b border-black pb-1 hover:text-zinc-500 transition">
                    Política de Devoluciones
                </Link>
            </div>
        </div>

      </div>
    </main>
  );
}