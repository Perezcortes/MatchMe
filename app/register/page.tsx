'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, ChevronLeft, Check } from 'lucide-react'

// Inicializar sin argumentos
const supabase = createClient()

const cities = [
  'Huajuapan de León, México',
  'Tamazulapan del Progreso, México',
  'Acatlán de Osorio, México', 
  'Santiago Juxtlahuaca, México',
  'Santa María Asunción Tlaxiaco, México',
  'Asunción Nochixtlán, México',
  'Otro'
]

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // Estado para password

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    lastName: '',
    age: '',
    gender: 'mujer',
    orientation: 'heterosexual',
    city: cities[0],
    password: '',
    acceptTerms: false,
    acceptPrivacy: false,
    confirmAge: false
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.name || !formData.lastName || !formData.age) {
      alert('Por favor completa todos los campos')
      return
    }
    setStep(2)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres')
      return
    }
    
    if (!formData.acceptTerms || !formData.acceptPrivacy || !formData.confirmAge) {
      alert('Debes aceptar los términos y condiciones')
      return
    }

    setLoading(true)

    try {
      // 1. Crear Usuario
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
            data: { name: formData.name }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      // 2. Insertar Perfil
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          lastname: formData.lastName,
          age: parseInt(formData.age),
          gender: formData.gender,
          orientation: formData.orientation,
          city: formData.city,
          terms_accepted: true,
          privacy_accepted: true,
          verification_status: 'pending',
          created_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      // 3. Auto-Login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (loginError) {
        router.push('/login')
        return
      }

      router.push('/verification')

    } catch (error: any) {
      console.error('Error registro:', error)
      alert(error.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-500 to-blue-500 py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-center relative overflow-hidden">
            <div className="relative z-10">
                <Link href="/" className="inline-block mb-4 transform hover:scale-110 transition duration-300">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg mx-auto">
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                </Link>
                <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
                <p className="text-gray-400 text-sm mt-1">Únete a la comunidad estudiantil</p>
            </div>
            
            {/* Decoración fondo header */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 transition-all duration-500 ease-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
        </div>

        <div className="p-6 sm:p-8">
            {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">Correo Institucional</label>
                    <input required type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} 
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900" 
                        placeholder="tu@email.com" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">Nombre</label>
                        <input required type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} 
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">Apellido</label>
                        <input required type="text" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} 
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">Edad</label>
                        <input required type="number" min="18" max="99" value={formData.age} onChange={e => handleInputChange('age', e.target.value)} 
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">Género</label>
                        <select value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} 
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900 bg-white">
                            <option value="mujer">Mujer</option>
                            <option value="hombre">Hombre</option>
                            <option value="no_binario">No binario</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">Ciudad</label>
                    <select value={formData.city} onChange={e => handleInputChange('city', e.target.value)} 
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900 bg-white">
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>

                <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg mt-4 flex items-center justify-center gap-2 group">
                    Continuar <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </form>
            ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">Crea una Contraseña</label>
                    <div className="relative">
                        <input 
                            required 
                            type={showPassword ? "text" : "password"} 
                            value={formData.password} 
                            onChange={e => handleInputChange('password', e.target.value)} 
                            className="w-full p-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900" 
                            placeholder="Mínimo 8 caracteres" 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="flex gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.acceptTerms ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300 group-hover:border-purple-400'}`}>
                             {formData.acceptTerms && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" checked={formData.acceptTerms} onChange={e => handleInputChange('acceptTerms', e.target.checked)} className="hidden" />
                        <span className="text-sm text-gray-600">Acepto los <span className="text-purple-600 font-bold">términos y condiciones</span></span>
                    </label>

                    <label className="flex gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.acceptPrivacy ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300 group-hover:border-purple-400'}`}>
                             {formData.acceptPrivacy && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" checked={formData.acceptPrivacy} onChange={e => handleInputChange('acceptPrivacy', e.target.checked)} className="hidden" />
                        <span className="text-sm text-gray-600">Acepto el <span className="text-purple-600 font-bold">aviso de privacidad</span></span>
                    </label>

                    <label className="flex gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.confirmAge ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300 group-hover:border-purple-400'}`}>
                             {formData.confirmAge && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" checked={formData.confirmAge} onChange={e => handleInputChange('confirmAge', e.target.checked)} className="hidden" />
                        <span className="text-sm text-gray-600">Confirmo que tengo <span className="text-gray-900 font-bold">+18 años</span></span>
                    </label>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition flex items-center gap-2">
                        <ChevronLeft size={20} /> Atrás
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 active:scale-95 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : 'Crear Cuenta'}
                    </button>
                </div>
            </form>
            )}
            
            <p className="text-center mt-8 text-sm text-gray-500 font-medium">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-purple-600 font-bold hover:text-purple-800 hover:underline transition-colors">
                    Inicia sesión aquí
                </Link>
            </p>
        </div>
      </div>
    </div>
  )
}