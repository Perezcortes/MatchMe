'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { UserProfile, MatchResult, findBestMatchesReal } from '@/lib/matching-algorithm'
import Icon from '../components/Icon'
import Link from 'next/link'

// Cliente Supabase Directo
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Constantes de UI
const objectiveMap = {
  amistad: { name: 'Amistad', color: 'text-blue-600 bg-blue-100' },
  networking: { name: 'Networking', color: 'text-green-600 bg-green-100' },
  relacion: { name: 'Relación', color: 'text-pink-600 bg-pink-100' }
}

const getCompatibilityColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 bg-green-100'
  if (score >= 60) return 'text-yellow-600 bg-yellow-100'
  if (score >= 40) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
}

const getInitials = (name: string) => {
  if (!name) return '??'
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realDataCount, setRealDataCount] = useState(0)

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true)
        
        // 1. Verificar Sesión
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/login')
          return
        }

        // 2. Cargar Perfil Directamente
        const { data: userProfile, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .limit(1)
          .maybeSingle()

        if (dbError) throw dbError

        // Si no hay perfil o está vacío, mostrar error amigable
        if (!userProfile || (!userProfile.big_five_scores && !userProfile.goal)) {
          setError("Perfil incompleto. Necesitas terminar el test para ver matches.")
          setLoading(false)
          return
        }

        // 3. Adaptar Perfil para el Algoritmo
        const currentUserProfile: UserProfile = {
            id: user.id,
            user_id: user.id,
            objective: userProfile.goal || 'amistad',
            big_five_scores: userProfile.big_five_scores || {},
            interests: userProfile.hobbies_list || [],
            values_goals: { 
                core_values: userProfile.value_main, 
                future_vision: userProfile.value_future, 
                life_goal: userProfile.goal 
            },
            lifestyle: { 
                social: userProfile.lifestyle_social, 
                alcohol: userProfile.lifestyle_alcohol, 
                rhythm: userProfile.lifestyle_rhythm 
            },
            compatibility_vector: null,
            user_data: { 
                personal_data: { 
                    name: userProfile.name || "Yo", 
                    email: userProfile.email, 
                    age: userProfile.age, 
                    city: userProfile.city, 
                    gender: userProfile.gender, 
                    orientation: userProfile.orientation 
                } 
            }
        }

        // 4. Buscar Matches
        const bestMatches = await findBestMatchesReal(currentUserProfile, 12)
        setMatches(bestMatches)
        setRealDataCount(bestMatches.length)

      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [router])

  const handleConnect = (match: MatchResult) => {
    alert(`¡Solicitud enviada a ${match.user.user_data?.personal_data?.name}!`)
  }

  // Renderizados condicionales
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Analizando compatibilidad...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Falta un paso</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
                onClick={() => router.push('/test/objective')}
                className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition"
            >
                Ir al Test de Compatibilidad
            </button>
        </div>
      </div>
    )
  }

  // --- TU DISEÑO ORIGINAL RESTAURADO ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-4 px-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Tus Matches Compatibles
          </h1>
          <p className="text-gray-700 text-sm sm:text-lg mb-3">
            Personas seleccionadas especialmente para ti basado en IA
          </p>
          {realDataCount > 0 && (
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">
              <Icon name="honestidad" size={14} className="sm:w-4 sm:h-4" />
              <span>{realDataCount} personas compatibles encontradas</span>
            </div>
          )}
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 mb-1 sm:mb-2">{matches.length}</div>
            <div className="text-gray-700 text-xs sm:text-sm">Total Matches</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-1 sm:mb-2">
              {matches.filter(m => m.compatibilityScore >= 75).length}
            </div>
            <div className="text-gray-700 text-xs sm:text-sm">Muy Compatibles</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mb-1 sm:mb-2">
              {matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.breakdown.interests, 0) / matches.length) : 0}%
            </div>
            <div className="text-gray-700 text-xs sm:text-sm">Intereses Comunes</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 mb-1 sm:mb-2">
              {matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.compatibilityScore, 0) / matches.length) : 0}%
            </div>
            <div className="text-gray-700 text-xs sm:text-sm">Score Promedio</div>
          </div>
        </div>

        {/* Tarjetas de Matches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {matches.map((match) => {
            const displayName = match.user.user_data?.personal_data?.name || "Usuario Anónimo"
            const initials = getInitials(displayName)
            const objKey = match.user.objective as keyof typeof objectiveMap || 'amistad'

            return (
              <div
                key={match.user.id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col h-full"
                onClick={() => handleConnect(match)}
              >
                {/* Header Card */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 sm:p-4 text-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">{Math.round(match.compatibilityScore)}%</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${objectiveMap[objKey]?.color || 'text-gray-700 bg-gray-100'}`}>
                      {objectiveMap[objKey]?.name || match.user.objective}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: `${match.compatibilityScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Body Card */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-base truncate">{displayName}</h3>
                      <p className="text-xs text-gray-500 truncate">
                        {match.user.user_data?.personal_data?.age ? `${match.user.user_data.personal_data.age} años` : 'Estudiante'}
                      </p>
                    </div>
                  </div>

                  {/* Intereses Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4 min-h-[50px]">
                    {match.user.interests.slice(0, 3).map((interestId, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                          {interestId}
                        </span>
                    ))}
                    {match.user.interests.length > 3 && (
                        <span className="text-xs text-gray-400 self-center">+{match.user.interests.length - 3}</span>
                    )}
                  </div>

                  {/* Desglose Puntuación (Footer) */}
                  <div className="mt-auto space-y-1.5 pt-3 border-t border-gray-50">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Personalidad</span>
                        <span className="font-semibold text-purple-600">{match.breakdown.personality}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Intereses</span>
                        <span className="font-semibold text-blue-600">{match.breakdown.interests}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Valores</span>
                        <span className="font-semibold text-green-600">{match.breakdown.values}%</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 bg-purple-50 text-purple-700 py-2 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors">
                    Ver Perfil Completo
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-2">¿Cómo funciona?</h3>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Nuestro algoritmo de IA analiza 5 dimensiones de personalidad, tus valores fundamentales y estilo de vida para encontrar personas con las que realmente conectarás.
          </p>
        </div>

      </div>
    </div>
  )
}