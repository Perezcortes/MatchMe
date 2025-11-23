'use client';

import { useEffect, useState } from 'react';
import { User, Star, MessageCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Cargar resultados guardados
    const stored = localStorage.getItem('matchme_results');
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center">Cargando tus conexiones...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <h1 className="text-xl font-black text-blue-900">MatchMe</h1>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
            Yo
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* 1. REPORTE DE AUTOCONOCIMIENTO (IA) */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg animate-in fade-in-50">
          <div className="flex items-center gap-2 mb-3">
            <Star className="text-yellow-300 fill-yellow-300" size={20} />
            <h2 className="font-bold text-lg">Tu Reporte Personal</h2>
          </div>
          <div className="prose prose-invert text-sm leading-relaxed opacity-90">
            {/* Renderizamos el markdown de la IA */}
            <p className="whitespace-pre-line">{data.report}</p>
          </div>
        </section>

        {/* 2. MATCHES POTENCIALES */}
        <section>
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <User className="text-blue-600" /> Matches Sugeridos
          </h3>
          
          <div className="space-y-4">
            {data.matches && data.matches.map((match: any, index: number) => (
              <div key={match.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex gap-4 items-start">
                
                {/* Avatar Simulado */}
                <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden relative">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.id}`} alt="avatar" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 flex items-center gap-1">
                        {match.name || 'Estudiante'} 
                        {/* Icono de verificado si aplica */}
                        <ShieldCheck size={14} className="text-green-500" />
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{match.hobbies}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      {Math.round(match.similarity * 100)}% Compatible
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700">
                      Conectar
                    </button>
                    <button className="p-2 border rounded-lg text-gray-500 hover:bg-gray-50">
                      <MessageCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {data.matches?.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                No hay matches exactos aún. ¡Invita a más amigos!
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}