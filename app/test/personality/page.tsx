'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const personalityTest = [
  // Extraversión
  {
    id: 1,
    text: "Me veo como alguien que es conversador/a.",
    trait: "extraversion",
    inverted: false
  },
  {
    id: 2, 
    text: "Me veo como alguien que es reservado/a.",
    trait: "extraversion", 
    inverted: true
  },
  // Amabilidad
  {
    id: 3,
    text: "Me veo como alguien que es considerado/a y amable con los demás.",
    trait: "amabilidad",
    inverted: false
  },
  {
    id: 4,
    text: "Me veo como alguien que tiende a encontrar faltas en otros.",
    trait: "amabilidad",
    inverted: true
  },
  // Escrupulosidad
  {
    id: 5,
    text: "Me veo como alguien que hace las cosas a conciencia.",
    trait: "escrupulosidad", 
    inverted: false
  },
  {
    id: 6,
    text: "Me veo como alguien que es perezoso/a.",
    trait: "escrupulosidad",
    inverted: true
  },
  // Estabilidad emocional
  {
    id: 7,
    text: "Me veo como alguien que se estresa con facilidad.",
    trait: "estabilidad_emocional",
    inverted: true
  },
  {
    id: 8,
    text: "Me veo como alguien relajado/a, que enfrenta bien el estrés.",
    trait: "estabilidad_emocional",
    inverted: false
  },
  // Apertura
  {
    id: 9,
    text: "Me veo como alguien con imaginación activa.",
    trait: "apertura",
    inverted: false
  },
  {
    id: 10,
    text: "Me veo como alguien que valora las rutinas por encima de lo nuevo.",
    trait: "apertura",
    inverted: true
  }
]

const likertScale = [
  { value: 1, label: "Totalmente en desacuerdo" },
  { value: 2, label: "En desacuerdo" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "De acuerdo" },
  { value: 5, label: "Totalmente de acuerdo" }
]

export default function PersonalityTest() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0))

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
  }

  const calculateScores = () => {
    const scores = {
      extraversion: 0,
      amabilidad: 0,
      escrupulosidad: 0,
      estabilidad_emocional: 0,
      apertura: 0
    }

    personalityTest.forEach((question, index) => {
      let score = answers[index]
      
      // Aplicar inversión si es necesario
      if (question.inverted) {
        score = 6 - score // Invertir escala 1-5
      }

      // Sumar al rasgo correspondiente (2 preguntas por rasgo)
      scores[question.trait as keyof typeof scores] += score
    })

    // Calcular promedio (dividir entre 2 porque son 2 preguntas por rasgo)
    Object.keys(scores).forEach(trait => {
      scores[trait as keyof typeof scores] = scores[trait as keyof typeof scores] / 2
    })

    return scores
  }

  const handleNext = () => {
    if (answers[currentQuestion] === 0) {
      alert('Por favor selecciona una respuesta')
      return
    }

    if (currentQuestion < personalityTest.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Test completo, calcular resultados y guardar
      const scores = calculateScores()
      localStorage.setItem('personalityScores', JSON.stringify(scores))
      router.push('/test/interests')
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const progress = ((currentQuestion + 1) / personalityTest.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test de Personalidad
          </h1>
          <p className="text-gray-600">
            Responde honestamente. Estas preguntas nos ayudan a entender tu personalidad para hacer mejores matches.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Pregunta {currentQuestion + 1} de {personalityTest.length}
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
              {personalityTest[currentQuestion].text}
            </h2>
            <p className="text-sm text-gray-500">
              Selecciona qué tan de acuerdo estás con esta afirmación
            </p>
          </div>

          {/* Escala Likert */}
          <div className="space-y-4">
            {likertScale.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  answers[currentQuestion] === option.value
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {option.label}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === option.value
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Información del rasgo actual */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">
            Rasgo evaluado: {personalityTest[currentQuestion].trait.replace('_', ' ').toUpperCase()}
          </h3>
          <p className="text-blue-800 text-sm">
            {personalityTest[currentQuestion].inverted && '(Pregunta invertida - se considera en el cálculo)'}
          </p>
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
            disabled={answers[currentQuestion] === 0}
            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestion === personalityTest.length - 1 ? 'Ver Resultados' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}