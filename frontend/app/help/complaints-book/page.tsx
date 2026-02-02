'use client';

import Link from 'next/link';
import { useState } from 'react';
import { complaintService } from '@/services/complaint.service';
import { ComplaintRequest, TipoBien, TipoReclamo } from '@/types/complaint.types';

export default function ComplaintsBookPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseCode, setResponseCode] = useState(''); // Para guardar el REC-2025-XXXX

  // Estado inicial tipado
  const [formData, setFormData] = useState<ComplaintRequest>({
      nombreCompleto: '',
      dni: '',
      telefono: '',
      email: '',
      direccion: '',
      tipoBien: 'PRODUCTO',
      montoReclamado: 0,
      descripcionBien: '',
      tipoReclamo: 'RECLAMO',
      detalleProblema: '',
      pedidoConsumidor: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          // Si es monto, convertimos a número, si no, texto tal cual
          [name]: name === 'montoReclamado' ? parseFloat(value) || 0 : value
      }));
  };

  const handleRadioChange = (name: keyof ComplaintRequest, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 1. Llamada al Backend
        const response = await complaintService.create(formData);
        
        // 2. Éxito: Guardamos el código y mostramos pantalla de éxito
        setResponseCode(response.codigoReclamacion);
        setSubmitted(true);
        window.scrollTo(0, 0); // Subir scroll para ver el mensaje

    } catch (error: any) {
        console.error("Error al enviar reclamo:", error);
        
        // Manejo básico de errores (puedes mejorarlo mostrando el mensaje del backend)
        const msg = error.response?.data?.message || "Ocurrió un error al procesar tu solicitud.";
        alert(`Error: ${msg}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans pt-12 pb-24">
      <div className="max-w-[800px] mx-auto px-6">
        
        {/* HEADER LEGAL */}
        <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
                <div className="border-2 border-black p-4 inline-block">
                    <span className="text-4xl">📖</span>
                </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                Libro de Reclamaciones
            </h1>
            <p className="text-zinc-500 text-sm max-w-lg mx-auto">
                Conforme al Código de Protección y Defensa del Consumidor, ponemos a tu disposición este libro virtual.
            </p>
            <div className="mt-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Razón Social: ARCHIVE S.A.C.
            </div>
        </div>

        {submitted ? (
            /* --- PANTALLA DE ÉXITO --- */
            <div className="bg-zinc-50 border border-black p-12 text-center animate-fade-in-up">
                <div className="text-5xl mb-4"></div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Reclamo Registrado</h2>
                <p className="text-zinc-600 mb-6">
                    Hemos recibido tu solicitud. Se ha enviado una copia a: <strong>{formData.email}</strong>.
                    Te responderemos en un plazo máximo de 15 días hábiles.
                </p>
                
                {/* CÓDIGO REAL DEL BACKEND */}
                <div className="bg-black text-white px-6 py-3 inline-block text-sm font-bold tracking-widest uppercase mb-8">
                    Hoja de Reclamación: #{responseCode}
                </div>
                
                <div>
                    <Link href="/" className="text-sm font-bold underline underline-offset-4 hover:text-zinc-600">
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        ) : (
            /* --- FORMULARIO --- */
            <form onSubmit={handleSubmit} className="space-y-12">
                
                {/* 1. DATOS DEL CONSUMIDOR */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-2 mb-6">
                        1. Identificación del Consumidor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Nombre Completo</label>
                            <input required name="nombreCompleto" onChange={handleChange} type="text" className="w-full bg-zinc-50 border border-zinc-200 p-3 focus:border-black outline-none transition-colors text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">DNI / CE</label>
                            <input required name="dni" onChange={handleChange} type="text" className="w-full bg-zinc-50 border border-zinc-200 p-3 focus:border-black outline-none transition-colors text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Teléfono</label>
                            <input required name="telefono" onChange={handleChange} type="tel" className="w-full bg-zinc-50 border border-zinc-200 p-3 focus:border-black outline-none transition-colors text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Email</label>
                            <input required name="email" onChange={handleChange} type="email" className="w-full bg-zinc-50 border border-zinc-200 p-3 focus:border-black outline-none transition-colors text-sm" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Dirección</label>
                            <input required name="direccion" onChange={handleChange} type="text" className="w-full bg-zinc-50 border border-zinc-200 p-3 focus:border-black outline-none transition-colors text-sm" />
                        </div>
                    </div>
                </section>

                {/* 2. DATOS DEL PRODUCTO */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-2 mb-6">
                        2. Identificación del Bien Contratado
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Tipo</label>
                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="tipoBien" onChange={() => handleRadioChange('tipoBien', 'PRODUCTO')} checked={formData.tipoBien === 'PRODUCTO'} className="accent-black" />
                                    <span className="text-sm font-medium">Producto</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="tipoBien" onChange={() => handleRadioChange('tipoBien', 'SERVICIO')} checked={formData.tipoBien === 'SERVICIO'} className="accent-black" />
                                    <span className="text-sm font-medium">Servicio</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Monto Reclamado</label>
                            <input name="montoReclamado" onChange={handleChange} type="number" step="0.01" className="w-full bg-zinc-50 border border-zinc-200 p-3 focus:border-black outline-none transition-colors text-sm" placeholder="S/ 0.00" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Descripción (Opcional)</label>
                            <input name="descripcionBien" onChange={handleChange} type="text" className="w-full bg-zinc-50 border border-zinc-200 p-3 focus:border-black outline-none transition-colors text-sm" placeholder="Ej: Hoodie Negro Talla M" />
                        </div>
                    </div>
                </section>

                {/* 3. DETALLE DE LA RECLAMACIÓN */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-2 mb-6">
                        3. Detalle de la Reclamación
                    </h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center gap-3 cursor-pointer p-4 border transition ${formData.tipoReclamo === 'RECLAMO' ? 'border-black bg-zinc-100' : 'border-zinc-200 bg-white'}`}>
                                <input type="radio" name="tipoReclamo" onChange={() => handleRadioChange('tipoReclamo', 'RECLAMO')} checked={formData.tipoReclamo === 'RECLAMO'} className="accent-black" />
                                <div>
                                    <span className="block text-sm font-bold uppercase">Reclamo</span>
                                    <span className="text-[10px] text-zinc-500">Disconformidad con el producto.</span>
                                </div>
                            </label>
                            <label className={`flex-1 flex items-center gap-3 cursor-pointer p-4 border transition ${formData.tipoReclamo === 'QUEJA' ? 'border-black bg-zinc-50' : 'border-zinc-200 bg-white'}`}>
                                <input type="radio" name="tipoReclamo" onChange={() => handleRadioChange('tipoReclamo', 'QUEJA')} checked={formData.tipoReclamo === 'QUEJA'} className="accent-black" />
                                <div>
                                    <span className="block text-sm font-bold uppercase">Queja</span>
                                    <span className="text-[10px] text-zinc-500">Malestar en la atención.</span>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Detalle del Problema</label>
                            <textarea required name="detalleProblema" onChange={handleChange} rows={5} className="w-full bg-zinc-50 border border-zinc-200 p-3 focus:border-black outline-none transition-colors resize-none text-sm" placeholder="Cuéntanos qué sucedió..."></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Pedido del Consumidor</label>
                            <textarea required name="pedidoConsumidor" onChange={handleChange} rows={2} className="w-full bg-zinc-50 border border-zinc-200 p-3 focus:border-black outline-none transition-colors resize-none text-sm" placeholder="¿Qué solución esperas?"></textarea>
                        </div>
                    </div>
                </section>

                {/* BOTÓN ENVIAR */}
                <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] text-zinc-400 max-w-sm text-center md:text-left">
                        * Al enviar este formulario, declaras que la información es verdadera. Plazo de respuesta: 15 días hábiles.
                    </p>
                    <button type="submit" disabled={loading} className="w-full md:w-auto bg-black text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all disabled:opacity-50">
                        {loading ? 'Enviando...' : 'Enviar Hoja de Reclamación'}
                    </button>
                </div>

            </form>
        )}
      </div>
    </main>
  );
}