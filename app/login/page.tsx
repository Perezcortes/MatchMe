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

      // 2. Verificar perfil y rol en la tabla CORRECTA (users)
      // Usamos .maybeSingle() para evitar errores 406 si no existe
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role, goal, big_five_scores') // Verificamos si tiene 'goal' o scores
        .eq('id', authData.user.id)
        .maybeSingle()

      if (profileError) {
         console.warn('Advertencia al obtener perfil:', profileError.message);
      }

      // 3. Redirección según ROL
      if (userProfile?.role === 'admin') {
        router.push('/admin/reports')
        return
      }

      // 4. Redirección según TEST COMPLETADO
      // Si tiene un 'goal' o 'big_five_scores' guardado en 'users', el test está hecho
      const isTestCompleted = userProfile?.goal || userProfile?.big_five_scores;

      if (isTestCompleted) {
        router.push('/matches') // O /dashboard
      } else {
        router.push('/test/objective')
      }

    } catch (error: any) {
      console.error('Error en login:', error)
      alert(error.message || 'Error al iniciar sesión.')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-4 px-4 sm:py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6">
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
            <label className="block text-sm font-medium text-gray-900 mb-2">Correo electrónico *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-gray-900"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Contraseña *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-gray-900"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-700 text-sm">
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