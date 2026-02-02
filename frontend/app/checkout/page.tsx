'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Optimización de imágenes
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Context & Services
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { addressService } from '@/services/address.service';
import { orderService } from '@/services/order.service';
import { Address } from '@/types';

// Components
import PaymentBrick from '@/components/checkout/PaymentBrick';

// --- UTILS (Para consistencia en toda la app) ---
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

// --- COMPONENTE 1: FORMULARIO YAPE (Aislado) ---
interface YapeFormProps {
  totalToPay: number;
  isProcessing: boolean;
  onSubmit: (code: string, file: File | null) => void;
}

const YapeForm = ({ totalToPay, isProcessing, onSubmit }: YapeFormProps) => {
  const [yapeCode, setYapeCode] = useState('');
  const [yapeFile, setYapeFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yapeCode && !yapeFile) {
        toast.error("Ingresa el código o sube la captura");
        return;
    }
    onSubmit(yapeCode, yapeFile);
  };

  return (
    <div className="bg-white border-2 border-[#742284] p-6 shadow-[8px_8px_0px_0px_rgba(116,34,132,0.2)] animate-in zoom-in-95 duration-200">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
            <div className="bg-white p-2 border-2 border-zinc-200 rounded shrink-0 text-center">
                {/* Asegúrate de tener yape-qr.png en public/ */}
                <div className="relative w-40 h-40">
                     <Image src="/yape-qr.png" alt="QR Yape" fill className="object-contain" />
                </div>
                <p className="text-[10px] font-bold mt-2 uppercase">Walter Barreto</p>
            </div>
            <div className="space-y-4 w-full">
                <div className="bg-purple-50 border-l-4 border-purple-600 p-4">
                    <p className="text-sm font-bold text-purple-900 uppercase mb-1">Instrucciones</p>
                    <ol className="text-xs text-purple-800 list-decimal list-inside space-y-1 font-medium">
                        <li>Escanea el QR o yapea al <strong>999-999-999</strong>.</li>
                        <li>Monto exacto: <strong>{formatCurrency(totalToPay)}</strong>.</li>
                        <li>Adjunta la constancia aquí abajo.</li>
                    </ol>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">Código de Operación</label>
                <input 
                    type="text" 
                    placeholder="Ej: 1234567"
                    value={yapeCode}
                    onChange={(e) => setYapeCode(e.target.value)}
                    className="w-full border-2 border-zinc-300 p-3 text-sm font-bold focus:border-[#742284] outline-none transition-colors"
                />
            </div>
            
            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-zinc-200"></div>
                <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs font-bold uppercase">O también</span>
                <div className="flex-grow border-t border-zinc-200"></div>
            </div>

            <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">Subir Captura</label>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => e.target.files && setYapeFile(e.target.files[0])}
                    className="w-full text-xs font-bold file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-black file:bg-white file:font-black file:uppercase hover:file:bg-black hover:file:text-white transition-all cursor-pointer"
                />
            </div>

            <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#742284] text-white py-4 font-black uppercase tracking-[0.2em] text-sm hover:bg-[#5a1a66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
            >
                {isProcessing ? 'Validando...' : 'Confirmar Pago'}
            </button>
        </form>
    </div>
  );
};

// --- COMPONENTE 2: RESUMEN DE ORDEN (Optimizado con useMemo) ---
const OrderSummary = ({ cart, step, onNext, canProceed, totalToPay, shippingCost }: any) => {
    return (
        <div className="sticky top-24 space-y-8">
            <div className="bg-zinc-50 border-2 border-black p-8">
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 border-b-2 border-black pb-4">Tu Pedido</h2>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {cart.map((item: any) => (
                        <div key={`${item.id}-${item.selectedVariant.id}`} className="flex gap-4">
                            <div className="w-12 h-12 bg-white border border-black shrink-0 relative overflow-hidden">
                                {item.imagenUrl ? (
                                    <Image src={item.imagenUrl} alt={item.nombre} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-[8px]">NO IMG</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold uppercase truncate">{item.nombre}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                                    {item.selectedVariant.color} / {item.selectedVariant.talla} <span className="text-black ml-1">x{item.quantity}</span>
                                </p>
                            </div>
                            <div className="text-sm font-bold tabular-nums">{formatCurrency(item.precio * item.quantity)}</div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-dashed border-zinc-400 pt-4 space-y-2 text-sm font-medium">
                    <div className="flex justify-between"><span className="text-zinc-600">Envío</span><span className="font-bold">{formatCurrency(shippingCost)}</span></div>
                </div>

                <div className="flex justify-between items-end mt-6 pt-6 border-t-2 border-black">
                    <span className="font-black uppercase tracking-widest text-lg">Total</span>
                    <span className="text-3xl font-black tracking-tighter">{formatCurrency(totalToPay)}</span>
                </div>

                {step === 1 && (
                    <button 
                        onClick={onNext}
                        disabled={!canProceed}
                        className={`w-full mt-8 py-5 font-black uppercase tracking-[0.2em] text-sm transition-all duration-200 border-2
                            ${canProceed 
                                ? 'bg-black text-white border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                                : 'bg-zinc-200 text-zinc-400 border-transparent cursor-not-allowed'}`}
                    >
                        {!canProceed ? 'Completa tus datos' : 'Ir a Pagar →'}
                    </button>
                )}
            </div>
        </div>
    );
};


// --- PÁGINA PRINCIPAL ---
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  
  // Estados
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<'MERCADO_PAGO' | 'YAPE'>('MERCADO_PAGO');
  const [isProcessing, setIsProcessing] = useState(false);

  // Carga inicial
  useEffect(() => {
    const init = async () => {
        if (!user) return;
        try {
            const data = await addressService.getAll();
            setAddresses(data);
            if (data.length > 0) setSelectedAddress(data[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAddr(false);
        }
    };
    init();
  }, [user]);

  // Cálculo optimizado con useMemo (Performance)
  const totals = useMemo(() => {
      const subtotal = cart.reduce((acc, item) => {
          const price = item.descuento ? item.precio * (1 - item.descuento / 100) : item.precio;
          return acc + price * item.quantity;
      }, 0);
      const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
      const shipping = itemsCount * 20; // Regla de negocio: 20 soles por item (ejemplo)
      return { subtotal, shipping, total: subtotal + shipping };
  }, [cart]);

  // Manejadores
  const handleYapePayment = async (code: string, file: File | null) => {
      if (!selectedAddress) return;
      setIsProcessing(true);
      try {
          const itemsPayload = cart.map(item => ({
              productId: item.id,
              variantId: item.selectedVariant.id,
              cantidad: item.quantity
          }));

          const orderRequest = {
              items: itemsPayload,
              direccion: {
                  calle: selectedAddress.direccion, // Asegúrate de que mapee con tu backend
                  ciudad: selectedAddress.distrito,
                  estado: selectedAddress.provincia,
                  codigoPostal: selectedAddress.codigoPostal,
                  pais: 'Peru'
              },
              codOperacion: code
          };

          await orderService.createManualOrder(orderRequest, file);
          clearCart();
          toast.success("Pedido recibido");
          router.push('/profile/orders?success=manual');
      } catch (error) {
          console.error(error);
          toast.error("Error al procesar pedido");
      } finally {
          setIsProcessing(false);
      }
  };

  const canProceed = Boolean(selectedAddress && user?.dni && user?.telefono);

  if (cart.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Carrito Vacío</h2>
              <button onClick={() => router.push('/products')} className="bg-black text-white px-10 py-4 font-black uppercase tracking-widest hover:bg-zinc-800">
                  Volver a la Tienda
              </button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white pt-12 pb-24 px-6 max-w-[1600px] mx-auto font-sans text-black">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-12 border-b-4 border-black pb-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Checkout</h1>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <span className={step === 1 ? "bg-black text-white px-2 py-1" : "text-zinc-400"}>1. Datos</span>
            <span className="text-zinc-300">/</span>
            <span className={step === 2 ? "bg-black text-white px-2 py-1" : "text-zinc-400"}>2. Pago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-12">
            {step === 1 ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-12">
                    {/* DIRECCIONES */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-tight"><span className="text-zinc-300 mr-2">01.</span> Envío</h2>
                            <Link href="/profile/addresses" className="text-xs font-bold uppercase tracking-widest underline hover:text-zinc-600">Gestionar</Link>
                        </div>
                        
                        {loadingAddr ? (
                            <div className="p-8 border-2 border-dashed border-zinc-200 text-center text-xs font-bold uppercase text-zinc-400">Cargando...</div>
                        ) : addresses.length === 0 ? (
                            <div className="bg-yellow-50 border-2 border-yellow-400 p-6 flex justify-between items-center">
                                <span className="font-bold text-sm text-yellow-800">No hay direcciones</span>
                                <button onClick={() => router.push('/profile/addresses')} className="bg-yellow-400 px-4 py-2 text-xs font-black uppercase border border-black">+ Crear</button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {addresses.map(addr => (
                                    <div 
                                        key={addr.id} 
                                        onClick={() => setSelectedAddress(addr)}
                                        className={`p-6 border-2 cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-black bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-zinc-200 hover:border-zinc-400'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-black text-lg uppercase">{addr.alias || 'Dirección'}</span>
                                                <p className="text-sm font-medium mt-1">{addr.direccion}</p>
                                                <p className="text-xs text-zinc-500 font-bold mt-1 uppercase">{addr.distrito}, {addr.provincia}</p>
                                            </div>
                                            {selectedAddress?.id === addr.id && <span className="bg-black text-white text-[9px] font-bold px-2 py-1 uppercase">Seleccionada</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* DATOS DE CONTACTO */}
                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-6"><span className="text-zinc-300 mr-2">02.</span> Contacto</h2>
                        <div className="bg-white border-2 border-black p-6">
                            {!user?.dni || !user?.telefono ? (
                                <div className="text-center">
                                    <p className="text-red-600 font-bold uppercase text-sm mb-2">Faltan Datos</p>
                                    <button onClick={() => router.push('/profile')} className="bg-red-600 text-white px-4 py-2 text-xs font-bold uppercase">Completar Perfil</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-[10px] text-zinc-400 font-bold uppercase">Cliente</p><p className="font-bold">{user.nombre} {user.apellido}</p></div>
                                    <div><p className="text-[10px] text-zinc-400 font-bold uppercase">DNI</p><p className="font-mono font-bold">{user.dni}</p></div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setStep(1)} className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black">← Volver</button>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6"><span className="text-zinc-300 mr-2">03.</span> Pago</h2>
                    
                    {/* TABS DE PAGO */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button 
                            onClick={() => setPaymentMethod('MERCADO_PAGO')}
                            className={`py-4 border-2 text-xs font-black uppercase transition-all ${paymentMethod === 'MERCADO_PAGO' ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]' : 'bg-white text-black border-zinc-200'}`}
                        >
                            Tarjeta (Mercado Pago)
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('YAPE')}
                            className={`py-4 border-2 text-xs font-black uppercase transition-all ${paymentMethod === 'YAPE' ? 'bg-[#742284] text-white border-[#742284] shadow-[4px_4px_0px_0px_rgba(116,34,132,0.4)]' : 'bg-white text-black border-zinc-200 hover:border-[#742284] hover:text-[#742284]'}`}
                        >
                            Yape / Plin
                        </button>
                    </div>

                    {paymentMethod === 'MERCADO_PAGO' ? (
                        <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                             <PaymentBrick 
                                amount={totals.total} 
                                userEmail={user?.email || ''} 
                                onSuccess={() => { clearCart(); router.push('/profile/orders?success=true'); }}
                                cart={cart}
                                selectedAddress={selectedAddress!}
                            />
                        </div>
                    ) : (
                        <YapeForm 
                            totalToPay={totals.total} 
                            isProcessing={isProcessing} 
                            onSubmit={handleYapePayment} 
                        />
                    )}
                </div>
            )}
        </div>

        {/* RIGHT COLUMN (Resumen) */}
        <div className="lg:col-span-5">
            <OrderSummary 
                cart={cart} 
                step={step} 
                onNext={() => setStep(2)} 
                canProceed={canProceed} 
                totalToPay={totals.total} 
                shippingCost={totals.shipping}
            />
        </div>

      </div>
    </div>
  );
}