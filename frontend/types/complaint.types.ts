import { z } from 'zod';

export type TipoBien = 'PRODUCTO' | 'SERVICIO';
export type TipoReclamo = 'RECLAMO' | 'QUEJA';
export type EstadoReclamo = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';

//ZOD VALIDACIONES DE DATOS DEL SCHEMA
export const complaintSchema = z.object({
    nombreCompleto: z.string().min(5, "El nombre debe tener al menos 5 caracteres"),
    dni: z.string().length(8, "El DNI debe tener exactamente 8 dígitos").regex(/^\d+$/, "Solo números"),
    telefono: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
    email: z.string().email("Debe ser un correo válido"),
    direccion: z.string().min(10, "La dirección debe ser detallada"),
    tipoBien: z.enum(['PRODUCTO', 'SERVICIO']),
    montoReclamado: z.number().positive("El monto debe ser mayor a 0"),
    descripcionBien: z.string().min(5, "Describe el bien contratado (ej. Zapatillas Nike)"),
    tipoReclamo: z.enum(['RECLAMO', 'QUEJA']),
    detalleProblema: z.string().min(20, "Por favor detalla el problema (mínimo 20 caracteres)"),
    pedidoConsumidor: z.string().min(10, "Indica qué solución esperas")
});

//VALIDAMOS EL SCHEMA VEMOS EL TIPO DE DATOS ZOD Y CON Z.INFER CONVERTIMOS A DATOS TS
export type ComplaintRequest = z.infer<typeof complaintSchema>;

export interface ComplaintResponse {
    id: number;
    codigoReclamacion: string; 
    fechaCreacion: string;     
    
    nombreCompleto: string;
    emailContacto: string;
    dni: string;
    telefono: string;
    direccion: string;
    
    tipoBien: TipoBien;
    montoReclamado: number;
    descripcionBien: string;
    tipoReclamo: TipoReclamo;
    detalleProblema: string;
    pedidoConsumidor: string;

    estado: EstadoReclamo;
    fechaResolucion?: string;
    respuestaAdmin?: string;   
}