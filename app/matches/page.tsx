'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile, MatchResult, findBestMatches } from '@/lib/matching-algorithm'
import { sampleUsers } from '@/lib/sample-data'

const interestsList = [
  { id: 'actividad_fisica', name: 'Actividad física', icon: '💪' },
  { id: 'musica', name: 'Música', icon: '🎵' },
  { id: 'arte', name: 'Arte', icon: '🎨' },
  { id: 'viajes', name: 'Viajes', icon: '✈️' },
  { id: 'cine_series', name: 'Cine y series', icon: '🎬' },
  { id: 'lectura', name: 'Lectura', icon: '📚' },
  { id: 'videojuegos', name: 'Videojuegos', icon: '🎮' },
  { id: 'naturaleza', name: 'Naturaleza', icon: '🌿' },
  { id: 'gastronomia', name: 'Gastronomía', icon: '🍳' },
  { id: 'tecnologia', name: 'Tecnología', icon: '💻' },
  { id: 'emprendimiento', name: 'Emprendimiento', icon: '🚀' },
  { id: 'mascotas', name: 'Mascotas', icon: '🐾' }
]

const objectiveMap = {
  amistad: { name: 'Amistad', icon: '👥', color: 'blue' },
  networking: { name: 'Networking', icon: '💼', color: 'green' },
  relacion: { name: 'Relación', icon: '💝', color: 'pink' }
}

export default function MatchesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      // Cargar perfil del usuario actual
      const profileData = localStorage.getItem('userProfile')
      if (!profileData) {
        router.push('/test/objective')
        return
      }

      const profile = JSON.parse(profileData)
      
      // Crear perfil de usuario actual con ID temporal
      const currentUserProfile: UserProfile = {
        ...profile,
        id: 'current-user'
      }

      setCurrentUser(currentUserProfile)

      // Encontrar mejores matches (usando datos de ejemplo por ahora)
      const bestMatches = findBestMatches(currentUserProfile, sampleUsers, 8)
      setMatches(bestMatches)

    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
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

  const getCompatibilityLevel = (score: number): string => {
    if (score >= 80) return 'Alta compatibilidad'
    if (score >= 60) return 'Buena compatibilidad'
    if (score >= 40) return 'Compatibilidad media'
    return 'Compatibilidad baja'
  }

  const handleConnect = (match: MatchResult) => {
    // En una app real, aquí se enviaría una solicitud de conexión
    alert(`¡Solicitud de conexión enviada a ${match.user.id}!`)
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tus Matches Compatibles
          </h1>
          <p className="text-gray-600 text-lg">
            Personas seleccionadas especialmente para ti basado en compatibilidad
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{matches.length}</div>
            <div className="text-gray-600 text-sm">Matches encontrados</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {matches.filter(m => m.compatibilityScore >= 80).length}
            </div>
            <div className="text-gray-600 text-sm">Alta compatibilidad</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {matches.filter(m => m.breakdown.interests >= 80).length}
            </div>
            <div className="text-gray-600 text-sm">Intereses similares</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {Math.round(matches.reduce((acc, m) => acc + m.compatibilityScore, 0) / matches.length)}%
            </div>
            <div className="text-gray-600 text-sm">Compatibilidad promedio</div>
          </div>
        </div>

        {/* Grid de Matches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {matches.map((match) => (
            <div 
              key={match.user.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => setSelectedMatch(match)}
            >
              {/* Header con compatibilidad */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{match.compatibilityScore}%</span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    {objectiveMap[match.user.objective as keyof typeof objectiveMap]?.icon}
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
                {/* Intereses */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {match.user.interests.slice(0, 2).map(interestId => {
                    const interest = getInterestByName(interestId)
                    return (
                      <span key={interestId} className="text-2xl" title={interest?.name}>
                        {interest?.icon}
                      </span>
                    )
                  })}
                  {match.user.interests.length > 2 && (
                    <span className="text-gray-400 text-sm">+{match.user.interests.length - 2}</span>
                  )}
                </div>

                {/* Breakdown de compatibilidad */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Personalidad</span>
                    <span className={`px-2 py-1 rounded-full ${getCompatibilityColor(match.breakdown.personality)}`}>
                      {match.breakdown.personality}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Intereses</span>
                    <span className={`px-2 py-1 rounded-full ${getCompatibilityColor(match.breakdown.interests)}`}>
                      {match.breakdown.interests}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valores</span>
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
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Conectar
                </button>
              </div>
            </div>
          ))}
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
                {/* Objetivo */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Objetivo principal</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {objectiveMap[selectedMatch.user.objective as keyof typeof objectiveMap]?.icon}
                    </span>
                    <span>{objectiveMap[selectedMatch.user.objective as keyof typeof objectiveMap]?.name}</span>
                  </div>
                </div>

                {/* Intereses */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Intereses en común</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedMatch.user.interests.map(interestId => {
                      const interest = getInterestByName(interestId)
                      const isCommon = currentUser?.interests.includes(interestId)
                      return (
                        <div 
                          key={interestId}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                            isCommon ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <span className="text-xl">{interest?.icon}</span>
                          <span className="text-sm">{interest?.name}</span>
                          {isCommon && (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Breakdown detallado */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Desglose de compatibilidad</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedMatch.breakdown).map(([category, score]) => (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {category}
                          </span>
                          <span className="text-sm font-semibold">{score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              score >= 80 ? 'bg-green-500' :
                              score >= 60 ? 'bg-yellow-500' :
                              score >= 40 ? 'bg-orange-500' : 'bg-red-500'
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
                  <div className="space-y-2 text-sm">
                    {selectedMatch.user.personality && Object.entries(selectedMatch.user.personality).map(([trait, score]) => (
                      <div key={trait} className="flex justify-between">
                        <span className="capitalize text-gray-600">
                          {trait.replace('_', ' ')}:
                        </span>
                        <span className="font-medium">{score}/5</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer del modal */}
              <div className="border-t border-gray-200 p-6">
                <button
                  onClick={() => handleConnect(selectedMatch)}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors mb-3"
                >
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
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">40%</div>
              <div className="text-sm text-gray-600">Personalidad</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">30%</div>
              <div className="text-sm text-gray-600">Valores y metas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-2">20%</div>
              <div className="text-sm text-gray-600">Intereses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 mb-2">10%</div>
              <div className="text-sm text-gray-600">Estilo de vida</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}