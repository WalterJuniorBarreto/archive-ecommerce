import api from '@/lib/axios';
import { Product, WishlistToggleResponse } from '@/types';



export const wishlistService = {
    getMyWishlist: async (): Promise<Product[]> => {
        const { data } = await api.get<Product[]>('/wishlist');
        return data;
    },

    toggle: async (productId: number): Promise<WishlistToggleResponse> => {
        const { data } = await api.post<WishlistToggleResponse>(`/wishlist/${productId}`);
        return data;
    }
};