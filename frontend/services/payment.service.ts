import api from '@/lib/axios';
import { PaymentRequest } from '@/types';


export const paymentService = {
    processPayment: async (paymentData: PaymentRequest) => {
        const { data } = await api.post('/payments/process_payment', paymentData);
        return data;
    }
};