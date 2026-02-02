
export interface UserProfile {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    dni?: string;
    telefono?: string;
    genero?: string;
    fechaNacimiento?: string; 
    authProvider?: 'LOCAL' | 'GOOGLE';  //MEJORAR PODEMOS HACER UN TYPE MEJORES PRACTICAS
}
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
export interface AdminUserFormData {
    nombre: string;
    apellido: string;
    email: string;
    password?: string; 
    rol: string;
}

export interface UserProfileUpdateRequest {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    genero: string;
    fechaNacimiento: string;
}