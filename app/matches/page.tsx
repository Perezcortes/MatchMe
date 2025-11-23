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
      // Obtener perfil del usuario actual con ID real
      const currentUserProfile = await getCurrentUserProfile()
      if (!currentUserProfile) {
        router.push('/test/objective')
        return
      }

      setCurrentUser(currentUserProfile)

      // Encontrar mejores matches con datos REALES
      const bestMatches = await findBestMatchesReal(currentUserProfile, 12)
      setMatches(bestMatches)
      
      // Contar cuántos son de datos reales vs de ejemplo
      const realMatches = bestMatches.filter(match => 
        !match.user.id.startsWith('user') // Los datos de ejemplo tienen IDs como 'user1', 'user2'
      )
      setRealDataCount(realMatches.length)

    } catch (error) {
      console.error('Error loading matches:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Buscando tus matches perfectos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header con información de datos reales */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tus Matches Compatibles
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Personas seleccionadas especialmente para ti basado en compatibilidad
          </p>
          {realDataCount > 0 && (
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">
              <Icon name="honestidad" size={16} />
              <span>
                {realDataCount} {realDataCount === 1 ? 'persona real' : 'personas reales'} en tu área
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{matches.length}</div>
            <div className="text-gray-600 text-sm">Matches encontrados</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {matches.filter(m => m.compatibilityScore >= 75).length}
            </div>
            <div className="text-gray-600 text-sm">Alta compatibilidad</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {matches.filter(m => m.breakdown.interests >= 60).length}
            </div>
            <div className="text-gray-600 text-sm">Intereses similares</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.compatibilityScore, 0) / matches.length) : 0}%
            </div>
            <div className="text-gray-600 text-sm">Compatibilidad promedio</div>
          </div>
        </div>

        {/* Grid de Matches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {matches.map((match) => {
            const displayName = getDisplayName(match)
            const initials = getInitials(displayName)
            
            return (
              <div 
                key={match.user.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => setSelectedMatch(match)}
              >
                {/* Header con compatibilidad */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 text-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{match.compatibilityScore}%</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${objectiveMap[match.user.objective as keyof typeof objectiveMap]?.color || 'text-gray-600 bg-gray-100'}`}>
                      <Icon name={match.user.objective as any} size={14} className="inline mr-1" />
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
                <div className="p-4">
                  {/* Nombre y avatar */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-semibold text-sm">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{displayName}</h3>
                      <p className="text-xs text-gray-500">
                        {match.user.user_data?.personal_data?.email || 'Usuario de MatchMe'}
                      </p>
                    </div>
                  </div>

                  {/* Intereses */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {match.user.interests.slice(0, 3).map(interestId => {
                      const interest = getInterestByName(interestId)
                      return (
                        <div key={interestId} className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1">
                          <Icon name={interestId as any} size={14} />
                          <span className="text-xs text-gray-700">{interest?.name || interestId}</span>
                        </div>
                      )
                    })}
                    {match.user.interests.length > 3 && (
                      <span className="text-gray-400 text-xs">+{match.user.interests.length - 3}</span>
                    )}
                  </div>

                  {/* Breakdown de compatibilidad */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Icon name="actividad_fisica" size={12} className="mr-1 text-purple-500" />
                        Personalidad
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getCompatibilityColor(match.breakdown.personality)}`}>
                        {match.breakdown.personality}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Icon name="musica" size={12} className="mr-1 text-blue-500" />
                        Intereses
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getCompatibilityColor(match.breakdown.interests)}`}>
                        {match.breakdown.interests}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Icon name="honestidad" size={12} className="mr-1 text-green-500" />
                        Valores
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getCompatibilityColor(match.breakdown.values)}`}>
                        {match.breakdown.values}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleConnect(match)
                    }}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <Icon name="amistad" size={16} className="mr-2" />
                    Conectar
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal de detalle del match */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Detalles de Compatibilidad</h3>
                    <p className="text-white/80">{getCompatibilityLevel(selectedMatch.compatibilityScore)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="text-white/80 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{selectedMatch.compatibilityScore}%</div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-white h-3 rounded-full"
                      style={{ width: `${selectedMatch.compatibilityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-6">
                {/* Información del usuario */}
                <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-semibold text-lg">
                    {getInitials(getDisplayName(selectedMatch))}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{getDisplayName(selectedMatch)}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedMatch.user.user_data?.personal_data?.email || 'Usuario de MatchMe'}
                    </p>
                  </div>
                </div>

                {/* Objetivo */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Objetivo principal</h4>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                    <Icon name={selectedMatch.user.objective as any} size={24} />
                    <div>
                      <span className="font-medium text-gray-900">
                        {objectiveMap[selectedMatch.user.objective as keyof typeof objectiveMap]?.name || selectedMatch.user.objective}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Intereses */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Intereses</h4>
                  <div className="grid grid-cols-2 gap-2">
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
                          <Icon name={interestId as any} size={16} className={isCommon ? 'text-green-600' : 'text-gray-600'} />
                          <span className={`text-sm ${isCommon ? 'text-green-800 font-medium' : 'text-gray-700'}`}>
                            {interest?.name || interestId}
                          </span>
                          {isCommon && (
                            <Icon name="honestidad" size={12} className="text-green-600 ml-auto" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Breakdown detallado */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Desglose de compatibilidad</h4>
                  <div className="space-y-4">
                    {Object.entries(selectedMatch.breakdown).map(([category, score]) => (
                      <div key={category} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize flex items-center">
                            <Icon 
                              name={
                                category === 'personality' ? 'actividad_fisica' :
                                category === 'interests' ? 'musica' :
                                category === 'values' ? 'honestidad' : 'naturaleza'
                              } 
                              size={14} 
                              className="mr-2" 
                            />
                            {category}
                          </span>
                          <span className="text-sm font-semibold">{score as React.ReactNode}%</span>
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
                  <h4 className="font-semibold text-gray-900 mb-2">Perfil de personalidad</h4>
                  <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-3">
                    {selectedMatch.user.personality && Object.entries(selectedMatch.user.personality).map(([trait, score]) => (
                      <div key={trait} className="flex justify-between items-center">
                        <span className="capitalize text-gray-600">
                          {trait.replace('_', ' ')}:
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${(score as number) * 20}%` }}
                            ></div>
                          </div>
                          <span className="font-medium w-8 text-right">{score as React.ReactNode}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer del modal */}
              <div className="border-t border-gray-200 p-6">
                <button
                  onClick={() => handleConnect(selectedMatch)}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors mb-3 flex items-center justify-center"
                >
                  <Icon name="amistad" size={18} className="mr-2" />
                  Enviar solicitud de conexión
                </button>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información del algoritmo */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            ¿Cómo calculamos tu compatibilidad?
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Icon name="actividad_fisica" size={32} className="text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600 mb-1">35%</div>
              <div className="text-sm text-gray-600">Personalidad</div>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="honestidad" size={32} className="text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600 mb-1">30%</div>
              <div className="text-sm text-gray-600">Valores y metas</div>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="musica" size={32} className="text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600 mb-1">25%</div>
              <div className="text-sm text-gray-600">Intereses</div>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="naturaleza" size={32} className="text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-600 mb-1">10%</div>
              <div className="text-sm text-gray-600">Estilo de vida</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}