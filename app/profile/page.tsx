// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserProfile, updateUserPersonalData, PersonalDataUpdate } from '@/lib/user-service'
import Icon from '../components/Icon'

// --- CAMBIO 1: Definir la misma lista de ciudades que en el registro ---
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
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const profile = await getCurrentUserProfile()

      if (!profile || !profile.user_id) {
        router.push('/login')
        return
      }

      setUserId(profile.user_id)

      const pd = profile.user_data?.personal_data || {}
      
      // Aseguramos que la ciudad cargada esté en la lista, si no, 'Otro' o vacío
      let loadedCity = pd.city || '';
      if (loadedCity && !cities.includes(loadedCity)) {
          // Si la ciudad guardada no está en la lista actual, podrías:
          // 1. Añadirla dinámicamente a la lista
          // 2. Dejarla seleccionada (el select lo permite aunque no esté en las opciones visibles)
          // 3. O forzarla a 'Otro' si prefieres normalizar.
          // Por ahora, dejaremos que el valor se cargue tal cual. El select lo mostrará.
      }

      setFormData({
        name: pd.name || '',
        lastName: pd.lastName || '',
        age: pd.age?.toString() || '',
        city: loadedCity, // Usamos el valor cargado
        gender: pd.gender || 'prefiero_no_decir',
        orientation: pd.orientation || 'prefiero_no_decir'
      })

    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage({ type: 'error', text: 'No se pudo cargar la información del perfil.' })
    } finally {
      setLoading(false)
    }
  }

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
      const result = await updateUserPersonalData(userId, formData)
      if (result.success) {
        setMessage({ type: 'success', text: '¡Información actualizada correctamente!' })
      } else {
        throw new Error('Falló la actualización')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Hubo un error al guardar los cambios.' })
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

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Encabezado (sin cambios) */}
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

                {/* --- CAMBIO 2: Reemplazar input de texto por select para Ciudad --- */}
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
                    {/* Icono de flecha para el select */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
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
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
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
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de guardar (sin cambios) */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full sm:w-auto sm:min-w-[200px] flex justify-center items-center py-4 px-8 border border-transparent rounded-xl shadow-lg text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all transform hover:-translate-y-1 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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

        {/* Enlaces adicionales (sin cambios) */}
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