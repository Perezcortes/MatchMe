'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateSelfKnowledgeReport } from '@/lib/gemini-ai'

interface UserProfile {
  objective: string
  personality: {
    extraversion: number
    amabilidad: number
    escrupulosidad: number
    estabilidad_emocional: number
    apertura: number
  }
  interests: string[]
  values: any
  lifestyle: any
}

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

export default function ReportPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [aiReport, setAiReport] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const profileData = localStorage.getItem('userProfile')
      if (!profileData) {
        router.push('/test/objective')
        return
      }

      const profile = JSON.parse(profileData)
      setUserProfile(profile)

      // Generar reporte con IA
      const report = await generateSelfKnowledgeReport(profile)
      setAiReport(report)

    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInterestByName = (id: string) => {
    return interestsList.find(interest => interest.id === id)
  }

  const getTraitLevel = (score: number): string => {
    if (score >= 4) return 'Alta'
    if (score >= 3) return 'Media'
    return 'Baja'
  }

  const getTraitColor = (score: number): string => {
    if (score >= 4) return 'text-green-600 bg-green-100'
    if (score >= 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const handleContinueToMatches = () => {
    router.push('/matches')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generando tu reporte personalizado con IA...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se encontraron datos del perfil</p>
          <button 
            onClick={() => router.push('/test/objective')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            Comenzar Test
          </button>
        </div>
      </div>
    )
  }

  const objectiveInfo = objectiveMap[userProfile.objective as keyof typeof objectiveMap] || objectiveMap.amistad

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tu Reporte de Autoconocimiento
          </h1>
          <p className="text-gray-600 text-lg">
            Generado con IA basado en tus respuestas
          </p>
        </div>

        {/* Objetivo Principal */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tu Objetivo Principal</h2>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{objectiveInfo.icon}</span>
                <span className="text-xl font-bold text-gray-800">{objectiveInfo.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Prioridad del algoritmo</p>
              <p className="text-lg font-semibold text-purple-600">
                {objectiveInfo.name === 'Amistad' ? '50%' : 
                 objectiveInfo.name === 'Networking' ? '40%' : '10%'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Personalidad */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tu Personalidad</h3>
            <div className="space-y-3">
              {userProfile.personality && Object.entries(userProfile.personality).map(([trait, score]) => (
                <div key={trait} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">
                    {trait.replace('_', ' ')}:
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTraitColor(score)}`}>
                    {getTraitLevel(score)} ({score}/5)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Intereses */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tus Intereses Principales</h3>
            <div className="space-y-3">
              {userProfile.interests?.map(interestId => {
                const interest = getInterestByName(interestId)
                return (
                  <div key={interestId} className="flex items-center space-x-3">
                    <span className="text-2xl">{interest?.icon}</span>
                    <span className="text-gray-700">{interest?.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Reporte de IA */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Análisis de Compatibilidad</h3>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aiReport || 'Generando análisis personalizado...'}
            </div>
          </div>
        </div>

        {/* Botón de continuar */}
        <div className="text-center">
          <button
            onClick={handleContinueToMatches}
            className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-lg shadow-lg"
          >
            Ver Mis Matches Compatibles
          </button>
          
          <p className="text-gray-600 mt-4 text-sm">
            Basado en tu perfil único, te mostraremos personas con alta compatibilidad
          </p>
        </div>
      </div>
    </div>
  )
}