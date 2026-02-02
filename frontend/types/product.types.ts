
export interface Category {
    id: number;
    nombre: string;
    descripcion: string;
}
export interface CategoryFormData {
    nombre: string;
    descripcion: string;
}


export interface Brand {
    id: number;
    nombre?: string; 
    name?: string;   
}

export type Genero = 'HOMBRE' | 'MUJER' | 'UNISEX';


export interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    descuento: number;    
    precioFinal: number;   
    imagenUrl: string;     
    images: string[];
           
    brandId?: number;
    categoryId?: number;

    brandName?: string;   
    categoryName?: string;
    genero: Genero;        
    featured: boolean;    
    variantes: ProductVariant[]; 
    
    totalStock: number; 
    brand?: unknown; 
    category?: unknown;

}

export interface ProductVariant {
    id: number;
    color: string;
    colorHex: string;
    talla: string;
    stock: number;
}

export interface CartItem {
    id: number;             
    nombre: string;
    precio: number;         
    precioFinal: number;    
    imagenUrl: string;
    selectedVariant: ProductVariant; 
    quantity: number;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; 
    last: boolean;
    first: boolean;
    empty: boolean;
}

export interface WishlistToggleResponse {
    message: string;
    added: boolean; 
}