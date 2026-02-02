import { z } from 'zod';

export const addressSchema = z.object({
    alias: z.string().min(2, "Dale un nombre (ej. Casa, Oficina)"),
    calle: z.string().min(5, "Ingresa la dirección exacta"),
    ciudad: z.string().min(2, "Requerido"),
    estado: z.string().min(2, "Requerido"), 
    codigoPostal: z.string().regex(/^\d+$/, "Solo números").min(3, "Código postal inválido"),
    pais: z.string().min(2, "Requerido")
});

export type AddressFormData = z.infer<typeof addressSchema>;

export interface Address extends AddressFormData {
    id: number;
}