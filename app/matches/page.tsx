'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Icon from '../components/Icon'
import { Check, X, Loader2 } from 'lucide-react'

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Constantes UI
const objectiveMap = {
  amistad: { name: 'Amistad', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  networking: { name: 'Networking', color: 'text-green-600 bg-green-50 border-green-200' },
  relacion: { name: 'Relación', color: 'text-pink-600 bg-pink-50 border-pink-200' }
}

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 px-4 w-full sm:w-auto">
        <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-700 w-full sm:w-auto justify-between sm:justify-start">
            <div className="bg-green-500 rounded-full p-1">
                <Check size={16} className="text-white" />
            </div>
            <div>
                <h4 className="font-bold text-sm">¡Solicitud Enviada!</h4>
                <p className="text-xs text-gray-300">{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-white">
                <X size={18} />
            </button>
        </div>
    </div>
)

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([]) // Usamos any para simplificar los mocks
  const [report, setReport] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  
  // --- GENERADOR DE DATOS FALSOS (La Magia) ---
  const generateFakeMatches = () => {
    return [
        {
            id: '1',
            name: 'Andrea Gómez',
            age: 21,
            city: 'Huajuapan de León',
            objective: 'amistad',
            compatibilityScore: 95,
            interests: ['lectura', 'viajes', 'cafe'],
            initials: 'AG',
            breakdown: { personality: 98, values: 90, interests: 85 }
        },
        {
            id: '2',
            name: 'Carlos Ruiz',
            age: 23,
            city: 'Tamazulapan del Progreso, México',
            objective: 'networking',
            compatibilityScore: 88,
            interests: ['tecnologia', 'emprendimiento', 'fitness'],
            initials: 'CR',
            breakdown: { personality: 85, values: 92, interests: 90 }
        },
        {
            id: '3',
            name: 'Sofía Martínez',
            age: 20,
            city: 'Huajuapan de León',
            objective: 'relacion',
            compatibilityScore: 82,
            interests: ['musica', 'arte', 'fotografia'],
            initials: 'SM',
            breakdown: { personality: 80, values: 85, interests: 75 }
        },
        {
            id: '4',
            name: 'Miguel Ángel',
            age: 22,
            city: 'Asunción Nochixtlán, México',
            objective: 'amistad',
            compatibilityScore: 78,
            interests: ['videojuegos', 'anime', 'cocina'],
            initials: 'MA',
            breakdown: { personality: 75, values: 80, interests: 85 }
        },
        {
            id: '5',
            name: 'Valentina H.',
            age: 24,
            city: 'Huajuapan',
            objective: 'networking',
            compatibilityScore: 75,
            interests: ['negocios', 'marketing', 'idiomas'],
            initials: 'VH',
            breakdown: { personality: 70, values: 88, interests: 60 }
        },
        {
            id: '6',
            name: 'Daniela P.',
            age: 19,
            city: 'Santiago Juxtlahuaca, México',
            objective: 'amistad',
            compatibilityScore: 70,
            interests: ['senderismo', 'naturaleza', 'animales'],
            initials: 'DP',
            breakdown: { personality: 75, values: 65, interests: 70 }
        }
    ]
  }

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true)
        
        // 1. Verificar si hay usuario (Esto sí lo dejamos real para seguridad)
        const { data: { user } } = await supabase.auth.getUser()
        
        // Si no hay usuario, intentamos recuperarlo del localStorage o redirigimos
        // (Permisivo para móviles)
        if (!user) {
             // Intentamos ver si hay sesión reciente
             const { data: { session } } = await supabase.auth.getSession()
             if (!session) {
                 // Si de plano no hay nada, al login
                 router.push('/login')
                 return
             }
        }

        // 2. Cargar TU Reporte Real (Esto sí viene de la DB)
        let realReport = "Tu análisis de personalidad está listo.";
        if (user) {
            const { data } = await supabase
                .from('users')
                .select('ai_report')
                .eq('id', user.id)
                .maybeSingle()
            
            if (data?.ai_report) {
                realReport = data.ai_report;
            }
        }
        setReport(realReport)

        // 3. Cargar Matches Falsos (Esto siempre funciona)
        setMatches(generateFakeMatches())

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [router])

  const handleConnect = (name: string) => {
    setToastMsg(`Has enviado una solicitud a ${name}`)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const renderCleanReport = (text: string) => {
    if (!text) return null
    return text.split('\n').map((line, index) => {
        const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
            return (
                <li key={index} className="mb-2 flex items-start text-gray-700">
                    <span className="mr-2 text-purple-500 mt-1">•</span>
                    <span dangerouslySetInnerHTML={{ __html: line.replace(/^[\*\-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </li>
            )
        }
        if (line.trim() !== '') {
             return <p key={index} className="mb-2 text-gray-700" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        }
        return null
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-16 w-16 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Reporte */}
        <div className="mb-12">
          <div className="text-center mb-8">
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Tus Resultados</h1>
             <p className="text-gray-500">Encontramos {matches.length} personas compatibles contigo</p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-3xl mx-auto border border-purple-100">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                    <Icon name="actividad_fisica" className="text-purple-600" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Análisis de Compatibilidad</h3>
            </div>
            <div className="text-sm leading-relaxed">
                <ul className="space-y-1">
                    {renderCleanReport(report)}
                </ul>
            </div>
          </div>
        </div>

        {/* Grid de Matches (Falsos pero bonitos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, i) => {
            const objKey = match.objective as keyof typeof objectiveMap || 'amistad'

            return (
              <div
                key={i} 
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group border border-gray-100 overflow-hidden"
              >
                {/* Header Card */}
                <div className="p-5 pb-0">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${objectiveMap[objKey]?.color || 'text-gray-700 bg-gray-100'}`}>
                            {objectiveMap[objKey]?.name || match.objective}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-black text-gray-900">{match.compatibilityScore}%</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${match.compatibilityScore > 75 ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${match.compatibilityScore}%` }}
                        ></div>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-5 flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                            {match.initials}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg truncate">{match.name}</h3>
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                {match.age} años • {match.city}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {match.interests.map((interest: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/50">
                    <button 
                        onClick={() => handleConnect(match.name)}
                        className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <Icon name="flecha_derecha" size={18} className="text-purple-400" />
                        Conectar
                    </button>
                </div>
              </div>
            )
          })}
        </div>

        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      </div>
    </div>
  )
}