// app/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Iniciar sesión
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo obtener el usuario')

      // 2. NUEVO: Obtener el perfil completo para verificar el ROL
      const { data: userProfile, error: profileError } = await supabase
        .from('users') // Consultamos la tabla principal de usuarios
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
         console.error('Error al obtener perfil:', profileError);
         // Si falla, asumimos rol de usuario normal por seguridad
      }

      // 3. NUEVO: Lógica de redirección basada en el ROL
      if (userProfile?.role === 'admin') {
        // Si es admin, va directo a su panel
        router.push('/admin/reports')
        return // Terminamos aquí
      }

      // 4. Si NO es admin, seguimos el flujo normal de usuarios
      // Verificar si el usuario completó el test
      const { data: compatibilityProfile } = await supabase
        .from('user_compatibility_profiles')
        .select('id') // Solo necesitamos saber si existe
        .eq('user_id', authData.user.id)
        .maybeSingle() // Usamos maybeSingle para que no lance error si no existe

      if (compatibilityProfile) {
        router.push('/matches')
      } else {
        router.push('/test/objective')
      }

    } catch (error: any) {
      console.error('Error en login:', error)
      alert(error.message || 'Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // ... (El resto del JSX del formulario sigue exactamente igual)
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Iniciar sesión</h1>
          <p className="text-gray-700 mt-2 text-sm sm:text-base">Bienvenido de vuelta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/forgot-password" 
            className="text-purple-600 text-sm hover:underline font-medium"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-700 text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-purple-600 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}