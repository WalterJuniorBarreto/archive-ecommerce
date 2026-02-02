import axios from 'axios';


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
//CREAMOS CLIENTE AXIOS CON BASE Y CONFIGURACIONES
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


//INTERCEPTOR ANTES DE ENVIAR AL BACKEND MODIFICAMOS
api.interceptors.request.use(
    (config) => {
        //GUARDAMOS EL TOKEN SI ES Q HAY TOKEN GUARDAMOS Y AGREGAMOS UN HEADERS//
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
//INTERCEPTOR DE LO Q ENVIA EL BACKEND
api.interceptors.response.use(
    (response) => {
        return response;
    },
    //SI LA RESPUESTA HAY ALGUN ERROR
    (error) => {
        if (error.response) {
            const status = error.response.status;
            //SI ES 401 SI EL TOKEN FUE INVALIDO O NO EXPIRO CERRAMOS SESION AUTOMATICAMENTE Y REDIRIGIMOS A LOGIN
            if (status === 401) {
                console.warn('Sesión expirada. Cerrando sesión...');
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user'); 
                    window.location.href = '/login';
                }
            }
            //SI EL STATUS ES 403 ES ACCESO DENEGADO
            if (status === 403) {
                console.error('Acceso denegado: No tienes rol de Admin.');
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;


