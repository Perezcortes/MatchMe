'use client';
import { useAuth } from '@/app/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Cargando...</div>;
  if (!user) return router.push('/login');

  return <>{children}</>;
}