'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateSelfKnowledgeReport } from '@/lib/gemini-ai'
import Icon from '../../components/Icon'

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

// Lista de intereses actualizada
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
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-xl p-3">
                <Icon name={userProfile.objective as any} size={32} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Tu Objetivo Principal</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-800">{objectiveInfo.name}</span>
                </div>
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
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="actividad_fisica" size={24} className="text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Tu Personalidad</h3>
            </div>
            <div className="space-y-3">
              {userProfile.personality && Object.entries(userProfile.personality).map(([trait, score]) => (
                <div key={trait} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">
                    {trait.replace('_', ' ')}:
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(score as number) * 20}%` }}
                      ></div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTraitColor(score)} w-20 text-center`}>
                      {getTraitLevel(score)} ({score}/5)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intereses */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="musica" size={24} className="text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Tus Intereses Principales</h3>
            </div>
            <div className="space-y-3">
              {userProfile.interests?.map(interestId => {
                const interest = getInterestByName(interestId)
                return (
                  <div key={interestId} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                    <Icon name={interestId as any} size={20} />
                    <span className="text-gray-700 font-medium">{interest?.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Reporte de IA */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 rounded-xl p-3">
              <Icon name="emprendimiento" size={24} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Análisis de Compatibilidad</h3>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-blue-50 rounded-xl p-6 border border-blue-100">
              {aiReport || 'Generando análisis personalizado...'}
            </div>
          </div>
        </div>

        {/* Botón de continuar */}
        <div className="text-center">
          <button
            onClick={handleContinueToMatches}
            className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 text-lg shadow-lg flex items-center justify-center mx-auto"
          >
            <Icon name="amistad" size={20} className="mr-2" />
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