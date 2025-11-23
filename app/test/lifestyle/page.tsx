'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const lifestyleQuestions = [
    {
        id: 'schedule_management',
        question: '¿Cómo manejas tus horarios y rutinas?',
        options: [
            { id: 'muy_estructurados', text: 'Muy estructurados y organizados', value: 1 },
            { id: 'moderadamente_organizados', text: 'Moderadamente organizados', value: 2 },
            { id: 'improvisados', text: 'Improvisados y flexibles', value: 3 }
        ]
    },
    {
        id: 'alcohol_consumption',
        question: '¿Cuál es tu consumo de alcohol?',
        options: [
            { id: 'nunca', text: 'Nunca consumo alcohol', value: 1 },
            { id: 'social', text: 'Solo en ocasiones sociales', value: 2 },
            { id: 'frecuente', text: 'Frecuentemente', value: 3 }
        ]
    },
    {
        id: 'social_energy',
        question: '¿Cómo describes tu energía social?',
        options: [
            { id: 'salir_mucho', text: 'Me gusta salir mucho y socializar', value: 1 },
            { id: 'salir_moderado', text: 'Salgo moderadamente', value: 2 },
            { id: 'planes_tranquilos', text: 'Prefiero planes tranquilos en casa', value: 3 }
        ]
    },
    {
        id: 'life_pace',
        question: '¿Cómo describirías tu ritmo de vida?',
        options: [
            { id: 'activo', text: 'Activo y dinámico', value: 1 },
            { id: 'balanceado', text: 'Balanceado y equilibrado', value: 2 },
            { id: 'muy_relajado', text: 'Muy relajado y pausado', value: 3 }
        ]
    }
]

export default function LifestylePage() {
    const router = useRouter()
    const supabase = createClient()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<{ [key: string]: number }>({})

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
            // Test completo, procesar todos los datos y generar reporte
            processAllData()
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
        }
    }

    const processAllData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            console.log('Usuario autenticado:', user.id)

            // Recopilar todos los datos del test
            const objective = localStorage.getItem('userObjective')
            const personalityScores = JSON.parse(localStorage.getItem('personalityScores') || '{}')
            const interests = JSON.parse(localStorage.getItem('userInterests') || '[]')
            const valuesAnswers = JSON.parse(localStorage.getItem('valuesAnswers') || '{}')
            const lifestyleData = answers

            console.log('Datos recopilados:', {
                objective,
                personalityScores,
                interests,
                valuesAnswers,
                lifestyleData
            })

            // Crear perfil completo del usuario
            const userProfile = {
                objective,
                personality: personalityScores,
                interests,
                values: valuesAnswers,
                lifestyle: lifestyleData,
                compatibility_vector: generateCompatibilityVector(personalityScores, valuesAnswers, lifestyleData)
            }

            console.log('Perfil a guardar:', userProfile)

            // Guardar en Supabase
            const { data, error: profileError } = await supabase
                .from('user_compatibility_profiles')
                .upsert({
                    user_id: user.id,
                    objective,
                    big_five_scores: personalityScores,
                    interests,
                    values_goals: valuesAnswers,
                    lifestyle: lifestyleData,
                    compatibility_vector: userProfile.compatibility_vector
                })
                .select() // Agregar .select() para ver qué devuelve

            console.log('Respuesta de Supabase:', { data, profileError })

            if (profileError) {
                console.error('Error detallado de Supabase:', profileError)
                throw profileError
            }

            // Guardar también en localStorage para uso inmediato
            localStorage.setItem('userProfile', JSON.stringify(userProfile))

            // Actualizar estado del usuario
            const { error: updateError } = await supabase
                .from('users')
                .update({ test_completed: true })
                .eq('id', user.id)

            if (updateError) {
                console.error('Error actualizando usuario:', updateError)
            }

            console.log('Perfil guardado exitosamente, redirigiendo...')

            // Redirigir al reporte de autoconocimiento
            router.push('/test/report')

        } catch (error) {
            console.error('Error detallado procesando datos:', error)
            alert('Error al guardar tu perfil. Por favor intenta de nuevo.')
        }
    }

    const generateCompatibilityVector = (personality: any, values: any, lifestyle: any) => {
        // Vector simplificado para el matching (en producción sería más complejo)
        return {
            openness: personality.apertura || 3,
            conscientiousness: personality.escrupulosidad || 3,
            extraversion: personality.extraversion || 3,
            agreeableness: personality.amabilidad || 3,
            stability: personality.estabilidad_emocional || 3,
            ambition: values.core_values === 'ambicion' ? 1 : 0,
            family_orientation: values.future_vision === 'familia' ? 1 : 0,
            social_level: lifestyle.social_energy || 2,
            structure_level: lifestyle.schedule_management || 2
        }
    }

    const progress = ((currentQuestion + 1) / lifestyleQuestions.length) * 100
    const currentQ = lifestyleQuestions[currentQuestion]

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Estilo de Vida
                    </h1>
                    <p className="text-gray-600">
                        Última parte del test - tus hábitos y preferencias diarias
                    </p>
                </div>

                {/* Progress */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Pregunta {currentQuestion + 1} de {lifestyleQuestions.length}
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
                            Selecciona la opción que mejor describa tu estilo de vida
                        </p>
                    </div>

                    {/* Opciones de respuesta */}
                    <div className="space-y-4">
                        {currentQ.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleAnswer(currentQ.id, option.value)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${answers[currentQ.id] === option.value
                                    ? 'border-purple-500 bg-purple-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">
                                        {option.text}
                                    </span>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQ.id] === option.value
                                        ? 'border-purple-500 bg-purple-500'
                                        : 'border-gray-300'
                                        }`}>
                                        {answers[currentQ.id] === option.value && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Información adicional */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                    <div className="flex items-start space-x-4">
                        <div className="bg-green-100 rounded-lg p-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-900 mb-2">¡Estás a punto de terminar!</h4>
                            <p className="text-green-800 text-sm leading-relaxed">
                                Después de esta sección, generaremos tu reporte personalizado de autoconocimiento usando IA y te mostraremos tus matches más compatibles.
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
                        disabled={answers[currentQ.id] === undefined}
                        className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {currentQuestion === lifestyleQuestions.length - 1 ? 'Ver Mi Reporte' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    )
}