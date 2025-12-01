'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react' // Iconos extra

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // Estado para ver contraseña

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

      // 2. Verificar perfil
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role, goal, big_five_scores')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (profileError) {
         console.warn('Advertencia al obtener perfil:', profileError.message);
      }

      // 3. Redirección
      if (userProfile?.role === 'admin') {
        router.push('/admin/reports')
        return
      }

      const isTestCompleted = userProfile?.goal || userProfile?.big_five_scores;

      if (isTestCompleted) {
        router.push('/matches')
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
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-500 to-blue-500 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        
        {/* Header con Logo */}
        <div className="pt-8 pb-6 text-center px-6 bg-gradient-to-b from-purple-50 to-white">
          <Link href="/" className="inline-block transform hover:scale-105 transition duration-300">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg mx-auto mb-4 border-4 border-white">
               {/* Logo Real */}
               <img src="/logo.jpg" alt="MatchMe Logo" className="w-full h-full object-cover" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">¡Hola de nuevo!</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Ingresa para conectar con más.</p>
        </div>

        <div className="p-6 sm:p-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Correo electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 transition-all font-medium"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link 
                    href="/forgot-password" 
                    className="text-xs text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                >
                    ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 px-4 rounded-xl font-bold text-lg hover:bg-gray-800 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Entrando...</span>
                </div>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              ¿Aún no tienes cuenta?{' '}
              <Link href="/register" className="text-purple-600 font-bold hover:text-purple-700 transition-colors inline-flex items-center gap-1 group">
                Regístrate gratis 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}