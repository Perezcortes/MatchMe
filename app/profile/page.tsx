'use client';
import { useAuth } from '@/app/src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Cargando...</div>;
  if (!profile) return router.push('/login');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{profile.name}</h1>
      {/* Mostrar datos del perfil */}
      {/* Botón editar */}
    </div>
  );
}