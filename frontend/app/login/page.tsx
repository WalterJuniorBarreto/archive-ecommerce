import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* Aquí solo importamos el componente. Clean Code. */}
      <LoginForm />
    </div>
  );
}