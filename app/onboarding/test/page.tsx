'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BigFiveTest from '../../src/components/big-five-test'; // Asegúrate de tener este componente
import { createClient } from '@supabase/supabase-js';
import { saveProfileAndGetMatches } from '@/app/actions';

// Cliente Supabase (Cliente)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: BigFive, 2: Hobbies, 3: Valores, 4: EstiloVida
  const [loading, setLoading] = useState(false);

  // ESTADO GLOBAL DEL TEST
  const [testData, setTestData] = useState({
    bigFive: null as any,
    hobbies: [] as string[],
    values: { search: '', main: '', future: '' },
    lifestyle: { schedule: '', alcohol: '', social: '', rhythm: '' }
  });

  // --- LOGICA DE CADA PASO ---
  
  const handleBigFiveComplete = (scores: any) => {
    setTestData(prev => ({ ...prev, bigFive: scores }));
    setStep(2); // Pasar a Hobbies
  };

  const handleHobbiesToggle = (hobby: string) => {
    setTestData(prev => {
      const current = prev.hobbies;
      if (current.includes(hobby)) return { ...prev, hobbies: current.filter(h => h !== hobby) };
      if (current.length >= 3) return prev; // Máximo 3
      return { ...prev, hobbies: [...current, hobby] };
    });
  };

  const submitFinalProfile = async () => {
    setLoading(true);
    
    // Recuperar datos básicos guardados en pasos anteriores (simulado)
    const goal = localStorage.getItem('matchme_goal');
    const basicInfo = JSON.parse(localStorage.getItem('matchme_basic') || '{}');

    const fullProfile = {
      ...basicInfo,
      goal,
      ...testData
    };

    // Llamar al Server Action nuevo
    // Importar saveProfileAndGetMatches arriba: import { saveProfileAndGetMatches } from '@/app/actions';
    // Nota: Asegúrate de importar la función al inicio del archivo
    
    // IMPORTANTE: Como es un client component, necesitamos llamar a la action así:
    const result = await saveProfileAndGetMatches(fullProfile);

    if (result.success) {
      // Guardamos los resultados en localStorage para mostrarlos en el Dashboard
      // (En una app real, esto se cargaría desde la DB al entrar al dashboard)
      localStorage.setItem('matchme_results', JSON.stringify(result));
      router.push('/dashboard');
    } else {
      alert('Error al procesar: ' + result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-20">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Barra de Progreso */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${step * 25}%` }}></div>
        </div>
        <p className="text-center text-sm font-semibold text-blue-600">Paso {step} de 4</p>

        {/* --- PASO 1: PERSONALIDAD (BIG FIVE) --- */}
        {step === 1 && (
          <BigFiveTest onComplete={handleBigFiveComplete} />
        )}

        {/* --- PASO 2: INTERESES (HOBBIES) --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h2 className="text-2xl font-bold">Pilar 2: Intereses</h2>
            <p className="text-gray-500">Selecciona tus 3 favoritos.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {['Actividad física', 'Música', 'Arte', 'Viajes', 'Cine y series', 'Lectura', 'Videojuegos', 'Naturaleza', 'Gastronomía', 'Tecnología', 'Emprendimiento', 'Mascotas'].map(hobby => (
                <button
                  key={hobby}
                  onClick={() => handleHobbiesToggle(hobby)}
                  className={`p-4 rounded-xl border-2 text-sm font-bold transition-all
                    ${testData.hobbies.includes(hobby) ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  {hobby}
                </button>
              ))}
            </div>
            
            <button 
              disabled={testData.hobbies.length === 0}
              onClick={() => setStep(3)} 
              className="w-full btn-primary bg-black text-white p-4 rounded-xl font-bold disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* --- PASO 3: VALORES --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h2 className="text-2xl font-bold">Pilar 3: Valores y Metas</h2>
            
            <div className="space-y-4">
              <label className="block font-semibold">¿Qué valoras más en alguien?</label>
              <select className="w-full p-3 border rounded-lg" onChange={e => setTestData({...testData, values: {...testData.values, main: e.target.value}})}>
                <option value="">Selecciona...</option>
                <option>Honestidad</option><option>Lealtad</option><option>Amor propio</option><option>Responsabilidad</option><option>Ambición</option><option>Calma</option>
              </select>

              <label className="block font-semibold">En el futuro te ves...</label>
              <select className="w-full p-3 border rounded-lg" onChange={e => setTestData({...testData, values: {...testData.values, future: e.target.value}})}>
                <option value="">Selecciona...</option>
                <option>Siendo independiente</option><option>Formando familia</option><option>Priorizar carrera</option><option>Viajando</option>
              </select>
            </div>

            <button onClick={() => setStep(4)} className="w-full bg-black text-white p-4 rounded-xl font-bold mt-4">Siguiente</button>
          </div>
        )}

        {/* --- PASO 4: ESTILO DE VIDA --- */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h2 className="text-2xl font-bold">Pilar 4: Estilo de Vida</h2>
            
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">Energía social</p>
                <div className="flex gap-2">
                  {['Me gusta salir', 'Moderado', 'Casero'].map(opt => (
                    <button key={opt} onClick={() => setTestData({...testData, lifestyle: {...testData.lifestyle, social: opt}})}
                      className={`flex-1 p-2 rounded border ${testData.lifestyle.social === opt ? 'bg-blue-600 text-white' : ''}`}>{opt}</button>
                  ))}
                </div>
              </div>

              <div>
                 <p className="font-semibold mb-2">Consumo de alcohol</p>
                 {/* Similar lógica para alcohol y horarios... Simplificado por espacio */}
                 <select className="w-full p-3 border rounded-lg" onChange={e => setTestData({...testData, lifestyle: {...testData.lifestyle, alcohol: e.target.value}})}>
                    <option>Nunca</option><option>Social</option><option>Frecuente</option>
                 </select>
              </div>
            </div>

            <button 
              onClick={submitFinalProfile} 
              disabled={loading}
              className="w-full bg-green-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition"
            >
              {loading ? 'Analizando Compatibilidad...' : 'Finalizar y Ver Matches'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}