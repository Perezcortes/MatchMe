'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// Inicializar sin argumentos (ya los tiene el helper)
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
      // 1. Crear Usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
            data: {
                name: formData.name, 
            }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      // 2. Insertar Perfil en la tabla 'users'
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

      // --- CAMBIO CLAVE AQUÍ ---
      // 3. Forzar inicio de sesión inmediato para asegurar que la sesión exista
      // Esto evita el error "Sesión expirada" en la siguiente página
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (loginError) {
        console.warn("Auto-login falló, redirigiendo al login manual", loginError)
        router.push('/login')
        return
      }

      // 4. Redirigir a Verificación con sesión activa garantizada
      router.push('/verification')

    } catch (error: any) {
      console.error('Error registro:', error)
      alert(error.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 text-sm">Paso {step} de 2</p>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
          <div className="bg-purple-600 h-1.5 rounded-full transition-all" style={{ width: step === 1 ? '50%' : '100%' }}></div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
                <label className="text-sm font-semibold block mb-1">Correo</label>
                <input required type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="tu@email.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-semibold block mb-1">Nombre</label>
                    <input required type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                    <label className="text-sm font-semibold block mb-1">Apellido</label>
                    <input required type="text" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} className="w-full p-3 border rounded-xl" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-semibold block mb-1">Edad</label>
                    <input required type="number" min="18" max="99" value={formData.age} onChange={e => handleInputChange('age', e.target.value)} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                    <label className="text-sm font-semibold block mb-1">Género</label>
                    <select value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} className="w-full p-3 border rounded-xl bg-white">
                        <option value="mujer">Mujer</option>
                        <option value="hombre">Hombre</option>
                        <option value="no_binario">No binario</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="text-sm font-semibold block mb-1">Ciudad</label>
                <select value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className="w-full p-3 border rounded-xl bg-white">
                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition">Continuar</button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-semibold block mb-1">Contraseña</label>
                <input required type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Mínimo 8 caracteres" />
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
                <label className="flex gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.acceptTerms} onChange={e => handleInputChange('acceptTerms', e.target.checked)} className="mt-1" />
                    <span>Acepto los términos y condiciones</span>
                </label>
                <label className="flex gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.acceptPrivacy} onChange={e => handleInputChange('acceptPrivacy', e.target.checked)} className="mt-1" />
                    <span>Acepto el aviso de privacidad</span>
                </label>
                <label className="flex gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.confirmAge} onChange={e => handleInputChange('confirmAge', e.target.checked)} className="mt-1" />
                    <span>Confirmo que tengo +18 años</span>
                </label>
            </div>

            <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 border border-gray-300 rounded-xl font-bold">Atrás</button>
                <button type="submit" disabled={loading} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition flex justify-center">
                    {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : 'Crear Cuenta'}
                </button>
            </div>
          </form>
        )}
        
        <p className="text-center mt-6 text-sm text-gray-500">¿Ya tienes cuenta? <Link href="/login" className="text-purple-600 font-bold">Inicia sesión</Link></p>
      </div>
    </div>
  )
}