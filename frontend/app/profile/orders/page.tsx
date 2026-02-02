'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Optimización de imágenes
import { orderService } from '@/services/order.service';
import { Order } from '@/types/order.types';
import { useSearchParams, useRouter } from 'next/navigation';

// --- 1. CONFIGURACIÓN DEVOPS (Variables de Entorno) ---
// En tu archivo .env.local debes tener: NEXT_PUBLIC_API_URL=https://api.tudominio.com
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const getEvidenceUrl = (path: string) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path; // Cloudinary / S3
    return `${API_BASE_URL}${path}`; // Local storage
};
const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const formatDate = (dateString: string) => 
    new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString));


export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const paymentSuccess = searchParams.get('success');

    const toggleOrderDetails = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await orderService.getMyOrders(); 
            setOrders(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error('[Orders] Error fetching history:', error);
            // En un entorno real, aquí podrías enviar el error a Sentry o Datadog
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (paymentSuccess) {
            setShowSuccessMessage(true);
            router.replace('/profile/orders'); // Limpia URL sin recargar
            const timer = setTimeout(() => setShowSuccessMessage(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [paymentSuccess, router]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getProgressStep = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'PAGADO': return 1;
            case 'ENVIADO': return 2;
            case 'ENTREGADO': return 3;
            case 'CANCELADO': return -1;
            default: return 0; // PENDIENTE o POR_CONFIRMAR
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" role="status">
                <div className="w-10 h-10 border-4 border-black border-t-zinc-200 rounded-full animate-spin"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Cargando historial...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            {/* HEADER */}
            <header className="flex items-end justify-between mb-10 pb-6 border-b border-black">
                <div>
                    <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-1">
                        Historial de Compras
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                        Gestiona y rastrea tus pedidos recientes
                    </p>
                </div>
                <div className="hidden sm:block">
                    <span className="text-xs font-bold bg-black text-white px-4 py-2 uppercase tracking-widest rounded-sm">
                        {orders.length} {orders.length === 1 ? 'Pedido' : 'Pedidos'}
                    </span>
                </div>
            </header>
            
            {/* FEEDBACK MSG */}
            {showSuccessMessage && (
                <div role="alert" className={`mb-12 p-6 border-l-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 
                    ${paymentSuccess === 'manual' ? 'bg-amber-50 border-amber-500' : 'bg-zinc-50 border-black'}`}>
                    <div className={`w-12 h-12 text-white flex items-center justify-center text-2xl font-bold rounded-sm
                        ${paymentSuccess === 'manual' ? 'bg-amber-500' : 'bg-black'}`}>
                        {paymentSuccess === 'manual' ? '⏳' : '✓'}
                    </div>
                    <div>
                        <h4 className="font-bold text-black uppercase tracking-wide text-sm">
                            {paymentSuccess === 'manual' ? 'Solicitud Enviada' : '¡Compra Exitosa!'}
                        </h4>
                        <p className="text-zinc-600 text-xs mt-1 font-medium">
                            {paymentSuccess === 'manual' 
                                ? 'Hemos recibido tu comprobante. Estamos validando tu pago.'
                                : 'Tu pedido ha sido confirmado. Revisa tu correo electrónico.'}
                        </p>
                    </div>
                </div>
            )}

            {orders.length === 0 ? (
                // EMPTY STATE
                <div className="py-32 text-center border-2 border-dashed border-zinc-200 bg-zinc-50 rounded-lg">
                    <div className="w-16 h-16 bg-white border border-zinc-200 flex items-center justify-center mx-auto mb-6 text-2xl grayscale opacity-50 rounded-full">📦</div>
                    <h3 className="text-lg font-black text-black uppercase tracking-wide mb-2">Sin actividad reciente</h3>
                    <p className="text-zinc-500 mb-8 text-xs font-medium uppercase tracking-wide max-w-xs mx-auto">
                        Aún no has realizado ninguna compra.
                    </p>
                    <Link href="/products" className="inline-block bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-zinc-800 transition-all active:scale-[0.98] rounded-sm">
                        Ir al Catálogo
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const isOpen = expandedOrderId === order.id;
                        const currentStep = getProgressStep(order.estado);
                        const isCancelled = currentStep === -1;
                        const totalItemsCount = order.items.reduce((acc, item) => acc + item.cantidad, 0);
                        const isManualPayment = order.metodoPago === 'YAPE_QR';

                        return (
                            <article key={order.id} className={`border transition-all duration-300 rounded-sm overflow-hidden ${isOpen ? 'border-black bg-white shadow-lg' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                {/* ACCORDION HEADER (Botón semántico para a11y) */}
                                <button 
                                    onClick={() => toggleOrderDetails(order.id)}
                                    className="w-full text-left p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group focus:outline-none focus:bg-zinc-50"
                                    aria-expanded={isOpen}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-10 h-10 border flex items-center justify-center text-lg font-bold transition-colors rounded-full ${isOpen ? 'bg-black text-white border-black' : 'bg-zinc-50 text-zinc-400 border-zinc-200 group-hover:border-zinc-400'}`}>
                                            {isOpen ? '−' : '+'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-black text-black uppercase tracking-widest">
                                                    Orden #{order.id.toString().padStart(6, '0')}
                                                </span>
                                                <StatusBadge status={order.estado} />
                                            </div>
                                            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide flex gap-2">
                                                <span>{formatDate(order.fechaCreacion)}</span>
                                                <span className="text-zinc-300">•</span>
                                                <span>{totalItemsCount} {totalItemsCount === 1 ? 'Producto' : 'Productos'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0 w-full md:w-auto">
                                        <div className="text-right">
                                            <span className="block text-[9px] text-zinc-400 uppercase font-bold tracking-widest mb-0.5">Total</span>
                                            <span className="block text-xl font-black tracking-tighter tabular-nums text-black">
                                                {formatCurrency(order.total)}
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                {/* CONTENT BODY */}
                                <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <div className="border-t border-zinc-100 bg-zinc-50/50">
                                            
                                            {/* TIMELINE & STATUS */}
                                            <div className="p-8 border-b border-zinc-200 bg-white">
                                                {!isCancelled ? (
                                                    <div className="max-w-2xl mx-auto">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 text-center">Estado del Pedido</h4>
                                                        <Timeline activeStep={currentStep} orderDate={new Date(order.fechaCreacion)} />
                                                        
                                                        {/* YAPE INFO */}
                                                        {isManualPayment && order.estado === 'POR_CONFIRMAR' && (
                                                            <div className="mt-8 bg-amber-50 border border-amber-200 p-4 rounded text-center animate-pulse">
                                                                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">⏳ Validación Manual</p>
                                                                <div className="flex justify-center gap-4 text-[11px] text-amber-900">
                                                                    {order.codOperacion && <span>Código: <strong>{order.codOperacion}</strong></span>}
                                                                    {order.urlComprobante && (
                                                                        <a 
                                                                            href={getEvidenceUrl(order.urlComprobante)} // <--- FIXED HERE
                                                                            target="_blank" 
                                                                            rel="noreferrer" 
                                                                            className="underline font-bold hover:text-black"
                                                                        >
                                                                            Ver Comprobante
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* TRACKING */}
                                                        {order.trackingNumber && (
                                                            <div className="mt-8 bg-zinc-50 border border-black p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-sm">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-lg rounded-full">🚚</div>
                                                                    <div>
                                                                        <h5 className="text-xs font-black uppercase tracking-widest text-black">Paquete en Camino</h5>
                                                                        <p className="text-[10px] text-zinc-600 mt-1 font-medium">
                                                                            Courier: <strong>{order.courierName || 'Agencia'}</strong>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right w-full md:w-auto">
                                                                    <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tracking Code</span>
                                                                    <span className="block bg-white border border-zinc-300 px-3 py-2 font-mono text-sm font-black text-black tracking-wider select-all text-center rounded-sm">
                                                                        {order.trackingNumber}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-red-50 border border-red-200 p-4 text-center rounded-sm">
                                                        <p className="text-red-700 font-bold uppercase text-xs tracking-widest">🚫 Pedido cancelado</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* PRODUCTS & SUMMARY */}
                                            <div className="flex flex-col lg:flex-row">
                                                <div className="flex-1 p-8">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">📦 Detalle de productos</h4>
                                                    <div className="space-y-4">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="flex gap-4 items-start">
                                                                <div className="w-16 h-16 bg-white border border-zinc-200 flex items-center justify-center flex-shrink-0 relative overflow-hidden rounded-sm">
                                                                    {/* IMAGEN: Usamos Next Image si hay URL, sino placeholder */}
                                                                    {item.imagenUrl ? (
                                                                        <Image 
                                                                            src={item.imagenUrl} 
                                                                            alt={item.productName} 
                                                                            fill
                                                                            className="object-cover"
                                                                            sizes="64px"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-wider">IMG</span>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="flex-1 min-w-0 pt-1">
                                                                    <p className="text-sm font-bold text-black uppercase tracking-tight leading-tight mb-1">{item.productName}</p>
                                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                                                                        <span>Cant: {item.cantidad}</span>
                                                                        {item.color && <span>• {item.color}</span>}
                                                                        {item.talla && <span>• {item.talla}</span>}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="text-right pt-1">
                                                                    <p className="text-sm font-bold tabular-nums">{formatCurrency(item.precioUnitario)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="w-full lg:w-80 bg-zinc-100 p-8 border-t lg:border-t-0 lg:border-l border-zinc-200">
                                                    <div className="flex justify-between items-end">
                                                        <span className="font-black text-black text-sm uppercase tracking-widest">Total</span>
                                                        <span className="font-black text-black text-xl tabular-nums tracking-tighter">
                                                            {formatCurrency(order.total)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] text-zinc-400 text-right mt-2 font-medium uppercase tracking-wide">Incluye Envío e IGV</p>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// --- SUBCOMPONENTES FUERTEMENTE TIPADOS ---

interface StatusBadgeProps { status: string; }

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const s = status?.toUpperCase() || 'UNKNOWN';
    
    // Mapeo de estilos para mantener el JSX limpio
    const styles: Record<string, { bg: string, icon: string }> = {
        'PENDIENTE': { bg: "bg-zinc-100 text-zinc-800 border-zinc-300", icon: "🕒" },
        'POR_CONFIRMAR': { bg: "bg-amber-100 text-amber-800 border-amber-200", icon: "⏳" },
        'PAGADO': { bg: "bg-blue-100 text-blue-800 border-blue-200", icon: "💳" },
        'ENVIADO': { bg: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: "🚚" },
        'ENTREGADO': { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "✓" },
        'CANCELADO': { bg: "bg-red-100 text-red-800 border-red-200", icon: "✕" }
    };

    const currentStyle = styles[s] || styles['PENDIENTE'];

    return (
        <span className={`text-[9px] font-black px-2 py-0.5 uppercase tracking-widest border rounded-sm ${currentStyle.bg}`}>
            <span className="mr-1">{currentStyle.icon}</span> {s.replace('_', ' ')}
        </span>
    );
};

interface TimelineProps { activeStep: number; orderDate: Date; }
interface TimelineStepProps { active: boolean; completed: boolean; icon: React.ReactNode; label: string; date: string; }

const TimelineStep = ({ active, completed, icon, label, date }: TimelineStepProps) => (
    <div className="flex flex-col items-center relative z-10 w-24 group">
        <div className={`w-8 h-8 flex items-center justify-center text-xs border-2 transition-all duration-300 rounded-full ${active ? 'bg-black border-black text-white shadow-md scale-110' : 'bg-white border-zinc-200 text-zinc-300'}`}>
            {completed ? '✓' : icon}
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest mt-3 transition-colors ${active ? 'text-black' : 'text-zinc-300'}`}>{label}</span>
        <span className="text-[8px] text-zinc-400 font-medium mt-0.5 uppercase tracking-wide">{date}</span>
    </div>
);

const Timeline = ({ activeStep, orderDate }: TimelineProps) => {
    // Calculamos el ancho de la barra de progreso
    const progressWidth = activeStep === 0 ? '15%' : activeStep === 1 ? '35%' : activeStep === 2 ? '70%' : '100%';

    return (
        <div className="relative pt-2 pb-6" aria-label="Progreso del pedido">
            <div className="absolute top-[18px] left-0 w-full h-[2px] bg-zinc-100 -translate-y-1/2"></div>
            <div className="absolute top-[18px] left-0 h-[2px] bg-black -translate-y-1/2 transition-all duration-1000 ease-out" style={{ width: progressWidth }}></div>
            <div className="relative flex justify-between w-full">
                <TimelineStep active={true} completed={activeStep >= 1} icon="1" label="Recibido" date={formatDate(orderDate.toISOString())} />
                <TimelineStep active={activeStep >= 1} completed={activeStep > 1} icon="2" label="Aprobado" date={activeStep >= 1 ? "Listo" : "..."} />
                <TimelineStep active={activeStep >= 2} completed={activeStep > 2} icon="3" label="Enviado" date={activeStep >= 2 ? "En camino" : "..."} />
                <TimelineStep active={activeStep >= 3} completed={activeStep >= 3} icon="4" label="Entregado" date={activeStep >= 3 ? "Fin" : "..."} />
            </div>
        </div>
    );
};