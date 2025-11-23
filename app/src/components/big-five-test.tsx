'use client';
import { useState } from 'react';

// Preguntas oficiales del documento
const questions = [
  { id: 1, text: "Me veo como alguien que es conversador/a.", trait: "extraversion", reverse: false },
  { id: 2, text: "Me veo como alguien que es reservado/a.", trait: "extraversion", reverse: true },
  { id: 3, text: "Me veo como alguien considerado/a y amable.", trait: "agreeableness", reverse: false },
  { id: 4, text: "Me veo como alguien que tiende a encontrar faltas en otros.", trait: "agreeableness", reverse: true },
  { id: 5, text: "Me veo como alguien que hace las cosas a conciencia.", trait: "conscientiousness", reverse: false },
  { id: 6, text: "Me veo como alguien que es perezoso/a.", trait: "conscientiousness", reverse: true },
  { id: 7, text: "Me veo como alguien que se estresa con facilidad.", trait: "emotional_stability", reverse: true },
  { id: 8, text: "Me veo como alguien relajado/a, que enfrenta bien el estrés.", trait: "emotional_stability", reverse: false },
  { id: 9, text: "Me veo como alguien con imaginación activa.", trait: "openness", reverse: false },
  { id: 10, text: "Me veo como alguien que valora las rutinas por encima de lo nuevo.", trait: "openness", reverse: true }
];

export default function BigFiveTest({ onComplete }: { onComplete: (scores: any) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (id: number, value: number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const calculateResults = () => {
    const scores = { extraversion: 0, agreeableness: 0, conscientiousness: 0, emotional_stability: 0, openness: 0 };
    const counts = { extraversion: 0, agreeableness: 0, conscientiousness: 0, emotional_stability: 0, openness: 0 };

    questions.forEach(q => {
      let val = answers[q.id] || 3; // Default neutral
      if (q.reverse) val = 6 - val; // Invertir puntaje (1->5, 5->1)
      
      scores[q.trait as keyof typeof scores] += val;
      counts[q.trait as keyof typeof counts] += 1;
    });

    // Promediar
    Object.keys(scores).forEach(k => {
      scores[k as keyof typeof scores] /= counts[k as keyof typeof counts];
    });

    onComplete(scores);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Pilar 1: Personalidad (Mini Big Five)</h3>
      <p className="text-sm text-gray-500">Responde del 1 (Totalmente en desacuerdo) al 5 (Totalmente de acuerdo)</p>
      
      {questions.map(q => (
        <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm">
          <p className="mb-3 font-medium">{q.text}</p>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val}
                onClick={() => handleAnswer(q.id, val)}
                className={`w-10 h-10 rounded-full ${answers[q.id] === val ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <button onClick={calculateResults} className="w-full btn-primary mt-4 bg-black text-white p-3 rounded">
        Siguiente Pilar
      </button>
    </div>
  );
}