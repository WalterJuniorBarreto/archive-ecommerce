'use client';

import { useEffect, useState, useCallback } from 'react';
import { orderService } from '@/services/order.service';
import { Order } from '@/types/order.types';
import { toast } from 'react-hot-toast'; // Usamos toast para consistencia

// --- 1. DEVOPS: VARIABLE DE ENTORNO ---
// En Vercel/Netlify configuras NEXT_PUBLIC_API_URL = https://api.tudominio.com
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// --- COMPONENTE FILA (Aislado para limpieza) ---
interface OrderRowProps {
    order: Order;
    onStatusChange: (id: number, status: string) => void;
    onTrackingClick: (id: number) => void;
}

const OrderRow = ({ order, onStatusChange, onTrackingClick }: OrderRowProps) => {
    const isYapeManual = order.metodoPago === 'YAPE_QR';
    const needsConfirmation = order.estado === 'POR_CONFIRMAR';
    
    // Lista de estados disponibles
    const statuses = ['POR_CONFIRMAR', 'PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

    const getEvidenceUrl = (path: string) => {
        if (!path) return '#';
        // Si ya es un link de internet (Cloudinary), úsalo directo
        if (path.startsWith('http')) return path;
        // Si no, pégale tu dominio
        return `${API_BASE_URL}${path}`;
    };
    // Manejador local con lógica de negocio
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        
        // Regla de Negocio: Validación de Yape
        if (newStatus === 'PAGADO' && isYapeManual && needsConfirmation) {
            const confirmed = window.confirm("💰 ¿Confirmaste en tu App de Banco que el dinero llegó?");
            if (!confirmed) return; // Cancelar cambio si dice que no
        }
        onStatusChange(order.id, newStatus);
    };

    return (
        <tr className={`transition-colors group ${needsConfirmation ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-zinc-50'}`}>
            {/* ID / FECHA */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="block text-xs font-mono font-bold text-black">#{order.id}</span>
                <span className="block text-[10px] text-zinc-400 mt-1 uppercase">
                    {new Date(order.fechaCreacion).toLocaleDateString('es-PE')}
                </span>
            </td>

            {/* CLIENTE */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-black">{order.userEmail}</div>
            </td>

            {/* EVIDENCIA / PAGO */}
            <td className="px-6 py-4 whitespace-nowrap">
                {isYapeManual ? (
                    <div className="flex flex-col items-start gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#742284] text-white text-[9px] font-bold uppercase tracking-wide">
                            📱 Yape / Plin
                        </span>
                        {order.codOperacion && (
                            <div className="text-xs font-mono text-zinc-600 bg-white border px-1">
                                Op: <strong>{order.codOperacion}</strong>
                            </div>
                        )}
                        {order.urlComprobante ? (
                            <a 
                                href={getEvidenceUrl(order.urlComprobante)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold uppercase tracking-widest text-blue-600 underline hover:text-blue-800 flex items-center gap-1"
                            >
                                📎 Ver Foto
                            </a>
                        ) : (
                            !order.codOperacion && <span className="text-[9px] text-red-500 font-bold uppercase">Sin evidencia</span>
                        )}
                    </div>
                ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-[9px] font-bold uppercase tracking-wide">
                        💳 Mercado Pago
                    </span>
                )}
            </td>

            {/* TOTAL */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-black tabular-nums">
                S/ {order.total.toFixed(2)}
            </td>

            {/* ESTADO (Selector) */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative w-36">
                    <select 
                        value={order.estado} 
                        onChange={handleStatusChange}
                        className={`w-full appearance-none pl-3 pr-8 py-1.5 text-[10px] font-bold uppercase tracking-wide border rounded-sm focus:outline-none cursor-pointer
                            ${order.estado === 'POR_CONFIRMAR' ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' : ''}
                            ${order.estado === 'PENDIENTE' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : ''}
                            ${order.estado === 'PAGADO' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                            ${order.estado === 'ENVIADO' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
                            ${order.estado === 'ENTREGADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                            ${order.estado === 'CANCELADO' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                        `}
                    >
                        {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    {/* Flecha Custom */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                {needsConfirmation && (
                    <div className="text-[9px] text-amber-600 font-bold mt-1 uppercase text-center">
                        ⚠️ Requiere Revisión
                    </div>
                )}
            </td>

            {/* LOGÍSTICA / TRACKING */}
            <td className="px-6 py-4 whitespace-nowrap">
                {order.trackingNumber ? (
                    <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 text-[9px] font-bold uppercase tracking-wide">
                            {order.courierName}
                        </span>
                        <span className="font-mono text-xs text-black border-b border-zinc-200 border-dashed select-all">
                            {order.trackingNumber}
                        </span>
                    </div>
                ) : (
                    <button 
                        onClick={() => onTrackingClick(order.id)}
                        className="text-[10px] font-bold uppercase tracking-wide bg-black text-white px-3 py-1.5 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                    >
                        <span>+</span> Agregar Guía
                    </button>
                )}
            </td>
        </tr>
    );
};

// --- COMPONENTE MODAL (Tipado Correcto) ---
interface TrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (code: string, courier: string) => void;
    loading: boolean;
}

const TrackingModal = ({ isOpen, onClose, onSave, loading }: TrackingModalProps) => {
    const [courier, setCourier] = useState('');
    const [code, setCode] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(code, courier);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md border border-zinc-200 shadow-2xl relative overflow-hidden">
                <div className="h-1 w-full bg-black absolute top-0 left-0"></div>
                <div className="p-8">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-1 text-black">Asignar Seguimiento</h3>
                    <p className="text-xs text-zinc-500 font-medium mb-6 uppercase tracking-wide">Ingresa los datos de la agencia.</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="group">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Agencia</label>
                            <div className="relative">
                                <select className="w-full p-3 bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none focus:border-black appearance-none rounded-none cursor-pointer" required value={courier} onChange={e => setCourier(e.target.value)}>
                                    <option value="">-- SELECCIONAR --</option>
                                    <option value="Olva Courier">Olva Courier</option>
                                    <option value="Shalom">Shalom</option>
                                    <option value="DHL">DHL</option>
                                    <option value="Motorizado Propio">Motorizado Propio</option>
                                </select>
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Número de Guía</label>
                            <input type="text" className="w-full p-3 bg-zinc-50 border border-zinc-200 text-sm font-mono font-medium focus:outline-none focus:border-black placeholder-zinc-300" placeholder="EJ: 19283712-PE" required value={code} onChange={e => setCode(e.target.value)}/>
                        </div>
                        <div className="flex gap-3 mt-8 pt-4 border-t border-zinc-100">
                            <button type="button" onClick={onClose} className="flex-1 py-3 border border-zinc-300 text-zinc-600 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors">Cancelar</button>
                            <button type="submit" disabled={loading} className="flex-1 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50">
                                {loading ? 'Guardando...' : 'Confirmar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [savingTracking, setSavingTracking] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      // Ordenamos: Lo más reciente primero
      setOrders(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    // Actualización Optimista (UI First)
    const originalOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: newStatus } : o));

    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Estado actualizado: ${newStatus}`);
    } catch (error) {
      // Rollback si falla
      setOrders(originalOrders);
      toast.error('Error al actualizar estado en servidor');
    }
  };

  const openTrackingModal = (orderId: number) => {
      setSelectedOrderId(orderId);
      setModalOpen(true);
  };

  const handleSaveTracking = async (code: string, courier: string) => {
    if (!selectedOrderId) return;
    setSavingTracking(true);
    try {
        await orderService.addTracking(selectedOrderId, code, courier);
        setModalOpen(false);
        setSelectedOrderId(null);
        await loadOrders(); 
        toast.success('Tracking asignado correctamente');
    } catch (error) {
        console.error(error);
        toast.error('No se pudo guardar el tracking');
    } finally {
        setSavingTracking(false);
    }
  };

  if (loading && orders.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-4 border-black border-t-zinc-200 rounded-full animate-spin"></div>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Cargando panel...</span>
    </div>
  );

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      
      <div className="border-b border-zinc-200 pb-6 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-black text-black uppercase tracking-tighter mb-2">Monitor de Pedidos</h1>
            <p className="text-sm text-zinc-500 font-medium">Gestión en tiempo real de pagos y logística.</p>
        </div>
        <button onClick={loadOrders} className="text-xs font-bold uppercase tracking-widest underline hover:text-zinc-600 cursor-pointer">
            Actualizar Lista
        </button>
      </div>
      
      <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ID / Fecha</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cliente</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-yellow-50/50 border-b-2 border-yellow-200">Medio de Pago / Evidencia</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estado</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Logística</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                    {orders.map(order => (
                        <OrderRow 
                            key={order.id} 
                            order={order} 
                            onStatusChange={handleStatusChange} 
                            onTrackingClick={openTrackingModal} 
                        />
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <TrackingModal 
        isOpen={modalOpen} 
        loading={savingTracking}
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveTracking}
      />
    </div>
  );
}