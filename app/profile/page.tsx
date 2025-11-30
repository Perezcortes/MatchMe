'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// Importamos tu cliente personalizado
import { createClient } from '@/lib/supabase' 
import { updateUserPersonalData, PersonalDataUpdate } from '@/lib/user-service'
import Icon from '../components/Icon'

const cities = [
  'Huajuapan de León, México',
  'Tamazulapan del Progreso, México',
  'Acatlán de Osorio, México',
  'Santiago Juxtlahuaca, México',
  'Santa María Asunción Tlaxiaco, México',
  'Asunción Nochixtlán, México',
  'Otro'
]

export default function ProfilePage() {
  const router = useRouter()
  // CORRECCIÓN: Inicializamos sin argumentos porque tu helper ya los tiene
  const supabase = createClient() 
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState<PersonalDataUpdate>({
    name: '',
    lastName: '',
    age: '',
    city: '',
    gender: 'prefiero_no_decir',
    orientation: 'prefiero_no_decir'
  })

  useEffect(() => {
    const initProfile = async () => {
      try {
        setLoading(true)
        
        // 1. Verificar Sesión
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.log("No session found")
          router.push('/login')
          return
        }
        
        setUserId(user.id)

        // 2. Cargar Datos Directos de la Tabla Users
        const { data: profiles, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .limit(1)

        if (dbError) throw dbError

        const profile = profiles && profiles.length > 0 ? profiles[0] : null

        if (profile) {
            // Cargar datos al formulario
            setFormData({
                name: profile.name || '',
                lastName: profile.lastname || '',
                age: profile.age?.toString() || '',
                city: profile.city || '',
                gender: profile.gender || 'prefiero_no_decir',
                orientation: profile.orientation || 'prefiero_no_decir'
            })
        } else {
            console.warn("Perfil no encontrado en DB, permitiendo creación.")
            setFormData(prev => ({ ...prev, name: 'Usuario Nuevo' }))
        }

      } catch (error: any) {
        console.error('Error loading profile:', error)
        setMessage({ type: 'error', text: 'Error cargando datos: ' + error.message })
      } finally {
        setLoading(false)
      }
    }

    initProfile()
  }, [router]) // Quitamos 'supabase' de dependencias para evitar loops

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
            id: userId,
            name: formData.name,
            lastname: formData.lastName,
            age: parseInt(formData.age) || 18,
            city: formData.city,
            gender: formData.gender,
            orientation: formData.orientation,
            updated_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage({ type: 'success', text: '¡Información actualizada correctamente!' })
      
    } catch (error: any) {
      console.error('Error saving:', error)
      setMessage({ type: 'error', text: 'Hubo un error al guardar los cambios: ' + error.message })
    } finally {
      setSaving(false)
      setTimeout(() => {
         if (message.type === 'success') setMessage({ type: '', text: '' })
      }, 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Si hay error crítico de carga
  if (message.type === 'error' && !userId) {
    return (
        <div className="p-8 text-center text-red-600">
            <p>Error: {message.text}</p>
            <button onClick={() => window.location.reload()} className="underline mt-4">Reintentar</button>
        </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Encabezado */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 sm:p-10 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
                <div className="bg-white/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
                    <Icon name="usuario" size={64} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
                <p className="text-purple-100 text-lg">Gestiona tu información personal</p>
            </div>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                <Icon name="networking" size={300} className="absolute -top-20 -left-20 text-white transform rotate-12" />
                <Icon name="amistad" size={250} className="absolute -bottom-20 -right-20 text-white transform -rotate-12" />
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {message.text && (
              <div className={`mb-8 p-4 rounded-xl flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                <Icon name={message.type === 'success' ? 'check' : 'alert'} size={20} className={`mr-3 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    required
                    placeholder="Tu nombre"
                  />
                </div>
                {/* Apellido */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    required
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Edad */}
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">Edad</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    required
                    min="18"
                    max="120"
                    placeholder="Ej. 25"
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                  <div className="relative">
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="" disabled className="text-gray-500">Selecciona tu ciudad</option>
                      {cities.map(city => (
                        <option key={city} value={city} className="text-gray-900">{city}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <Icon name="flecha_derecha" size={16} className="transform rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-gray-100">
                {/* Género */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">Género</label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="hombre">Hombre</option>
                      <option value="mujer">Mujer</option>
                      <option value="no_binario">No binario</option>
                      <option value="otro">Otro</option>
                      <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                       <Icon name="flecha_derecha" size={16} className="transform rotate-90" />
                    </div>
                  </div>
                </div>
                {/* Orientación */}
                <div>
                  <label htmlFor="orientation" className="block text-sm font-semibold text-gray-700 mb-2">Orientación Sexual</label>
                  <div className="relative">
                    <select
                      id="orientation"
                      name="orientation"
                      value={formData.orientation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="heterosexual">Heterosexual</option>
                      <option value="homosexual">Homosexual</option>
                      <option value="bisexual">Bisexual</option>
                      <option value="pansexual">Pansexual</option>
                      <option value="otro">Otra</option>
                      <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                       <Icon name="flecha_derecha" size={16} className="transform rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de guardar */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full sm:w-auto sm:min-w-[200px] flex justify-center items-center py-4 px-8 border border-transparent rounded-xl shadow-lg text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all transform hover:-translate-y-1 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white border-2 border-white border-t-transparent rounded-full"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Enlaces adicionales */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="/test/report" className="flex items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all group">
                <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors mr-4">
                    <Icon name="documento" size={24} className="text-purple-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Reporte de Compatibilidad</h3>
                    <p className="text-sm text-gray-500">Ver tu análisis detallado</p>
                </div>
                <Icon name="flecha_derecha" size={20} className="ml-auto text-gray-400 group-hover:text-purple-500 transition-colors" />
            </a>
        </div>
      </div>
    </div>
  )
}