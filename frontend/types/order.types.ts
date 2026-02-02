


export interface OrderRequest {
    items: {
        productId: number;
        variantId: number;   
        cantidad: number;
    }[]; //MAL, TENEMOS Q HACER UN INTERFACE Y LE AGREGAMOS UN ARRAY TOTALMENTE MAL
    direccion: ShippingAddress;
    metodoPago: 'YAPE_QR' | 'MERCADO_PAGO'; //MAL, HACER UN TYPE MEJORES PRACTICAS
    codOperacion?: string;   
}

export interface OrderItemResponse {
    id: number;
    cantidad: number;
    precioUnitario: number;
    productId: number;
    productName: string;
    color: string;           
    talla: string;          
}

export interface Order {
    id: number;
    fechaCreacion: string;
    estado: string;
    total: number;
    userEmail: string;
    items: OrderItemResponse[];
    trackingNumber?: string;
    courierName?: string;
    metodoPago: string;
    codOperacion?: string;
    urlComprobante?: string;
    direccionEnvio: string;  
}

export interface ShippingAddress {
    calle: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    pais: string;
}

export type OrderResponse = Order;