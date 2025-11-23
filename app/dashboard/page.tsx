// app/dashboard/page.tsx (VERSIÓN MEJORADA)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../src/context/AuthContext';
import { Heart, X, MessageCircle, User, LogOut, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Match {
  id: string;
  matched_user_id: string;
  compatibility_score: number;
  breakdown: {
    personality: number;
    hobbies: number;
    values: number;
    lifestyle: number;
  };
  status: string;
  user_profile?: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState('');

  // Proteger ruta
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Cargar matches
  useEffect(() => {
    if (!user) return;

    const fetchMatches = async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*, user_profile:users!matched_user_id(*)')
          .eq('user_id', user.id)
          .neq('status', 'rejected')
          .order('compatibility_score', { ascending: false });

        if (error) throw error;
        setMatches(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [user]);

  const handleLike = async () => {
    const currentMatch = matches[currentIndex];
    if (!currentMatch) return;

    try {
      await supabase
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', currentMatch.id);

      moveToNext();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePass = async () => {
    const currentMatch = matches[currentIndex];
    if (!currentMatch) return;

    try {
      await supabase
        .from('matches')
        .update({ status: 'rejected' })
        .eq('id', currentMatch.id);

      moveToNext();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const moveToNext = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setMatches([]);
      setCurrentIndex(0);
    }
  };

  const currentMatch = matches[currentIndex];

  if (authLoading || loadingMatches) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando matches...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MatchMe</h1>
            <p className="text-sm text-gray-600">¡Conecta con tu tribu!</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <User size={20} />
                <span className="hidden sm:inline">Mi Perfil</span>
              </button>
            </Link>
            
            <button 
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {matches.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-4 text-6xl">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentIndex > 0 ? '¡Lo hiciste!' : 'Cargando matches...'}
            </h2>
            <p className="text-gray-600 mb-6">
              {currentIndex > 0 
                ? 'Has revisado todos los matches disponibles. ¡Vuelve pronto para más!'
                : 'Estamos analizando la compatibilidad. Por favor espera.'}
            </p>
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition">
                Volver al Inicio
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Card Principal */}
            <div className="lg:col-span-2">
              {currentMatch && currentMatch.user_profile && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  
                  {/* Imagen de Perfil */}
                  <div className="relative h-96 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                    {currentMatch.user_profile.profile_photo_url ? (
                      <img 
                        src={currentMatch.user_profile.profile_photo_url} 
                        alt={currentMatch.user_profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={100} className="text-white" />
                    )}
                  </div>

                  {/* Info del Usuario */}
                  <div className="p-8 space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {currentMatch.user_profile.name}, {currentMatch.user_profile.age}
                      </h2>
                      <p className="text-gray-600">{currentMatch.user_profile.city}</p>
                    </div>

                    {/* Compatibilidad Desglosada */}
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <p className="font-semibold text-gray-900">Compatibilidad</p>
                      <div className="space-y-2">
                        {Object.entries(currentMatch.breakdown).map(([key, value]: any) => (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{key}</span>
                              <span className="font-bold">{(value * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${value * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-blue-200">
                        <p className="text-lg font-bold text-blue-600">
                          Score Total: {(currentMatch.compatibility_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Intereses */}
                    {currentMatch.user_profile.hobbies_list && (
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Intereses</p>
                        <div className="flex flex-wrap gap-2">
                          {currentMatch.user_profile.hobbies_list.map((hobby: string) => (
                            <span key={hobby} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                              {hobby}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Valores */}
                    {currentMatch.user_profile.values_main && (
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Valores</p>
                        <p className="text-gray-700">{currentMatch.user_profile.values_main}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Acciones Laterales */}
            <div className="lg:col-span-3 lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
                
                {/* Puntuación Grande */}
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {currentMatch ? (currentMatch.compatibility_score * 100).toFixed(0) : 0}%
                  </div>
                  <p className="text-gray-600 font-semibold">Compatibilidad</p>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-3">
                  <button
                    onClick={handleLike}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-2 text-lg"
                  >
                    <Heart size={24} fill="white" />
                    Me Interesa
                  </button>

                  <button
                    onClick={handlePass}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-4 rounded-lg transition flex items-center justify-center gap-2 text-lg"
                  >
                    <X size={24} />
                    Pasar
                  </button>
                </div>

                {/* Chat Button */}
                {currentMatch?.status === 'accepted' && (
                  <Link href={`/chat/${currentMatch.id}`}>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
                      <MessageCircle size={20} />
                      Iniciar Chat
                    </button>
                  </Link>
                )}

                {/* Contador */}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    {currentIndex + 1} de {matches.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}