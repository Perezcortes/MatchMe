'use client';

import { useState } from 'react';
import { Camera, Upload, CheckCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Datos, 2: Identidad
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Mujer',
    orientation: 'Heterosexual',
    city: 'Tamazulapan del Progreso, México',
    ineFront: null as File | null,
    ineBack: null as File | null,
    selfie: null as File | null,
    terms: false
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value)
    }));
  };

  const handleNext = () => setStep(2);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    // AQUÍ CONECTAREMOS CON SUPABASE EN EL SIGUIENTE PASO
    // Simulamos carga por 2 segundos
    setTimeout(() => {
      setLoading(false);
      // Redirigir a la siguiente pantalla del documento: "¿Qué buscas?"
      router.push('/onboarding/goal');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header de Progreso */}
        <div className="bg-blue-900 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Registro Seguro</h2>
          <div className="flex justify-center mt-4 gap-2">
            <div className={`h-2 w-1/2 rounded-full ${step === 1 ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
            <div className={`h-2 w-1/2 rounded-full ${step === 2 ? 'bg-yellow-400' : 'bg-white/20'}`}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* PASO 1: DATOS PERSONALES */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
              <h3 className="text-lg font-semibold text-gray-700">Datos Personales</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input required name="name" type="text" onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input required name="lastname" type="text" className="w-full p-3 border rounded-lg" placeholder="Apellidos" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Edad (18-40)</label>
                <input required name="age" type="number" min="18" max="40" onChange={handleChange} className="w-full p-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                <select name="city" onChange={handleChange} className="w-full p-3 border rounded-lg bg-white">
                  <option>Tamazulapan del Progreso, México</option>
                  <option>Acatlán de Osorio, México</option>
                  <option>Santiago Juxtlahuaca, México</option>
                  <option>Santa María Asunción Tlaxiaco, México</option>
                  <option>Asunción Nochixtlán, México</option>
                </select>
              </div>

              <button type="button" onClick={handleNext} className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 transition">
                Continuar
              </button>
            </div>
          )}

          {/* PASO 2: IDENTIDAD (INE) */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800">
                  Tu identidad será verificada para garantizar seguridad y exclusividad. Tus datos se cifran.
                </p>
              </div>

              {/* Subida de INE */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">INE (Frente y Reverso)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer relative">
                    <input type="file" name="ineFront" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" required />
                    {formData.ineFront ? <CheckCircle className="text-green-500" /> : <Upload />}
                    <span className="text-xs mt-2">{formData.ineFront ? 'Cargado' : 'Frente'}</span>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer relative">
                    <input type="file" name="ineBack" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" required />
                    {formData.ineBack ? <CheckCircle className="text-green-500" /> : <Upload />}
                    <span className="text-xs mt-2">{formData.ineBack ? 'Cargado' : 'Reverso'}</span>
                  </div>
                </div>
              </div>

              {/* Selfie */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Selfie de verificación</label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 cursor-pointer relative">
                  <input type="file" name="selfie" accept="image/*" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" required />
                  {formData.selfie ? <CheckCircle className="text-green-500 size-10" /> : <Camera size={40} />}
                  <span className="text-sm mt-2">{formData.selfie ? 'Selfie lista' : 'Tomar o subir selfie'}</span>
                </div>
              </div>

              {/* Términos */}
              <div className="flex items-start gap-2">
                <input required type="checkbox" name="terms" onChange={handleChange} className="mt-1 w-4 h-4 text-blue-600 rounded" />
                <label className="text-xs text-gray-600">
                  Acepto los términos, condiciones y aviso de privacidad. Confirmo que tengo 18 años o más.
                </label>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-green-600 text-white font-bold p-4 rounded-xl hover:bg-green-700 transition flex justify-center items-center gap-2">
                {loading ? 'Verificando...' : 'Finalizar Registro'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}