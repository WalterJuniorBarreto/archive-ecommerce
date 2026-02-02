'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { toast } from 'react-hot-toast';

export default function GoogleButton() {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
        toast.error("No se recibieron credenciales de Google.");
        return;
    }

    const toastId = toast.loading("Conectando con Google...");

    try {
      // 1. SEGURIDAD: Nunca imprimir el token en consola en producción
      
      // 2. Llamada al Backend
      const response = await authService.loginWithGoogle(credentialResponse.credential);
      
      // 3. Guardar Token (Idealmente esto debería hacerlo tu AuthContext, 
      // pero si el service lo maneja directo, está bien por ahora)
      authService.setToken(response.token);
      
      toast.success(`Bienvenido ${response.user?.nombre || ''}`, { id: toastId });

      // 4. NAVIGACIÓN OPTIMIZADA (Next.js Way)
      // Primero refrescamos los Server Components (como el Navbar que muestra el usuario)
      router.refresh(); 
      // Luego redirigimos sin recargar toda la página
      router.push('/'); 

    } catch (error) {
      // Log técnico discreto (opcional, mejor si se envía a un servicio de monitoreo como Sentry)
      console.error("Google Auth Error:", error); 
      
      toast.error("Error al iniciar sesión con Google", { id: toastId });
    }
  };

  const handleError = () => {
    toast.error("La ventana de Google se cerró o falló la conexión.");
  };

  return (
    <div className="w-full flex justify-center">
      {/* WRAPPER DE DISEÑO:
         Centramos y limitamos el ancho para que no se rompa en móviles.
         El 'min-h' evita saltos de contenido (CLS) mientras carga el script de Google.
      */}
      <div className="w-full max-w-[400px] flex justify-center min-h-[44px]">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="outline"      // Borde sutil
            size="large"         // Botón grande para fácil clic
            text="continue_with"
            shape="rectangular"  // Brutalista (Cuadrado)
            width="350"          // Ancho fijo optimizado
            logo_alignment="center"
            locale="es"          // Forzar español
          />
      </div>
    </div>
  );
}