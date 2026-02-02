'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addressService } from '@/services/address.service'; 
import { ubigeoService, UbigeoItem } from '@/lib/ubigeo'; 
import { Address } from '@/types/address.types'; 
import { toast } from 'react-hot-toast';


interface AddressPayload {
  alias: string;
  departamento: string; // Antes enviábamos 'estado'
  provincia: string;    // Antes no lo enviábamos (iba en ciudad)
  distrito: string;     // Antes no lo enviábamos (iba en ciudad)
  direccion: string;    // Antes enviábamos 'calle'
  referencia?: string;
  codigoPostal: string;
  pais: string;
}

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Address | null;
}

interface AddressFormState {
  alias: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  referencia: string;
  codigoPostal: string;
}

export default function AddressForm({ onSuccess, onCancel, initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [depsList, setDepsList] = useState<UbigeoItem[]>([]);
  const [provsList, setProvsList] = useState<UbigeoItem[]>([]);
  const [distsList, setDistsList] = useState<UbigeoItem[]>([]);

  const [selectedDepId, setSelectedDepId] = useState("");
  const [selectedProvId, setSelectedProvId] = useState("");
  const [selectedDistId, setSelectedDistId] = useState("");

  const [formData, setFormData] = useState<AddressFormState>({
    alias: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    referencia: '',
    codigoPostal: ''
  });

  useEffect(() => {
    const initForm = async () => {
      const deps = await ubigeoService.getDepartamentos();
      setDepsList(deps);

      if (initialData) {
        
        let provName = '';
        let distName = initialData.ciudad; 

        
        if (initialData.ciudad && initialData.ciudad.includes(' - ')) {
            const parts = initialData.ciudad.split(' - ');
            provName = parts[0];
            distName = parts[1];
        } else {
           
        }

        setFormData({
            alias: initialData.alias || '',
            departamento: initialData.estado || initialData.departamento, // Probamos ambos nombres
            provincia: provName || initialData.provincia,                 // Probamos ambos nombres
            distrito: distName || initialData.distrito,                   // Probamos ambos nombres
            direccion: initialData.calle || initialData.direccion,        // Probamos ambos nombres
            referencia: initialData.referencia || '',      
            codigoPostal: initialData.codigoPostal
        });

        const depName = initialData.estado || initialData.departamento;
        const dep = deps.find(d => d.name === depName);
        
        if (dep) {
            setSelectedDepId(dep.id);
            const provs = await ubigeoService.getProvincias(dep.id);
            setProvsList(provs);
            
            const pName = provName || initialData.provincia;
            const prov = provs.find(p => p.name === pName); 
            
            if (prov) {
                setSelectedProvId(prov.id);
                const dists = await ubigeoService.getDistritos(prov.id);
                setDistsList(dists);
                
                const dName = distName || initialData.distrito;
                const dist = dists.find(d => d.name === dName);
                if (dist) setSelectedDistId(dist.id);
            }
        }
      }
    };
    initForm();
  }, [initialData]);

  // HANDLERS (Iguales)
  const handleDepChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedDepId(id);
    setFormData(prev => ({ ...prev, departamento: name, provincia: '', distrito: '' }));
    setSelectedProvId(""); setSelectedDistId(""); setDistsList([]); 
    if (id) {
        const provs = await ubigeoService.getProvincias(id);
        setProvsList(provs);
    } else { setProvsList([]); }
  };

  const handleProvChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedProvId(id);
    setFormData(prev => ({ ...prev, provincia: name, distrito: '' }));
    setSelectedDistId("");
    if (id) {
        const dists = await ubigeoService.getDistritos(id);
        setDistsList(dists);
    } else { setDistsList([]); }
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedDistId(id);
    setFormData(prev => ({ ...prev, distrito: name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.alias.trim()) {
        toast.error("Por favor ingresa un nombre (Alias)");
        setLoading(false);
        return;
    }

   
    const payload: AddressPayload = {
        alias: formData.alias,
        departamento: formData.departamento, // Java pide "departamento"
        provincia: formData.provincia,       // Java pide "provincia"
        distrito: formData.distrito,         // Java pide "distrito"
        direccion: formData.direccion,       // Java pide "direccion"
        referencia: formData.referencia,
        codigoPostal: formData.codigoPostal,
        pais: 'Perú' 
    };

    console.log("🚀 Payload Correcto:", payload); 

    try {
        if (initialData) {
            await addressService.update(initialData.id, payload);
            toast.success('Dirección actualizada');
        } else {
            await addressService.create(payload);
            toast.success('Dirección guardada');
        }

        if (onSuccess) onSuccess();
        else router.refresh();
        
    } catch (error: any) {
        console.error("Error API:", error);
        
        let serverMessage = error.response?.data?.message || 'Error al guardar';
        
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (typeof errors === 'object' && !Array.isArray(errors)) {
                 const fieldErrors = Object.entries(errors)
                    .map(([key, msg]) => `${key}: ${msg}`)
                    .join('; '); // Usamos ; para separar mejor
                 serverMessage = `Validación: ${fieldErrors}`;
            } 
            else if (Array.isArray(errors)) {
                 serverMessage = errors.join(', ');
            }
        }
        
        toast.error(serverMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-lg border border-gray-100 mt-4 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">
        {initialData ? 'Editar Dirección' : 'Nueva Dirección'}
      </h3>

      <div className="space-y-6">
        
        {/* ALIAS */}
        <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Nombre de la Dirección (Alias) *
            </label>
            <input 
                type="text" required 
                className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400"
                placeholder="Ej: Casa, Oficina"
                value={formData.alias}
                onChange={e => setFormData({...formData, alias: e.target.value})}
            />
        </div>

        {/* UBIGEO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Departamento</label>
                <div className="relative">
                    <select 
                        className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md text-sm outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none"
                        value={selectedDepId} onChange={handleDepChange} required
                    >
                        <option value="">Seleccionar</option>
                        {depsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Provincia</label>
                <div className="relative">
                    <select 
                        className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md text-sm outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none disabled:bg-gray-100"
                        value={selectedProvId} onChange={handleProvChange} disabled={!selectedDepId} required
                    >
                        <option value="">Seleccionar</option>
                        {provsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Distrito</label>
                <div className="relative">
                    <select 
                        className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md text-sm outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none disabled:bg-gray-100"
                        value={selectedDistId} onChange={handleDistChange} disabled={!selectedProvId} required
                    >
                        <option value="">Seleccionar</option>
                        {distsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* DIRECCIÓN */}
        <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Dirección Exacta</label>
            <input 
                type="text" required 
                className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Av. Larco 123, Dpto 401"
                value={formData.direccion}
                onChange={e => setFormData({...formData, direccion: e.target.value})}
            />
        </div>

        {/* REF & ZIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Referencia (Opcional)</label>
                <input 
                    type="text" 
                    className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Frente al parque..."
                    value={formData.referencia}
                    onChange={e => setFormData({...formData, referencia: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Código Postal</label>
                <input 
                    type="text" required 
                    className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="15036"
                    value={formData.codigoPostal}
                    onChange={e => setFormData({...formData, codigoPostal: e.target.value})}
                />
            </div>
        </div>

        {/* BOTONES */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            {onCancel && (
                <button type="button" onClick={onCancel} className="flex-1 border border-black text-black px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-gray-100">
                    Cancelar
                </button>
            )}
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50">
                {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
            </button>
        </div>
      </div>
    </form>
  );
}