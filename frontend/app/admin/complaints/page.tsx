'use client';

import { useEffect, useState } from 'react';
import { complaintService } from '@/services/complaint.service';
import { ComplaintResponse } from '@/types/complaint.types';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await complaintService.getAll();
      const sorted = data.sort((a, b) => {
    // Le decimos a TS que trate a 'a' y 'b' como cualquier cosa (any) para dejarnos pasar
    const valA = (a as any).resuelto;
    const valB = (b as any).resuelto;

    if (valA === valB) return 0;
    return valA ? 1 : -1;
});
      setComplaints(sorted);
    } catch (error) {
      console.error("Error cargando reclamos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentState: boolean) => {
      const newState = !currentState;
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, resuelto: newState } : c));

      try {
          await complaintService.toggleStatus(id, newState);
      } catch (error) {
          alert("Error al actualizar estado");
          loadComplaints(); 
      }
  };

  const closeModal = () => setSelectedComplaint(null);

  if (loading) return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-8 h-8 border-4 border-zinc-900 border-t-zinc-200 rounded-full animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Cargando libro...</span>
      </div>
  );

  return (
    <div className="space-y-8">
      
      {/* 1. HEADER INDUSTRIAL */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-6">
        <div>
            <h1 className="text-3xl font-black text-black uppercase tracking-tighter mb-2">Libro de Reclamaciones</h1>
            <p className="text-sm text-zinc-500 font-medium">Gestión legal de quejas y reclamos de consumidores.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right">
                <span className="block text-2xl font-black tabular-nums leading-none">{complaints.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Registros Totales</span>
            </div>
        </div>
      </div>

      {/* 2. TABLA INDUSTRIAL */}
      <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
                <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Código</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fecha</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tipo</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gestión</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
                {complaints.map((item) => (
                <tr 
                    key={item.id} 
                    className={`transition-colors group ${item.resuelto ? 'bg-zinc-50/50' : 'hover:bg-zinc-50'}`}
                >
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                            onClick={() => handleToggleStatus(item.id, item.resuelto)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                item.resuelto 
                                ? 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200' 
                                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
                            }`}
                        >
                            {item.resuelto ? (
                                <><span>✓</span> Atendido</>
                            ) : (
                                <><span className="animate-pulse">●</span> Pendiente</>
                            )}
                        </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-black font-mono bg-zinc-100 px-2 py-1 rounded-sm border border-zinc-200">
                            {item.codigoReclamacion}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 font-medium uppercase">
                        {new Date(item.fechaCreacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-zinc-900">{item.nombreCompleto}</div>
                        <div className="text-[10px] text-zinc-400 font-medium">{item.emailContacto}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-[9px] font-black uppercase tracking-widest rounded-full border ${
                            item.tipoReclamo === 'QUEJA' 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                            {item.tipoReclamo}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                            onClick={() => setSelectedComplaint(item)} 
                            className="text-zinc-400 hover:text-black font-bold text-[10px] uppercase tracking-widest border border-transparent hover:border-black px-4 py-2 transition-all flex items-center justify-end gap-2 ml-auto"
                        >
                            <span>Ver Detalle</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* --- MODAL DE DETALLE (INDUSTRIAL) --- */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200 border border-zinc-200">
                
                {/* Barra decorativa superior */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-black"></div>

                {/* Header Modal */}
                <div className="flex justify-between items-start p-8 border-b border-zinc-100 bg-white sticky top-0 z-10">
                    <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">
                            Expediente Legal
                        </span>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-black">
                            {selectedComplaint.tipoReclamo} #{selectedComplaint.codigoReclamacion}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                handleToggleStatus(selectedComplaint.id, selectedComplaint.resuelto);
                                setSelectedComplaint(prev => prev ? {...prev, resuelto: !prev.resuelto} : null);
                            }}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                                selectedComplaint.resuelto 
                                ? 'bg-white text-zinc-500 border-zinc-300 hover:border-black hover:text-black' 
                                : 'bg-black text-white border-black hover:bg-zinc-800'
                            }`}
                        >
                            {selectedComplaint.resuelto ? 'Reabrir Caso' : 'Marcar Atendido'}
                        </button>

                        <button onClick={closeModal} className="p-2 text-zinc-400 hover:text-black transition-colors bg-zinc-50 hover:bg-zinc-100 border border-transparent hover:border-zinc-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body Modal */}
                <div className="p-8 space-y-10 bg-zinc-50/30">
                    
                    {/* 1. DATOS DEL CLIENTE */}
                    <section>
                        <h4 className="flex items-center gap-3 text-xs font-bold text-black uppercase tracking-widest mb-6 border-b border-zinc-200 pb-2">
                            <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full text-[9px]">1</span>
                            Datos del Consumidor
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                            <div className="group">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 group-hover:text-black transition-colors">Nombre Completo</p>
                                <p className="text-sm font-bold text-black border-b border-dashed border-zinc-300 pb-1">{selectedComplaint.nombreCompleto}</p>
                            </div>
                            <div className="group">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 group-hover:text-black transition-colors">Documento (DNI)</p>
                                <p className="text-sm font-medium text-zinc-800 border-b border-dashed border-zinc-300 pb-1">{selectedComplaint.dni}</p>
                            </div>
                            <div className="group">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 group-hover:text-black transition-colors">Teléfono</p>
                                <p className="text-sm font-medium text-zinc-800 border-b border-dashed border-zinc-300 pb-1">{selectedComplaint.telefono}</p>
                            </div>
                            <div className="group col-span-2">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 group-hover:text-black transition-colors">Correo Electrónico</p>
                                <p className="text-sm font-medium text-zinc-800 border-b border-dashed border-zinc-300 pb-1">{selectedComplaint.emailContacto}</p>
                            </div>
                            <div className="group col-span-3">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 group-hover:text-black transition-colors">Domicilio</p>
                                <p className="text-sm font-medium text-zinc-800 border-b border-dashed border-zinc-300 pb-1">{selectedComplaint.direccion}</p>
                            </div>
                        </div>
                    </section>

                    {/* 2. DETALLE DEL PROBLEMA */}
                    <section>
                        <h4 className="flex items-center gap-3 text-xs font-bold text-black uppercase tracking-widest mb-6 border-b border-zinc-200 pb-2">
                            <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full text-[9px]">2</span>
                            Detalle de los Hechos
                        </h4>
                        
                        <div className="space-y-6">
                            <div>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-2">Descripción del Incidente</p>
                                <div className="bg-white p-5 border border-zinc-200 shadow-sm text-sm text-zinc-700 leading-relaxed font-medium">
                                    {selectedComplaint.detalleProblema}
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-2">Solicitud del Consumidor</p>
                                <div className="bg-blue-50 p-5 border border-blue-100 text-sm text-blue-900 leading-relaxed font-bold border-l-4 border-l-blue-500">
                                    {selectedComplaint.pedidoConsumidor}
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer Modal */}
                <div className="p-6 border-t border-zinc-100 bg-white flex justify-end">
                    <button 
                        onClick={closeModal} 
                        className="px-8 py-3 bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}