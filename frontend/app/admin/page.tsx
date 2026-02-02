'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { orderService } from '@/services/order.service';
import { userService } from '@/services/user.service';
import { Order, UserProfile } from '@/types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';

// --- UTILS: FORMATO MONEDA ---
const formatCurrency = (val: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // --- 1. DATA FETCHING (Robust) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, usersData] = await Promise.all([
         orderService.getAllOrders(),
         userService.getAll(0, 1000) 
      ]);
      // Ordenar por fecha reciente para la tabla
      setOrders(ordersData.sort((a: Order, b: Order) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()));
      setUsers(usersData.content); 
      setLastUpdated(new Date());
    } catch (error) {
      console.error("[Dashboard] Error fetching data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 2. PERFORMANCE: MEMOIZED CALCULATIONS ---
  const kpis = useMemo(() => {
    if (!orders.length) return { revenue: 0, salesMonth: 0, salesToday: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const todayStr = now.toISOString().split('T')[0];

    return orders.reduce((acc, o) => {
        if (o.estado === 'CANCELADO') return acc;
        
        // Total
        acc.revenue += o.total;

        // Month
        const orderDate = new Date(o.fechaCreacion);
        if (orderDate.getMonth() === currentMonth) {
            acc.salesMonth += o.total;
        }

        // Today
        if (o.fechaCreacion.toString().startsWith(todayStr)) {
            acc.salesToday += o.total;
        }

        return acc;
    }, { revenue: 0, salesMonth: 0, salesToday: 0 });
  }, [orders]);

  // --- 3. CHART DATA PREPARATION ---
  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    // Inicializar últimos 7 días con 0 (para que el gráfico no se vea vacío)
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
        dataMap.set(key, 0);
    }

    orders.forEach(o => {
        if (o.estado === 'CANCELADO') return;
        const key = new Date(o.fechaCreacion).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
        if (dataMap.has(key)) {
            dataMap.set(key, (dataMap.get(key) || 0) + o.total);
        }
    });

    return Array.from(dataMap.entries()).map(([name, ventas]) => ({ name, ventas }));
  }, [orders]);

  const statusData = useMemo(() => [
    { name: 'Pendiente', value: orders.filter(o => o.estado === 'PENDIENTE').length, color: '#fbbf24' }, // Amber-400
    { name: 'Por Confirmar', value: orders.filter(o => o.estado === 'POR_CONFIRMAR').length, color: '#f59e0b' }, // Amber-500
    { name: 'Pagado', value: orders.filter(o => o.estado === 'PAGADO').length, color: '#60a5fa' }, // Blue-400
    { name: 'Enviado', value: orders.filter(o => o.estado === 'ENVIADO').length, color: '#818cf8' }, // Indigo-400
    { name: 'Entregado', value: orders.filter(o => o.estado === 'ENTREGADO').length, color: '#34d399' }, // Emerald-400
    { name: 'Cancelado', value: orders.filter(o => o.estado === 'CANCELADO').length, color: '#f87171' }, // Red-400
  ], [orders]);


  if (loading && !lastUpdated) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-zinc-200 rounded-full animate-spin"></div>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Cargando Dashboard...</span>
    </div>
  );

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
        
        {/* HEADER & CONTROLS */}
        <div className="border-b border-zinc-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-black uppercase tracking-tighter mb-2">Dashboard</h1>
                <p className="text-sm text-zinc-500 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Actualizado: {lastUpdated?.toLocaleTimeString()}
                </p>
            </div>
            <button 
                onClick={fetchData} 
                className="bg-white border border-zinc-300 hover:border-black text-xs font-bold uppercase px-4 py-2 tracking-widest transition-all active:scale-95"
            >
                ↻ Actualizar Datos
            </button>
        </div>

        {/* 1. KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
                title="Ventas Hoy" 
                value={formatCurrency(kpis.salesToday)} 
                icon="☀️"
            />
            <KPICard 
                title="Ventas del Mes" 
                value={formatCurrency(kpis.salesMonth)} 
                icon="📅"
                isHighlight
            />
            <KPICard 
                title="Total Usuarios" 
                value={users.length.toString()} 
                icon="👥"
            />
            <KPICard 
                title="Total Pedidos" 
                value={orders.length.toString()} 
                icon="📦"
            />
        </div>

        {/* 2. CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[450px]">
            
            {/* AREA CHART (Revenue) */}
            <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 shadow-sm relative flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Tendencia de Ingresos (7 días)</h3>
                </div>
                
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fill: '#a1a1aa'}} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fill: '#a1a1aa'}} 
                                tickFormatter={(val) => `S/${val}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="ventas" 
                                stroke="#000000" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorVentas)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* BAR CHART (Status) */}
            <div className="bg-white border border-zinc-200 p-6 shadow-sm relative flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-zinc-300"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Distribución de Pedidos</h3>
                
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData} layout="vertical" margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f4f4f5" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false}
                                width={100}
                                tick={{fontSize: 10, fill: '#52525b', fontWeight: 'bold'}} 
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '0px', color: '#fff' }}
                            />
                            <Bar dataKey="value" barSize={15} radius={[0, 4, 4, 0]}>
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* 3. RECENT ORDERS TABLE */}
        <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-black">Últimas Transacciones</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100">
                            <th className="px-6 py-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">ID</th>
                            <th className="px-6 py-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Fecha</th>
                            <th className="px-6 py-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Cliente</th>
                            <th className="px-6 py-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total</th>
                            <th className="px-6 py-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {orders.slice(0, 5).map(order => (
                            <tr key={order.id} className="hover:bg-zinc-50 transition-colors group">
                                <td className="px-6 py-3 text-xs font-mono text-zinc-500 group-hover:text-black">
                                    #{order.id.toString().padStart(5, '0')}
                                </td>
                                <td className="px-6 py-3 text-xs text-zinc-500">
                                    {new Date(order.fechaCreacion).toLocaleDateString('es-PE')}
                                </td>
                                <td className="px-6 py-3 text-xs font-bold text-black">{order.userEmail}</td>
                                <td className="px-6 py-3 text-xs font-medium tabular-nums">{formatCurrency(order.total)}</td>
                                <td className="px-6 py-3 text-right">
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-sm ${
                                        order.estado === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-800' :
                                        order.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' :
                                        order.estado === 'POR_CONFIRMAR' ? 'bg-orange-100 text-orange-800' :
                                        order.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {order.estado.replace('_', ' ')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    </div>
  );
}

// --- SUBCOMPONENTS ---

interface KPICardProps { title: string; value: string; icon: string; isHighlight?: boolean; }

const KPICard = ({ title, value, icon, isHighlight }: KPICardProps) => (
    <div className={`p-6 border shadow-sm relative overflow-hidden group transition-all duration-300 ${isHighlight ? 'bg-black border-black text-white' : 'bg-white border-zinc-200 text-black hover:border-black'}`}>
        <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isHighlight ? 'text-zinc-400' : 'text-zinc-400'}`}>
                {title}
            </span>
            <span className="text-xl opacity-50 grayscale">{icon}</span>
        </div>
        <div className="flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight tabular-nums">{value}</span>
        </div>
        {/* Decorative Circle */}
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-5 pointer-events-none ${isHighlight ? 'bg-white' : 'bg-black'}`}></div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black text-white p-3 text-xs shadow-xl border border-zinc-800">
                <p className="font-bold uppercase tracking-wide mb-1 text-zinc-400">{label}</p>
                <p className="font-mono text-emerald-400 text-lg">
                    {formatCurrency(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};