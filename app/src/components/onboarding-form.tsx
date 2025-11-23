'use client';

import { useState } from 'react';
import { generatePersonalityReport } from '@/app/actions';

export default function OnboardingForm() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setReport(null);

    const formData = new FormData(event.currentTarget);
    const result = await generatePersonalityReport(formData);
    
    if (result.success && result.report) {
      setReport(result.report);
    } else {
      alert('Error: ' + result.error);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      {!report ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">¿Qué buscas hoy?</label>
            <select name="goal" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black">
              <option value="amistad">🤝 Amistad</option>
              <option value="networking">💼 Networking Profesional</option>
              <option value="relacion">❤️ Relación</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tus Intereses</label>
            <input name="hobbies" type="text" placeholder="Ej: Futbol, Python, Leer..." required className="w-full p-3 border border-gray-300 rounded-lg text-black" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tus Valores</label>
            <input name="values" type="text" placeholder="Ej: Honestidad, Ambición..." required className="w-full p-3 border border-gray-300 rounded-lg text-black" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">¿Cómo eres?</label>
            <textarea name="personality" placeholder="Soy tranquilo, me gusta escuchar..." required className="w-full p-3 border border-gray-300 rounded-lg text-black" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? '🧠 Analizando con IA...' : '✨ Generar mi Perfil'}
          </button>
        </form>
      ) : (
        <div className="animate-fade-in">
          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mb-4">
            <h3 className="text-lg font-bold text-indigo-900 mb-2">🔮 Tu Reporte MatchMe</h3>
            <p className="text-gray-800 leading-relaxed">{report}</p>
          </div>
          <button 
            onClick={() => setReport(null)}
            className="w-full text-indigo-600 font-semibold hover:underline"
          >
            Volver a intentar
          </button>
        </div>
      )}
    </div>
  );
}