'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const valuesQuestions = [
  {
    id: 'life_goal',
    question: '¿Qué buscas actualmente en tus relaciones?',
    options: [
      { id: 'relacion_seria', text: 'Relación seria y comprometida' },
      { id: 'algo_que_crezca', text: 'Algo que pueda crecer con el tiempo' },
      { id: 'conocer_gente', text: 'Conocer gente nueva y ver qué pasa' },
      { id: 'no_seguro', text: 'No estoy seguro/a, explorando opciones' }
    ]
  },
  {
    id: 'core_values',
    question: '¿Qué valoras más en alguien?',
    options: [
      { id: 'honestidad', text: 'Honestidad y transparencia' },
      { id: 'lealtad', text: 'Lealtad y confianza' },
      { id: 'amor_propio', text: 'Amor propio y autoestima' },
      { id: 'responsabilidad', text: 'Responsabilidad y compromiso' },
      { id: 'ambicion', text: 'Ambición y crecimiento' },
      { id: 'calma', text: 'Calma y estabilidad emocional' }
    ]
  },
  {
    id: 'future_vision',
    question: '¿En el futuro te ves...?',
    options: [
      { id: 'independiente', text: 'Siendo independiente y autosuficiente' },
      { id: 'familia', text: 'Formando una familia' },
      { id: 'carrera', text: 'Priorizando carrera profesional' },
      { id: 'viajando', text: 'Viajando y explorando el mundo' },
      { id: 'tradicional', text: 'Viviendo de forma tradicional' },
      { id: 'minimalista', text: 'Viviendo estilo minimalista y simple' }
    ]
  }
]

export default function ValuesPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: string]: string}>({})

  const handleAnswer = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  const handleNext = () => {
    const currentQuestionId = valuesQuestions[currentQuestion].id
    
    if (!answers[currentQuestionId]) {
      alert('Por favor selecciona una respuesta')
      return
    }

    if (currentQuestion < valuesQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Test completo, guardar respuestas
      localStorage.setItem('valuesAnswers', JSON.stringify(answers))
      router.push('/test/lifestyle')
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const progress = ((currentQuestion + 1) / valuesQuestions.length) * 100
  const currentQ = valuesQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Valores y Metas de Vida
          </h1>
          <p className="text-gray-600">
            Tus valores fundamentales son clave para conexiones significativas
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Pregunta {currentQuestion + 1} de {valuesQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Pregunta actual */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQ.question}
            </h2>
            <p className="text-sm text-gray-500">
              Selecciona la opción que mejor represente tus valores
            </p>
          </div>

          {/* Opciones de respuesta */}
          <div className="space-y-4">
            {currentQ.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(currentQ.id, option.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  answers[currentQ.id] === option.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {option.text}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQ.id] === option.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQ.id] === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Tus valores son privados</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                Esta información nos ayuda a hacer matches más compatibles. Solo compartimos compatibilidad general, no tus respuestas específicas.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          
          <button
            onClick={handleNext}
            disabled={!answers[currentQ.id]}
            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestion === valuesQuestions.length - 1 ? 'Continuar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}