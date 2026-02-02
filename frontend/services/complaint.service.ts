import api from '@/lib/axios';
import { ComplaintRequest, ComplaintResponse } from '@/types/complaint.types';

export const complaintService = {
    
    create: async (complaintData: ComplaintRequest): Promise<ComplaintResponse> => {
        const { data } = await api.post<ComplaintResponse>('/complaints', complaintData);
        return data;
    },

   
    getAll: async (): Promise<ComplaintResponse[]> => {
        const { data } = await api.get<ComplaintResponse[]>('/complaints');
        return data;
    },


    
    resolve: async (id: number, respuestaAdmin: string): Promise<ComplaintResponse> => {
        const { data } = await api.patch<ComplaintResponse>(`/complaints/${id}/resolver`, {
            estado: 'RESUELTO',
            respuestaAdmin: respuestaAdmin
        });
        return data;
    },

    getByCode: async (codigo: string): Promise<ComplaintResponse> => {
        const { data } = await api.get<ComplaintResponse>(`/complaints/track/${codigo}`);
        return data;
    }
};