'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const objectives = [
  {
    id: 'amistad',
    title: 'Amistad',
    description: 'Conectar con nuevas personas para amistades genuinas',
    percentage: '50%',
    icon: '👥',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'networking',
    title: 'Networking Académico/Profesional',
    description: 'Expandir tu red de contactos para colaboraciones y crecimiento',
    percentage: '40%', 
    icon: '💼',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'relacion',
    title: 'Relación',
    description: 'Encontrar una conexión romántica significativa',
    percentage: '10%',
    icon: '💝',
    color: 'from-pink-500 to-rose-500'
  }
]

export default function ObjectivePage() {
  const router = useRouter()
  const [selectedObjective, setSelectedObjective] = useState<string>('')

  const handleContinue = () => {
    if (!selectedObjective) {
      alert('Por favor selecciona un objetivo')
      return
    }
    
    // Guardar en estado global/local storage o enviar a API
    localStorage.setItem('userObjective', selectedObjective)
    
    // Redirigir al test de personalidad
    router.push('/test/personality')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <div className="bg-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">MM</span>
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Qué buscas en MatchMe?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige un objetivo principal. Nuestro algoritmo priorizará los matches según tu elección para darte mejores resultados.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Paso 4 de 5</span>
            <span className="text-sm font-medium text-gray-700">Test de compatibilidad</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: '80%' }}
            ></div>
          </div>
        </div>

        {/* Objetivos */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {objectives.map((objective) => (
            <button
              key={objective.id}
              onClick={() => setSelectedObjective(objective.id)}
              className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedObjective === objective.id
                  ? `border-purple-500 bg-white shadow-xl shadow-purple-100`
                  : 'border-gray-200 bg-white/80 hover:border-gray-300'
              }`}
            >
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${objective.color} flex items-center justify-center text-2xl`}>
                  {objective.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedObjective === objective.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {objective.percentage}
                </span>
              </div>

              {/* Contenido */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {objective.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {objective.description}
              </p>

              {/* Check indicator */}
              <div className={`mt-4 flex justify-end ${
                selectedObjective === objective.id ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-300`}>
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Información adicional */}
        <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">¿Por qué solo un objetivo?</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                Nuestra investigación muestra que priorizar un objetivo principal lleva a matches más relevantes y conexiones más auténticas. Puedes cambiar esta configuración más tarde en cualquier momento.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link
            href="/verification"
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Atrás
          </Link>
          
          <button
            onClick={handleContinue}
            disabled={!selectedObjective}
            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors transform hover:scale-105"
          >
            Continuar al Test
          </button>
        </div>
      </div>
    </div>
  )
}