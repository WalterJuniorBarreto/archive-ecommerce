'use client';

import { useState } from 'react';
import { userService } from '@/services/user.service';
import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast'; 

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  show: boolean;
  setShow: (v: boolean) => void;
  disabled?: boolean;
}

const PasswordInput = ({ label, name, value, placeholder, show, setShow, disabled }: PasswordInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={8}
        placeholder={placeholder}
        className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition pr-10 disabled:bg-gray-100 disabled:text-gray-400"
        value={value}
        onChange={(e) => {
  
        }}
       
        readOnly={disabled} 
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none"
        tabIndex={-1}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} // Accesibilidad
        disabled={disabled}
      >
        {show ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        )}
      </button>
    </div>
  </div>
);

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (formData.newPassword.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres.');
        return;
    }

    setLoading(true);

    try {
      await userService.changePassword({
        
        oldPassword: formData.oldPassword, 
        
        newPassword: formData.newPassword
      });

      toast.success('¡Contraseña actualizada correctamente!');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      let errorMessage = 'Error al cambiar la contraseña';
      
      if (error instanceof AxiosError) {
         errorMessage = error.response?.data?.message || error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const commonProps = {
    onChange: handleChange, 
  };

  return (
    <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
            Seguridad y Contraseña
        </h2>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            
            <div>
                
            </div>

            <div className="space-y-6">
                <PasswordInputWrapper 
                    label="Contraseña Actual"
                    name="oldPassword"
                    value={formData.oldPassword}
                    placeholder="********"
                    show={showOld}
                    setShow={setShowOld}
                    onChange={handleChange}
                    disabled={loading}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PasswordInputWrapper 
                        label="Nueva Contraseña"
                        name="newPassword"
                        value={formData.newPassword}
                        placeholder="Mínimo 8 caracteres"
                        show={showNew}
                        setShow={setShowNew}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <PasswordInputWrapper 
                        label="Confirmar Nueva"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        placeholder="Repite la contraseña"
                        show={showConfirm}
                        setShow={setShowConfirm}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>}
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
            </div>
        </form>
    </div>
  );
}


interface WrapperProps extends PasswordInputProps {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInputWrapper = (props: WrapperProps) => {
    const { label, show, setShow, ...inputProps } = props;
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    {...inputProps}
                    type={show ? "text" : "password"}
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition pr-10 disabled:bg-gray-50"
                    required
                    minLength={8}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    tabIndex={-1}
                    disabled={props.disabled}
                >
                    {show ? (
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    )}
                </button>
            </div>
        </div>
    )
}