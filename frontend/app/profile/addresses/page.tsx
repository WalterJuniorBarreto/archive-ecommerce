'use client';

import { useEffect, useState, useCallback } from 'react';
import { addressService } from '@/services/address.service'; 
import { Address } from '@/types'; // <--- Importamos tu interfaz REAL
import AddressForm from '@/components/profile/AddressForm';

// --- SUB-COMPONENTE: TARJETA DE DIRECCIÓN (Sincronizado con tu Schema) ---
interface AddressCardProps {
  address: Address;
  onEdit: (addr: Address) => void;
  onDelete: (id: number) => void;
}

const AddressCard = ({ address, onEdit, onDelete }: AddressCardProps) => (
  <article className="group relative bg-white border border-gray-200 p-6 rounded-lg hover:border-black hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
          {/* 1. USAMOS EL ALIAS COMO TÍTULO (Ej: "CASA") */}
          <div className="pr-4">
              <h4 className="font-black text-lg text-black uppercase tracking-tight line-clamp-1">
                  {address.alias}
              </h4>
              {/* 2. USAMOS 'CALLE' COMO SUBTÍTULO */}
              <p className="text-xs text-zinc-500 font-medium line-clamp-1 mt-0.5">
                  {address.calle}
              </p>
          </div>
          
          <div className="flex gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button 
                  onClick={() => onEdit(address)}
                  className="text-gray-400 hover:text-black transition-colors focus:opacity-100"
                  title="Editar dirección"
              >
                  {/* Icono Edit */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
              </button>
              <button 
                  onClick={() => onDelete(address.id)} 
                  className="text-gray-400 hover:text-red-600 transition-colors focus:opacity-100"
                  title="Eliminar dirección"
              >
                  {/* Icono Trash */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
          </div>
      </div>

      <div className="space-y-1 text-sm text-gray-500 font-medium mt-3 border-t border-gray-100 pt-3">
          {/* 3. USAMOS TUS CAMPOS: CIUDAD, ESTADO, PAIS */}
          <p>{address.ciudad}, {address.estado}</p>
          <div className="flex items-center gap-2 mt-2">
              <span className="text-xs uppercase tracking-wide bg-zinc-100 px-2 py-1 rounded text-zinc-500">
                  {address.pais}
              </span>
              <span className="text-xs uppercase tracking-wide text-zinc-400">
                  CP: {address.codigoPostal}
              </span>
          </div>
      </div>
  </article>
);

// --- COMPONENTE PRINCIPAL (Sin cambios lógicos, solo usa el nuevo AddressCard) ---
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]); // TypeScript ahora está feliz :)
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [idToDelete, setIdToDelete] = useState<number | null>(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAddresses = useCallback(async () => {
    try {
      const data = await addressService.getAll();
      setAddresses(data);
    } catch (error) {
      console.error("[AddressPage] Error loading:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Actions
  const confirmDelete = (id: number) => {
    setIdToDelete(id);
    setMessage(null); 
  };

  const cancelDelete = () => {
    setIdToDelete(null);
  };

  const executeDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      await addressService.delete(idToDelete);
      setMessage({ text: 'Dirección eliminada correctamente.', type: 'success' });
      await loadAddresses();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: 'No se pudo eliminar la dirección.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setIdToDelete(null); 
    }
  };

  const handleNew = () => {
    setEditingAddress(null);
    setShowForm(true);
    setMessage(null);
  };

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setShowForm(true);
    setMessage(null);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingAddress(null);
    loadAddresses();
    setMessage({ text: 'Operación realizada con éxito.', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    setMessage(null);
  }

  if (loading) {
    return (
        <div className="p-10 text-center flex flex-col items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-zinc-200 rounded-full"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Cargando direcciones...</span>
        </div>
    );
  }

  return (
    <div className="relative animate-fade-in">
      
      {/* Modal Confirmación */}
      {idToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
            <div className="bg-white p-8 max-w-sm w-full shadow-2xl border border-zinc-100 rounded-lg">
                <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">¿Eliminar Dirección?</h3>
                <p className="text-sm text-zinc-500 mb-6 font-medium">
                    Esta acción no se puede deshacer. ¿Estás seguro?
                </p>
                <div className="flex gap-3">
                    <button onClick={cancelDelete} className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition cursor-pointer" disabled={isDeleting}>Cancelar</button>
                    <button onClick={executeDelete} className="flex-1 bg-red-600 text-white py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition shadow-lg cursor-pointer flex items-center justify-center gap-2" disabled={isDeleting}>
                        {isDeleting && <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>}
                        {isDeleting ? '...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {!showForm && (
          <div className="flex justify-between items-end mb-8 border-b pb-4">
            <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-black">Mis Direcciones</h2>
                <p className="text-sm text-gray-500 mt-1">Administra tus lugares de entrega.</p>
            </div>
            <button onClick={handleNew} className="bg-black text-white px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition shadow-lg hover:-translate-y-0.5 transform cursor-pointer flex items-center gap-2"><span>+</span> Nueva</button>
          </div>
      )}

      {!showForm && message && (
        <div role="alert" className={`mb-6 p-4 text-xs font-bold uppercase tracking-wide flex items-center gap-3 animate-fade-in border-l-4 rounded-r ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
            <span className="text-lg">{message.type === 'success' ? '✓' : '✕'}</span>
            {message.text}
        </div>
      )}

      {showForm ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 cursor-pointer hover:text-black focus:outline-none" onClick={handleCancel}><span>←</span> Volver</button>
            <AddressForm initialData={editingAddress} onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.length === 0 ? (
                <div className="col-span-2 py-16 text-center bg-zinc-50 border border-zinc-100 rounded-lg border-dashed">
                    <p className="text-4xl mb-3 grayscale opacity-30">🏠</p>
                    <p className="text-zinc-500 text-sm font-medium">No tienes direcciones guardadas.</p>
                </div>
            ) : (
                addresses.map((addr) => (
                    <AddressCard key={addr.id} address={addr} onEdit={handleEdit} onDelete={confirmDelete} />
                ))
            )}
        </div>
      )}
    </div>
  );
}