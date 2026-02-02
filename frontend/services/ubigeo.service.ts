import axios from 'axios';
import { Departamento, Provincia, Distrito } from '@/types';


const UBIGEO_API_URL = process.env.NEXT_PUBLIC_UBIGEO_API_URL;
const CACHE_KEY = process.env.NEXT_PUBLIC_CACHE_KEY;



export const ubigeoService = {
  getPeruData: async (): Promise<Departamento[]> => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY!);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const { data } = await axios.get<Departamento[]>(UBIGEO_API_URL!);
      
      localStorage.setItem(CACHE_KEY!, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error("Error crítico cargando ubigeo:", error);
      return [];
    }
  }
};