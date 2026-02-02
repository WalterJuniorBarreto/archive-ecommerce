'use client';

// 1. IMPORTAMOS 'use' PARA NEXT.JS 15
import { useEffect, useState, use } from 'react';
import { userService } from '@/services/user.service';
import UserForm from '@/components/admin/UserForm';
import { UserProfile } from '@/types';

// 2. DEFINIMOS PARAMS COMO PROMISE
export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 3. DESEMPAQUETAMOS EL ID
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 4. CARGAMOS LOS DATOS DEL USUARIO
    userService.getById(Number(id))
      .then(setUser)
      .catch((error) => {
        console.error(error);
        alert('Error al cargar el usuario');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  if (!user) {
    return <div className="text-center p-10 text-red-500">Usuario no encontrado</div>;
  }

  return <UserForm initialData={user} />;
}