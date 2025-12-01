'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { UserProfile, MatchResult, findBestMatchesReal } from '@/lib/matching-algorithm'
import Icon from '../components/Icon'
import { Check, X, Loader2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const objectiveMap = {
  amistad: { name: 'Amistad', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  networking: { name: 'Networking', color: 'text-green-600 bg-green-50 border-green-200' },
  relacion: { name: 'Relación', color: 'text-pink-600 bg-pink-50 border-pink-200' }
}

const getInitials = (name: string) => {
  if (!name) return '??'
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 px-4 w-full sm:w-auto">
        <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-700 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-4">
                <div className="bg-green-500 rounded-full p-1">
                    <Check size={16} className="text-white" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">¡Solicitud Enviada!</h4>
                    <p className="text-xs text-gray-300">{message}</p>
                </div>
            </div>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-white">
                <X size={18} />
            </button>
        </div>
    </div>
)

export default function MatchesPage() {
  const router = useRouter()
  
  // Estados de Datos
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [report, setReport] = useState<string>('')
  const [realDataCount, setRealDataCount] = useState(0)
  const [stats, setStats] = useState({ total: 0, highCompat: 0, commonInterests: 0, avgScore: 0 })
  
  // Estados de UI
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Adaptador
  const adaptServerMatches = (serverMatches: any[]): MatchResult[] => {
    return serverMatches.map(m => ({
      user: {
        id: m.id,
        user_id: m.id,
        objective: 'amistad',
        big_five_scores: { extraversion: 3, amabilidad: 3, escrupulosidad: 3, estabilidad_emocional: 3, apertura: 3 },
        interests: m.hobbies_list || [],
        values_goals: { core_values: m.value_main, future_vision: '', life_goal: '' },
        lifestyle: { social: '', alcohol: '', rhythm: '' },
        compatibility_vector: null,
        user_data: {
          personal_data: {
            name: m.name || "Usuario Anónimo",
            email: "",
            age: m.age,
            city: m.city,
            gender: "",
            orientation: ""
          }
        }
      },
      compatibilityScore: Math.round((m.similarity || 0) * 100),
      breakdown: {
        personality: Math.round((m.similarity || 0) * 100),
        interests: Math.round((m.similarity || 0) * 90),
        values: Math.round((m.similarity || 0) * 95),
        lifestyle: 0
      },
      sharedInterests: []
    }))
  }

  // EFECTO 1: Manejo EXCLUSIVO de Autenticación (Blindado)
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
        try {
            // 1. Verificar sesión actual
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!mounted) return;

            if (session) {
                setIsAuthChecking(false)
                loadUserData(session.user.id)
            } else {
                setIsAuthChecking(true) 
            }
        } catch (e) {
            console.error("Auth check error", e)
            setIsAuthChecking(false)
        }
    }

    checkSession()

    // Escuchar cambios en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        
        console.log("Auth Event:", event)

        if (session) {
            setIsAuthChecking(false)
            loadUserData(session.user.id)
        } else if (event === 'SIGNED_OUT') { // CORRECCIÓN: Quitamos USER_DELETED
            router.push('/login')
        } else {
            setTimeout(() => {
                if (mounted && !session) {
                    setIsAuthChecking(false)
                    router.push('/login')
                }
            }, 1000)
        }
    })

    return () => {
        mounted = false;
        subscription.unsubscribe()
    }
  }, [router])


  // EFECTO 2: Carga de Datos (Separado de Auth)
  const loadUserData = async (userId: string) => {
      try {
        setLoadingData(true)

        // A. Intentar Cache Local primero
        const storedResults = localStorage.getItem('matchme_results')
        if (storedResults) {
            try {
                const parsed = JSON.parse(storedResults)
                if (parsed.success && parsed.matches && parsed.matches.length > 0) {
                    const loadedMatches = adaptServerMatches(parsed.matches)
                    setMatches(loadedMatches)
                    setReport(parsed.report || '')
                    setRealDataCount(loadedMatches.length)
                    calculateStats(loadedMatches)
                    setLoadingData(false)
                    return 
                }
            } catch (e) { console.warn("Cache inválido") }
        }

        // B. Cargar de DB
        const { data: userProfiles, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .limit(1)

        if (dbError) throw dbError
        const userProfile = userProfiles && userProfiles.length > 0 ? userProfiles[0] : null

        if (!userProfile) {
          setError("No encontramos tu usuario en la base de datos.")
          setLoadingData(false)
          return
        }

        const currentUserProfile: UserProfile = {
            id: userId,
            user_id: userId,
            objective: userProfile.goal || 'amistad',
            big_five_scores: userProfile.big_five_scores || { extraversion: 3, amabilidad: 3, escrupulosidad: 3, estabilidad_emocional: 3, apertura: 3 },
            interests: userProfile.hobbies_list || [],
            values_goals: { 
                core_values: userProfile.value_main || '', 
                future_vision: userProfile.value_future || '', 
                life_goal: userProfile.goal || '' 
            },
            lifestyle: { 
                social: userProfile.lifestyle_social || '', 
                alcohol: userProfile.lifestyle_alcohol || '', 
                rhythm: userProfile.lifestyle_rhythm || '' 
            },
            compatibility_vector: null,
            user_data: { 
                personal_data: { 
                    name: userProfile.name || "Yo", 
                    email: "" 
                } 
            }
        }

        const bestMatches = await findBestMatchesReal(currentUserProfile, 12)
        setMatches(bestMatches)
        setReport(userProfile.ai_report || '')
        setRealDataCount(bestMatches.length)
        calculateStats(bestMatches)

      } catch (err: any) {
        console.error('Error data:', err)
        setError(err.message)
      } finally {
        setLoadingData(false)
      }
  }

  const calculateStats = (matchesData: any[]) => {
    if (!matchesData.length) return
    setStats({
        total: matchesData.length,
        highCompat: matchesData.filter(m => m.compatibilityScore >= 75).length,
        commonInterests: Math.round(matchesData.reduce((acc, m) => acc + (m.breakdown?.interests || 0), 0) / matchesData.length * 100),
        avgScore: Math.round(matchesData.reduce((acc, m) => acc + m.compatibilityScore, 0) / matchesData.length)
    })
  }

  const handleConnect = (match: MatchResult) => {
    const name = match.user.user_data?.personal_data?.name || "Usuario"
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

  if (isAuthChecking || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-16 w-16 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {isAuthChecking ? 'Verificando sesión...' : 'Buscando tus mejores conexiones...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ups...</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
                onClick={() => router.push('/test/objective')}
                className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition"
            >
                Ir al Test
            </button>
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
             <p className="text-gray-500">Encontramos {realDataCount} personas compatibles contigo</p>
          </div>
          
          {report && (
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
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Matches</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <div className="text-2xl font-bold text-green-600">{stats.highCompat}</div>
            <div className="text-xs text-gray-500">Top %</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.commonInterests}%</div>
            <div className="text-xs text-gray-500">Intereses</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.avgScore}%</div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>

        {/* Grid de Matches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, i) => {
            const userData = match.user?.user_data?.personal_data || {}
            const displayName = userData.name || "Usuario Anónimo"
            const initials = getInitials(displayName)
            const objKey = (match.user?.objective as keyof typeof objectiveMap) || 'amistad'
            const score = Math.round(match.compatibilityScore || 0)

            return (
              <div
                key={i} 
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group border border-gray-100 overflow-hidden"
              >
                <div className="p-5 pb-0">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${objectiveMap[objKey]?.color || 'text-gray-700 bg-gray-100'}`}>
                            {objectiveMap[objKey]?.name || match.user?.objective}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-black text-gray-900">{score}%</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${score > 75 ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${score}%` }}
                        ></div>
                    </div>
                </div>

                <div className="px-5 flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg truncate">{displayName}</h3>
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                {userData.age ? `${userData.age} años` : 'Estudiante'} • {userData.city?.split(',')[0] || 'Campus'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {match.user?.interests?.slice(0, 3).map((interestId, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                {interestId.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/50">
                    <button 
                        onClick={() => handleConnect(match)}
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

        {matches.length === 0 && (
            <div className="text-center py-16">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="mascotas" className="text-gray-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-700">Buscando...</h3>
                <p className="text-gray-500 mt-2">Estamos buscando personas compatibles contigo.</p>
            </div>
        )}

        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      </div>
    </div>
  )
}