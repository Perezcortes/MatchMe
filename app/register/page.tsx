// app/register/page.tsx 
'use client';

import { useState } from 'react';
import { Camera, Upload, CheckCircle, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (pwd: string) => pwd.length >= 8;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    lastname: '',
    age: '',
    gender: 'Mujer',
    orientation: 'Heterosexual',
    city: 'Tamazulapan del Progreso, México',
    ineFront: null as File | null,
    ineBack: null as File | null,
    selfie: null as File | null,
    terms: false,
    privacy: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? files?.[0] || null : value)
    }));
    setError('');
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const maxWidth = 800;
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleNext = async () => {
    setError('');

    // Validaciones Paso 1
    if (!formData.email || !validateEmail(formData.email)) {
      setError('Email inválido');
      return;
    }
    if (!formData.password || !validatePassword(formData.password)) {
      setError('La contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!formData.name) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 40) {
      setError('Edad inválida (18-40)');
      return;
    }

    // Guardar en localStorage temporalmente
    localStorage.setItem('matchme_signup', JSON.stringify({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      lastname: formData.lastname,
      age: formData.age,
      gender: formData.gender,
      orientation: formData.orientation,
      city: formData.city
    }));

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones Paso 2
      if (!formData.ineFront || !formData.ineBack || !formData.selfie) {
        throw new Error('Todos los documentos son requeridos');
      }
      if (!formData.terms || !formData.privacy) {
        throw new Error('Debes aceptar términos y privacidad');
      }

      // 1. Comprimir imágenes
      const [ineFrontCompressed, ineBackCompressed, selfieCompressed] = await Promise.all([
        compressImage(formData.ineFront),
        compressImage(formData.ineBack),
        compressImage(formData.selfie)
      ]);

      // 2. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            lastname: formData.lastname
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      const userId = authData.user.id;
      const timestamp = Date.now();

      // 3. Subir archivos al storage
      const uploadPromises = [
        supabase.storage
          .from('documents')
          .upload(`${userId}/ine-front-${timestamp}.jpg`, ineFrontCompressed),
        
        supabase.storage
          .from('documents')  
          .upload(`${userId}/ine-back-${timestamp}.jpg`, ineBackCompressed),
        
        supabase.storage
          .from('documents')
          .upload(`${userId}/selfie-${timestamp}.jpg`, selfieCompressed)
      ];

      const uploadResults = await Promise.all(uploadPromises);
      
      // Verificar si hubo errores en la subida
      const uploadErrors = uploadResults.filter(result => result.error);
      if (uploadErrors.length > 0) {
        throw new Error(`Error subiendo archivos: ${uploadErrors[0].error?.message}`);
      }

      // 4. Obtener datos del localStorage
      const savedData = JSON.parse(localStorage.getItem('matchme_signup') || '{}');

      // 5. Guardar perfil en tabla users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: formData.email,
          name: formData.name,
          lastname: formData.lastname,
          age: parseInt(formData.age),
          gender: formData.gender,
          orientation: formData.orientation,
          city: formData.city,
          terms_accepted: formData.terms,
          privacy_accepted: formData.privacy,
          identity_verified: false,
          ine_front_path: `${userId}/ine-front-${timestamp}.jpg`,
          ine_back_path: `${userId}/ine-back-${timestamp}.jpg`, 
          selfie_path: `${userId}/selfie-${timestamp}.jpg`,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error detallado:', profileError);
        throw new Error(`Error guardando perfil: ${profileError.message}`);
      }

      // 6. Limpiar y redirigir
      localStorage.removeItem('matchme_signup');
      
      // Redirigir al onboarding
      router.push('/onboarding/goal');
      
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-900 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Registro Seguro</h2>
          <div className="flex justify-center mt-4 gap-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-yellow-400' : 'bg-white/20'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-yellow-400' : 'bg-white/20'}`}></div>
          </div>
          <p className="text-sm text-blue-100 mt-2">Paso {step} de 2</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-medium">Error de registro</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <p className="text-xs text-red-500 mt-2">
                  Si el problema persiste, verifica que las políticas RLS estén configuradas en Supabase.
                </p>
              </div>
            </div>
          )}

          {/* PASO 1: DATOS PERSONALES */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
              <h3 className="text-lg font-semibold text-gray-700">Datos Personales</h3>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  required name="email" type="email" onChange={handleChange} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="tu@email.com" 
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña (mín 8 caracteres)</label>
                <div className="relative">
                  <input 
                    required name="password" type={showPassword ? "text" : "password"} onChange={handleChange} 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none pr-10" 
                    placeholder="••••••••" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input 
                  required name="passwordConfirm" type="password" onChange={handleChange} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="••••••••" 
                />
              </div>

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input required name="name" type="text" onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input name="lastname" type="text" onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Apellidos" />
                </div>
              </div>

              {/* Edad */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Edad (18-40)</label>
                <input required name="age" type="number" min="18" max="40" onChange={handleChange} className="w-full p-3 border rounded-lg" />
              </div>

              {/* Ciudad */}
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

          {/* PASO 2: IDENTIDAD */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Tu identidad será verificada para garantizar seguridad. Tus datos se cifran automáticamente.
                </p>
              </div>

              {/* INE */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">INE (Frente y Reverso)</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                    <input type="file" name="ineFront" onChange={handleChange} accept="image/*" className="hidden" required />
                    {formData.ineFront ? <CheckCircle className="text-green-500" size={24} /> : <Upload />}
                    <span className="text-xs mt-2">{formData.ineFront ? 'Cargado' : 'Frente'}</span>
                  </label>
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                    <input type="file" name="ineBack" onChange={handleChange} accept="image/*" className="hidden" required />
                    {formData.ineBack ? <CheckCircle className="text-green-500" size={24} /> : <Upload />}
                    <span className="text-xs mt-2">{formData.ineBack ? 'Cargado' : 'Reverso'}</span>
                  </label>
                </div>
              </div>

              {/* Selfie */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Selfie de Verificación</label>
                <label className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:bg-blue-50 cursor-pointer">
                  <input type="file" name="selfie" onChange={handleChange} accept="image/*" className="hidden" required />
                  {formData.selfie ? <CheckCircle className="text-green-500 size-10" /> : <Camera size={40} />}
                  <span className="text-sm mt-2">{formData.selfie ? 'Selfie lista' : 'Tomar o subir selfie'}</span>
                </label>
              </div>

              {/* Términos */}
              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input required type="checkbox" name="terms" onChange={handleChange} className="mt-1 w-4 h-4 text-blue-600 rounded" />
                  <span className="text-xs text-gray-600">Acepto los términos y condiciones. Confirmo que tengo 18 años o más.</span>
                </label>
                <label className="flex items-start gap-3">
                  <input required type="checkbox" name="privacy" onChange={handleChange} className="mt-1 w-4 h-4 text-blue-600 rounded" />
                  <span className="text-xs text-gray-600">Acepto el aviso de privacidad y el procesamiento de mis datos.</span>
                </label>
              </div>

              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-green-600 text-white font-bold p-4 rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Registrando...
                  </>
                ) : (
                  'Finalizar Registro'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}