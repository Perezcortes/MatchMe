'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { UserProfile, MatchResult, findBestMatchesReal } from '@/lib/matching-algorithm'
import { getCurrentUserProfile } from '@/lib/user-service'
import Icon from '../components/Icon'

// Cliente Supabase Local para esta página
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// --- CONSTANTES Y MAPAS ---
const interestsList = [
  { id: 'actividad_fisica', name: 'Actividad física' },
  { id: 'musica', name: 'Música' },
  { id: 'arte', name: 'Arte' },
  { id: 'viajes', name: 'Viajes' },
  { id: 'cine_series', name: 'Cine y series' },
  { id: 'lectura', name: 'Lectura' },
  { id: 'videojuegos', name: 'Videojuegos' },
  { id: 'naturaleza', name: 'Naturaleza' },
  { id: 'gastronomia', name: 'Gastronomía' },
  { id: 'tecnologia', name: 'Tecnología' },
  { id: 'emprendimiento', name: 'Emprendimiento' },
  { id: 'mascotas', name: 'Mascotas' }
] as const

const objectiveMap = {
  amistad: { name: 'Amistad', color: 'text-blue-600 bg-blue-100' },
  networking: { name: 'Networking', color: 'text-green-600 bg-green-100' },
  relacion: { name: 'Relación', color: 'text-pink-600 bg-pink-100' }
}

// --- FUNCIONES AUXILIARES ---
const hashCode = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

const getInterestByName = (id: string) => {
  return interestsList.find(interest => interest.id === id)
}

const getCompatibilityColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 bg-green-100'
  if (score >= 60) return 'text-yellow-600 bg-yellow-100'
  if (score >= 40) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
}

const generateImprovedFallbackName = (userId: string, email?: string): string => {
  const firstNames = ['Alex', 'Maria', 'Carlos', 'Ana', 'David', 'Laura', 'Javier', 'Sofia', 'Daniel', 'Elena']
  const lastNames = ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres']

  let seed = userId
  if (email) seed = email

  const hash = hashCode(seed)
  const firstName = firstNames[Math.abs(hash) % firstNames.length]
  const lastName = lastNames[Math.abs(hash + 1) % lastNames.length]

  return `${firstName} ${lastName}`
}

const getDisplayName = (match: MatchResult): string => {
  const userData = match.user.user_data?.personal_data
  const name = userData?.name

  if (name && !name.startsWith('Usuario_')) {
    return name
  }
  return generateImprovedFallbackName(match.user.id, userData?.email)
}

const getInitials = (name: string) => {
  if (!name) return '??'
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

// --- COMPONENTE PRINCIPAL ---
export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realDataCount, setRealDataCount] = useState(0)

  useEffect(() => {
    const initPage = async () => {
      try {
        // 1. Verificar Sesión REAL (Evita rebotes al login)
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        
        if (authError || !session) {
          console.log("No hay sesión activa, redirigiendo...")
          router.push('/login')
          return
        }

        // 2. Cargar Perfil
        const currentUserProfile = await getCurrentUserProfile()

        if (!currentUserProfile) {
          // Si no hay perfil, mostramos un estado especial en lugar de expulsar
          setError("No encontramos tu perfil de compatibilidad. Necesitas completar el test.")
          setLoading(false)
          return
        }

        // 3. Buscar Matches
        // Pasamos 12 como límite para tener suficientes tarjetas
        const bestMatches = await findBestMatchesReal(currentUserProfile, 12)
        setMatches(bestMatches)

        // Contar usuarios reales para mostrar en la UI
        const realMatches = bestMatches.filter(match => {
          const name = match.user.user_data?.personal_data?.name
          return name && !name.startsWith('Usuario_')
        })
        setRealDataCount(realMatches.length)

      } catch (err: any) {
        console.error('Error loading matches:', err)
        setError(err.message || "Error cargando tus matches")
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [router])

  const handleConnect = (match: MatchResult) => {
    const name = getDisplayName(match)
    alert(`¡Solicitud de conexión enviada a ${name}!`)
  }

  // --- RENDERIZADO DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Buscando tus matches perfectos...</p>
        </div>
      </div>
    )
  }

  // --- RENDERIZADO DE ERROR (Falta perfil) ---
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="text-4xl mb-4">🧩</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Falta un paso</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/test/objective')}
            className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition shadow-lg"
          >
            Ir al Test de Compatibilidad
          </button>
        </div>
      </div>
    )
  }

  // --- RENDERIZADO PRINCIPAL (Tu UI original) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-4 px-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Tus Matches Compatibles
          </h1>
          <p className="text-gray-700 text-sm sm:text-lg mb-3">
            Personas seleccionadas especialmente para ti basado en compatibilidad
          </p>
          {realDataCount > 0 && (
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">
              <Icon name="honestidad" size={14} className="sm:w-4 sm:h-4" />
              <span>{realDataCount} {realDataCount === 1 ? 'persona real' : 'personas reales'} en tu área</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 mb-1 sm:mb-2">{matches.length}</div>
            <div className="text-gray-700 text-xs sm:text-sm">Matches encontrados</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-1 sm:mb-2">
              {matches.filter(m => m.compatibilityScore >= 75).length}
            </div>
            <div className="text-gray-700 text-xs sm:text-sm">Alta compatibilidad</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mb-1 sm:mb-2">
              {matches.filter(m => m.breakdown.interests >= 60).length}
            </div>
            <div className="text-gray-700 text-xs sm:text-sm">Intereses similares</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 mb-1 sm:mb-2">
              {matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.compatibilityScore, 0) / matches.length) : 0}%
            </div>
            <div className="text-gray-700 text-xs sm:text-sm">Compatibilidad promedio</div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {matches.map((match) => {
            const displayName = getDisplayName(match)
            const initials = getInitials(displayName)

            return (
              <div
                key={match.user.id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col"
                onClick={() => handleConnect(match)}
              >
                {/* Header de la tarjeta con gradiente */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 sm:p-4 text-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm sm:text-base">{match.compatibilityScore}%</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${objectiveMap[match.user.objective as keyof typeof objectiveMap]?.color || 'text-gray-700 bg-gray-100'}`}>
                      <Icon name={match.user.objective as any} size={12} className="inline mr-1" />
                      {objectiveMap[match.user.objective as keyof typeof objectiveMap]?.name || match.user.objective}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${match.compatibilityScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{displayName}</h3>
                      <p className="text-xs text-gray-600 truncate">
                        {match.user.user_data?.personal_data?.email || 'Usuario de MatchMe'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 min-h-[40px]">
                    {match.user.interests.slice(0, 3).map(interestId => {
                      const interest = getInterestByName(interestId)
                      return (
                        <div key={interestId} className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1">
                          <Icon name={interestId as any} size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span className="text-xs text-gray-800">{interest?.name || interestId}</span>
                        </div>
                      )
                    })}
                    {match.user.interests.length > 3 && (
                      <span className="text-gray-500 text-xs self-center">+{match.user.interests.length - 3}</span>
                    )}
                  </div>

                  {/* Desglose de puntuación */}
                  <div className="space-y-1 sm:space-y-2 text-xs mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-gray-800">
                        <Icon name="actividad_fisica" size={10} className="mr-1 text-purple-500 sm:w-3 sm:h-3" />
                        Personalidad
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${getCompatibilityColor(match.breakdown.personality)}`}>
                        {match.breakdown.personality}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-gray-800">
                        <Icon name="musica" size={10} className="mr-1 text-blue-500 sm:w-3 sm:h-3" />
                        Intereses
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${getCompatibilityColor(match.breakdown.interests)}`}>
                        {match.breakdown.interests}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-gray-800">
                        <Icon name="honestidad" size={10} className="mr-1 text-green-500 sm:w-3 sm:h-3" />
                        Valores
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${getCompatibilityColor(match.breakdown.values)}`}>
                        {match.breakdown.values}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 p-3 sm:p-4 mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleConnect(match)
                    }}
                    className="w-full bg-purple-600 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center text-sm sm:text-base shadow-md hover:shadow-lg"
                  >
                    <Icon name="amistad" size={14} className="mr-2 sm:w-4 sm:h-4" />
                    Conectar
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Explicación del algoritmo */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center text-lg sm:text-xl">
            ¿Cómo calculamos tu compatibilidad?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="flex flex-col items-center">
              <Icon name="actividad_fisica" size={24} className="text-purple-600 mb-2 sm:w-8 sm:h-8" />
              <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">35%</div>
              <div className="text-xs sm:text-sm text-gray-700">Personalidad</div>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="honestidad" size={24} className="text-blue-600 mb-2 sm:w-8 sm:h-8" />
              <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">30%</div>
              <div className="text-xs sm:text-sm text-gray-700">Valores y metas</div>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="musica" size={24} className="text-green-600 mb-2 sm:w-8 sm:h-8" />
              <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">25%</div>
              <div className="text-xs sm:text-sm text-gray-700">Intereses</div>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="naturaleza" size={24} className="text-orange-600 mb-2 sm:w-8 sm:h-8" />
              <div className="text-lg sm:text-2xl font-bold text-orange-600 mb-1">10%</div>
              <div className="text-xs sm:text-sm text-gray-700">Estilo de vida</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}