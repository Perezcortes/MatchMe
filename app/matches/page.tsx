'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile, MatchResult, findBestMatchesReal } from '@/lib/matching-algorithm'
import { getCurrentUserProfile } from '@/lib/user-service'
import Icon from '../components/Icon'

// Lista de intereses
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

// Función para generar nombre aleatorio (fallback)
const generateRandomName = (userId: string) => {
  const firstNames = ['Alex', 'Maria', 'Carlos', 'Ana', 'David', 'Laura', 'Javier', 'Sofia', 'Daniel', 'Elena']
  const lastNames = ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres']
  
  const firstName = firstNames[Math.abs(hashCode(userId)) % firstNames.length]
  const lastName = lastNames[Math.abs(hashCode(userId + '1')) % lastNames.length]
  
  return `${firstName} ${lastName}`
}

// Función hash simple para consistencia
const hashCode = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

// Función para obtener interés por nombre (corregida)
const getInterestByName = (id: string) => {
  return interestsList.find(interest => interest.id === id)
}

export default function MatchesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null)
  const [realDataCount, setRealDataCount] = useState(0)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      //console.log('🔄 Loading matches...')
      
      // Obtener perfil del usuario actual con ID real
      const currentUserProfile = await getCurrentUserProfile()
      //console.log('👤 Current user profile:', currentUserProfile)
      
      if (!currentUserProfile) {
        //console.log('❌ No current user profile, redirecting to test')
        router.push('/test/objective')
        return
      }

      setCurrentUser(currentUserProfile)

      // Encontrar mejores matches con datos REALES
      //console.log('🔍 Finding best matches...')
      const bestMatches = await findBestMatchesReal(currentUserProfile, 12)
      //console.log('🎯 Best matches found:', bestMatches)
      
      setMatches(bestMatches)
      
      // Contar cuántos son de datos reales vs de ejemplo
      const realMatches = bestMatches.filter(match => 
        !match.user.id.startsWith('user') // Los datos de ejemplo tienen IDs como 'user1', 'user2'
      )
      //console.log(`📊 Real matches: ${realMatches.length}, Sample matches: ${bestMatches.length - realMatches.length}`)
      
      setRealDataCount(realMatches.length)

    } catch (error) {
      //console.error('❌ Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCompatibilityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getCompatibilityLevel = (score: number): string => {
    if (score >= 80) return 'Alta compatibilidad'
    if (score >= 60) return 'Buena compatibilidad'
    if (score >= 40) return 'Compatibilidad media'
    return 'Compatibilidad baja'
  }

  // Obtener nombre para mostrar
  const getDisplayName = (match: MatchResult) => {
    // Primero intentar obtener el nombre real de la base de datos
    if (match.user.user_data?.personal_data?.name) {
      return match.user.user_data.personal_data.name
    }
    
    // Si no hay nombre real, generar uno basado en el ID para consistencia
    return generateRandomName(match.user.id)
  }

  // Obtener iniciales para el avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase()
  }

  const handleConnect = (match: MatchResult) => {
    const name = getDisplayName(match)
    alert(`¡Solicitud de conexión enviada a ${name}!`)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-4 px-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header con información de datos reales */}
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
              <span>
                {realDataCount} {realDataCount === 1 ? 'persona real' : 'personas reales'} en tu área
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
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

        {/* Grid de Matches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {matches.map((match) => {
            const displayName = getDisplayName(match)
            const initials = getInitials(displayName)
            
            return (
              <div 
                key={match.user.id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => setSelectedMatch(match)}
              >
                {/* Header con compatibilidad */}
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

                {/* Contenido */}
                <div className="p-3 sm:p-4">
                  {/* Nombre y avatar */}
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-semibold text-xs sm:text-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{displayName}</h3>
                      <p className="text-xs text-gray-600 truncate">
                        {match.user.user_data?.personal_data?.email || 'Usuario de MatchMe'}
                      </p>
                    </div>
                  </div>

                  {/* Intereses */}
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
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
                      <span className="text-gray-500 text-xs">+{match.user.interests.length - 3}</span>
                    )}
                  </div>

                  {/* Breakdown de compatibilidad */}
                  <div className="space-y-1 sm:space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-gray-800">
                        <Icon name="actividad_fisica" size={10} className="mr-1 text-purple-500 sm:w-3 sm:h-3" />
                        Personalidad
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getCompatibilityColor(match.breakdown.personality)}`}>
                        {match.breakdown.personality}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-gray-800">
                        <Icon name="musica" size={10} className="mr-1 text-blue-500 sm:w-3 sm:h-3" />
                        Intereses
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getCompatibilityColor(match.breakdown.interests)}`}>
                        {match.breakdown.interests}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-gray-800">
                        <Icon name="honestidad" size={10} className="mr-1 text-green-500 sm:w-3 sm:h-3" />
                        Valores
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getCompatibilityColor(match.breakdown.values)}`}>
                        {match.breakdown.values}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-3 sm:p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleConnect(match)
                    }}
                    className="w-full bg-purple-600 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                  >
                    <Icon name="amistad" size={14} className="mr-2 sm:w-4 sm:h-4" />
                    Conectar
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal de detalle del match */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 sm:p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">Detalles de Compatibilidad</h3>
                    <p className="text-white/80 text-sm">{getCompatibilityLevel(selectedMatch.compatibilityScore)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="text-white/80 hover:text-white"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-2">{selectedMatch.compatibilityScore}%</div>
                  <div className="w-full bg-white/20 rounded-full h-2 sm:h-3">
                    <div 
                      className="bg-white h-2 sm:h-3 rounded-full"
                      style={{ width: `${selectedMatch.compatibilityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Información del usuario */}
                <div className="flex items-center space-x-3 sm:space-x-4 bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-semibold text-base sm:text-lg">
                    {getInitials(getDisplayName(selectedMatch))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{getDisplayName(selectedMatch)}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {selectedMatch.user.user_data?.personal_data?.email || 'Usuario de MatchMe'}
                    </p>
                  </div>
                </div>

                {/* Objetivo */}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Objetivo principal</h4>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                    <Icon name={selectedMatch.user.objective as any} size={20} className="sm:w-6 sm:h-6" />
                    <div>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        {objectiveMap[selectedMatch.user.objective as keyof typeof objectiveMap]?.name || selectedMatch.user.objective}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Intereses */}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Intereses</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedMatch.user.interests.map(interestId => {
                      const interest = getInterestByName(interestId)
                      const isCommon = currentUser?.interests.includes(interestId)
                      return (
                        <div 
                          key={interestId}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                            isCommon ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <Icon name={interestId as any} size={14} className={`sm:w-4 sm:h-4 ${isCommon ? 'text-green-600' : 'text-gray-600'}`} />
                          <span className={`text-xs sm:text-sm ${isCommon ? 'text-green-800 font-medium' : 'text-gray-800'}`}>
                            {interest?.name || interestId}
                          </span>
                          {isCommon && (
                            <Icon name="honestidad" size={10} className="text-green-600 ml-auto sm:w-3 sm:h-3" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Breakdown detallado */}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3">Desglose de compatibilidad</h4>
                  <div className="space-y-3 sm:space-y-4">
                    {Object.entries(selectedMatch.breakdown).map(([category, score]) => (
                      <div key={category} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-800 capitalize flex items-center">
                            <Icon 
                              name={
                                category === 'personality' ? 'actividad_fisica' :
                                category === 'interests' ? 'musica' :
                                category === 'values' ? 'honestidad' : 'naturaleza'
                              } 
                              size={12} 
                              className="mr-2 sm:w-3.5 sm:h-3.5" 
                            />
                            {category}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">{score as React.ReactNode}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (score as number) >= 80 ? 'bg-green-500' :
                              (score as number) >= 60 ? 'bg-yellow-500' :
                              (score as number) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personalidad */}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Perfil de personalidad</h4>
                  <div className="space-y-2 text-xs sm:text-sm bg-gray-50 rounded-lg p-3">
                    {selectedMatch.user.big_five_scores && Object.entries(selectedMatch.user.big_five_scores).map(([trait, score]) => (
                      <div key={trait} className="flex justify-between items-center">
                        <span className="capitalize text-gray-700">
                          {trait.replace('_', ' ')}:
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${(score as number) * 20}%` }}
                            ></div>
                          </div>
                          <span className="font-medium w-6 sm:w-8 text-right text-gray-900">{score as React.ReactNode}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer del modal */}
              <div className="border-t border-gray-200 p-4 sm:p-6">
                <button
                  onClick={() => handleConnect(selectedMatch)}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg sm:rounded-xl font-semibold hover:bg-purple-700 transition-colors mb-3 flex items-center justify-center text-sm sm:text-base"
                >
                  <Icon name="amistad" size={16} className="mr-2 sm:w-4 sm:h-4" />
                  Enviar solicitud de conexión
                </button>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="w-full border border-gray-300 text-gray-800 py-3 px-4 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información del algoritmo */}
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