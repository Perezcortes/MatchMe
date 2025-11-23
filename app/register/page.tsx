'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const cities = [
  'Tamazulapan del Progreso, México',
  'Acatlán de Osorio, México', 
  'Santiago Juxtlahuaca, México',
  'Santa María Asunción Tlaxiaco, México',
  'Asunción Nochixtlán, México',
  'Otro'
]

export default function Register() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Paso 1: Datos personales
    email: '',
    name: '',
    lastName: '',
    age: '',
    gender: '',
    orientation: '',
    city: '',
    
    // Paso 2: Verificación
    password: '',
    acceptTerms: false,
    acceptPrivacy: false,
    confirmAge: false
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validaciones básicas
    if (!formData.email || !formData.name || !formData.lastName || !formData.age || !formData.gender || !formData.orientation || !formData.city) {
      alert('Por favor completa todos los campos')
      return
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Por favor ingresa un email válido')
      return
    }
    
    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (!formData.password || formData.password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres')
      setLoading(false)
      return
    }
    
    if (!formData.acceptTerms || !formData.acceptPrivacy || !formData.confirmAge) {
      alert('Debes aceptar todos los términos y condiciones')
      setLoading(false)
      return
    }

    try {
      // 1. Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            last_name: formData.lastName,
            age: formData.age,
            gender: formData.gender,
            orientation: formData.orientation,
            city: formData.city
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Guardar datos personales en la tabla users
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            personal_data: {
              name: formData.name,
              lastName: formData.lastName,
              age: formData.age,
              gender: formData.gender,
              orientation: formData.orientation,
              city: formData.city
            },
            verification_status: 'pending',
            role: 'user' // Rol por defecto
          })

        if (profileError) throw profileError

        // 3. Redirigir a verificación
        router.push('/verification')
      }

    } catch (error: any) {
      console.error('Error en registro:', error)
      alert(error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-4 px-4 sm:py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <div className="bg-purple-600 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-lg sm:text-xl font-bold text-white">MM</span>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-700 mt-2 text-sm sm:text-base">Paso {step} de 2</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
        </div>

        {step === 1 ? (
          // Paso 1: Datos personales
          <form onSubmit={handleStep1Submit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="tu@email.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Edad *
              </label>
              <select
                required
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-500">Selecciona tu edad</option>
                {Array.from({length: 23}, (_, i) => i + 18).map(age => (
                  <option key={age} value={age} className="text-gray-900">{age} años</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Género *
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-500">Selecciona tu género</option>
                <option value="mujer" className="text-gray-900">Mujer</option>
                <option value="hombre" className="text-gray-900">Hombre</option>
                <option value="no_binario" className="text-gray-900">No binario</option>
                <option value="prefiero_no_decir" className="text-gray-900">Prefiero no decir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Orientación *
              </label>
              <select
                required
                value={formData.orientation}
                onChange={(e) => handleInputChange('orientation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-500">Selecciona tu orientación</option>
                <option value="heterosexual" className="text-gray-900">Heterosexual</option>
                <option value="bisexual" className="text-gray-900">Bisexual</option>
                <option value="pansexual" className="text-gray-900">Pansexual</option>
                <option value="homosexual" className="text-gray-900">Homosexual</option>
                <option value="prefiero_no_decir" className="text-gray-900">Prefiero no decir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ciudad/Municipio *
              </label>
              <select
                required
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-500">Selecciona tu ciudad</option>
                {cities.map(city => (
                  <option key={city} value={city} className="text-gray-900">{city}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Continuar
            </button>
          </form>
        ) : (
          // Paso 2: Contraseña y términos
          <form onSubmit={handleStep2Submit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm text-gray-900 leading-tight">
                  Acepto los <span className="font-medium">términos y condiciones</span>
                </span>
              </label>

              <label className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.acceptPrivacy}
                  onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm text-gray-900 leading-tight">
                  Acepto el <span className="font-medium">aviso de privacidad</span>
                </span>
              </label>

              <label className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.confirmAge}
                  onChange={(e) => handleInputChange('confirmAge', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm text-gray-900 leading-tight">
                  Confirmo que tengo <span className="font-medium">18 años o más</span>
                </span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-base focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Atrás
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {loading ? 'Creando cuenta...' : 'Continuar'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-700 mt-6 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-purple-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}