export interface PaymentRequest {
    token: string;
    transactionAmount: number;
    paymentMethodId: string;
    payerEmail: string;
    installments: number;
    issuerId: string;

    items: {
        productId: number;
        variantId: number;
        cantidad: number;
    }[];

    direccion: {
        calle: string;
        ciudad: string;
        estado: string;
        codigoPostal: string;
        pais: string;
    };
}