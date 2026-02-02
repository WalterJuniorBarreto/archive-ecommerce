import api from '@/lib/axios';
import { OrderRequest, OrderResponse, Order } from '@/types'; 

export const orderService = {
    
    createOrder: async (items: OrderRequest): Promise<OrderResponse> => {
        const { data } = await api.post<OrderResponse>('/orders', items);
        return data;
    },

    getMyOrders: async (): Promise<Order[]> => {
        const { data } = await api.get<Order[]>('/orders/me');
        return data;
    },
    getAllOrders: async (): Promise<Order[]> => {
        const { data } = await api.get<Order[]>('/orders/admin/all');
        return data;
    },
    updateStatus: async (id: number, status: string): Promise<Order> => {
        const { data } = await api.put<Order>(`/orders/${id}/status?status=${status}`);
        return data;
    },
    getStatuses: () => ["PENDIENTE", "ENVIADO", "ENTREGADO", "CANCELADO"],
    addTracking: async (orderId: number, trackingNumber: string, courierName: string) => {
        const { data } = await api.put<Order>(`/orders/${orderId}/tracking`, { 
            trackingNumber, 
            courierName 
        });
        return data;
    },
    createManualOrder: async (orderData: OrderRequest, file: File | null): Promise<OrderResponse> => {
        
        const formData = new FormData();

        formData.append('order', JSON.stringify({
            ...orderData,
            metodoPago: 'YAPE_QR' 
        }));

        if (file) {
            formData.append('file', file);
        }

        const { data } = await api.post<OrderResponse>('/orders/create-manual', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return data;
    },

    
};