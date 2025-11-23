'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const interestsList = [
  {
    id: 'actividad_fisica',
    name: 'Actividad física',
    icon: '💪',
    category: 'Salud'
  },
  {
    id: 'musica',
    name: 'Música',
    icon: '🎵',
    category: 'Arte'
  },
  {
    id: 'arte',
    name: 'Arte',
    icon: '🎨',
    category: 'Arte'
  },
  {
    id: 'viajes',
    name: 'Viajes',
    icon: '✈️',
    category: 'Aventura'
  },
  {
    id: 'cine_series',
    name: 'Cine y series',
    icon: '🎬',
    category: 'Entretenimiento'
  },
  {
    id: 'lectura',
    name: 'Lectura',
    icon: '📚',
    category: 'Cultura'
  },
  {
    id: 'videojuegos',
    name: 'Videojuegos',
    icon: '🎮',
    category: 'Entretenimiento'
  },
  {
    id: 'naturaleza',
    name: 'Naturaleza',
    icon: '🌿',
    category: 'Aventura'
  },
  {
    id: 'gastronomia',
    name: 'Gastronomía',
    icon: '🍳',
    category: 'Cultura'
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    icon: '💻',
    category: 'Ciencia'
  },
  {
    id: 'emprendimiento',
    name: 'Emprendimiento',
    icon: '🚀',
    category: 'Profesional'
  },
  {
    id: 'mascotas',
    name: 'Mascotas',
    icon: '🐾',
    category: 'Vida'
  }
]

export default function InterestsPage() {
  const router = useRouter()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        // Remover si ya está seleccionado
        return prev.filter(id => id !== interestId)
      } else {
        // Agregar si no está seleccionado y no excede el límite
        if (prev.length < 3) {
          return [...prev, interestId]
        } else {
          alert('Solo puedes seleccionar hasta 3 intereses principales')
          return prev
        }
      }
    })
  }

  const handleContinue = () => {
    if (selectedInterests.length === 0) {
      alert('Por favor selecciona al menos un interés')
      return
    }

    // Guardar intereses seleccionados
    localStorage.setItem('userInterests', JSON.stringify(selectedInterests))
    router.push('/test/values')
  }

  const getInterestByName = (id: string) => {
    return interestsList.find(interest => interest.id === id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tus Intereses y Hobbies
          </h1>
          <p className="text-gray-600 text-lg">
            Selecciona hasta <span className="font-semibold text-purple-600">3 intereses principales</span> que definan mejor tus pasatiempos
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Paso 2 de 4 - Test de compatibilidad</span>
            <span className="text-sm font-medium text-gray-700">{selectedInterests.length}/3 seleccionados</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: '60%' }}
            ></div>
          </div>
        </div>

        {/* Contador de selección */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className={`p-4 rounded-xl text-center ${
            selectedInterests.length === 3 
              ? 'bg-green-100 border border-green-200 text-green-800'
              : 'bg-blue-100 border border-blue-200 text-blue-800'
          }`}>
            <p className="font-semibold">
              {selectedInterests.length === 3 
                ? '✅ ¡Perfecto! Has seleccionado 3 intereses'
                : `📝 Selecciona ${3 - selectedInterests.length} interés(es) más`}
            </p>
          </div>
        </div>

        {/* Grid de intereses */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
          {interestsList.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              disabled={selectedInterests.length === 3 && !selectedInterests.includes(interest.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedInterests.includes(interest.id)
                  ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${
                selectedInterests.length === 3 && !selectedInterests.includes(interest.id)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <div className="text-center space-y-3">
                <div className={`text-3xl transition-transform duration-300 ${
                  selectedInterests.includes(interest.id) ? 'scale-110' : ''
                }`}>
                  {interest.icon}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {interest.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {interest.category}
                  </p>
                </div>

                {/* Check indicator */}
                <div className={`w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center ${
                  selectedInterests.includes(interest.id)
                    ? 'bg-purple-500 border-purple-500'
                    : 'bg-white border-gray-300'
                }`}>
                  {selectedInterests.includes(interest.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Intereses seleccionados preview */}
        {selectedInterests.length > 0 && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              Tus intereses seleccionados:
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {selectedInterests.map(interestId => {
                const interest = getInterestByName(interestId)
                return (
                  <div 
                    key={interestId}
                    className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full"
                  >
                    <span>{interest?.icon}</span>
                    <span className="font-medium">{interest?.name}</span>
                    <button
                      onClick={() => toggleInterest(interestId)}
                      className="text-purple-600 hover:text-purple-800 ml-1"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">¿Por qué solo 3 intereses?</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                La investigación muestra que priorizar intereses principales lleva a conexiones más significativas. 
                Esto nos ayuda a encontrar personas que realmente compartan tus pasiones fundamentales, no solo gustos superficiales.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/test/personality')}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Atrás
          </button>
          
          <button
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Continuar a Valores
          </button>
        </div>
      </div>
    </div>
  )
}