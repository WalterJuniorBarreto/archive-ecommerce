'use client';

import { useEffect, useMemo, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { paymentService, PaymentRequest } from '@/services/payment.service';
import { CartItem, Address } from '@/types/product.types';
import { toast } from 'react-hot-toast';

// Inicialización segura del SDK
const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

if (MP_PUBLIC_KEY) {
    initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-PE' });
}

interface Props {
    amount: number;
    userEmail: string;
    onSuccess: () => void;
    cart: CartItem[];
    selectedAddress: Address;
}

export default function PaymentBrick({ amount, userEmail, onSuccess, cart, selectedAddress }: Props) {
    // Estado local para evitar doble envío
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. OPTIMIZACIÓN REACT: MEMOIZACIÓN
    // MercadoPago Brick se recarga si estos objetos cambian de referencia. 
    // Usamos useMemo para congelarlos hasta que los datos cambien realmente.
    const initialization = useMemo(() => ({
        amount: amount,
        payer: { email: userEmail },
    }), [amount, userEmail]);

    const customization = useMemo(() => ({
        paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            ticket: 'all',
        },
        visual: {
            style: { theme: 'default' as const },
            hidePaymentButton: false
        }
    }), []); // Array vacío = solo se crea una vez

    // 2. VALIDACIÓN DE ENTORNO (DevOps Safety)
    if (!MP_PUBLIC_KEY) {
        console.error("❌ CRITICAL: Missing NEXT_PUBLIC_MP_PUBLIC_KEY");
        return (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
                Error de configuración del sistema de pagos. Contacte al soporte.
            </div>
        );
    }

    // 3. HANDLER DEL PAGO
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const onSubmit = async (param: any) => {
        if (isProcessing) return; // Prevenir doble clic
        setIsProcessing(true);
        const toastId = toast.loading("Procesando pago seguro...");

        const { formData } = param;

        try {
            // Validaciones defensivas
            const emailSeguro = formData.payer.email || userEmail;
            const cuotasSeguras = formData.installments ? Number(formData.installments) : 1;

            // Armado del Payload
            const backendPayload: PaymentRequest = {
                token: formData.token,
                transactionAmount: Number(formData.transaction_amount),
                paymentMethodId: formData.payment_method_id,
                payerEmail: emailSeguro,
                installments: cuotasSeguras,
                issuerId: formData.issuer_id || "",
                
                // Mapeo de Items (Con variante)
                items: cart.map(item => ({
                    productId: item.id,
                    variantId: item.selectedVariant.id,
                    cantidad: item.quantity
                })),

                // Dirección
                direccion: {
                    calle: selectedAddress.direccion,
                    ciudad: selectedAddress.distrito,
                    estado: selectedAddress.departamento,
                    codigoPostal: selectedAddress.codigoPostal,
                    pais: "Perú"
                }
            };

            // Envío al Backend
            await paymentService.processPayment(backendPayload);
            
            toast.success("¡Pago aprobado!", { id: toastId });
            onSuccess(); // Redirección o limpieza

        } catch (error: any) {
            console.error("Payment Error:", error);
            // Mensaje amigable para el usuario, log técnico en consola
            toast.error("No se pudo procesar el pago. Intente nuevamente.", { id: toastId });
            setIsProcessing(false); // Permitir reintentar
        }
    };

    return (
        <div className={`mt-4 p-4 border border-zinc-200 rounded bg-white relative ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
            
            {/* Overlay de carga */}
            {isProcessing && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {selectedAddress ? (
                <Payment
                    initialization={initialization}
                    customization={customization}
                    onSubmit={onSubmit}
                    onReady={() => {/* Brick cargado */}}
                    onError={(error) => {
                        console.error('MP Brick Error:', error);
                        toast.error("Error al cargar el formulario de pago");
                    }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <p className="text-xs font-bold uppercase tracking-widest">Selecciona una dirección primero</p>
                </div>
            )}
        </div>
    );
}