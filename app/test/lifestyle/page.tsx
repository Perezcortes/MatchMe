'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { saveProfileAndGetMatches } from '@/app/actions' // Importamos la acción correcta
import Icon from '@/app/components/Icon'

const lifestyleQuestions = [
    {
        id: 'schedule_management',
        icon: 'calma',
        question: '¿Cómo manejas tus horarios y rutinas?',
        options: [
            { id: 'muy_estructurados', text: 'Muy estructurados y organizados', value: 1, description: 'Planifico cada detalle' },
            { id: 'moderadamente_organizados', text: 'Moderadamente organizados', value: 2, description: 'Tengo rutina pero soy flexible' },
            { id: 'improvisados', text: 'Improvisados y flexibles', value: 3, description: 'Fluyo con el día' }
        ]
    },
    {
        id: 'alcohol_consumption',
        icon: 'gastronomia',
        question: '¿Cuál es tu consumo de alcohol?',
        options: [
            { id: 'nunca', text: 'Nunca consumo alcohol', value: 1, description: 'Prefiero no beber' },
            { id: 'social', text: 'Solo en ocasiones sociales', value: 2, description: 'Ocasionalmente con amigos' },
            { id: 'frecuente', text: 'Frecuentemente', value: 3, description: 'Fines de semana o más' }
        ]
    },
    {
        id: 'social_energy',
        icon: 'amistad',
        question: '¿Cómo describes tu energía social?',
        options: [
            { id: 'salir_mucho', text: 'Me gusta salir mucho', value: 1, description: 'Me recargo con gente' },
            { id: 'salir_moderado', text: 'Salgo moderadamente', value: 2, description: 'Equilibrio casa/calle' },
            { id: 'planes_tranquilos', text: 'Prefiero planes tranquilos', value: 3, description: 'Disfruto estar en casa' }
        ]
    },
    {
        id: 'life_pace',
        icon: 'actividad_fisica',
        question: '¿Cómo describirías tu ritmo de vida?',
        options: [
            { id: 'activo', text: 'Activo y dinámico', value: 1, description: 'Siempre en movimiento' },
            { id: 'balanceado', text: 'Balanceado y equilibrado', value: 2, description: 'Ni muy rápido ni muy lento' },
            { id: 'muy_relajado', text: 'Muy relajado y pausado', value: 3, description: 'Con mucha calma' }
        ]
    }
]

export default function LifestylePage() {
    const router = useRouter()
    const supabase = createClient()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<{ [key: string]: number }>({})
    const [loading, setLoading] = useState(false)

    const handleAnswer = (questionId: string, value: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const handleNext = () => {
        const currentQuestionId = lifestyleQuestions[currentQuestion].id

        if (answers[currentQuestionId] === undefined) {
            alert('Por favor selecciona una respuesta')
            return
        }

        if (currentQuestion < lifestyleQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
        } else {
            // Test completo, procesar
            processAllData()
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
        }
    }

    const processAllData = async () => {
        setLoading(true)
        try {
            // 1. Obtener usuario actual
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                console.error("No usuario autenticado")
                router.push('/login')
                return
            }

            console.log('Usuario autenticado:', user.id)

            // 2. Recopilar datos del localStorage
            const objective = localStorage.getItem('userObjective')
            const personalityScores = JSON.parse(localStorage.getItem('personalityScores') || '{}')
            const interests = JSON.parse(localStorage.getItem('userInterests') || '[]')
            const valuesAnswers = JSON.parse(localStorage.getItem('valuesAnswers') || '{}')
            
            // Mapeamos las respuestas numéricas a etiquetas legibles para la IA
            const lifestyleData = {
                schedule_management: lifestyleQuestions[0].options.find(o => o.value === answers.schedule_management)?.text,
                alcohol_consumption: lifestyleQuestions[1].options.find(o => o.value === answers.alcohol_consumption)?.text,
                social_energy: lifestyleQuestions[2].options.find(o => o.value === answers.social_energy)?.text,
                life_pace: lifestyleQuestions[3].options.find(o => o.value === answers.life_pace)?.text
            }

            // 3. Crear payload compatible con actions.ts
            const fullProfile = {
                userId: user.id, // ID IMPRESCINDIBLE
                goal: objective,
                bigFive: personalityScores,
                hobbies: interests,
                values: {
                    main: valuesAnswers.core_values,
                    future: valuesAnswers.future_vision
                },
                lifestyle: {
                    social: lifestyleData.social_energy,
                    alcohol: lifestyleData.alcohol_consumption,
                    rhythm: lifestyleData.life_pace
                }
            }

            console.log('Enviando a Action:', fullProfile)

            // 4. Llamar a la acción del servidor (Backend Seguro)
            const result = await saveProfileAndGetMatches(fullProfile)

            if (result.success) {
                console.log('Perfil guardado con éxito:', result)
                
                // Guardar resultado en localStorage para el Dashboard
                localStorage.setItem('matchme_results', JSON.stringify(result))
                
                // Limpiar temporales
                localStorage.removeItem('userObjective')
                localStorage.removeItem('personalityScores')
                localStorage.removeItem('userInterests')
                localStorage.removeItem('valuesAnswers')

                // Redirigir al Dashboard final (Matches)
                router.push('/test/report') 
            } else {
                throw new Error(result.error || 'Error desconocido en el servidor')
            }

        } catch (error: any) {
            console.error('Error detallado procesando datos:', error)
            alert('Error al guardar tu perfil: ' + (error.message || 'Intenta de nuevo.'))
        } finally {
            setLoading(false)
        }
    }

    const progress = ((currentQuestion + 1) / lifestyleQuestions.length) * 100
    const currentQ = lifestyleQuestions[currentQuestion]

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Estilo de Vida</h1>
                    <p className="text-gray-600">Última parte: tus hábitos diarios</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Pregunta {currentQuestion + 1} de {lifestyleQuestions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                            className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Icon name={currentQ.icon} size={24} />
                        </div>
                        {currentQ.question}
                    </h2>

                    <div className="space-y-4">
                        {currentQ.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleAnswer(currentQ.id, option.value)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                    answers[currentQ.id] === option.value
                                        ? 'border-purple-600 bg-purple-50 shadow-md'
                                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-gray-900">{option.text}</div>
                                        <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                        answers[currentQ.id] === option.value
                                            ? 'border-purple-600 bg-purple-600'
                                            : 'border-gray-300'
                                    }`}>
                                        {answers[currentQ.id] === option.value && (
                                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0 || loading}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                        Anterior
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:bg-gray-400 transition shadow-lg flex justify-center items-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Analizando...
                            </>
                        ) : (
                            currentQuestion === lifestyleQuestions.length - 1 ? 'Finalizar y Ver Resultados' : 'Siguiente'
                        )}
                    </button>
                </div>

            </div>
        </div>
    )
}