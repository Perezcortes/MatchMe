'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Briefcase, Heart } from 'lucide-react'; // Iconos para cada opción

export default function GoalPage() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedGoal) {
      // Guardaríamos esto en un contexto o localStorage temporalmente
      localStorage.setItem('matchme_goal', selectedGoal);
      router.push('/onboarding/test');
    }
  };

  const goals = [
    { id: 'amistad', label: 'Amistad', icon: Users, desc: 'Conectar con nuevos amigos afines a ti.' },
    { id: 'networking', label: 'Networking', icon: Briefcase, desc: 'Contactos académicos y profesionales.' },
    { id: 'relacion', label: 'Relación', icon: Heart, desc: 'Algo serio y significativo.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">¿Qué buscas hoy?</h1>
          <p className="text-gray-500 mt-2">El algoritmo priorizará tus matches según tu elección.</p>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoal === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`w-full p-6 rounded-xl flex items-center gap-4 transition-all border-2 text-left
                  ${isSelected 
                    ? 'border-blue-600 bg-blue-50 shadow-md' 
                    : 'border-white bg-white hover:border-blue-200'
                  }`}
              >
                <div className={`p-3 rounded-full ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{goal.label}</h3>
                  <p className="text-sm text-gray-500">{goal.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedGoal}
          className="w-full py-4 bg-black text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}