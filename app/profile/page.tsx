'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { updateUserPersonalData, PersonalDataUpdate } from '@/lib/user-service'
import Icon from '../components/Icon'
import { User, ArrowLeft, Save, LogOut, CheckCircle, AlertTriangle } from 'lucide-react'

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
    const initProfile = async () => {
      try {
        setLoading(true)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/login')
          return
        }
        
        setUserId(user.id)

        const { data: profiles, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .limit(1)

        if (dbError) throw dbError

        const profile = profiles && profiles.length > 0 ? profiles[0] : null

        if (profile) {
            setFormData({
                name: profile.name || '',
                lastName: profile.lastname || '',
                age: profile.age?.toString() || '',
                city: profile.city || '',
                gender: profile.gender || 'prefiero_no_decir',
                orientation: profile.orientation || 'prefiero_no_decir'
            })
        } else {
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
  }, [router])

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

      setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' })
      
    } catch (error: any) {
      console.error('Error saving:', error)
      setMessage({ type: 'error', text: 'Error al guardar: ' + error.message })
    } finally {
      setSaving(false)
      setTimeout(() => {
         if (message.type === 'success') setMessage({ type: '', text: '' })
      }, 3000)
    }
  }

  const handleSignOut = async () => {
      await supabase.auth.signOut()
      router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        
        {/* Mobile Header Bar */}
        <div className="bg-white sticky top-0 z-20 border-b border-gray-200 px-4 py-3 flex justify-between items-center md:hidden shadow-sm">
            <button onClick={() => router.back()} className="text-gray-600">
                <ArrowLeft size={24} />
            </button>
            <h1 className="font-bold text-gray-900">Mi Perfil</h1>
            <button onClick={handleSignOut} className="text-red-500">
                <LogOut size={24} />
            </button>
        </div>

        <div className="max-w-3xl mx-auto md:pt-8 px-4 sm:px-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                
                {/* Cover & Avatar */}
                <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
                    <div className="absolute -bottom-12 left-6 md:left-10">
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                <User size={48} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Header */}
                <div className="pt-14 px-6 md:px-10 pb-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {formData.name} {formData.lastName}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium mt-1 flex items-center gap-1">
                        <Icon name="networking" size={14} /> {formData.city || 'Ubicación no definida'}
                    </p>
                </div>

                {/* Formulario */}
                <div className="p-6 md:p-10">
                    
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                            {message.type === 'success' ? <CheckCircle size={20} className="mt-0.5 shrink-0" /> : <AlertTriangle size={20} className="mt-0.5 shrink-0" />}
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white shadow-sm font-medium"
                                    placeholder="Tu nombre"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Apellido</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white shadow-sm font-medium"
                                    placeholder="Tu apellido"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Edad</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white shadow-sm font-medium"
                                    min="18"
                                    max="99"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ciudad</label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white shadow-sm font-medium"
                                    required
                                >
                                    <option value="" disabled>Selecciona...</option>
                                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6 border-b border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Género</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white shadow-sm font-medium"
                                >
                                    <option value="mujer">Mujer</option>
                                    <option value="hombre">Hombre</option>
                                    <option value="no_binario">No binario</option>
                                    <option value="otro">Otro</option>
                                    <option value="prefiero_no_decir">Prefiero no decir</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Orientación</label>
                                <select
                                    name="orientation"
                                    value={formData.orientation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white shadow-sm font-medium"
                                >
                                    <option value="heterosexual">Heterosexual</option>
                                    <option value="homosexual">Homosexual</option>
                                    <option value="bisexual">Bisexual</option>
                                    <option value="pansexual">Pansexual</option>
                                    <option value="prefiero_no_decir">Prefiero no decir</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Guardar Cambios
                                </>
                            )}
                        </button>

                    </form>
                </div>
            </div>

            {/* Links adicionales */}
            <div className="mt-6 grid grid-cols-1 gap-4">
                <button 
                    onClick={() => router.push('/test/report')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition group"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                            <Icon name="documento" size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900 text-sm">Mi Reporte de IA</p>
                            <p className="text-xs text-gray-500">Ver análisis de personalidad</p>
                        </div>
                    </div>
                    <Icon name="flecha_derecha" size={18} className="text-gray-300 group-hover:text-purple-500 transition" />
                </button>
            </div>

        </div>
    </div>
  )
}