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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-white">MM</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-600 mt-2">Paso {step} de 2</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
        </div>

        {step === 1 ? (
          // Paso 1: Datos personales
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad *
              </label>
              <select
                required
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Selecciona tu edad</option>
                {Array.from({length: 23}, (_, i) => i + 18).map(age => (
                  <option key={age} value={age}>{age} años</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género *
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Selecciona tu género</option>
                <option value="mujer">Mujer</option>
                <option value="hombre">Hombre</option>
                <option value="no_binario">No binario</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orientación *
              </label>
              <select
                required
                value={formData.orientation}
                onChange={(e) => handleInputChange('orientation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Selecciona tu orientación</option>
                <option value="heterosexual">Heterosexual</option>
                <option value="bisexual">Bisexual</option>
                <option value="pansexual">Pansexual</option>
                <option value="homosexual">Homosexual</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad/Municipio *
              </label>
              <select
                required
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Selecciona tu ciudad</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Continuar
            </button>
          </form>
        ) : (
          // Paso 2: Contraseña y términos
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm text-gray-700">
                  Acepto términos y condiciones
                </span>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.acceptPrivacy}
                  onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm text-gray-700">
                  Acepto el aviso de privacidad
                </span>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.confirmAge}
                  onChange={(e) => handleInputChange('confirmAge', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm text-gray-700">
                  Confirmo que tengo 18 años o más
                </span>
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Atrás
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creando cuenta...' : 'Continuar a verificación'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-600 mt-8 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-purple-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}